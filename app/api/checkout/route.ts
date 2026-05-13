import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, isStripeConfigured, TIER_PRICE_IDS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local." },
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

  const origin = req.headers.get("origin") ?? "http://localhost:3001";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/premium`,
    allow_promotion_codes: true,
    metadata: { tier, clerkUserId: userId },
    subscription_data: {
      trial_period_days: 7,
      metadata: { tier, clerkUserId: userId },
    },
  });

  return NextResponse.json({ url: session.url });
}
