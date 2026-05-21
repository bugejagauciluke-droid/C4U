"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Loader2, Sparkles, CheckCircle2, Circle, ChevronRight,
  RefreshCw, Clock, Calendar, Star, TrendingUp, Zap, Eye,
  Trophy, ArrowRight, Flame, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoalPlan } from "@/app/api/goals/route";

const GOAL_KEY      = "c4u_life_goal";
const MILESTONES_KEY = "c4u_completed_milestones";

interface StoredGoal {
  goal: string;
  currentSituation: string;
  obstacles: string;
  strengths: string;
  timeline: string;
  plan: GoalPlan;
  createdAt: string;
  dailyChecked: Record<string, string[]>; // date → completed daily task indices
}

function today() { return new Date().toISOString().split("T")[0]; }

// ── Week progress ring ────────────────────────────────────────────────────────
function ProgressRing({ score }: { score: number }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="url(#rg)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <text x="44" y="44" textAnchor="middle" dominantBaseline="middle" className="text-xl font-black fill-gray-800" fontSize="18" fontWeight="bold">{score}%</text>
    </svg>
  );
}

// ── Time-scale section ───────────────────────────────────────────────────────
function TimeSection({ icon: Icon, label, color, children }: {
  icon: React.ElementType; label: string; color: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-5 py-4 ${open ? "border-b border-border" : ""}`}>
        <span className={`flex items-center gap-2.5 font-semibold text-sm ${color}`}>
          <Icon className="h-4 w-4" />{label}
        </span>
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Checkable item ────────────────────────────────────────────────────────────
function CheckItem({ text, sub, checked, onToggle }: {
  text: string; sub?: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-start gap-3 text-left group py-1.5">
      {checked
        ? <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
        : <Circle className="h-5 w-5 text-gray-300 group-hover:text-teal-400 shrink-0 mt-0.5 transition-colors" />}
      <div>
        <p className={`text-sm font-medium ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>{text}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const [stored, setStored]         = useState<StoredGoal | null>(null);
  const [form, setForm]             = useState({ goal: "", currentSituation: "", obstacles: "", strengths: "", timeline: "12 months" });
  const [loading, setLoading]       = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyReview, setWeeklyReview]   = useState<{ letter: string; progressScore: number; winThisWeek: string; blindspot: string; focusNextWeek: string } | null>(null);
  const [todayDone, setTodayDone]   = useState<string[]>([]);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(GOAL_KEY);
    if (raw) {
      const s: StoredGoal = JSON.parse(raw);
      setStored(s);
      setTodayDone(s.dailyChecked?.[today()] ?? []);
    }
    setCompletedMilestones(JSON.parse(localStorage.getItem(MILESTONES_KEY) ?? "[]"));
  }, []);

  function save(s: StoredGoal) {
    setStored(s);
    localStorage.setItem(GOAL_KEY, JSON.stringify(s));
  }

  async function generate() {
    if (!form.goal.trim() || !form.currentSituation.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate", ...form }),
      });
      const plan: GoalPlan = await res.json();
      const s: StoredGoal = { ...form, plan, createdAt: new Date().toISOString(), dailyChecked: {} };
      save(s);
    } catch {}
    setLoading(false);
  }

  function toggleDaily(taskText: string) {
    if (!stored) return;
    const next = todayDone.includes(taskText)
      ? todayDone.filter(t => t !== taskText)
      : [...todayDone, taskText];
    setTodayDone(next);
    const updated: StoredGoal = { ...stored, dailyChecked: { ...stored.dailyChecked, [today()]: next } };
    save(updated);
  }

  function toggleMilestone(m: string) {
    const next = completedMilestones.includes(m)
      ? completedMilestones.filter(x => x !== m)
      : [...completedMilestones, m];
    setCompletedMilestones(next);
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(next));
  }

  async function getWeeklyReview() {
    if (!stored) return;
    setWeeklyLoading(true);
    const DIARY_KEY = "c4u_diary_entries";
    const entries = JSON.parse(localStorage.getItem(DIARY_KEY) ?? "{}") as Record<string, { freeWrite: string; mood: number; date: string }>;
    const last7 = Object.values(entries).slice(-7).map(e => `[${e.date}] Mood: ${e.mood}/10 — ${e.freeWrite.slice(0, 200)}`).join("\n\n");

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "review", goal: stored.goal, plan: stored.plan, completedMilestones, diaryEntries: last7 }),
      });
      setWeeklyReview(await res.json());
    } catch {}
    setWeeklyLoading(false);
  }

  const dailyDoneCount = stored ? (stored.plan.daily.filter(d => todayDone.includes(d.task)).length) : 0;
  const dailyTotal = stored?.plan.daily.length ?? 0;
  const dailyPct = dailyTotal ? Math.round((dailyDoneCount / dailyTotal) * 100) : 0;

  // ── Setup form (no goal yet) ─────────────────────────────────────────────
  if (!stored) {
    return (
      <div className="min-h-full bg-serene">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Life Goal</h1>
            <p className="text-sm text-gray-500 mt-1">Tell me what you want. I&apos;ll build you a real roadmap to get there.</p>
          </div>

          <div className="bg-white rounded-3xl border border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-teal-500" /> Your north star goal
              </label>
              <textarea rows={3} value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                placeholder="Be specific. Not 'be happy' — what does that look like? 'Launch my own business and earn €50k by December', 'Find a relationship I actually want', 'Get to 80kg and feel strong in my body'…"
                className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Where are you right now?</label>
              <textarea rows={3} value={form.currentSituation} onChange={e => setForm(f => ({ ...f, currentSituation: e.target.value }))}
                placeholder="Be honest. What does your life actually look like today — work, relationships, money, health, mental state? The AI can only help you if it knows the real starting point."
                className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What&apos;s in your way?</label>
                <textarea rows={2} value={form.obstacles} onChange={e => setForm(f => ({ ...f, obstacles: e.target.value }))}
                  placeholder="Fears, habits, people, money, time, confidence…"
                  className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What do you have going for you?</label>
                <textarea rows={2} value={form.strengths} onChange={e => setForm(f => ({ ...f, strengths: e.target.value }))}
                  placeholder="Skills, support, time, drive, resources, previous experience…"
                  className="w-full text-sm text-gray-800 border border-border rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Timeline</label>
              <div className="flex flex-wrap gap-2">
                {["3 months", "6 months", "12 months", "2 years"].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, timeline: t }))}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${form.timeline === t ? "bg-teal-500 text-white border-teal-500" : "border-border text-muted-foreground hover:border-teal-400"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={generate} disabled={loading || !form.goal.trim() || !form.currentSituation.trim()}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-semibold py-3">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Building your roadmap…</> : <><Sparkles className="h-4 w-4 mr-2" /> Build my roadmap</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { plan } = stored;

  // ── Dashboard view ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Your Roadmap</h1>
            <p className="text-sm text-gray-600 mt-1 font-medium leading-snug">🎯 {stored.goal}</p>
          </div>
          <button onClick={() => { localStorage.removeItem(GOAL_KEY); setStored(null); }}
            className="text-xs text-muted-foreground hover:text-gray-600 flex items-center gap-1 shrink-0 mt-1">
            <RefreshCw className="h-3 w-3" /> New goal
          </button>
        </div>

        {/* Today's progress */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 font-medium">Today&apos;s progress</p>
              <p className="text-4xl font-black mt-1">{dailyDoneCount}<span className="text-xl font-semibold text-white/60">/{dailyTotal}</span></p>
              <p className="text-sm text-white/70 mt-0.5">daily tasks done</p>
            </div>
            <div className="bg-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-3xl font-black">{dailyPct}%</p>
              <p className="text-xs text-white/70">complete</p>
            </div>
          </div>
          {dailyPct === 100 && (
            <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
              <Trophy className="h-4 w-4" />
              <p className="text-sm font-semibold">All done today. You showed up.</p>
            </div>
          )}
        </div>

        {/* Vision */}
        <div className="bg-indigo-900 rounded-3xl p-6 text-white">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-3">Your vision</p>
          <p className="text-sm leading-relaxed text-indigo-100">{plan.vision}</p>
          <div className="mt-4 border-t border-indigo-700 pt-4">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-2">Honest truth</p>
            <p className="text-xs text-indigo-300 leading-relaxed">{plan.honestAssessment}</p>
          </div>
        </div>

        {/* First step */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Your next step right now</p>
            <p className="text-sm text-amber-900 font-medium">{plan.firstStep}</p>
          </div>
        </div>

        {/* Hourly habits */}
        <TimeSection icon={Clock} label="Daily micro-habits (build these in)" color="text-sky-600">
          <div className="space-y-3">
            {plan.hourly.map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-sky-600">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{h.habit}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.why}</p>
                </div>
              </div>
            ))}
          </div>
        </TimeSection>

        {/* Daily tasks — checkable */}
        <TimeSection icon={Calendar} label="Today's non-negotiables" color="text-teal-600">
          <div className="space-y-1">
            {plan.daily.map((d, i) => (
              <CheckItem key={i} text={d.task} sub={d.why}
                checked={todayDone.includes(d.task)}
                onToggle={() => toggleDaily(d.task)} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Resets each day. Check off as you go.</p>
        </TimeSection>

        {/* Weekly milestones — checkable */}
        <TimeSection icon={Star} label="Weekly milestones" color="text-violet-600">
          <div className="space-y-2">
            {plan.weekly.map((w, i) => (
              <CheckItem key={i} text={w.milestone} sub={`How to know: ${w.measure}`}
                checked={completedMilestones.includes(w.milestone)}
                onToggle={() => toggleMilestone(w.milestone)} />
            ))}
          </div>
        </TimeSection>

        {/* Monthly targets */}
        <TimeSection icon={TrendingUp} label="Monthly targets" color="text-amber-600">
          <div className="space-y-3">
            {plan.monthly.map((m, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-amber-600">M{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.target}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Proof: {m.howToKnow}</p>
                </div>
              </div>
            ))}
          </div>
        </TimeSection>

        {/* Yearly vision */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-violet-300" />
            <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide">In {stored.timeline}</p>
          </div>
          <p className="text-sm leading-relaxed text-violet-100 mb-4">{plan.yearly.vision}</p>
          <div className="bg-white/10 rounded-2xl px-4 py-3">
            <p className="text-xs text-violet-300 font-semibold mb-1">The identity shift</p>
            <p className="text-xs text-violet-200 leading-relaxed">{plan.yearly.identity}</p>
          </div>
        </div>

        {/* Weekly review */}
        <div className="bg-white rounded-3xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-500" /> Weekly review
            </h3>
            <Button size="sm" variant="outline" onClick={getWeeklyReview} disabled={weeklyLoading}>
              {weeklyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Sparkles className="h-3.5 w-3.5 mr-1" /> Get my review</>}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Reads your diary from this week + your goal progress. Gives you an honest assessment of where you stand.</p>

          <AnimatePresence>
            {weeklyReview && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
                <div className="flex items-center gap-4">
                  <ProgressRing score={weeklyReview.progressScore} />
                  <div className="space-y-2 flex-1">
                    <div className="bg-teal-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-teal-600 font-semibold">Win this week</p>
                      <p className="text-sm text-teal-800">{weeklyReview.winThisWeek}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-amber-600 font-semibold">Blind spot</p>
                      <p className="text-sm text-amber-800">{weeklyReview.blindspot}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-2">This week&apos;s letter</p>
                  <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-line">{weeklyReview.letter}</p>
                </div>
                <div className="bg-slate-900 rounded-2xl px-4 py-3 flex items-start gap-2">
                  <Flame className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-400">Focus next week</p>
                    <p className="text-sm text-white mt-0.5">{weeklyReview.focusNextWeek}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
