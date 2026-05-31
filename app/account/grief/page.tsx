"use client";

import { useState } from "react";
import {
  Heart, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp,
  Target, AlertCircle, Clock, BookOpen, Flame, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GriefResponse, GriefExercise } from "@/app/api/grief/route";

const LOSS_TYPES = [
  { value: "death_loved_one",    label: "Death of someone I love",         emoji: "🕯️" },
  { value: "death_unexpected",   label: "Sudden or traumatic death",        emoji: "💔" },
  { value: "relationship_end",   label: "Relationship ending / divorce",    emoji: "💔" },
  { value: "pregnancy_loss",     label: "Miscarriage / pregnancy loss",     emoji: "🌸" },
  { value: "death_pet",          label: "Loss of a pet",                    emoji: "🐾" },
  { value: "health_loss",        label: "Health / body change",             emoji: "🌿" },
  { value: "job_identity",       label: "Job loss / identity loss",         emoji: "🏛️" },
  { value: "friendship",         label: "Loss of a friendship",             emoji: "🫂" },
  { value: "home_place",         label: "Leaving home / place",             emoji: "🏡" },
  { value: "other",              label: "Another kind of loss",             emoji: "🌊" },
];

const TIMEFRAMES = [
  { value: "very_recent",  label: "Just happened",        sub: "days or weeks" },
  { value: "months",       label: "A few months ago",     sub: "1–6 months" },
  { value: "past_year",    label: "Within the past year", sub: "6–12 months" },
  { value: "longer",       label: "More than a year",     sub: "ongoing grief" },
];

const STUCK_AREAS = [
  "Can't stop thinking about it",
  "Feeling numb or cut off",
  "Guilt or regret",
  "Anger I can't express",
  "Others expect me to be 'over it'",
  "Not sure how to live differently",
  "Isolating from people",
  "Struggling to find meaning",
];

const APPROACH_COLORS: Record<string, { color: string; bg: string }> = {
  "Grief counseling":    { color: "text-rose-700",    bg: "bg-rose-50"    },
  "CBT":                 { color: "text-violet-700",  bg: "bg-violet-50"  },
  "Logotherapy":         { color: "text-amber-700",   bg: "bg-amber-50"   },
  "IPT":                 { color: "text-teal-700",    bg: "bg-teal-50"    },
  "Expressive art":      { color: "text-indigo-700",  bg: "bg-indigo-50"  },
  "Meaning-centered":    { color: "text-emerald-700", bg: "bg-emerald-50" },
  "Dual process":        { color: "text-sky-700",     bg: "bg-sky-50"     },
};

function ExerciseCard({ ex }: { ex: GriefExercise }) {
  const [open, setOpen] = useState(false);
  const cfg = APPROACH_COLORS[ex.approach] ?? { color: "text-gray-600", bg: "bg-gray-50" };

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ex.title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 ${cfg.color}`}>{ex.approach}</span>
          <span className="text-[10px] text-muted-foreground">{ex.duration}</span>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{ex.description}</p>
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-xs font-medium mt-2 ${cfg.color} hover:opacity-70 transition-opacity`}>
        {open ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Why it helps + when to use</>}
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
          <p className="text-xs text-gray-700 leading-relaxed"><strong>Why:</strong> {ex.why}</p>
          <p className="text-xs text-gray-600 italic"><strong>Best moment:</strong> {ex.whenToUse}</p>
          {ex.phase !== "any" && (
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/80 ${cfg.color} font-semibold`}>
              {ex.phase} grief
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function GriefPage() {
  const [lossType, setLossType]     = useState("");
  const [timeframe, setTimeframe]   = useState("");
  const [stuckAreas, setStuckAreas] = useState<string[]>([]);
  const [lossDetail, setLossDetail] = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<GriefResponse | null>(null);

  function toggleStuck(s: string) {
    setStuckAreas(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function generate() {
    if (!lossType || !timeframe) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/grief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lossType, lossDetail: lossDetail.trim() || undefined, timeframe, stuckAreas }),
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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-white/50" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grief Support</h1>
            <p className="text-sm text-gray-500 mt-0.5">Evidence-based grief therapy grounded in real research — at your pace</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
          <p className="text-xs text-rose-800 leading-relaxed">
            There is no correct way to grieve and no timeline you should be on.
            C4U holds space for your loss exactly as it is — without rushing you toward anything.
          </p>
        </div>

        {!result && (
          <div className="space-y-5">
            {/* Loss type */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">What kind of loss are you carrying?</h2>
              <div className="grid grid-cols-2 gap-2">
                {LOSS_TYPES.map(l => (
                  <button key={l.value} onClick={() => setLossType(l.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all
                      ${lossType === l.value ? "border-rose-400 bg-rose-50/50" : "border-border hover:border-rose-300"}`}>
                    <span className="text-lg">{l.emoji}</span>
                    <span className={`text-xs font-medium leading-tight ${lossType === l.value ? "text-rose-700" : "text-gray-700"}`}>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            {lossType && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> How long have you been carrying this?
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {TIMEFRAMES.map(t => (
                    <button key={t.value} onClick={() => setTimeframe(t.value)}
                      className={`flex flex-col px-3 py-2.5 rounded-xl border-2 text-left transition-all
                        ${timeframe === t.value ? "border-rose-400 bg-rose-50/50" : "border-border hover:border-rose-300"}`}>
                      <span className={`text-xs font-semibold ${timeframe === t.value ? "text-rose-700" : "text-gray-700"}`}>{t.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{t.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Where stuck */}
            {timeframe && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-semibold text-sm text-gray-700 mb-2">Where do you feel most stuck? <span className="font-normal text-muted-foreground">(optional — choose any)</span></h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {STUCK_AREAS.map(s => (
                    <button key={s} onClick={() => toggleStuck(s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${stuckAreas.includes(s) ? "border-rose-400 bg-rose-50 text-rose-700" : "border-border text-muted-foreground hover:border-rose-300"}`}>
                      {stuckAreas.includes(s) && <CheckCircle2 className="h-3 w-3" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional detail */}
            {timeframe && (
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <h2 className="font-semibold text-sm text-gray-700 mb-2">Is there anything you'd like to share? <span className="font-normal text-muted-foreground">(completely optional)</span></h2>
                <textarea value={lossDetail} onChange={e => setLossDetail(e.target.value)} rows={3}
                  placeholder="Whatever feels right to say. There's no wrong answer here."
                  className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder-gray-300"
                />
              </div>
            )}

            <Button onClick={generate} disabled={!lossType || !timeframe || loading}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-600 hover:from-rose-500 hover:to-pink-700 text-white rounded-2xl py-3 font-semibold text-base shadow-md">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating your grief support…</>
                : <><Heart className="h-4 w-4 mr-2 fill-white/40" /> Get support for this grief</>
              }
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Acknowledgment */}
            <div className="bg-gradient-to-br from-rose-400 to-pink-600 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-white/70 fill-white/30" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">C4U — Grief Support</span>
              </div>
              <p className="text-white/95 leading-relaxed text-[15px]">{result.acknowledgment}</p>
            </div>

            {/* Grief insight + phase */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Where you may be</p>
                <p className="text-sm text-gray-800 leading-relaxed">{result.griefInsight}</p>
              </div>
              <div className="border-t border-border/50 pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What this feels like</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.phaseDescription}</p>
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 px-1 mb-3">Exercises for your grief</h2>
              <div className="space-y-3">
                {result.exercises.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
              </div>
            </div>

            {/* Myth */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">A grief myth to gently release</p>
                <p className="text-sm text-amber-900">{result.mythToChallenge}</p>
              </div>
            </div>

            {/* Cultural note */}
            {result.culturalNote && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800">{result.culturalNote}</p>
              </div>
            )}

            {/* Today invitation + weekly ritual */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Target className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Today</p>
                <p className="text-sm text-rose-900">{result.continueHere}</p>
              </div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Flame className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Weekly ritual</p>
                <p className="text-sm text-teal-900">{result.weeklyRitual}</p>
              </div>
            </div>

            <button onClick={() => { setResult(null); setLossDetail(""); setStuckAreas([]); }}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <RefreshCw className="h-3.5 w-3.5" /> Start again with a different loss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
