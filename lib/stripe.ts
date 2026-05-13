import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export const isStripeConfigured = () =>
  Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_"));

// Map tier names → Stripe Price IDs (set these in .env.local after creating products in Stripe)
export const TIER_PRICE_IDS: Record<string, string> = {
  Base: process.env.STRIPE_PRICE_BASE ?? "",
  Plus: process.env.STRIPE_PRICE_PLUS ?? "",
  Transform: process.env.STRIPE_PRICE_TRANSFORM ?? "",
};
