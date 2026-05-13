import Link from "next/link";
import {
  ArrowRight, Heart, Shield, Sparkles, Users, Headphones,
  Music, MessageCircle, Star, CheckCircle, HandHeart,
  Wind, Anchor, Activity, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readSiteConfig } from "@/lib/site-config";

const SITUATIONS = [
  { label: "Lonely in a crowd", gradient: "from-indigo-500 to-violet-700" },
  { label: "Going through divorce", gradient: "from-rose-500 to-pink-700" },
  { label: "Job loss or career stress", gradient: "from-amber-500 to-orange-600" },
  { label: "Social anxiety", gradient: "from-fuchsia-500 to-purple-700" },
  { label: "Overwhelmed & burnt out", gradient: "from-sky-500 to-blue-700" },
  { label: "Just feeling low", gradient: "from-slate-600 to-gray-800" },
];

const EXERCISE_TYPES = [
  { Icon: Wind, label: "Breathing", color: "text-sky-600 bg-sky-100" },
  { Icon: Anchor, label: "Grounding", color: "text-emerald-700 bg-emerald-100" },
  { Icon: Users, label: "Connection", color: "text-pink-600 bg-pink-100" },
  { Icon: Activity, label: "Movement", color: "text-amber-700 bg-amber-100" },
  { Icon: Brain, label: "Mindset", color: "text-violet-600 bg-violet-100" },
];

const PREMIUM_FEATURES = [
  { Icon: Headphones, title: "Guided Meditations", desc: "10-minute audio meditations for your exact situation", gradient: "from-indigo-500 to-violet-700" },
  { Icon: Music, title: "Healing Music", desc: "Curated playlists: calm, focus, confidence, sleep", gradient: "from-rose-500 to-pink-700" },
  { Icon: MessageCircle, title: "AI Companion", desc: "Extended memory-enabled conversations with a companion who knows you", gradient: "from-teal-500 to-emerald-700" },
  { Icon: Star, title: "7-Day Support Plan", desc: "A personalised daily plan to rebuild calm, confidence, and connection", gradient: "from-amber-500 to-orange-600" },
];

const TESTIMONIALS = [
  {
    quote: "I was at my friend's birthday feeling invisible. C4U gave me three things to do right there at the party. Within 20 minutes I actually felt present.",
    name: "Sarah M.",
    context: "Single mum, felt lonely at a social event",
  },
  {
    quote: "Going through divorce is the hardest thing I've ever done. C4U was there at 2am when I couldn't sleep and didn't want to wake anyone up.",
    name: "James T.",
    context: "Going through divorce",
  },
  {
    quote: "Lost my job after 12 years. C4U helped me stay grounded while I figured out next steps. The exercises actually work.",
    name: "Maria L.",
    context: "Recovering from sudden job loss",
  },
];

export default function LandingPage() {
  const { branding, landing, subscription } = readSiteConfig();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero py-28 px-4">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-teal-700/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <Badge variant="teal" className="mb-6 px-4 py-1 text-xs">
            <Shield className="h-3 w-3 mr-1.5" /> {branding.heroBadge}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            {landing.heroHeadline.includes("alone") ? (
              <>
                {landing.heroHeadline.split("alone")[0]}
                <span className="bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-transparent">
                  alone.
                </span>
              </>
            ) : (
              landing.heroHeadline
            )}
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {landing.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/support">
              <Button variant="gradient" size="lg" className="text-base shadow-xl shadow-teal-900/30">
                {landing.ctaPrimary} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="dark" size="lg" className="text-base">
                {landing.ctaSecondary}
              </Button>
            </a>
          </div>
          <p className="mt-5 text-sm text-white/40">No sign-up. No credit card. Works right now.</p>
        </div>
      </section>

      {/* ── SITUATION CHIPS ──────────────────────────────────────── */}
      <section className="bg-white border-b border-border py-10 px-4">
        <p className="text-center text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">
          C4U helps with
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {SITUATIONS.map((s) => (
            <Link key={s.label} href="/support">
              <div className={`rounded-full text-white text-sm font-semibold px-5 py-2 bg-gradient-to-r ${s.gradient} hover:opacity-90 transition-opacity shadow-sm`}>
                {s.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/40">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="teal" className="mb-4">{landing.howItWorksTitle}</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-16">
            Support in <span className="gradient-text">minutes, not days.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {landing.steps.map((step, i) => (
              <div key={i}>
                <div className="h-14 w-14 rounded-2xl gradient-c4u-soft text-white text-2xl font-black flex items-center justify-center mx-auto mb-5 shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/support">
              <Button variant="gradient" size="lg">
                <HandHeart className="h-5 w-5" /> Try it now — free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXERCISE TYPES ───────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What kind of exercises?</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            C4U picks from five types of proven technique — matched to your exact situation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {EXERCISE_TYPES.map((t) => (
              <div key={t.label} className={`flex items-center gap-2 px-5 py-3 rounded-full ${t.color} font-semibold text-sm`}>
                <t.Icon className="h-4 w-4" />{t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 via-white to-violet-50 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Real moments. <span className="gradient-text">Real relief.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREE VS PREMIUM ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Free forever. <span className="gradient-text">Go deeper with Premium.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-white p-7">
              <Badge variant="green" className="mb-4">Free — always</Badge>
              <h3 className="text-xl font-bold mb-1">Immediate support</h3>
              <p className="text-sm text-muted-foreground mb-5">No sign-up needed. Just open C4U and get help.</p>
              <ul className="space-y-2.5 mb-6">
                {["AI-powered exercise recommendations", "All 6 situation types", "4–5 personalised exercises per session", "Breathing, grounding, mindset & more"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/support">
                <Button variant="outline" className="w-full">Get free support now</Button>
              </Link>
            </div>

            <div className="rounded-2xl p-[2px] shadow-lg" style={{ background: "linear-gradient(135deg, #0d9488, #7c3aed)" }}>
              <div className="bg-white rounded-[14px] p-7 h-full">
                <Badge variant="purple" className="mb-4">
                  <Sparkles className="h-3 w-3 mr-1" /> Premium — from €{subscription.tiers[0]?.price}/mo
                </Badge>
                <h3 className="text-xl font-bold mb-1">Deeper healing</h3>
                <p className="text-sm text-muted-foreground mb-5">{subscription.freeTrialText}</p>
                <ul className="space-y-2.5 mb-6">
                  {(subscription.tiers[1]?.features ?? subscription.tiers[0]?.features ?? []).map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-violet-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/premium">
                  <Button variant="gradient" className="w-full">
                    Unlock Premium <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PREMIUM FEATURES ─────────────────────────────────────── */}
      <section className="py-20 px-4 gradient-hero">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="gold" className="mb-4"><Sparkles className="h-3 w-3 mr-1" /> Premium</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything you need to heal</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.title} className="relative rounded-2xl overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-85`} />
                <div className="relative p-6 text-white">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <f.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                  <p className="text-sm text-white/80">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/premium">
              <Button variant="dark" size="lg">See Premium plans <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Heart className="h-12 w-12 mx-auto text-primary mb-6 fill-primary" />
          <h2 className="text-4xl md:text-5xl font-bold">
            You came this far.<br />
            <span className="gradient-text">That takes courage.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            C4U is here — right now, free, no sign-up needed.
          </p>
          <div className="mt-8">
            <Link href="/support">
              <Button variant="gradient" size="lg" className="text-base shadow-xl shadow-teal-200">
                <HandHeart className="h-5 w-5" /> Get support now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <p className="font-bold gradient-text text-base mb-1">{branding.appName}</p>
        <p>{branding.footerText}</p>
        <p className="mt-4 text-xs">
          <strong>Crisis line:</strong> Text HOME to 741741 &nbsp;·&nbsp;{" "}
          <a href="https://www.befrienders.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">befrienders.org</a>
        </p>
        <div className="mt-5 flex items-center justify-center gap-5 text-xs">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-primary transition-colors">Mental Health Disclaimer</Link>
        </div>
      </footer>
    </>
  );
}
