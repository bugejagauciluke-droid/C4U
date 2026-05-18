import Link from "next/link";
import { CheckCircle, Sparkles, Zap, Star, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readSiteConfig } from "@/lib/site-config";
import { CheckoutButton } from "./checkout-button";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getTrialInfo } from "@/lib/subscription";

async function getUserProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return { gender: "unknown", age: "unknown" };
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
    return { gender: meta.gender ?? "unknown", age: meta.ageRange ?? "unknown" };
  } catch { return { gender: "unknown", age: "unknown" }; }
}

function getHeroCopy(gender: string, age: string) {
  if (gender === "man") return {
    headline: "The tools that actually work.",
    sub: "Direct. Practical. No fluff. C4U gives you what you need to get through hard times and come out stronger.",
    cta: "Start your free trial",
  };
  if (gender === "woman") return {
    headline: "A safe space that grows with you.",
    sub: "Feel truly supported, understood, and empowered — at every stage of what you're going through.",
    cta: "Start your free trial",
  };
  if (age === "18-25") return {
    headline: "Built for people who take their mental health seriously.",
    sub: "Real support, real tools, real results. Try everything free for 7 days.",
    cta: "Start your free trial",
  };
  if (age === "50+") return {
    headline: "Proven support. Genuine care.",
    sub: "Evidence-based tools and a compassionate companion — try everything free for 7 days, no risk.",
    cta: "Start your free trial",
  };
  return {
    headline: "7 days free. No commitment.",
    sub: "Try every feature of C4U free for 7 days. Your card is only charged if you decide to stay.",
    cta: "Start your free trial",
  };
}

const TIER_ICONS = [Zap, Star, Crown];
const TIER_GRADIENTS = [
  "from-teal-500 to-emerald-600",
  "from-violet-500 to-indigo-700",
  "from-amber-500 to-violet-700",
];

export default async function PremiumPage() {
  const { subscription } = readSiteConfig();
  const { tiers, footerNote } = subscription;
  const { gender, age } = await getUserProfile();
  const hero = getHeroCopy(gender, age);
  const trialInfo = await getTrialInfo();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <Badge variant="gold" className="mb-4 px-4 py-1">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Choose your plan
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">{hero.headline}</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">{hero.sub}</p>

        {/* Trial status banner */}
        {trialInfo.isOnTrial && (
          <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-md">
            <Shield className="h-4 w-4" />
            You have {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? "s" : ""} left in your free trial
          </div>
        )}
        {!trialInfo.isOnTrial && !trialInfo.trialUsed && (
          <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-md">
            <Shield className="h-4 w-4" />
            Start today — 7 days completely free
          </div>
        )}
        {trialInfo.trialUsed && !trialInfo.isOnTrial && (
          <div className="mt-6 inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-5 py-2.5 rounded-full">
            Your free trial has ended — subscribe to continue
          </div>
        )}
      </div>

      {/* Pricing grid — 3 paid tiers, no free tier */}
      <div className="grid md:grid-cols-3 gap-4 mb-6 items-start">
        {tiers.map((tier, i) => {
          const Icon = TIER_ICONS[i] ?? Star;
          const gradient = TIER_GRADIENTS[i] ?? "from-teal-500 to-emerald-600";
          return (
            <div
              key={tier.name}
              className={`rounded-2xl overflow-hidden ${
                tier.highlighted
                  ? "ring-2 ring-violet-500 shadow-xl shadow-violet-100"
                  : "border border-border"
              } bg-white`}
            >
              {tier.badge ? (
                <div className={`bg-gradient-to-r ${gradient} text-white text-xs font-bold text-center py-1.5 tracking-wide`}>
                  {tier.badge}
                </div>
              ) : (
                <div className="h-7" />
              )}
              <div className="p-6">
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{tier.name}</p>
                <p className="text-3xl font-black mb-0.5">€{tier.price}</p>
                <p className="text-xs text-muted-foreground mb-1">/month after trial</p>
                {!trialInfo.trialUsed && (
                  <p className="text-xs font-semibold text-teal-600 mb-5">7 days free →</p>
                )}
                {trialInfo.trialUsed && <div className="mb-5" />}
                <ul className="space-y-2.5 mb-8">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${tier.highlighted ? "text-violet-500" : "text-teal-500"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <CheckoutButton tier={tier.name} highlighted={tier.highlighted} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust line */}
      <p className="text-center text-xs text-muted-foreground mb-10">
        {trialInfo.trialUsed
          ? footerNote
          : "No charge for 7 days. Cancel before your trial ends and you'll never be billed. " + footerNote}
      </p>

      {/* Feature comparison */}
      <div className="rounded-2xl border border-border overflow-hidden mb-10">
        <div className="bg-muted/50 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">What&apos;s included in each plan</h2>
        </div>
        {[
          { feature: "AI-personalised exercises",  base: true,  plus: true,  transform: true  },
          { feature: "Guided meditations",          base: true,  plus: true,  transform: true  },
          { feature: "Healing & focus music",       base: true,  plus: true,  transform: true  },
          { feature: "Weekly new content",          base: true,  plus: true,  transform: true  },
          { feature: "Unlimited AI companion",      base: false, plus: true,  transform: true  },
          { feature: "Daily Challenge",             base: false, plus: true,  transform: true  },
          { feature: "AI remembers your story",     base: false, plus: true,  transform: true  },
          { feature: "7-day support plans",         base: false, plus: false, transform: true  },
          { feature: "Priority support",            base: false, plus: false, transform: true  },
        ].map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-4 px-6 py-3.5 text-sm border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
            <span className="col-span-1 text-muted-foreground">{row.feature}</span>
            {[row.base, row.plus, row.transform].map((has, j) => (
              <div key={j} className="flex justify-center">
                {has
                  ? <CheckCircle className={`h-4 w-4 ${j === 1 ? "text-violet-500" : "text-teal-500"}`} />
                  : <span className="text-muted-foreground/30 text-base leading-none">—</span>
                }
              </div>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-4 px-6 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground border-t border-border">
          <span></span>
          <span className="text-center">Base</span>
          <span className="text-center text-violet-600">Plus</span>
          <span className="text-center">Transform</span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Try the free support first
        </Link>
      </div>
    </div>
  );
}
