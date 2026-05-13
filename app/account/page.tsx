import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription";
import { Headphones, Music, MessageCircle, Star, ArrowRight, Zap, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TIER_BADGES: Record<string, { label: string; variant: "teal" | "purple" | "gold" }> = {
  base:      { label: "Base",      variant: "teal"   },
  plus:      { label: "Plus",      variant: "purple" },
  transform: { label: "Transform", variant: "gold"   },
};

const FEATURES = [
  { href: "/account/meditations", Icon: Headphones, title: "Guided Meditations", desc: "Audio meditations for your exact situation", tier: "base"      },
  { href: "/account/music",       Icon: Music,       title: "Healing Music",      desc: "Curated playlists for every emotional state",  tier: "base"      },
  { href: "/account/companion",   Icon: MessageCircle,title: "AI Companion",      desc: "Extended conversations that remember your story", tier: "plus"   },
  { href: "/account/plans",       Icon: Star,        title: "7-Day Plans",        desc: "Personalised daily support plan",                tier: "transform" },
];

const TIER_ORDER = ["free", "base", "plus", "transform"];

export default async function AccountPage() {
  const [user, tier] = await Promise.all([currentUser(), getUserTier()]);
  const tierInfo = TIER_BADGES[tier];
  const tierIndex = TIER_ORDER.indexOf(tier);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 👋
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">Your current plan:</p>
          {tierInfo ? (
            <Badge variant={tierInfo.variant}>{tierInfo.label}</Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {FEATURES.map((f) => {
          const unlocked = tierIndex >= TIER_ORDER.indexOf(f.tier);
          return (
            <Link key={f.href} href={unlocked ? f.href : "/premium"}
              className={`bg-white rounded-2xl border p-5 transition-all group ${
                unlocked ? "border-border hover:border-primary/40 hover:shadow-md" : "border-border opacity-60"
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl gradient-c4u-soft flex items-center justify-center">
                  <f.Icon className="h-5 w-5 text-white" />
                </div>
                {unlocked
                  ? <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  : <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full capitalize">{f.tier}+</span>
                }
              </div>
              <p className="font-semibold mb-1">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Upgrade prompt */}
      {tier !== "transform" && (
        <div className="rounded-2xl gradient-c4u p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            {tier === "free" ? <Zap className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
            <p className="font-bold">
              {tier === "free" ? "Unlock your full support toolkit" : "Unlock even more with the next tier"}
            </p>
          </div>
          <p className="text-white/80 text-sm mb-4">
            {tier === "free"
              ? "Upgrade to Base for meditations and healing music — from just €10/mo."
              : tier === "base"
              ? "Upgrade to Plus for unlimited AI companion chat — €20/mo."
              : "Upgrade to Transform for personalised 7-day plans — €30/mo."}
          </p>
          <Link href="/premium">
            <Button variant="outline" size="sm" className="bg-white text-primary border-0">
              See plans <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Settings link */}
      <div className="mt-6 pt-6 border-t border-border">
        <Link href="/account/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Account settings & subscription →
        </Link>
      </div>
    </div>
  );
}
