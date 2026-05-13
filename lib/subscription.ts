import { currentUser } from "@clerk/nextjs/server";
export type { Tier } from "./subscription-utils";

export interface SubMeta {
  tier: import("./subscription-utils").Tier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export async function getUserTier(): Promise<import("./subscription-utils").Tier> {
  try {
    const user = await currentUser();
    if (!user) return "free";
    const meta = user.privateMetadata as Partial<SubMeta>;
    return meta.tier ?? "free";
  } catch {
    return "free";
  }
}
