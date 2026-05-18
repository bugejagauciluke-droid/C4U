import Link from "next/link";
import {
  ArrowRight, CheckCircle, Shield, BarChart3, Users, Palette,
  Zap, Brain, TrendingDown, Heart, Building2, Globe2, Lock,
  ChevronRight, Sparkles, FileText, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { value: "€1,913", label: "lost per employee per year to mental health absence", source: "Deloitte, 2023" },
  { value: "76%", label: "of employees report at least one symptom of burnout", source: "Gallup" },
  { value: "5×", label: "return on investment for mental health programmes", source: "WHO" },
  { value: "40%", label: "reduction in absenteeism with proper mental wellness support", source: "APA" },
];

const FEATURES = [
  {
    Icon: BarChart3,
    title: "Anonymous wellness insights",
    desc: "See aggregate mental health trends across your team — most common stressors, engagement levels, burnout risk — without ever seeing individual data. Your team's privacy is absolute.",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    Icon: Users,
    title: "Simple employee access",
    desc: "Invite your whole team in minutes. Share a company invite link or bulk-import emails. Employees sign up, enter their code, and get instant full access.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    Icon: Palette,
    title: "Built around your team",
    desc: "Tell us your industry, your people's biggest challenges, and your company values. C4U adapts its AI, challenges, and content to what actually matters to your workforce.",
    gradient: "from-violet-500 to-indigo-700",
  },
  {
    Icon: FileText,
    title: "Monthly wellness reports",
    desc: "A clear, visual report for leadership — engagement rates, trend shifts, challenge completion — everything you need to show the board that your investment is working.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    Icon: Shield,
    title: "Enterprise-grade privacy",
    desc: "GDPR compliant. No individual data ever shared. All insights are anonymised and aggregated. You'll never know which employee is struggling — only that someone needs support.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    Icon: Brain,
    title: "AI that learns your culture",
    desc: "The more your team uses C4U, the more culturally attuned the AI becomes — picking up language patterns, industry pressures, and seasonal stressors specific to your organisation.",
    gradient: "from-indigo-500 to-violet-700",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about your team",
    desc: "A 15-minute call with our team. We learn your industry, team size, the biggest mental health challenges your people face, and what you want to measure.",
  },
  {
    step: "02",
    title: "We configure your workspace",
    desc: "C4U is set up with your company branding, focus areas, and wellness goals. Your invite link is ready within 48 hours.",
  },
  {
    step: "03",
    title: "Your team gets access",
    desc: "Employees click one link, sign up, and immediately have full C4U access. No IT integration required. No app store. Just a link.",
  },
  {
    step: "04",
    title: "You see the impact",
    desc: "Your admin dashboard goes live. Watch engagement grow. Monthly reports land in your inbox. Adjust focus areas any time.",
  },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    seats: "10–50 employees",
    price: "€9",
    unit: "per employee / month",
    features: [
      "Full C4U platform access",
      "Anonymous wellness dashboard",
      "Email invite system",
      "Monthly wellness report",
      "Email support",
    ],
    cta: "Get a quote",
    highlight: false,
  },
  {
    name: "Growth",
    seats: "51–250 employees",
    price: "€7",
    unit: "per employee / month",
    badge: "Most popular",
    features: [
      "Everything in Starter",
      "Custom branding & focus areas",
      "Dedicated account manager",
      "Slack / Teams integration",
      "Quarterly strategy review",
      "Custom challenge themes",
    ],
    cta: "Get a quote",
    highlight: true,
  },
  {
    name: "Enterprise",
    seats: "250+ employees",
    price: "Custom",
    unit: "volume pricing",
    features: [
      "Everything in Growth",
      "SSO / SAML integration",
      "Custom AI persona for your brand",
      "API access & HR system sync",
      "SLA guarantee",
      "On-site wellness workshops",
      "White-label option",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

const INDUSTRIES = [
  "Finance & Banking", "Technology", "Healthcare", "Legal",
  "Creative & Media", "Retail & Hospitality", "Manufacturing", "Education",
];

export default function EnterprisePage() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative gradient-hero pt-20 pb-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-1.5 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> C4U for Teams
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your team&apos;s mental health<br />
            <span className="text-teal-300">is your competitive advantage.</span>
          </h1>
          <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Give every employee a private mental wellness companion, personalised daily challenges, and evidence-based support — for less than your monthly coffee budget per person.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/enterprise/contact">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-bold px-8 shadow-xl">
                Book a free demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                See how it works
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.value} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center">
              <p className="text-2xl md:text-3xl font-black text-white">{s.value}</p>
              <p className="text-white/65 text-xs mt-1 leading-snug">{s.label}</p>
              <p className="text-white/35 text-xs mt-1">— {s.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Mental health is already costing you — <span className="gradient-text">you just can&apos;t see it.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Presenteeism, quiet quitting, sick days, turnover — most of it traces back to untreated mental health. Your team is absorbing the cost every day.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { Icon: TrendingDown, title: "Productivity loss", desc: "Employees struggling with mental health are up to 35% less productive — even when they show up.", color: "text-rose-500" },
              { Icon: Clock, title: "12+ days per year", desc: "The average employee experiencing burnout takes 12 additional sick days a year.", color: "text-amber-500" },
              { Icon: Users, title: "Talent retention", desc: "57% of employees cite mental health support as a key factor in staying with an employer.", color: "text-violet-500" },
            ].map(({ Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-border text-left">
                <Icon className={`h-8 w-8 ${color} mb-4`} />
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="purple" className="mb-4"><Sparkles className="h-3 w-3 mr-1" /> What you get</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Everything your team needs. <span className="gradient-text">Nothing they don&apos;t.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}>
                  <f.Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in <span className="gradient-text">48 hours.</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">No IT project. No integration work. No long procurement cycle. One call and your team is in.</p>
          </div>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex gap-5 items-start bg-white rounded-2xl border border-border p-6">
                <div className="h-10 w-10 rounded-xl gradient-c4u-soft text-white font-black text-sm flex items-center justify-center shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Trusted across industries</p>
          <div className="flex flex-wrap justify-center gap-3">
            {INDUSTRIES.map(ind => (
              <span key={ind} className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-muted-foreground">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="gold" className="mb-4"><Zap className="h-3 w-3 mr-1" /> Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Priced per person. <span className="gradient-text">Bespoke for your needs.</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every package is built around your team size, industry, and requirements. The prices below are starting points — your exact quote will reflect exactly what you need.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl overflow-hidden ${
                  tier.highlight
                    ? "ring-2 ring-violet-500 shadow-xl shadow-violet-100"
                    : "border border-border"
                } bg-white`}
              >
                {tier.badge ? (
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                    {tier.badge}
                  </div>
                ) : (
                  <div className="h-7" />
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{tier.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{tier.seats}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-black">{tier.price}</span>
                    {tier.price !== "Custom" && <span className="text-xs text-muted-foreground">{tier.unit}</span>}
                  </div>
                  {tier.price === "Custom" && (
                    <p className="text-xs text-muted-foreground mb-4">{tier.unit}</p>
                  )}
                  <ul className="space-y-2.5 my-6">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${tier.highlight ? "text-violet-500" : "text-teal-500"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/enterprise/contact">
                    <Button
                      className={`w-full ${tier.highlight ? "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white" : ""}`}
                      variant={tier.highlight ? undefined : "outline"}
                    >
                      {tier.cta} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            All plans include annual or monthly billing options · Volume discounts available · Minimum 10 seats
          </p>
        </div>
      </section>

      {/* ── PRIVACY CALLOUT ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <Lock className="h-10 w-10 text-teal-400 mx-auto mb-5" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Privacy isn&apos;t a feature. It&apos;s the foundation.
          </h2>
          <p className="text-white/65 mb-8 max-w-xl mx-auto">
            Your HR team never sees individual data. Managers never see who said what. The only data you receive is anonymous, aggregated, and designed to help you understand trends — never to identify individuals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["GDPR compliant", "No individual tracking", "End-to-end encryption", "Data stays in EU", "Annual security audit"].map(tag => (
              <span key={tag} className="flex items-center gap-1.5 text-sm text-teal-300 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <Shield className="h-3.5 w-3.5" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 gradient-hero">
        <div className="max-w-2xl mx-auto text-center">
          <Globe2 className="h-12 w-12 text-teal-300 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to invest in your people?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Book a free 20-minute demo. We&apos;ll show you the platform, understand your team&apos;s needs, and send you a custom quote within 24 hours.
          </p>
          <Link href="/enterprise/contact">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-bold px-10 shadow-xl">
              Book your free demo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-white/45 text-xs mt-4">No commitment. No sales pressure. Just a conversation.</p>
        </div>
      </section>

    </div>
  );
}
