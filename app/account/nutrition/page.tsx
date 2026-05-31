"use client";

import { useState, useEffect } from "react";
import {
  Apple, Loader2, Sparkles, RefreshCw, Clock, Target,
  ChevronDown, ChevronUp, AlertTriangle, Leaf, Zap,
  Droplets, Coffee, Pill, Heart, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NutritionResponse, FoodRecommendation } from "@/app/api/nutrition/route";

// ── Constants ────────────────────────────────────────────────────────────────

const MOODS = [
  { value: "anxious",     label: "Anxious / overwhelmed",    emoji: "😰", color: "from-sky-400 to-blue-500" },
  { value: "low",         label: "Low / depressed",          emoji: "😔", color: "from-slate-400 to-indigo-500" },
  { value: "stressed",    label: "Stressed / tense",         emoji: "😤", color: "from-orange-400 to-red-500" },
  { value: "unfocused",   label: "Can't focus / brain fog",  emoji: "🌫️", color: "from-violet-400 to-purple-600" },
  { value: "tired",       label: "Tired / low energy",       emoji: "😴", color: "from-amber-400 to-yellow-500" },
  { value: "grief",       label: "Grieving / heartbroken",   emoji: "💔", color: "from-rose-400 to-pink-600" },
  { value: "good",        label: "Pretty good — want to optimise", emoji: "✨", color: "from-teal-400 to-emerald-500" },
];

const RESTRICTIONS = [
  "Lactose intolerant", "Vegan", "Vegetarian", "Gluten-free",
  "Nut allergy", "Diabetic", "Halal", "Kosher", "Egg-free", "Soy-free",
];

const TIMES = [
  { value: "morning", label: "Morning", sub: "Before noon" },
  { value: "afternoon", label: "Afternoon", sub: "12–5pm" },
  { value: "evening", label: "Evening", sub: "5–9pm" },
  { value: "night", label: "Night", sub: "After 9pm" },
];

const CATEGORY_CONFIG: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  protein:     { Icon: Zap,     color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
  carb:        { Icon: Leaf,    color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
  fat:         { Icon: Heart,   color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  drink:       { Icon: Droplets,color: "text-sky-600",     bg: "bg-sky-50 border-sky-100" },
  supplement:  { Icon: Pill,    color: "text-violet-600",  bg: "bg-violet-50 border-violet-100" },
  herb:        { Icon: Leaf,    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
};

const PREFS_KEY = "c4u_nutrition_prefs";

// ── Sub-components ───────────────────────────────────────────────────────────

function FoodCard({ rec }: { rec: FoodRecommendation }) {
  const [open, setOpen] = useState(false);
  const cfg = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.carb;
  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
          <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{rec.emoji}</span>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{rec.name}</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{rec.why}</p>

          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-1 text-xs font-medium mt-2 ${cfg.color} hover:opacity-70 transition-opacity`}
          >
            {open ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> How to use today</>}
          </button>

          {open && (
            <div className="mt-2 space-y-2">
              <div className="bg-white/70 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">How to use today</p>
                <p className="text-xs text-gray-700 leading-relaxed">{rec.howToUse}</p>
              </div>
              <div className="bg-white/70 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">You'll likely notice</p>
                <p className="text-xs text-gray-700 leading-relaxed">{rec.moodBenefit}</p>
              </div>
              {rec.goalLink && (
                <div className="bg-white/70 rounded-xl px-3 py-2 flex items-start gap-1.5">
                  <Target className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-700 leading-relaxed">{rec.goalLink}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NutritionPage() {
  const [mood, setMood]             = useState("");
  const [timeOfDay, setTimeOfDay]   = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [context, setContext]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<NutritionResponse | null>(null);
  const [savedGoal, setSavedGoal]   = useState("");
  const [savedMood, setSavedMood]   = useState<number | undefined>();

  // Auto-detect time of day
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeOfDay("morning");
    else if (h < 17) setTimeOfDay("afternoon");
    else if (h < 21) setTimeOfDay("evening");
    else setTimeOfDay("night");

    // Load saved preferences
    try {
      const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
      if (prefs.restrictions) setRestrictions(prefs.restrictions);
    } catch { /* ignore */ }

    // Load goal and diary mood
    try {
      const goalRaw = localStorage.getItem("c4u_life_goal");
      if (goalRaw) setSavedGoal((JSON.parse(goalRaw) as { goal?: string }).goal ?? "");

      const diaryRaw = localStorage.getItem("c4u_diary_entries");
      if (diaryRaw) {
        const entries = JSON.parse(diaryRaw) as Record<string, { mood?: number; date: string }>;
        const today = new Date().toISOString().split("T")[0];
        if (entries[today]?.mood) setSavedMood(entries[today].mood);
      }
    } catch { /* ignore */ }
  }, []);

  function toggleRestriction(r: string) {
    const next = restrictions.includes(r) ? restrictions.filter(x => x !== r) : [...restrictions, r];
    setRestrictions(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify({ restrictions: next }));
  }

  async function generate() {
    if (!mood || !timeOfDay) return;
    setLoading(true);
    setResult(null);
    try {
      const moodLabel = MOODS.find(m => m.value === mood)?.label ?? mood;
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: moodLabel,
          goal: savedGoal || undefined,
          timeOfDay,
          restrictions,
          diaryMood: savedMood,
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
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Apple className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nutrition & Mood</h1>
            <p className="text-sm text-gray-500 mt-0.5">Science-backed food recommendations for how you're feeling right now</p>
          </div>
        </div>

        {/* Setup form */}
        {!result && (
          <div className="space-y-5">
            {/* Mood selector */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">How are you feeling right now?</h2>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setMood(m.value)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border-2 text-left transition-all
                      ${mood === m.value ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                    <span className="text-lg">{m.emoji}</span>
                    <span className={`text-xs leading-tight ${mood === m.value ? "text-primary" : "text-gray-700"}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time of day */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Time of day
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {TIMES.map(t => (
                  <button key={t.value} onClick={() => setTimeOfDay(t.value)}
                    className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 text-center transition-all
                      ${timeOfDay === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <span className={`text-xs font-semibold ${timeOfDay === t.value ? "text-primary" : "text-gray-700"}`}>{t.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary restrictions */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-1">Dietary restrictions</h2>
              <p className="text-xs text-muted-foreground mb-4">C4U will never recommend foods that conflict with these. Saved to your device.</p>
              <div className="flex flex-wrap gap-2">
                {RESTRICTIONS.map(r => (
                  <button key={r} onClick={() => toggleRestriction(r)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${restrictions.includes(r) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-border text-muted-foreground hover:border-teal-400"}`}>
                    {restrictions.includes(r) && <CheckCircle2 className="h-3 w-3" />}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional context */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h2 className="font-semibold text-sm text-gray-700 mb-2">Anything else C4U should know? <span className="font-normal text-muted-foreground">(optional)</span></h2>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={2}
                placeholder="e.g. I had a big lunch, I'm going to the gym later, I've been drinking more coffee than usual…"
                className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300"
              />
            </div>

            {/* Goal reminder */}
            {savedGoal && (
              <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3">
                <Target className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-0.5">C4U knows your goal</p>
                  <p className="text-sm text-violet-800">"{savedGoal.length > 80 ? savedGoal.slice(0, 80) + "…" : savedGoal}"</p>
                  <p className="text-xs text-violet-500 mt-1">Recommendations will be tied to what helps you get there.</p>
                </div>
              </div>
            )}

            <Button
              onClick={generate}
              disabled={!mood || !timeOfDay || loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl py-3 font-semibold text-base shadow-md"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analysing your needs…</>
                : <><Sparkles className="h-4 w-4 mr-2" /> Get my food recommendations</>
              }
            </Button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Headline card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Apple className="h-4 w-4 text-emerald-200" />
                <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">C4U Nutrition</span>
              </div>
              <p className="font-bold text-lg leading-snug mb-2">{result.headline}</p>
              <p className="text-white/80 text-sm leading-relaxed">{result.insight}</p>
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="font-semibold text-sm text-gray-700 px-1 mb-3">What to eat today</h2>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => <FoodCard key={i} rec={rec} />)}
              </div>
            </div>

            {/* Avoid */}
            {result.avoid.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h2 className="font-semibold text-sm text-gray-700">Worth avoiding today</h2>
                </div>
                <div className="space-y-2">
                  {result.avoid.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-amber-500 text-sm font-bold shrink-0 mt-0.5">✕</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timing tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Timing tip for today</p>
                <p className="text-sm text-amber-900">{result.timingTip}</p>
              </div>
            </div>

            {/* Weekly habit */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Target className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">One habit to build this week</p>
                <p className="text-sm text-teal-900">{result.weeklyHabit}</p>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setResult(null); setContext(""); setMood(""); }}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Get new recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
