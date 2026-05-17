"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Wind, Anchor, Users, Activity, Brain, PenLine,
  Lock, Sparkles, ArrowLeft, Music, Headphones, MessageCircle,
  Moon, Briefcase, Cloud, Star, ChevronDown, ChevronUp, ArrowRight, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { SituationConfig } from "@/lib/site-config";
import type { Tier } from "@/lib/subscription-utils";
import { hasFeature } from "@/lib/subscription-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string; title: string; description: string; duration: string;
  type: "breathing"|"grounding"|"social"|"movement"|"cognitive"|"journaling";
  why: string;
}
interface SupportResponse { acknowledgment: string; exercises: Exercise[]; closingMessage: string; }
type Step = "entry"|"describe"|"loading"|"results";

export interface PageConfig {
  pageHeadline: string; pageSubtitle: string;
  situations: SituationConfig[];
  pricingHeadline: string; price: string; pricingSubtext: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ICONS: Record<string, typeof Heart> = {
  "lonely-crowd": Users, "loss-heartbreak": Heart, "job-career": Briefcase,
  "social-pressure": Sparkles, "overwhelmed": Cloud, "just-low": Moon,
};
const getIcon = (id: string) => ICONS[id] ?? Heart;

// Exercise type gradients — science-optimised:
// breathing: sky→blue (max parasympathetic, respiratory association)
// grounding: teal→emerald (earth, roots, heart chakra)
// social: rose→pink SOFTENED (love/warmth — softer than rose→rose-600 to avoid stimulation)
// movement: amber→yellow-green (solar plexus energy, NOT orange which raises cortisol)
// cognitive: violet→indigo (insight + introspection, indigo = deep thought)
// journaling: violet→indigo (reflection, written introspection)
const EX_CFG: Record<Exercise["type"], { gradient: string; Icon: typeof Wind; label: string }> = {
  breathing:  { gradient: "from-sky-400 to-blue-600",      Icon: Wind,    label: "Breathing"  },
  grounding:  { gradient: "from-teal-500 to-emerald-600",  Icon: Anchor,  label: "Grounding"  },
  social:     { gradient: "from-rose-400 to-pink-500",     Icon: Users,   label: "Connection" },
  movement:   { gradient: "from-amber-400 to-amber-600",   Icon: Activity,label: "Movement"   },
  cognitive:  { gradient: "from-violet-500 to-indigo-700", Icon: Brain,   label: "Mindset"    },
  journaling: { gradient: "from-violet-400 to-indigo-600", Icon: PenLine, label: "Reflection" },
};

const PREMIUM_CARDS = [
  { Icon: Headphones, title: "Guided Meditation",   subtitle: "10-min audio meditation for your exact situation",         gradient: "from-indigo-500 to-violet-600", tag: "Audio · 10 min",     feature: "meditations", requiredTier: "Base",      href: "/account/meditations" },
  { Icon: Music,      title: "Healing Music",        subtitle: "Curated playlists: calm, focus, confidence, sleep",        gradient: "from-rose-400 to-pink-600",    tag: "Music · Always on",  feature: "music",        requiredTier: "Base",      href: "/account/music"       },
  { Icon: MessageCircle, title: "Your AI Companion",subtitle: "Extended memory-enabled conversations just for you",        gradient: "from-sky-500 to-teal-600",     tag: "Chat · Unlimited",   feature: "companion",    requiredTier: "Plus",      href: "/account/companion"   },
  { Icon: Star,       title: "7-Day Support Plan",   subtitle: "Personalised daily plan to rebuild calm and confidence",   gradient: "from-amber-400 to-violet-600", tag: "Plan · Personalised", feature: "plans",       requiredTier: "Transform", href: "/account/plans"       },
];

const LOADING_MSGS = ["Reading what you shared…","Finding what fits your situation…","Choosing exercises just for you…","Almost ready…"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const [open, setOpen] = useState(false);
  const cfg = EX_CFG[exercise.type] ?? EX_CFG.cognitive;
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: index*0.1, duration:0.4 }}
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${cfg.gradient}`} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
            <cfg.Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{exercise.title}</p>
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">{cfg.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{exercise.duration}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{exercise.description}</p>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="mt-3 w-full flex items-center justify-between text-xs text-primary font-medium hover:opacity-80">
          <span>{open ? "Hide the reason" : "Why does this help?"}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} className="overflow-hidden">
              <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 py-1">{exercise.why}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PremiumCard({ card, index, unlocked }: { card: typeof PREMIUM_CARDS[0]; index: number; unlocked: boolean }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: index*0.08+0.3, duration:0.4 }} className="relative rounded-2xl overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`} />
      {!unlocked && <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />}
      <div className="relative p-5 text-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center"><card.Icon className="h-5 w-5 text-white" /></div>
          {unlocked ? (
            <span className="flex items-center gap-1 bg-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase">✓ Unlocked</span>
          ) : (
            <span className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase">
              <Lock className="h-2.5 w-2.5" /> {card.requiredTier}+
            </span>
          )}
        </div>
        <p className="font-bold text-lg leading-tight">{card.title}</p>
        <p className="text-sm text-white/80 mt-1.5">{card.subtitle}</p>
        <p className="text-[10px] text-white/60 mt-3 font-semibold uppercase tracking-wider">{card.tag}</p>
        {unlocked && (
          <Link href={card.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 transition-colors">
            Open <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SupportClient({ config, userTier = "free" }: { config: PageConfig; userTier?: Tier }) {
  const [step, setStep] = useState<Step>("entry");
  const [selected, setSelected] = useState<SituationConfig | null>(null);
  const [details, setDetails] = useState("");
  const [response, setResponse] = useState<SupportResponse | null>(null);
  const [error, setError] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step !== "loading") return;
    const iv = setInterval(() => setMsgIdx(n => (n+1) % LOADING_MSGS.length), 1800);
    return () => clearInterval(iv);
  }, [step]);

  useEffect(() => {
    if (step === "describe") setTimeout(() => textarea.current?.focus(), 150);
  }, [step]);

  async function submit() {
    if (!details.trim()) return;
    setStep("loading"); setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: selected?.title ?? "General support", details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResponse(data); setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("describe");
    }
  }

  function restart() { setStep("entry"); setSelected(null); setDetails(""); setResponse(null); setError(""); }

  return (
    {/* bg-serene: #f0f9ff — very light sky-blue. Research: cool-light backgrounds lower cortisol
        for already-stressed users arriving at a support page. */}
    <div className="min-h-screen bg-serene">
      {/* Hero */}
      <div className="relative overflow-hidden gradient-hero py-16 px-4">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-700/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-violet-700/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 rounded-full px-4 py-1.5 text-xs font-medium mb-6 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" /> Private &amp; always here for you
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {config.pageHeadline.includes("alone") ? (
              <>{config.pageHeadline.split("alone")[0]}<span className="bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-transparent">alone.</span></>
            ) : config.pageHeadline}
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">{config.pageSubtitle}</p>
          {step !== "entry" && (
            <button onClick={restart} className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Start over
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <AnimatePresence mode="wait">

          {/* Step 1 */}
          {step === "entry" && (
            <motion.div key="entry" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:0.3 }}>
              <p className="text-center text-sm text-muted-foreground mb-8">What's closest to what you're experiencing?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.situations.map(s => {
                  const Icon = getIcon(s.id);
                  return (
                    <button key={s.id} onClick={() => { setSelected(s); setStep("describe"); }}
                      className="group relative rounded-2xl overflow-hidden text-left aspect-[3/2] sm:aspect-[4/3]">
                      <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-all" />
                      <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                        <Icon className="h-6 w-6 opacity-80" />
                        <div>
                          <p className="font-bold text-lg leading-snug">{s.title}</p>
                          <p className="text-sm text-white/80 mt-1 leading-snug">{s.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-center mt-8">
                <button onClick={() => { setSelected(null); setStep("describe"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  None of these — just let me type <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === "describe" && (
            <motion.div key="describe" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:0.3 }} className="max-w-2xl mx-auto">
              {selected && (() => { const Icon = getIcon(selected.id); return (
                <div className={`rounded-2xl bg-gradient-to-br ${selected.gradient} p-5 text-white mb-6`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 opacity-90 shrink-0" />
                    <div><p className="font-bold">{selected.title}</p><p className="text-sm text-white/80">{selected.subtitle}</p></div>
                  </div>
                </div>
              ); })()}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                <label className="block text-sm font-semibold mb-1.5">Tell me what's happening right now</label>
                <p className="text-xs text-muted-foreground mb-4">The more you share, the more specific I can be. Take your time — no right or wrong way to say this.</p>
                <textarea ref={textarea} value={details} onChange={e => setDetails(e.target.value)}
                  placeholder={selected?.placeholder ?? "Tell me what's happening… Share as much or as little as you'd like."} rows={6} className="input-base resize-none text-base leading-relaxed" />
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                <div className="mt-5 flex items-center justify-between gap-4">
                  <button onClick={() => setStep("entry")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <Button variant="gradient" size="lg" onClick={submit} disabled={!details.trim()}>
                    Find my exercises <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-5 flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3" /> Private. We never store your support sessions.
              </p>
            </motion.div>
          )}

          {/* Step 3 */}
          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="text-center py-20">
              <div className="relative inline-flex">
                <div className="h-20 w-20 rounded-full gradient-c4u-soft flex items-center justify-center animate-pulse-soft shadow-xl">
                  <Heart className="h-9 w-9 text-white fill-white" />
                </div>
                <div className="absolute inset-0 rounded-full gradient-c4u-soft opacity-30 animate-ping" />
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={msgIdx} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:0.3 }} className="mt-8 text-lg font-medium">
                  {LOADING_MSGS[msgIdx]}
                </motion.p>
              </AnimatePresence>
              <p className="mt-2 text-sm text-muted-foreground">Taking your situation seriously takes a moment.</p>
            </motion.div>
          )}

          {/* Step 4 */}
          {step === "results" && response && (
            <motion.div key="results" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}>
              {/* Acknowledgment: teal→blue-700 — calming, parasympathetic, NOT teal→violet
                  which adds energy/stimulation. Distressed users need maximum calm here. */}
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="rounded-2xl bg-gradient-to-br from-teal-500 to-blue-700 p-6 text-white mb-8 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 fill-white text-white opacity-80" />
                  <span className="text-sm font-semibold uppercase tracking-wider opacity-80">I hear you</span>
                </div>
                <p className="text-lg leading-relaxed font-medium">{response.acknowledgment}</p>
              </motion.div>

              <div className="mb-4">
                <h2 className="text-xl font-bold mb-1">What you can do <span className="gradient-text">right now</span></h2>
                <p className="text-sm text-muted-foreground">Each of these works within the next few minutes, wherever you are.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {response.exercises.map((ex, i) => <ExerciseCard key={ex.id} exercise={ex} index={i} />)}
              </div>

              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} className="rounded-xl bg-muted border border-border p-5 text-center mb-12">
                <p className="text-muted-foreground italic">"{response.closingMessage}"</p>
              </motion.div>

              {/* Premium */}
              <div className="border-t border-border pt-10">
                <div className="text-center mb-8">
                  <Badge variant="gold" className="mb-3"><Sparkles className="h-3 w-3 mr-1" /> Premium</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold">{config.pricingHeadline}</h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">Your exercises are a start. Premium goes deeper.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {PREMIUM_CARDS.map((card, i) => (
                    <PremiumCard key={card.title} card={card} index={i} unlocked={hasFeature(userTier, card.feature)} />
                  ))}
                </div>
                {userTier === "free" && (
                  <div className="rounded-2xl gradient-c4u p-6 text-white text-center shadow-lg">
                    <h3 className="text-xl font-bold mb-2">Unlock everything from €{config.price}/mo</h3>
                    <p className="text-white/80 text-sm mb-5 max-w-md mx-auto">{config.pricingSubtext}</p>
                    <Link href="/premium">
                      <Button variant="outline" size="lg" className="bg-white text-primary border-0">
                        See plans · 7-day free trial <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="text-center mt-10">
                <button onClick={restart} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ← Something changed? Start fresh
                </button>
              </div>
              <div className="mt-8 rounded-xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  <strong>In crisis?</strong> <strong>Crisis Text Line:</strong> Text HOME to 741741 &nbsp;·&nbsp;{" "}
                  <a href="https://www.befrienders.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">befrienders.org</a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
