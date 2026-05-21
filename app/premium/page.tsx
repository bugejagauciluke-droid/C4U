import Link from "next/link";
import {
  CheckCircle, Sparkles, Zap, Star, Crown, Shield,
  Headphones, Music, Heart, MessageCircle, Mic, Flame,
  BookOpen, Target, BarChart3, FileText, Brain, Clock,
  Users, TrendingUp, Eye, AlertCircle, ChevronRight,
} from "lucide-react";
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
  };
  if (gender === "woman") return {
    headline: "A safe space that grows with you.",
    sub: "Feel truly supported, understood, and empowered — at every stage of what you're going through.",
  };
  if (age === "18-25") return {
    headline: "Built for people who take their mental health seriously.",
    sub: "Real support, real tools, real results. Try everything free for 7 days.",
  };
  if (age === "50+") return {
    headline: "Proven support. Genuine care.",
    sub: "Evidence-based tools and a compassionate companion — try everything free for 7 days.",
  };
  return {
    headline: "7 days free. Everything unlocked.",
    sub: "Try every single feature of C4U free for 7 days. Cancel before and you pay nothing.",
  };
}

const TIER_ICONS = [Zap, Star, Crown];
const TIER_GRADIENTS = [
  "from-teal-500 to-emerald-600",
  "from-violet-500 to-indigo-700",
  "from-amber-500 to-violet-700",
];

// ── Full feature breakdown per tier ──────────────────────────────────────────
const TIER_FEATURES_DETAIL = [
  {
    name: "Base",
    tagline: "The foundation of a calmer mind.",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    gradient: "from-teal-500 to-emerald-600",
    sections: [
      {
        heading: "Guided Meditations",
        Icon: Headphones,
        features: [
          { name: "8 guided meditations", detail: "Grounding, sleep, grief, anxiety, overwhelm, connection, morning intention, and emotional release" },
          { name: "Colour-psychology optimised", detail: "Each session designed with clinical research on colour, sound, and nervous system response" },
          { name: "6 to 15 minutes", detail: "Short enough to do anywhere, long enough to actually shift your state" },
          { name: "Audio player with pause & replay", detail: "Pick up where you left off, any time" },
        ],
      },
      {
        heading: "Music Library",
        Icon: Music,
        features: [
          { name: "Healing & focus music", detail: "Curated tracks for focus, sleep, calm, and emotional processing" },
          { name: "New tracks added weekly", detail: "Fresh content every week — always something new to try" },
        ],
      },
      {
        heading: "Always-on support",
        Icon: Heart,
        features: [
          { name: "Type anything — get help instantly", detail: "No categories to choose, no forms to fill. Just write what's going on and receive personalised exercises within seconds." },
          { name: "Crisis resources always visible", detail: "741741, 112, and Befrienders.org accessible from every page, always." },
        ],
      },
    ],
  },
  {
    name: "Plus",
    tagline: "Your 24/7 companion, coach, and confidant.",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    gradient: "from-violet-500 to-indigo-700",
    sections: [
      {
        heading: "AI Companion",
        Icon: MessageCircle,
        features: [
          { name: "Unlimited conversation, 24/7", detail: "No message limits. Talk for 5 minutes or 5 hours. Your companion is always there." },
          { name: "Remembers your full story", detail: "Everything you share is remembered. It knows your situation, your people, your patterns." },
          { name: "Gender & age personalized", detail: "Responds differently based on how you communicate — your tone, your pace, your language" },
          { name: "Sounds human, not like a product", detail: "Short sentences. Real warmth. No clinical language or generic affirmations." },
        ],
      },
      {
        heading: "Voice Mode",
        Icon: Mic,
        features: [
          { name: "Speak freely — C4U speaks back", detail: "Full voice conversation mode, hands-free. Uses your device's native speech engine — no extra app needed." },
          { name: "Warm voice selection", detail: "Automatically picks the calmest available voice on your device" },
          { name: "Works alongside typing", detail: "Switch between voice and text at any point in the conversation" },
        ],
      },
      {
        heading: "Daily Challenge",
        Icon: Flame,
        features: [
          { name: "One personalised mission every day", detail: "Built from what you've actually shared — 'Call Marco', 'Go speak to your crush', 'Say what you've been holding back'" },
          { name: "6 challenge categories", detail: "Social, courage, movement, mindset, connection, and growth" },
          { name: "3 difficulty levels", detail: "Gentle (small step), Bold (standard effort), Brave (face what you've been avoiding)" },
          { name: "Streak tracking", detail: "See your consecutive days — momentum is built, not motivated into" },
          { name: "Friend-style recommendations", detail: "Sometimes suggests a book, journal, or resource — written like a knowing friend, never an ad" },
        ],
      },
      {
        heading: "Safety",
        Icon: AlertCircle,
        features: [
          { name: "Crisis detection across full history", detail: "Scans every message for 14 warning patterns. Escalates gradually before it becomes urgent." },
          { name: "Crisis banner with tap-to-call", detail: "Emergency resources appear immediately when distress is detected" },
          { name: "Location sharing option", detail: "Share your location when needed — for emergency services or to find nearby support" },
        ],
      },
    ],
  },
  {
    name: "Transform",
    tagline: "Track your whole life. Become who you want to be.",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    gradient: "from-amber-500 to-violet-700",
    sections: [
      {
        heading: "7-Day Support Plans",
        Icon: FileText,
        features: [
          { name: "AI-built daily plan for your exact situation", detail: "Morning, afternoon, and evening activities built around your specific challenge — grief, anxiety, burnout, confidence" },
          { name: "Daily affirmation", detail: "A personal affirmation generated for each day of your plan" },
          { name: "Full 7-day view with expandable days", detail: "See the whole week at once, expand each day for detail" },
        ],
      },
      {
        heading: "Daily Diary",
        Icon: BookOpen,
        features: [
          { name: "Private daily journal", detail: "Tell C4U everything — what happened, how you felt, who you saw" },
          { name: "Mood, energy & sleep tracking", detail: "Interactive sliders that track your physical and emotional state every day" },
          { name: "Food, drink & activity logging", detail: "Log what you ate, drank, how you moved — everything feeds the analysis" },
          { name: "Digital life section", detail: "Screen time, apps used, content consumed, significant conversations — the AI sees the full picture" },
          { name: "AI reflection as your closest friend", detail: "Personal response to your day — not generic, references exactly what you shared" },
          { name: "Pattern spotting", detail: "The AI notices what you don't: 'When you sleep under 6 hours, your mood drops to 5 or below every time'" },
          { name: "Follow-up questions", detail: "2 personal questions each day — your answers carry into the next session" },
          { name: "14-day calendar view", detail: "See your history, revisit past entries, track your evolution" },
        ],
      },
      {
        heading: "Life Goals & Roadmap",
        Icon: Target,
        features: [
          { name: "Your north star goal", detail: "Set one specific, ambitious goal — the AI builds your entire roadmap around it" },
          { name: "Personalised full roadmap", detail: "Accounts for your current situation, obstacles, strengths, and timeline" },
          { name: "Micro-habits (hourly)", detail: "Small things to build into every single day that compound over time" },
          { name: "Daily non-negotiables (checkable)", detail: "3–5 tasks that move the needle today — resets each morning" },
          { name: "Weekly milestones (checkable)", detail: "Measurable checkpoints so you always know exactly where you stand" },
          { name: "Monthly targets", detail: "Significant progress markers with proof criteria — 'how will you know you hit this?'" },
          { name: "Yearly identity vision", detail: "Not just what you'll achieve — who you'll have become" },
          { name: "Weekly life review letter", detail: "The AI reads your diary + goal progress and writes you a personal review: wins, blind spots, focus for next week" },
          { name: "Progress score", detail: "0–100 weekly progress score based on your diary data and completed milestones" },
        ],
      },
      {
        heading: "Analytics & Insights",
        Icon: BarChart3,
        features: [
          { name: "Digital habits analysis", detail: "Your screen time and content choices analysed against your mood, energy, and goals" },
          { name: "Social influence mapping", detail: "The AI identifies what (and who) is helping vs hurting your progress" },
          { name: "Mood & energy trend tracking", detail: "7-week rolling view of your emotional state — spot patterns before they become problems" },
          { name: "Goal progress dashboard", detail: "Daily task completion, streak data, and weekly progress all in one view" },
        ],
      },
    ],
  },
];

// ── Full comparison table ──────────────────────────────────────────────────────
const COMPARISON = [
  // Free (always available)
  { feature: "AI-powered support — type anything, get help now", free: true,  base: true,  plus: true,  transform: true,  note: "" },
  { feature: "Personalised exercises for your exact moment",     free: true,  base: true,  plus: true,  transform: true,  note: "" },
  { feature: "Crisis resources always visible",                  free: true,  base: true,  plus: true,  transform: true,  note: "" },
  // Base
  { feature: "Guided meditations (8 sessions)",   free: false, base: true,  plus: true,  transform: true,  note: "" },
  { feature: "Healing & focus music library",     free: false, base: true,  plus: true,  transform: true,  note: "" },
  { feature: "New content weekly",                free: false, base: true,  plus: true,  transform: true,  note: "" },
  // Plus
  { feature: "AI Companion — unlimited, 24/7",    free: false, base: false, plus: true,  transform: true,  note: "" },
  { feature: "Voice mode (speak & listen)",       free: false, base: false, plus: true,  transform: true,  note: "" },
  { feature: "AI remembers your full story",      free: false, base: false, plus: true,  transform: true,  note: "" },
  { feature: "Daily Challenge + streak",          free: false, base: false, plus: true,  transform: true,  note: "" },
  { feature: "Gender & age-personalised AI",      free: false, base: false, plus: true,  transform: true,  note: "" },
  { feature: "Crisis detection & safety banner",  free: false, base: false, plus: true,  transform: true,  note: "" },
  { feature: "Location sharing in crisis",        free: false, base: false, plus: true,  transform: true,  note: "" },
  // Transform
  { feature: "Personalised 7-day support plans",  free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Daily Diary with AI reflection",    free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Mood, energy & sleep tracking",     free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Food, drink & activity log",        free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Digital habits & screen time",      free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Life Goals + full roadmap",         free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Hourly → yearly milestone tracking",free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Weekly life review letter",         free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Pattern spotting & insights",       free: false, base: false, plus: false, transform: true,  note: "" },
  { feature: "Progress score & dashboard",        free: false, base: false, plus: false, transform: true,  note: "" },
];

export default async function PremiumPage() {
  const { subscription } = readSiteConfig();
  const { tiers, footerNote } = subscription;
  const { gender, age } = await getUserProfile();
  const hero = getHeroCopy(gender, age);
  const trialInfo = await getTrialInfo();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

      {/* ── Header ── */}
      <div className="text-center">
        <Badge variant="gold" className="mb-4 px-4 py-1">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Choose your plan
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">{hero.headline}</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">{hero.sub}</p>

        {/* Trial banner */}
        <div className="mt-6">
          {trialInfo.isOnTrial && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-md">
              <Shield className="h-4 w-4" />
              {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? "s" : ""} left in your free trial — you have full Transform access
            </div>
          )}
          {!trialInfo.isOnTrial && !trialInfo.trialUsed && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-md">
              <Shield className="h-4 w-4" />
              Start today — 7 days completely free, all features unlocked
            </div>
          )}
          {trialInfo.trialUsed && !trialInfo.isOnTrial && (
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-5 py-2.5 rounded-full">
              Your free trial has ended — subscribe below to continue
            </div>
          )}
        </div>
      </div>

      {/* ── Pricing cards ── */}
      <div>
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {tiers.map((tier, i) => {
            const Icon = TIER_ICONS[i] ?? Star;
            const gradient = TIER_GRADIENTS[i] ?? "from-teal-500 to-emerald-600";
            const detail = TIER_FEATURES_DETAIL[i];
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
                ) : <div className="h-7" />}
                <div className="p-6">
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{tier.name}</p>
                  {detail && <p className="text-xs text-muted-foreground mb-3 italic">{detail.tagline}</p>}
                  <p className="text-3xl font-black mb-0.5">€{tier.price}</p>
                  <p className="text-xs text-muted-foreground mb-1">/month after trial</p>
                  {!trialInfo.trialUsed && (
                    <p className="text-xs font-semibold text-teal-600 mb-5">7 days free →</p>
                  )}
                  {trialInfo.trialUsed && <div className="mb-5" />}
                  <ul className="space-y-2 mb-6">
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
        <p className="text-center text-xs text-muted-foreground">
          {trialInfo.trialUsed
            ? footerNote
            : "No charge for 7 days. Cancel before your trial ends and you'll never be billed. " + footerNote}
        </p>
      </div>

      {/* ── Feature deep-dive per tier ── */}
      <div className="space-y-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Every feature, explained.</h2>
          <p className="text-muted-foreground">No vague bullet points. Here&apos;s exactly what you get in each plan.</p>
        </div>

        {TIER_FEATURES_DETAIL.map((tier, ti) => (
          <div key={tier.name} className={`rounded-3xl border ${tier.border} ${tier.bg} p-8`}>
            <div className="flex items-center gap-3 mb-7">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                {ti === 0 ? <Zap className="h-5 w-5 text-white" /> : ti === 1 ? <Star className="h-5 w-5 text-white" /> : <Crown className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.tagline}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {tier.sections.map(section => (
                <div key={section.heading}>
                  <div className="flex items-center gap-2 mb-4">
                    <section.Icon className={`h-4 w-4 ${tier.color}`} />
                    <h4 className={`font-semibold text-sm ${tier.color}`}>{section.heading}</h4>
                  </div>
                  <ul className="space-y-3">
                    {section.features.map(f => (
                      <li key={f.name}>
                        <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {ti < TIER_FEATURES_DETAIL.length - 1 && (
              <div className="mt-7 pt-6 border-t border-current/10">
                <p className="text-xs text-muted-foreground">
                  <strong className={tier.color}>{TIER_FEATURES_DETAIL[ti + 1].name}</strong> includes everything above, plus:
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Full comparison table ── */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Full feature comparison</h2>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-5 px-5 py-3 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground">
            <span className="col-span-1"></span>
            <span className="text-center">Free</span>
            <span className="text-center">Base</span>
            <span className="text-center text-violet-600">Plus</span>
            <span className="text-center text-amber-600">Transform</span>
          </div>

          {/* Section: Always free */}
          <div className="px-5 py-2 bg-slate-50 border-b border-border">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Always available — no subscription needed</p>
          </div>
          {COMPARISON.filter(r => r.free).map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-5 px-5 py-3 text-sm border-b border-border/50 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
              <span className="col-span-1 text-gray-600 text-xs leading-snug">{row.feature}</span>
              {[row.free, row.base, row.plus, row.transform].map((has, j) => (
                <div key={j} className="flex justify-center items-center">
                  {has ? <CheckCircle className={`h-4 w-4 ${j === 2 ? "text-violet-500" : j === 3 ? "text-amber-500" : "text-teal-500"}`} />
                       : <span className="text-muted-foreground/25 text-base leading-none">—</span>}
                </div>
              ))}
            </div>
          ))}

          {/* Section: Base */}
          <div className="px-5 py-2 bg-teal-50 border-b border-border">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Base plan (€10/mo)</p>
          </div>
          {COMPARISON.filter(r => r.base && !r.free).map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-5 px-5 py-3 text-sm border-b border-border/50 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
              <span className="col-span-1 text-gray-600 text-xs leading-snug">{row.feature}</span>
              {[row.free, row.base, row.plus, row.transform].map((has, j) => (
                <div key={j} className="flex justify-center items-center">
                  {has ? <CheckCircle className={`h-4 w-4 ${j === 2 ? "text-violet-500" : j === 3 ? "text-amber-500" : "text-teal-500"}`} />
                       : <span className="text-muted-foreground/25 text-base leading-none">—</span>}
                </div>
              ))}
            </div>
          ))}

          {/* Section: Plus */}
          <div className="px-5 py-2 bg-violet-50 border-b border-border">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wide">Plus plan (€20/mo) — Most Popular</p>
          </div>
          {COMPARISON.filter(r => r.plus && !r.base).map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-5 px-5 py-3 text-sm border-b border-border/50 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
              <span className="col-span-1 text-gray-600 text-xs leading-snug">{row.feature}</span>
              {[row.free, row.base, row.plus, row.transform].map((has, j) => (
                <div key={j} className="flex justify-center items-center">
                  {has ? <CheckCircle className={`h-4 w-4 ${j === 2 ? "text-violet-500" : j === 3 ? "text-amber-500" : "text-teal-500"}`} />
                       : <span className="text-muted-foreground/25 text-base leading-none">—</span>}
                </div>
              ))}
            </div>
          ))}

          {/* Section: Transform */}
          <div className="px-5 py-2 bg-amber-50 border-b border-border">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Transform plan (€30/mo)</p>
          </div>
          {COMPARISON.filter(r => r.transform && !r.plus).map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-5 px-5 py-3 text-sm border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
              <span className="col-span-1 text-gray-600 text-xs leading-snug">{row.feature}</span>
              {[row.free, row.base, row.plus, row.transform].map((has, j) => (
                <div key={j} className="flex justify-center items-center">
                  {has ? <CheckCircle className={`h-4 w-4 ${j === 3 ? "text-amber-500" : "text-teal-500"}`} />
                       : <span className="text-muted-foreground/25 text-base leading-none">—</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="text-center space-y-4">
        {!trialInfo.trialUsed && (
          <div className="bg-gradient-to-r from-teal-500 to-violet-600 rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Start your 7-day free trial</h2>
            <p className="text-white/75 mb-6 max-w-md mx-auto">Every feature. Every plan. Free for 7 days. No charge until your trial ends — and you can cancel any time before that.</p>
            <Link href="#pricing">
              <Button className="bg-white text-violet-700 hover:bg-white/90 font-bold px-8" size="lg">
                Choose your plan <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
        <Link href="/support" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Try the free support first — no sign-up needed
        </Link>
      </div>

    </div>
  );
}
