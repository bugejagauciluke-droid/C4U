import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription";
import {
  Headphones, Music, MessageCircle, Star, ArrowRight, Zap, Crown,
  Brain, Heart, RefreshCw, Apple, Watch, BookOpen, Target, Flame, Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TIER_BADGES: Record<string, { label: string; variant: "teal" | "purple" | "gold" }> = {
  base:      { label: "Base",      variant: "teal"   },
  plus:      { label: "Plus",      variant: "purple" },
  transform: { label: "Transform", variant: "gold"   },
};

const FEATURES = [
  // Base
  { href: "/account/meditations", Icon: Headphones,    title: "Guided Meditations",    desc: "8 sessions for grief, anxiety, sleep & more",             tier: "base",      color: "from-indigo-500 to-violet-600"  },
  { href: "/account/music",       Icon: Music,          title: "Healing Music",          desc: "Curated playlists for every emotional state",             tier: "base",      color: "from-rose-400 to-pink-600"      },
  // Plus
  { href: "/account/companion",   Icon: MessageCircle,  title: "AI Companion",           desc: "Unlimited, 24/7 — remembers your full story",             tier: "plus",      color: "from-sky-500 to-teal-600"       },
  { href: "/account/challenge",   Icon: Flame,          title: "Daily Challenge",        desc: "One personalised mission per day, streak tracking",       tier: "plus",      color: "from-amber-400 to-orange-500"   },
  { href: "/account/conditions",  Icon: Brain,          title: "Condition Support",      desc: "CBT/DBT/ACT for anxiety, ADHD, depression & more",        tier: "plus",      color: "from-violet-500 to-purple-700"  },
  { href: "/account/grief",       Icon: Heart,          title: "Grief & Loss",           desc: "Evidence-based support — no timelines, no rushing",       tier: "plus",      color: "from-rose-500 to-pink-600"      },
  { href: "/account/habits",      Icon: RefreshCw,      title: "Break a Habit",          desc: "Brain-science approach + Emergency SOS button",           tier: "plus",      color: "from-amber-500 to-orange-600"   },
  // Transform
  { href: "/account/plans",       Icon: Star,           title: "7-Day Support Plans",    desc: "Full personalised plan for your exact situation",          tier: "transform", color: "from-teal-500 to-emerald-600"   },
  { href: "/account/diary",       Icon: BookOpen,       title: "Daily Diary",            desc: "AI reflection, pattern spotting, mood tracking",           tier: "transform", color: "from-emerald-500 to-teal-600"   },
  { href: "/account/goals",       Icon: Target,         title: "Life Goals",             desc: "Full roadmap: hourly habits to yearly identity shift",     tier: "transform", color: "from-violet-500 to-indigo-700"  },
  { href: "/account/nutrition",   Icon: Apple,          title: "Nutrition & Mood",       desc: "Food recommendations based on mood science",               tier: "transform", color: "from-green-500 to-emerald-600"  },
  { href: "/account/wearable",    Icon: Watch,          title: "Body & Mind Tracker",    desc: "Smartwatch sync — HRV, sleep, heart rate & insights",      tier: "transform", color: "from-indigo-500 to-blue-600"    },
];

const TIER_ORDER = ["free", "base", "plus", "transform"];

const UPGRADE_COPY: Record<string, { title: string; desc: string }> = {
  free:  { title: "Unlock your full support toolkit", desc: "Get meditations, healing music and always-on AI support — from €10/mo." },
  base:  { title: "Unlock your AI companion & more",  desc: "Unlimited companion, daily challenges, grief support, habit SOS and more — €20/mo." },
  plus:  { title: "Unlock your full transformation",  desc: "7-day plans, daily diary, life goals, nutrition science & smartwatch tracking — €30/mo." },
};

export default async function AccountPage() {
  const [user, tier] = await Promise.all([currentUser(), getUserTier()]);
  const tierInfo = TIER_BADGES[tier];
  const tierIndex = TIER_ORDER.indexOf(tier);
  const upgrade = UPGRADE_COPY[tier];

  const unlockedFeatures = FEATURES.filter(f => tierIndex >= TIER_ORDER.indexOf(f.tier));
  const lockedFeatures   = FEATURES.filter(f => tierIndex < TIER_ORDER.indexOf(f.tier));

  return (
    <div className="p-6 md:p-8 max-w-4xl">

      {/* Greeting */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 👋
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">Your plan:</p>
            {tierInfo ? (
              <Badge variant={tierInfo.variant} className="font-bold">{tierInfo.label}</Badge>
            ) : (
              <Badge variant="secondary">Free</Badge>
            )}
          </div>
        </div>
        <Link href="/resources">
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors">
            <Shield className="h-3 w-3" /> Crisis resources
          </div>
        </Link>
      </div>

      {/* Unlocked features */}
      {unlockedFeatures.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your features</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unlockedFeatures.map((f) => (
              <Link key={f.href} href={f.href}
                className="bg-white rounded-2xl border border-border hover:border-primary/40 hover:shadow-md p-4 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-sm`}>
                    <f.Icon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                </div>
                <p className="font-semibold text-sm mb-0.5">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade prompt */}
      {tier !== "transform" && upgrade && (
        <div className="rounded-2xl gradient-c4u p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-2">
            {tier === "free" ? <Zap className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
            <p className="font-bold">{upgrade.title}</p>
          </div>
          <p className="text-white/80 text-sm mb-4">{upgrade.desc}</p>

          {/* Preview of locked features */}
          {lockedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {lockedFeatures.slice(0, 5).map(f => (
                <span key={f.href} className="flex items-center gap-1 text-xs bg-white/15 rounded-full px-2.5 py-1 text-white/80">
                  <f.Icon className="h-3 w-3" /> {f.title}
                </span>
              ))}
              {lockedFeatures.length > 5 && (
                <span className="text-xs bg-white/15 rounded-full px-2.5 py-1 text-white/80">+{lockedFeatures.length - 5} more</span>
              )}
            </div>
          )}

          <Link href="/premium">
            <Button variant="outline" size="sm" className="bg-white text-primary border-0 font-bold">
              See plans & start free trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Settings */}
      <div className="pt-4 border-t border-border">
        <Link href="/account/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Account settings & billing →
        </Link>
      </div>
    </div>
  );
}
