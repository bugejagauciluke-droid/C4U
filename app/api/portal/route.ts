import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import type { SubMeta } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = user.privateMetadata as Partial<SubMeta>;
  const customerId = meta.stripeCustomerId;

  if (!customerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3001";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/account/settings`,
  });

  return NextResponse.json({ url: session.url });
}
