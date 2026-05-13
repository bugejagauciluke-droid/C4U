"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, ArrowRight, Sun, Coffee, Moon, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DayPlan {
  day: number; theme: string;
  morning: string; afternoon: string; evening: string; affirmation: string;
}
interface Plan { title: string; intention: string; days: DayPlan[]; }

const DAY_COLORS = [
  "from-teal-500 to-emerald-600","from-sky-500 to-blue-600","from-violet-500 to-purple-700",
  "from-rose-500 to-pink-600","from-amber-500 to-orange-600","from-fuchsia-500 to-purple-600","from-indigo-500 to-violet-700",
];

export default function PlansPage() {
  const [situation, setSituation] = useState("");
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);

  async function generate() {
    if (!situation.trim() || !goal.trim()) return;
    setLoading(true); setError(""); setPlan(null);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data); setActiveDay(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Star className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">7-Day Support Plan</h1>
            <p className="text-sm text-muted-foreground">A personalised daily roadmap built around what you're going through</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!plan ? (
          <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold mb-1.5">What are you going through right now?</label>
                <p className="text-xs text-muted-foreground mb-3">Be as open as you like. The more you share, the more personal your plan will be.</p>
                <textarea value={situation} onChange={e => setSituation(e.target.value)} rows={4}
                  placeholder="e.g. I'm going through a difficult separation and feeling lost, anxious most mornings, and disconnected from friends…"
                  className="input-base resize-none w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">How do you want to feel by the end of the week?</label>
                <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={2}
                  placeholder="e.g. Calmer, more grounded, and able to get through the day without panic…"
                  className="input-base resize-none w-full" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button variant="gradient" size="lg" onClick={generate}
                disabled={!situation.trim() || !goal.trim() || loading} className="w-full">
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating your plan…</>
                  : <><Sparkles className="h-4 w-4" /> Generate my 7-day plan <ArrowRight className="h-4 w-4" /></>}
              </Button>
              {loading && (
                <p className="text-center text-sm text-muted-foreground">This takes about 15 seconds — we're crafting something just for you.</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="plan" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Plan header */}
            <div className="rounded-2xl gradient-c4u p-6 text-white mb-6 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Your 7-Day Plan</p>
              <h2 className="text-2xl font-black mb-2">{plan.title}</h2>
              <p className="text-white/80 text-sm leading-relaxed">{plan.intention}</p>
            </div>

            {/* Day tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {plan.days.map((d, i) => (
                <button key={i} onClick={() => setActiveDay(i)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                    ${activeDay === i ? `bg-gradient-to-r ${DAY_COLORS[i]} text-white shadow-sm` : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  Day {d.day}
                </button>
              ))}
            </div>

            {/* Active day */}
            <AnimatePresence mode="wait">
              {plan.days[activeDay] && (
                <motion.div key={activeDay} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <div className={`rounded-2xl bg-gradient-to-br ${DAY_COLORS[activeDay]} p-1 shadow-lg mb-5`}>
                    <div className="bg-white rounded-xl p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Day {plan.days[activeDay].day}</p>
                      <h3 className="text-xl font-bold mb-5">{plan.days[activeDay].theme}</h3>
                      <div className="space-y-4">
                        {[
                          { Icon: Sun, label: "Morning", content: plan.days[activeDay].morning, color: "text-amber-500" },
                          { Icon: Coffee, label: "Afternoon", content: plan.days[activeDay].afternoon, color: "text-teal-500" },
                          { Icon: Moon, label: "Evening", content: plan.days[activeDay].evening, color: "text-violet-500" },
                        ].map(({ Icon, label, content, color }) => (
                          <div key={label} className="flex gap-3">
                            <div className="shrink-0 mt-0.5"><Icon className={`h-4 w-4 ${color}`} /></div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground mb-0.5">{label}</p>
                              <p className="text-sm leading-relaxed">{content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 pt-4 border-t border-border">
                        <p className="text-xs font-bold text-muted-foreground mb-1">Today&apos;s affirmation</p>
                        <p className="text-sm italic text-muted-foreground">&ldquo;{plan.days[activeDay].affirmation}&rdquo;</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button disabled={activeDay === 0} onClick={() => setActiveDay(d => d - 1)}
                      className="text-sm text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">← Previous day</button>
                    <button disabled={activeDay === plan.days.length - 1} onClick={() => setActiveDay(d => d + 1)}
                      className="text-sm text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">Next day →</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => setPlan(null)}
              className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto">
              <RefreshCw className="h-3.5 w-3.5" /> Create a new plan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
