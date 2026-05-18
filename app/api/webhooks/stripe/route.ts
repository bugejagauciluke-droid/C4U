import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Tier } from "@/lib/subscription";

async function setUserTier(clerkUserId: string, tier: Tier, stripeCustomerId: string, stripeSubscriptionId: string) {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(clerkUserId);
  const existing = (user.privateMetadata ?? {}) as Record<string, unknown>;
  await clerk.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      ...existing,
      tier,
      stripeCustomerId,
      stripeSubscriptionId,
      trialUsed: true, // Trial is considered used once a subscription is active
    },
  });
}

async function clearUserTier(clerkUserId: string) {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(clerkUserId);
  const existing = (user.privateMetadata ?? {}) as Record<string, unknown>;
  await clerk.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      ...existing,
      tier: "free",
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined,
      // trialUsed stays true — trial was already consumed
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook verification failed: ${msg}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId;
      const tier = (session.metadata?.tier ?? "base") as Tier;
      const customerId = typeof session.customer === "string" ? session.customer : "";
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : "";

      if (clerkUserId) {
        await setUserTier(clerkUserId, tier, customerId, subscriptionId);
        console.log(`✓ Granted ${tier} to Clerk user ${clerkUserId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const clerkUserId = sub.metadata?.clerkUserId;
      if (clerkUserId) {
        await clearUserTier(clerkUserId);
        console.log(`✗ Revoked subscription from Clerk user ${clerkUserId}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("! Payment failed for customer:", invoice.customer);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
