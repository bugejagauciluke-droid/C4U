"use client";

import { useState } from "react";
import {
  Zap, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp,
  AlertCircle, Target, Shield, Brain, Heart, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HabitResponse, HabitExercise } from "@/app/api/habits/route";

const HABITS = [
  { value: "alcohol",        label: "Alcohol",          emoji: "🍷", desc: "Drinking more than you want to" },
  { value: "cannabis",       label: "Cannabis",         emoji: "🌿", desc: "Weed, edibles, daily use" },
  { value: "pornography",    label: "Pornography",      emoji: "🔒", desc: "Private and non-judgmental space" },
  { value: "gambling",       label: "Gambling",         emoji: "🎲", desc: "Betting, casino, online" },
  { value: "social_media",   label: "Social media",     emoji: "📱", desc: "Scrolling, doom-scrolling, compulsive checking" },
  { value: "smoking",        label: "Smoking / nicotine", emoji: "🚬", desc: "Cigarettes, vaping" },
  { value: "food",           label: "Food / eating",    emoji: "🍫", desc: "Emotional eating, bingeing, restriction" },
  { value: "substances",     label: "Other substances", emoji: "💊", desc: "Prescription misuse or other substances" },
  { value: "other",          label: "Something else",   emoji: "🔄", desc: "Any pattern you want to change" },
];

const SEVERITIES = [
  { value: "mild",        label: "Mild",        desc: "I notice it but it's manageable" },
  { value: "moderate",    label: "Moderate",    desc: "It's affecting my life in real ways" },
  { value: "significant", label: "Significant", desc: "I'm struggling to control it" },
  { value: "severe",      label: "Severe",      desc: "It's affecting health and relationships" },
];

const TRIGGERS = [
  "Stress / anxiety", "Loneliness", "Boredom", "After conflict",
  "Late at night", "Social situations", "Low mood", "Reward / celebration",
];

const TECHNIQUE_COLORS: Record<string, { color: string; bg: string }> = {
  CBT:           { color: "text-violet-700", bg: "bg-violet-50" },
  ACT:           { color: "text-teal-700",   bg: "bg-teal-50"   },
  Motivational:  { color: "text-amber-700",  bg: "bg-amber-50"  },
  "Harm reduction": { color: "text-rose-700", bg: "bg-rose-50"  },
  Neuroscience:  { color: "text-sky-700",    bg: "bg-sky-50"    },
  Mindfulness:   { color: "text-indigo-700", bg: "bg-indigo-50" },
};

function ExerciseCard({ ex }: { ex: HabitExercise }) {
  const [open, setOpen] = useState(false);
  const cfg = TECHNIQUE_COLORS[ex.technique] ?? { color: "text-gray-600", bg: "bg-gray-50" };

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ex.title}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 ${cfg.color} shrink-0`}>{ex.technique}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{ex.description}</p>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-xs font-medium mt-2 ${cfg.color} hover:opacity-70 transition-opacity`}>
        {open ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Why + when to use</>}
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
          <p className="text-xs text-gray-700"><strong>Targets:</strong> {ex.targetMechanism}</p>
          <p className="text-xs text-gray-700 leading-relaxed"><strong>Why:</strong> {ex.why}</p>
          <p className={`text-xs font-medium ${cfg.color}`}>⚡ {ex.immediateUse}</p>
        </div>
      )}
    </div>
  );
}

export default function HabitsPage() {
  const [habitType, setHabitType]   = useState("");
  const [severity, setSeverity]     = useState("");
  const [triggers, setTriggers]     = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [howLong, setHowLong]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<HabitResponse | null>(null);

  function toggleTrigger(t: string) {
    setTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function generate() {
    if (!habitType || !severity) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitType,
          severity,
          mainTrigger: triggers.join(", ") || undefined,
          howLong: howLong.trim() || undefined,
          motivation: motivation.trim() || undefined,
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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Break a Habit</h1>
            <p className="text-sm text-gray-500 mt-0.5">Neuroscience-based support — no shame, no willpower myths</p>
          </div>
        </div>

        {/* Safe space note */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Private and non-judgmental.</strong> What you share here stays here. Habits are brain patterns — not character flaws.
            If you're dealing with dependence that affects your physical health (especially alcohol), please also speak with a doctor.
          </p>
        </div>

        {!result && (
          <div className="space-y-5">
            {/* Habit type */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">What pattern do you want to work on?</h2>
              <div className="grid grid-cols-1 gap-2">
                {HABITS.map(h => (
                  <button key={h.value} onClick={() => setHabitType(h.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                      ${habitType === h.value ? "border-amber-400 bg-amber-50/50" : "border-border hover:border-amber-300"}`}>
                    <span className="text-xl">{h.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${habitType === h.value ? "text-amber-700" : "text-gray-800"}`}>{h.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
                    </div>
                    {habitType === h.value && <CheckCircle2 className="h-4 w-4 text-amber-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            {habitType && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-semibold text-sm text-gray-700 mb-3">How would you describe its impact?</h2>
                <div className="grid grid-cols-2 gap-2">
                  {SEVERITIES.map(s => (
                    <button key={s.value} onClick={() => setSeverity(s.value)}
                      className={`flex flex-col px-3 py-2.5 rounded-xl border-2 text-left transition-all
                        ${severity === s.value ? "border-amber-400 bg-amber-50/50" : "border-border hover:border-amber-300"}`}>
                      <span className={`text-xs font-semibold ${severity === s.value ? "text-amber-700" : "text-gray-700"}`}>{s.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Triggers + optional context */}
            {severity && (
              <>
                <div className="bg-white rounded-3xl shadow-sm p-6">
                  <h2 className="font-semibold text-sm text-gray-700 mb-2">When does it tend to happen? <span className="font-normal text-muted-foreground">(optional)</span></h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {TRIGGERS.map(t => (
                      <button key={t} onClick={() => toggleTrigger(t)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${triggers.includes(t) ? "border-amber-400 bg-amber-50 text-amber-700" : "border-border text-muted-foreground hover:border-amber-300"}`}>
                        {triggers.includes(t) && <CheckCircle2 className="h-3 w-3" />}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How long has this been a pattern? <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <input value={howLong} onChange={e => setHowLong(e.target.value)}
                      placeholder="e.g. a few months, several years..."
                      className="w-full border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Why do you want to change this now? <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={2}
                      placeholder="What matters to you about changing this..."
                      className="w-full border border-border rounded-xl px-3.5 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                </div>

                <Button onClick={generate} disabled={!habitType || !severity || loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl py-3 font-semibold text-base shadow-md">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Building your support plan…</>
                    : <><Brain className="h-4 w-4 mr-2" /> Get my personalised plan</>
                  }
                </Button>
              </>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Acknowledgment */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-white/70" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">C4U — Habit Support</span>
              </div>
              <p className="text-white/95 leading-relaxed">{result.acknowledgment}</p>
            </div>

            {/* Brain insight + habit loop */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" /> What's happening in your brain
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">{result.brainInsight}</p>
              </div>
              <div className="border-t border-border/50 pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your habit loop</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.habitLoop}</p>
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 px-1 mb-3">Your personalised techniques</h2>
              <div className="space-y-3">
                {result.exercises.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
              </div>
            </div>

            {/* Urge strategy */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Zap className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">When the urge hits right now</p>
                <p className="text-sm text-rose-900">{result.urgeStrategy}</p>
              </div>
            </div>

            {/* Weekly goal */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Target className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">This week's goal</p>
                <p className="text-sm text-teal-900">{result.weeklyGoal}</p>
              </div>
            </div>

            {/* Warning sign */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Watch for this pattern</p>
                <p className="text-sm text-amber-900">{result.warningSign}</p>
              </div>
            </div>

            {/* Compassion */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Heart className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5 fill-indigo-200" />
              <p className="text-sm text-indigo-800 italic leading-relaxed">{result.compassionNote}</p>
            </div>

            <button onClick={() => { setResult(null); setMotivation(""); setHowLong(""); setTriggers([]); }}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <RefreshCw className="h-3.5 w-3.5" /> Work on a different habit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
