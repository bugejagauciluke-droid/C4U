import { currentUser } from "@clerk/nextjs/server";
import { TRIAL_DAYS } from "./trial";
export type { Tier } from "./subscription-utils";

export interface SubMeta {
  tier: import("./subscription-utils").Tier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialStartedAt?: string;   // ISO — when they started the trial (account-tied)
  trialUsed?: boolean;       // true after first subscription checkout created
}

export async function getUserTier(): Promise<import("./subscription-utils").Tier> {
  try {
    const user = await currentUser();
    if (!user) return "free";
    const meta = user.privateMetadata as Partial<SubMeta>;

    // Active paid subscription always wins
    if (meta.tier && meta.tier !== "free") return meta.tier;

    // Check trial window — trial = full Transform access for 7 days
    if (meta.trialStartedAt && !meta.trialUsed) {
      const daysSince = (Date.now() - new Date(meta.trialStartedAt).getTime()) / 86_400_000;
      if (daysSince < TRIAL_DAYS) return "transform";
    }

    return "free";
  } catch {
    return "free";
  }
}

/** Returns trial info for the current user (for UI display). */
export async function getTrialInfo(): Promise<{
  isOnTrial: boolean;
  daysRemaining: number;
  trialUsed: boolean;
}> {
  try {
    const user = await currentUser();
    if (!user) return { isOnTrial: false, daysRemaining: 0, trialUsed: false };
    const meta = user.privateMetadata as Partial<SubMeta>;

    // Already on paid subscription
    if (meta.tier && meta.tier !== "free") {
      return { isOnTrial: false, daysRemaining: 0, trialUsed: true };
    }

    if (meta.trialStartedAt) {
      const daysSince = (Date.now() - new Date(meta.trialStartedAt).getTime()) / 86_400_000;
      const daysRemaining = Math.max(0, Math.ceil(TRIAL_DAYS - daysSince));
      return {
        isOnTrial: daysRemaining > 0 && !meta.trialUsed,
        daysRemaining,
        trialUsed: meta.trialUsed ?? daysSince >= TRIAL_DAYS,
      };
    }

    return { isOnTrial: false, daysRemaining: TRIAL_DAYS, trialUsed: false };
  } catch {
    return { isOnTrial: false, daysRemaining: 0, trialUsed: false };
  }
}
