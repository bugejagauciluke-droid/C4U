"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp,
  Target, AlertCircle, CheckCircle2, Shield, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HabitResponse, HabitExercise } from "@/app/api/habits/route";

const HABIT_TYPES = [
  { value: "alcohol",       label: "Alcohol",            emoji: "🍷" },
  { value: "cannabis",      label: "Cannabis",           emoji: "🌿" },
  { value: "pornography",   label: "Pornography",        emoji: "📱" },
  { value: "gambling",      label: "Gambling",           emoji: "🎲" },
  { value: "smoking",       label: "Smoking",            emoji: "🚬" },
  { value: "social_media",  label: "Social media",       emoji: "📲" },
  { value: "food",          label: "Food / bingeing",    emoji: "🍫" },
  { value: "drugs",         label: "Drugs",              emoji: "💊" },
  { value: "other",         label: "Something else",     emoji: "⚡" },
];

const SEVERITIES = [
  { value: "mild",         label: "Mild",         sub: "I can stop but keep going back" },
  { value: "moderate",     label: "Moderate",     sub: "It's affecting my life noticeably" },
  { value: "significant",  label: "Significant",  sub: "I've tried to stop and struggled" },
  { value: "severe",       label: "Severe",       sub: "It controls a lot of my life" },
];

const TECHNIQUE_COLORS: Record<string, { color: string; bg: string }> = {
  CBT:          { color: "text-violet-700", bg: "bg-violet-100" },
  ACT:          { color: "text-emerald-700",bg: "bg-emerald-100"},
  Motivational: { color: "text-amber-700",  bg: "bg-amber-100"  },
  "Harm reduction": { color: "text-teal-700", bg: "bg-teal-100" },
  Neuroscience: { color: "text-indigo-700", bg: "bg-indigo-100" },
  Mindfulness:  { color: "text-rose-700",   bg: "bg-rose-100"   },
};

function ExerciseCard({ ex }: { ex: HabitExercise }) {
  const [open, setOpen] = useState(false);
  const cfg = TECHNIQUE_COLORS[ex.technique] ?? { color: "text-gray-600", bg: "bg-gray-100" };
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">{ex.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{ex.technique}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" />{ex.duration}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{ex.description}</p>
        <button onClick={() => setOpen(!open)} className={`flex items-center gap-1 text-xs font-medium mt-2 ${cfg.color} hover:opacity-70 transition-opacity`}>
          {open ? <><ChevronUp className="h-3 w-3" />Less</> : <><ChevronDown className="h-3 w-3" />Why it works</>}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-slate-50 px-5 py-4 space-y-2">
          <p className="text-xs text-gray-700 leading-relaxed"><strong>Why:</strong> {ex.why}</p>
          <p className="text-xs text-gray-600"><strong>Brain target:</strong> {ex.targetMechanism}</p>
          <p className="text-xs text-gray-500 italic"><strong>In the moment:</strong> {ex.immediateUse}</p>
        </div>
      )}
    </div>
  );
}

export default function HabitsPage() {
  const [habitType, setHabitType]     = useState("");
  const [severity, setSeverity]       = useState("");
  const [mainTrigger, setMainTrigger] = useState("");
  const [howLong, setHowLong]         = useState("");
  const [motivation, setMotivation]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<HabitResponse | null>(null);

  async function generate() {
    if (!habitType || !severity) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitType, severity, mainTrigger: mainTrigger.trim() || undefined, howLong: howLong.trim() || undefined, motivation: motivation.trim() || undefined }),
      });
      setResult(await res.json());
    } catch { }
    setLoading(false);
  }

  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Break the Habit</h1>
            <p className="text-sm text-gray-500 mt-0.5">Evidence-based support grounded in brain science</p>
          </div>
        </div>

        {/* SOS EMERGENCY BUTTON */}
        <Link href="/account/habits/sos">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:from-slate-800 hover:to-slate-700 transition-all border border-rose-900/50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 animate-pulse">
                <Shield className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Fighting an urge RIGHT NOW?</p>
                <p className="text-slate-400 text-xs mt-0.5">Tap here for immediate help — works in 30 seconds</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {!result && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">What habit are you working on?</h2>
              <div className="grid grid-cols-3 gap-2">
                {HABIT_TYPES.map(h => (
                  <button key={h.value} onClick={() => setHabitType(h.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all ${habitType === h.value ? "border-amber-400 bg-amber-50" : "border-border hover:border-amber-300"}`}>
                    <span className="text-2xl">{h.emoji}</span>
                    <span className={`text-[11px] font-medium text-center leading-tight ${habitType === h.value ? "text-amber-700" : "text-gray-700"}`}>{h.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {habitType && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-semibold text-sm text-gray-700 mb-3">How much is it affecting your life?</h2>
                <div className="space-y-2">
                  {SEVERITIES.map(s => (
                    <button key={s.value} onClick={() => setSeverity(s.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${severity === s.value ? "border-amber-400 bg-amber-50" : "border-border hover:border-amber-300"}`}>
                      {severity === s.value ? <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />}
                      <div>
                        <p className={`text-sm font-semibold ${severity === s.value ? "text-amber-700" : "text-gray-800"}`}>{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {severity && (
              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">What usually triggers it? <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <input type="text" value={mainTrigger} onChange={e => setMainTrigger(e.target.value)} placeholder="e.g. stress, boredom, loneliness, evenings alone..." className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">How long has this been going on? <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <input type="text" value={howLong} onChange={e => setHowLong(e.target.value)} placeholder="e.g. months, a few years..." className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Why do you want to change now? <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={2} placeholder="e.g. for my family, feeling out of control..." className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
            )}

            {severity && (
              <Button onClick={generate} disabled={!habitType || !severity || loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl py-3 font-semibold text-base shadow-md">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Building your support plan…</> : <><Sparkles className="h-4 w-4 mr-2" />Get my personalised plan</>}
              </Button>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <Link href="/account/habits/sos">
              <div className="bg-slate-900 rounded-2xl p-3 flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer">
                <Shield className="h-4 w-4 text-rose-400" />
                <p className="text-slate-300 text-xs font-medium">Urge hitting hard right now? Get immediate help →</p>
              </div>
            </Link>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-white/70" /><span className="text-xs font-semibold text-white/70 uppercase tracking-wide">C4U Habit Support</span></div>
              <p className="text-white/95 leading-relaxed">{result.acknowledgment}</p>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What is happening in your brain</p><p className="text-sm text-gray-800 leading-relaxed">{result.brainInsight}</p></div>
              <div className="border-t pt-3 bg-slate-50 rounded-xl p-3"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Your habit loop</p><p className="text-sm text-gray-700 italic">{result.habitLoop}</p></div>
            </div>

            <div><h2 className="font-semibold text-sm text-gray-700 px-1 mb-3">Your personalised toolkit</h2><div className="space-y-3">{result.exercises.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}</div></div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div><p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">When the urge hits — do this</p><p className="text-sm text-rose-900">{result.urgeStrategy}</p></div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Target className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div><p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">This week goal</p><p className="text-sm text-teal-900">{result.weeklyGoal}</p></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3"><p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Remember</p><p className="text-sm text-violet-800">{result.compassionNote}</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3"><div className="flex items-center gap-1.5 mb-1"><AlertCircle className="h-3.5 w-3.5 text-amber-500" /><p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Watch for</p></div><p className="text-sm text-amber-800">{result.warningSign}</p></div>
            </div>

            <button onClick={() => { setResult(null); setHabitType(""); setSeverity(""); }} className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <RefreshCw className="h-3.5 w-3.5" /> Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
