import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe, isStripeConfigured, TIER_PRICE_IDS } from "@/lib/stripe";
import type { SubMeta } from "@/lib/subscription";
import { TRIAL_DAYS } from "@/lib/trial";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to subscribe." }, { status: 401 });
  }

  const { tier } = (await req.json()) as { tier: string };
  const priceId = TIER_PRICE_IDS[tier];

  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe Price ID configured for tier "${tier}".` },
      { status: 400 }
    );
  }

  // Check if this account has already used its free trial
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.privateMetadata ?? {}) as Partial<SubMeta>;

  const alreadyTrialed =
    meta.trialUsed === true ||
    (meta.trialStartedAt
      ? (Date.now() - new Date(meta.trialStartedAt).getTime()) / 86_400_000 >= TRIAL_DAYS
      : false);

  const origin = req.headers.get("origin") ?? "http://localhost:3001";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/premium`,
    allow_promotion_codes: true,
    // Always collect payment method — this is what enables automatic charges after trial
    payment_method_collection: "always",
    metadata: { tier, clerkUserId: userId },
    subscription_data: {
      // No trial if account already used one; otherwise 7-day trial
      ...(alreadyTrialed ? {} : { trial_period_days: TRIAL_DAYS }),
      metadata: { tier, clerkUserId: userId },
    },
  });

  // Record trial start on this account (idempotent — only set if not already set)
  if (!alreadyTrialed && !meta.trialStartedAt) {
    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...meta,
        trialStartedAt: new Date().toISOString(),
        trialUsed: false,
      },
    });
  }

  return NextResponse.json({ url: session.url });
}
