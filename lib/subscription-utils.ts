export type Tier = "free" | "base" | "plus" | "transform";

export const TIER_FEATURES: Record<Tier, string[]> = {
  free:      [],
  base:      ["meditations", "music"],
  plus:      ["meditations", "music", "companion", "challenge", "conditions", "grief", "habits"],
  transform: ["meditations", "music", "companion", "plans", "challenge", "diary", "goals", "nutrition", "conditions", "grief", "habits", "wearable"],
};

export function hasFeature(tier: Tier, feature: string): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false;
}

export function tierAtLeast(userTier: Tier, required: Tier): boolean {
  const order: Tier[] = ["free", "base", "plus", "transform"];
  return order.indexOf(userTier) >= order.indexOf(required);
}
