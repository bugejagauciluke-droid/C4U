import Link from "next/link";
import {
  ArrowRight, Heart, Sparkles, Headphones, Music,
  MessageCircle, Star, CheckCircle, Building2, BookOpen,
  Target, Zap, Crown, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readSiteConfig } from "@/lib/site-config";
import { HeroChat } from "@/components/hero-chat";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

const TESTIMONIALS = [
  {
    quote: "I was at my friend's birthday feeling invisible. C4U gave me three things to do right there at the party. Within 20 minutes I actually felt present.",
    name: "Sarah M.",
    context: "Felt alone in a crowd",
  },
  {
    quote: "Going through the worst period of my life. C4U was there at 2am when I couldn't sleep and didn't want to wake anyone up. It actually listened.",
    name: "James T.",
    context: "Going through divorce",
  },
  {
    quote: "I typed out everything I was feeling and it came back with exactly what I needed. Not generic advice — it felt personal. I cried a little, honestly.",
    name: "Maria L.",
    context: "Burnout and job loss",
  },
];

const WHAT_YOU_GET = [
  {
    Icon: Headphones,
    title: "Guided meditations",
    desc: "8 sessions built for grief, anxiety, sleep, overwhelm, and more. Each one clinically designed — not generic wellness filler.",
    tier: "Base",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    Icon: Music,
    title: "Healing music",
    desc: "Curated tracks for sleep, focus, calm, and emotional processing. Something new every week.",
    tier: "Base",
    gradient: "from-rose-400 to-pink-600",
  },
  {
    Icon: MessageCircle,
    title: "AI Companion",
    desc: "Unlimited, 24/7. Voice mode. Remembers everything. Responds like a caring person who actually knows you — not a bot.",
    tier: "Plus",
    gradient: "from-sky-500 to-teal-600",
  },
  {
    Icon: Zap,
    title: "Daily Challenge",
    desc: "One personalised mission per day built from your actual life. 'Call Marco today'. 'Say what you've been holding back.' Streak tracking included.",
    tier: "Plus",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    Icon: BookOpen,
    title: "Daily Diary",
    desc: "Private journal with AI analysis. Track mood, sleep, food, digital habits, social life. The AI spots patterns you'd never notice yourself.",
    tier: "Transform",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    Icon: Target,
    title: "Life Goals & Roadmap",
    desc: "Tell C4U what you want. It builds a full plan — hourly habits, daily tasks, weekly milestones, monthly targets, yearly identity shift. Weekly review letter included.",
    tier: "Transform",
    gradient: "from-violet-500 to-indigo-700",
  },
];

const TIER_COLORS: Record<string, string> = {
  Base: "bg-teal-100 text-teal-700",
  Plus: "bg-violet-100 text-violet-700",
  Transform: "bg-amber-100 text-amber-700",
};

export default function LandingPage() {
  const { branding, subscription } = readSiteConfig();

  return (
    <>
      {/* ── HERO — full screen, chat-first ──────────────────────────────── */}
      <section className="relative min-h-[100svh] gradient-hero flex flex-col items-center justify-center px-4 pt-8 pb-16 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-teal-700/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-2xl mx-auto text-center space-y-8">
          {/* Wordmark */}
          <div className="flex items-center justify-center gap-2">
            <span className="h-8 w-8 rounded-full gradient-c4u-soft flex items-center justify-center shadow-md">
              <Heart className="h-4 w-4 text-white fill-white" />
            </span>
            <span className="text-white font-bold text-xl tracking-tight">{branding.appName}</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Whatever you&apos;re carrying,<br />
              <span className="bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-transparent">
                you don&apos;t have to carry it alone.
              </span>
            </h1>
            <p className="mt-4 text-white/55 text-lg md:text-xl">
              Tell C4U what&apos;s going on. Right now. No forms, no sign-up.
            </p>
          </div>

          {/* The chat — the hero IS the input */}
          <HeroChat />
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 via-white to-sky-50 border-y border-border">
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
                <p className="text-sm leading-relaxed italic mb-4 text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="gold" className="mb-4 px-4 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium — 7 days free
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Go deeper. <span className="gradient-text">Unlock everything.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The free support you just tried is just the beginning. Premium gives you a companion who knows you, a daily challenge built from your life, and a roadmap to become who you want to be.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {WHAT_YOU_GET.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                  <f.Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[f.tier]}`}>{f.tier}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Trial CTA */}
          <div className="max-w-md mx-auto text-center">
            <div className="rounded-2xl p-[2px] shadow-xl" style={{ background: "linear-gradient(135deg, #0d9488, #7c3aed)" }}>
              <div className="bg-white rounded-[14px] p-7">
                <p className="font-bold text-lg mb-1">Start free — 7 days, everything unlocked</p>
                <p className="text-sm text-muted-foreground mb-5">Full Transform access. No charge until your trial ends.</p>
                <Link href="/premium">
                  <Button variant="gradient" className="w-full" size="lg">
                    See plans & start free trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  From €{subscription.tiers[0]?.price}/month after trial · Cancel anytime
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              One trial per account and device. Auto-billing begins when trial ends.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOR TEAMS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> C4U for Teams
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Does your team need this?
            </h2>
            <p className="text-white/65 text-lg mb-6">
              Burnout, absenteeism, quiet quitting — most of it traces back to untreated mental health. C4U for Teams gives every employee private, always-available support for less than a coffee a week per person.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["Anonymous wellness dashboard", "Employee invite system", "Custom focus areas", "Monthly reports"].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-sm text-teal-300 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> {f}
                </span>
              ))}
            </div>
            <Link href="/enterprise">
              <Button className="bg-white text-slate-900 hover:bg-white/90 font-bold" size="lg">
                Explore C4U for Teams <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex-shrink-0 hidden md:block">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 min-w-[220px]">
              {[
                { label: "Avg engagement", value: "73%", color: "text-teal-400" },
                { label: "Burnout reduction", value: "−40%", color: "text-emerald-400" },
                { label: "ROI", value: "5×", color: "text-amber-400" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className={`text-3xl font-black ${color}`}>{value}</p>
                  <p className="text-white/50 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Heart className="h-12 w-12 mx-auto text-primary mb-6 fill-primary" />
          <h2 className="text-4xl md:text-5xl font-bold">
            You came this far.<br />
            <span className="gradient-text">That takes courage.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            C4U is here — right now, no sign-up needed. Just type.
          </p>
          <div className="mt-8">
            <ScrollToTopButton />
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
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
