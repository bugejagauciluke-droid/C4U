"use client";

import { useState } from "react";
import {
  Brain, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp,
  Zap, Heart, Wind, BookOpen, Users, Target, AlertCircle,
  CheckCircle2, ArrowRight, Info, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConditionResponse, ConditionExercise } from "@/app/api/conditions/route";

// ── Conditions data ───────────────────────────────────────────────────────────

const CONDITIONS = [
  {
    id: "anxiety",
    label: "Anxiety",
    emoji: "😰",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 border-sky-200",
    desc: "Generalised worry, constant tension, 'what if' thinking",
    subtypes: ["Generalised Anxiety (GAD)", "Panic Attacks", "Health Anxiety", "Worry spirals"],
  },
  {
    id: "social-anxiety",
    label: "Social Anxiety",
    emoji: "👥",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 border-violet-200",
    desc: "Fear of judgment, social situations, negative evaluation",
    subtypes: ["Fear of judgment", "Performance anxiety", "Avoidance of social situations", "Public speaking fear"],
  },
  {
    id: "panic",
    label: "Panic Disorder",
    emoji: "💨",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 border-rose-200",
    desc: "Panic attacks, fear of symptoms, anticipatory anxiety",
    subtypes: ["Frequent panic attacks", "Fear of having panic attacks", "Avoiding triggers"],
  },
  {
    id: "adhd",
    label: "ADHD",
    emoji: "⚡",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 border-amber-200",
    desc: "Attention, focus, impulsivity, emotional regulation",
    subtypes: ["Predominantly Inattentive", "Predominantly Hyperactive/Impulsive", "Combined type", "Adult ADHD"],
  },
  {
    id: "depression",
    label: "Low Mood / Depression",
    emoji: "🌧️",
    color: "from-slate-500 to-indigo-600",
    bg: "bg-slate-50 border-slate-200",
    desc: "Persistent low mood, loss of interest, fatigue, hopelessness",
    subtypes: ["Mild low mood", "Anhedonia (lost enjoyment)", "Withdrawal & isolation", "Low energy & motivation"],
  },
  {
    id: "ocd",
    label: "OCD / Intrusive Thoughts",
    emoji: "🔄",
    color: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50 border-teal-200",
    desc: "Unwanted thoughts, compulsions, rituals, doubt",
    subtypes: ["Checking rituals", "Intrusive thoughts", "Contamination fears", "Perfectionism & doubt"],
  },
  {
    id: "trauma",
    label: "Trauma / PTSD",
    emoji: "🛡️",
    color: "from-indigo-500 to-violet-700",
    bg: "bg-indigo-50 border-indigo-200",
    desc: "Flashbacks, hypervigilance, avoidance, emotional numbing",
    subtypes: ["Hypervigilance", "Emotional flashbacks", "Avoidance", "Difficulty trusting"],
  },
  {
    id: "burnout",
    label: "Burnout",
    emoji: "🔥",
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50 border-orange-200",
    desc: "Exhaustion, cynicism, detachment, feeling hollow",
    subtypes: ["Emotional exhaustion", "Cynicism & detachment", "Loss of purpose", "Physical depletion"],
  },
];

const TECHNIQUE_CONFIG: Record<string, { color: string; bg: string }> = {
  CBT:           { color: "text-violet-700", bg: "bg-violet-100" },
  DBT:           { color: "text-teal-700",   bg: "bg-teal-100"   },
  ACT:           { color: "text-emerald-700",bg: "bg-emerald-100"},
  Exposure:      { color: "text-rose-700",   bg: "bg-rose-100"   },
  Breathing:     { color: "text-sky-700",    bg: "bg-sky-100"    },
  Behavioural:   { color: "text-amber-700",  bg: "bg-amber-100"  },
  Mindfulness:   { color: "text-indigo-700", bg: "bg-indigo-100" },
};

const TYPE_CONFIG: Record<string, { Icon: React.ElementType; color: string }> = {
  cognitive:    { Icon: Brain,   color: "text-violet-600" },
  behavioural:  { Icon: Zap,    color: "text-amber-600"  },
  somatic:      { Icon: Wind,   color: "text-sky-600"    },
  mindfulness:  { Icon: Heart,  color: "text-rose-600"   },
  social:       { Icon: Users,  color: "text-teal-600"   },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ExerciseCard({ ex }: { ex: ConditionExercise }) {
  const [open, setOpen] = useState(false);
  const techCfg = TECHNIQUE_CONFIG[ex.technique] ?? { color: "text-gray-600", bg: "bg-gray-100" };
  const typeCfg = TYPE_CONFIG[ex.type] ?? TYPE_CONFIG.cognitive;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <typeCfg.Icon className={`h-4 w-4 ${typeCfg.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ex.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${techCfg.bg} ${techCfg.color}`}>
              {ex.technique}
            </span>
            <span className="text-xs text-muted-foreground">{ex.duration}</span>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{ex.description}</p>

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs font-medium mt-3 text-primary hover:opacity-70 transition-opacity"
        >
          {open ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Why this works + when to use</>}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-slate-50 px-5 py-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Why it works</p>
            <p className="text-xs text-gray-700 leading-relaxed">{ex.why}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Best moment to use</p>
            <p className="text-xs text-gray-700 leading-relaxed">{ex.whenToUse}</p>
          </div>
          <div className="flex items-start gap-1.5 bg-white rounded-xl p-3 border border-border">
            <Info className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">{ex.scienceNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ConditionsPage() {
  const [selected, setSelected]     = useState("");
  const [subtype, setSubtype]       = useState("");
  const [context, setContext]       = useState("");
  const [mood, setMood]             = useState(5);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<ConditionResponse | null>(null);
  const [activeCondition, setActiveCondition] = useState<typeof CONDITIONS[0] | null>(null);

  function selectCondition(c: typeof CONDITIONS[0]) {
    setSelected(c.id);
    setActiveCondition(c);
    setSubtype("");
    setResult(null);
  }

  async function generate() {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    try {
      const cond = CONDITIONS.find(c => c.id === selected);
      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition: cond?.label ?? selected,
          subtype: subtype || undefined,
          currentMood: mood,
          context: context.trim() || undefined,
        }),
      });
      setResult(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mental Health Support</h1>
            <p className="text-sm text-gray-500 mt-0.5">Evidence-based exercises for specific conditions — grounded in real research</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <Shield className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            C4U is not therapy and not a substitute for professional care. If you're working with a therapist,
            these exercises complement that work. If you're in crisis, use the support resources in the footer.
          </p>
        </div>

        {/* Condition selector */}
        {!result && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">What would you like support with today?</h2>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map(c => (
                  <button key={c.id} onClick={() => selectCondition(c)}
                    className={`flex items-start gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all
                      ${selected === c.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                    <span className="text-xl shrink-0">{c.emoji}</span>
                    <div>
                      <p className={`text-xs font-semibold leading-tight ${selected === c.id ? "text-primary" : "text-gray-800"}`}>{c.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{c.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtype */}
            {activeCondition && activeCondition.subtypes.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-semibold text-sm text-gray-700 mb-3">Which aspect fits most right now? <span className="font-normal text-muted-foreground">(optional)</span></h2>
                <div className="flex flex-wrap gap-2">
                  {activeCondition.subtypes.map(s => (
                    <button key={s} onClick={() => setSubtype(subtype === s ? "" : s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${subtype === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                      {subtype === s && <CheckCircle2 className="h-3 w-3" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood + context */}
            {selected && (
              <>
                <div className="bg-white rounded-3xl shadow-sm p-6">
                  <h2 className="font-semibold text-sm text-gray-700 mb-4">How are you feeling right now? <span className="text-muted-foreground font-normal">{mood}/10</span></h2>
                  <input type="range" min={1} max={10} value={mood} onChange={e => setMood(Number(e.target.value))}
                    className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Very bad</span><span>Okay</span><span>Great</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-6">
                  <h2 className="font-semibold text-sm text-gray-700 mb-2">What's happening right now? <span className="font-normal text-muted-foreground">(optional)</span></h2>
                  <textarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    rows={3}
                    placeholder={`e.g. "I have a work meeting in 2 hours and I can't stop thinking about all the ways it could go wrong" or "I can't get started on anything today, everything feels too big"`}
                    className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-gray-300"
                  />
                </div>

                <Button onClick={generate} disabled={!selected || loading}
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-700 hover:from-violet-600 hover:to-indigo-800 text-white rounded-2xl py-3 font-semibold text-base shadow-md">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Building your support session…</>
                    : <><Sparkles className="h-4 w-4 mr-2" /> Get personalised exercises</>
                  }
                </Button>
              </>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Acknowledgment */}
            <div className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${activeCondition?.color ?? "from-violet-500 to-indigo-700"}`}>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-white/70" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">C4U — {activeCondition?.label}</span>
              </div>
              <p className="text-white/95 leading-relaxed mb-4">{result.acknowledgment}</p>
              <div className="bg-white/15 rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-1">What's happening</p>
                <p className="text-sm text-white/90 leading-relaxed">{result.conditionInsight}</p>
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 px-1 mb-3">Your exercises for today</h2>
              <div className="space-y-3">
                {result.exercises.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
              </div>
            </div>

            {/* Today focus */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Today's focus</p>
                <p className="text-sm text-gray-800">{result.todayFocus}</p>
              </div>
            </div>

            {/* Watch for */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Notice this pattern</p>
                <p className="text-sm text-amber-900">{result.watchFor}</p>
              </div>
            </div>

            {/* Weekly challenge */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">This week's step</p>
                <p className="text-sm text-teal-900">{result.weeklyChallenge}</p>
              </div>
            </div>

            {/* Technique legend */}
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Techniques used today</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set(result.exercises.map(e => e.technique))].map(t => {
                  const cfg = TECHNIQUE_CONFIG[t] ?? { color: "text-gray-600", bg: "bg-gray-100" };
                  const labels: Record<string, string> = {
                    CBT: "Cognitive Behavioural Therapy",
                    DBT: "Dialectical Behaviour Therapy",
                    ACT: "Acceptance & Commitment Therapy",
                    Exposure: "Exposure Therapy",
                    Breathing: "Controlled Breathing",
                    Behavioural: "Behavioural Activation",
                    Mindfulness: "Mindfulness",
                  };
                  return (
                    <span key={t} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.color}`}>
                      {t} — {labels[t] ?? t}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Reset */}
            <button onClick={() => { setResult(null); setContext(""); }}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <RefreshCw className="h-3.5 w-3.5" /> Try a different condition or get new exercises
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
