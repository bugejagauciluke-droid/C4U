import Link from "next/link";
import { getUserTier } from "@/lib/subscription";
import { Headphones, Music, MessageCircle, Star, Lock, ArrowRight, Zap, BookOpen, Target, Apple, Brain, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/account/meditations", label: "Meditations",      Icon: Headphones,     feature: "base"      },
  { href: "/account/music",       label: "Music",             Icon: Music,           feature: "base"      },
  { href: "/account/companion",   label: "AI Companion",      Icon: MessageCircle,   feature: "plus"      },
  { href: "/account/challenge",   label: "Daily Challenge",   Icon: Zap,             feature: "plus"      },
  { href: "/account/plans",       label: "7-Day Plans",       Icon: Star,            feature: "transform" },
  { href: "/account/diary",       label: "Daily Diary",       Icon: BookOpen,        feature: "transform" },
  { href: "/account/goals",       label: "Life Goals",        Icon: Target,          feature: "transform" },
  { href: "/account/nutrition",   label: "Nutrition & Mood",  Icon: Apple,           feature: "transform" },
  { href: "/account/conditions",  label: "Condition Support", Icon: Brain,           feature: "plus"      },
  { href: "/account/grief",       label: "Grief Support",     Icon: Heart,           feature: "plus"      },
  { href: "/account/habits",      label: "Break a Habit",     Icon: RefreshCw,       feature: "plus"      },
];

const TIER_ORDER = ["free", "base", "plus", "transform"];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const tier = await getUserTier();
  const isSubscribed = tier !== "free";

  if (!isSubscribed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Premium content</h1>
          <p className="text-muted-foreground mb-8">Upgrade to access guided meditations, healing music, your AI companion, and 7-day support plans.</p>
          <Link href="/premium">
            <Button variant="gradient" size="lg">
              See plans <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-border bg-white">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Premium</p>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {NAV.map((item) => {
            const unlocked = TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(item.feature);
            return (
              <Link key={item.href} href={unlocked ? item.href : "/premium"}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group
                  ${unlocked ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "text-muted-foreground/50 cursor-not-allowed"}`}>
                <span className="flex items-center gap-2.5">
                  <item.Icon className="h-4 w-4" />{item.label}
                </span>
                {!unlocked && <Lock className="h-3 w-3" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-0.5">
          <Link href="/account/settings" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors">
            Settings
          </Link>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors">
            ← Talk to C4U
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-muted/20">{children}</div>
    </div>
  );
}
