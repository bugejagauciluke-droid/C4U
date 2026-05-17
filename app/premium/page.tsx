import Link from "next/link";
import { CheckCircle, Sparkles, Zap, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readSiteConfig } from "@/lib/site-config";
import { CheckoutButton } from "./checkout-button";
import { auth, clerkClient } from "@clerk/nextjs/server";

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
    cta: "Start winning back control",
  };
  if (gender === "woman") return {
    headline: "A safe space that grows with you.",
    sub: "Feel truly supported, understood, and empowered — at every stage of what you're going through.",
    cta: "Start your transformation",
  };
  if (age === "18-25") return {
    headline: "Built for people who take their mental health seriously.",
    sub: "Real support, real tools, real results. Start free — upgrade when you're ready.",
    cta: "Join thousands feeling better",
  };
  if (age === "50+") return {
    headline: "Proven support. Genuine care.",
    sub: "Evidence-based tools and a compassionate companion — available whenever you need them, with no commitment.",
    cta: "Start with no risk",
  };
  return {
    headline: "Start free. Grow when you're ready.",
    sub: "7-day free trial on all paid plans. Cancel anytime. No hidden fees.",
    cta: "Choose your plan",
  };
}

const TIER_ICONS = [Zap, Star, Crown];
const TIER_GRADIENTS = [
  "from-teal-500 to-emerald-600",
  "from-violet-500 to-purple-700",
  "from-amber-500 to-orange-600",
];

const FREE_FEATURES = [
  "Personalised AI exercises on demand",
  "All 6 support situations",
  "No account or sign-up needed",
];

export default async function PremiumPage() {
  const { subscription } = readSiteConfig();
  const { tiers, footerNote } = subscription;
  const { gender, age } = await getUserProfile();
  const hero = getHeroCopy(gender, age);

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
      </div>

      {/* Pricing grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-10 items-start">
        {/* Free tier */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Free</p>
          <p className="text-3xl font-black mb-1">€0</p>
          <p className="text-xs text-muted-foreground mb-6">forever</p>
          <ul className="space-y-2.5 mb-8">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link href="/support">
            <Button variant="outline" size="sm" className="w-full">
              Get support now
            </Button>
          </Link>
        </div>

        {/* Paid tiers */}
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
                <p className="text-3xl font-black mb-1">€{tier.price}</p>
                <p className="text-xs text-muted-foreground mb-6">/month</p>
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

      <p className="text-center text-xs text-muted-foreground mb-10">{footerNote}</p>

      {/* Feature comparison */}
      <div className="rounded-2xl border border-border overflow-hidden mb-10">
        <div className="bg-muted/50 px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">What&apos;s included in each plan</h2>
        </div>
        {[
          { feature: "AI-personalised exercises", free: true, base: true, plus: true, transform: true },
          { feature: "Guided meditations", free: false, base: true, plus: true, transform: true },
          { feature: "Healing & focus music", free: false, base: true, plus: true, transform: true },
          { feature: "Weekly new content", free: false, base: true, plus: true, transform: true },
          { feature: "Unlimited AI companion", free: false, base: false, plus: true, transform: true },
          { feature: "AI remembers your story", free: false, base: false, plus: true, transform: true },
          { feature: "7-day support plans", free: false, base: false, plus: false, transform: true },
          { feature: "Priority support", free: false, base: false, plus: false, transform: true },
        ].map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-5 px-6 py-3.5 text-sm border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
            <span className="col-span-1 text-muted-foreground">{row.feature}</span>
            {[row.free, row.base, row.plus, row.transform].map((has, j) => (
              <div key={j} className="flex justify-center">
                {has
                  ? <CheckCircle className={`h-4 w-4 ${j === 2 ? "text-violet-500" : "text-teal-500"}`} />
                  : <span className="text-muted-foreground/30 text-base leading-none">—</span>
                }
              </div>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-5 px-6 py-2 bg-muted/30 text-xs font-semibold text-muted-foreground border-t border-border">
          <span></span>
          <span className="text-center">Free</span>
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
