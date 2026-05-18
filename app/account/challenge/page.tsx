"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, CheckCircle2, RotateCcw, Loader2, Flame, Star,
  ShoppingBag, ChevronRight, Calendar, Trophy, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Challenge {
  title: string;
  mission: string;
  category: "social" | "courage" | "movement" | "mindset" | "connection" | "growth";
  difficulty: "gentle" | "bold" | "brave";
  why: string;
  suggestion: string | null;
}

interface Message { role: string; content: string; }

const STORAGE_KEY_CHALLENGE = "c4u_challenge_state";
const COMPANION_KEY = "c4u_companion_history";
const COMPLETED_KEY = "c4u_completed_challenges";

interface StoredState {
  date: string;          // YYYY-MM-DD
  challenge: Challenge;
  done: boolean;
}

const CATEGORY_CONFIG = {
  social:     { label: "Social",      color: "from-sky-500 to-blue-600",       bg: "bg-sky-50",     text: "text-sky-700"   },
  courage:    { label: "Courage",     color: "from-orange-500 to-red-600",     bg: "bg-orange-50",  text: "text-orange-700"},
  movement:   { label: "Movement",    color: "from-emerald-500 to-teal-600",   bg: "bg-emerald-50", text: "text-emerald-700"},
  mindset:    { label: "Mindset",     color: "from-violet-500 to-purple-700",  bg: "bg-violet-50",  text: "text-violet-700" },
  connection: { label: "Connection",  color: "from-rose-500 to-pink-600",      bg: "bg-rose-50",    text: "text-rose-700"   },
  growth:     { label: "Growth",      color: "from-amber-500 to-orange-600",   bg: "bg-amber-50",   text: "text-amber-700"  },
};

const DIFFICULTY_CONFIG = {
  gentle: { label: "Gentle day",  dot: "bg-emerald-400" },
  bold:   { label: "Bold move",   dot: "bg-amber-400"   },
  brave:  { label: "Brave step",  dot: "bg-rose-500"    },
};

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function getStreak(completed: { date: string }[]): number {
  if (!completed.length) return 0;
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const dateStr = d.toISOString().split("T")[0];
    if (completed.some(c => c.date === dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function ChallengePage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [completedHistory, setCompletedHistory] = useState<{ date: string; title: string }[]>([]);
  const [celebrating, setCelebrating] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY_CHALLENGE);
    const hist = JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? "[]") as { date: string; title: string }[];
    setCompletedHistory(hist);

    if (raw) {
      const state: StoredState = JSON.parse(raw);
      if (state.date === today()) {
        setChallenge(state.challenge);
        setDone(state.done);
        return;
      }
    }
    // No challenge for today yet — generate one
    generateChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateChallenge = useCallback(async () => {
    setLoading(true);
    setDone(false);
    setChallenge(null);

    const messages: Message[] = JSON.parse(localStorage.getItem(COMPANION_KEY) ?? "[]");
    const hist: { date: string; title: string }[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? "[]");
    const completedTitles = hist.slice(-7).map(h => h.title);

    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentMessages: messages.slice(-20),
          completedChallenges: completedTitles,
          date: today(),
        }),
      });
      const data: Challenge = await res.json();
      setChallenge(data);
      setDone(false);
      const state: StoredState = { date: today(), challenge: data, done: false };
      localStorage.setItem(STORAGE_KEY_CHALLENGE, JSON.stringify(state));
    } catch {
      // silent — fallback handled by API
    } finally {
      setLoading(false);
    }
  }, []);

  function markDone() {
    if (!challenge || done) return;
    setDone(true);
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2800);

    // Persist done state
    const state: StoredState = { date: today(), challenge, done: true };
    localStorage.setItem(STORAGE_KEY_CHALLENGE, JSON.stringify(state));

    // Add to completed history (avoid duplicate for same day)
    const hist: { date: string; title: string }[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? "[]");
    if (!hist.some(h => h.date === today())) {
      const updated = [...hist, { date: today(), title: challenge.title }];
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
      setCompletedHistory(updated);
    }
  }

  const streak = getStreak(completedHistory);
  const cat = challenge ? CATEGORY_CONFIG[challenge.category] : null;
  const diff = challenge ? DIFFICULTY_CONFIG[challenge.difficulty] : null;

  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Challenge</h1>
            <p className="text-sm text-gray-500 mt-0.5">One real thing. Today.</p>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-md"
            >
              <Flame className="h-4 w-4" />
              <span className="font-bold text-sm">{streak} day{streak !== 1 ? "s" : ""}</span>
            </motion.div>
          )}
        </div>

        {/* Challenge Card */}
        {loading && (
          <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
            <p className="text-gray-500 text-sm">Building your challenge for today…</p>
          </div>
        )}

        {!loading && challenge && cat && diff && (
          <motion.div
            key={challenge.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Celebration overlay */}
            <AnimatePresence>
              {celebrating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 rounded-3xl overflow-hidden pointer-events-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-emerald-400/30 rounded-3xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1.1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      className="text-center"
                    >
                      <div className="text-6xl mb-2">🎉</div>
                      <p className="font-bold text-teal-800 text-lg">Challenge complete!</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`bg-white rounded-3xl shadow-sm overflow-hidden ${done ? "ring-2 ring-teal-400" : ""}`}>
              {/* Top gradient band */}
              <div className={`h-2 bg-gradient-to-r ${cat.color}`} />

              <div className="p-6 space-y-5">
                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`h-2 w-2 rounded-full ${diff.dot}`} />
                    {diff.label}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(today() + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 leading-snug">{challenge.title}</h2>

                {/* Mission */}
                <p className="text-gray-700 leading-relaxed">{challenge.mission}</p>

                {/* Why */}
                <div className="bg-indigo-50 rounded-2xl px-4 py-3">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Why this, why today</p>
                  <p className="text-sm text-indigo-800">{challenge.why}</p>
                </div>

                {/* Suggestion (subtle upsell) */}
                {challenge.suggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border border-amber-200 bg-amber-50 rounded-2xl px-4 py-3"
                  >
                    <div className="flex gap-2">
                      <ShoppingBag className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">By the way</p>
                        <p className="text-sm text-amber-900">{challenge.suggestion}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CTA */}
                {!done ? (
                  <Button
                    onClick={markDone}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-2xl py-3 font-semibold text-base shadow-md"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    I did it
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-3 py-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-500" />
                    <span className="font-semibold text-teal-700">Done. Come back tomorrow.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Refresh (not done only, after generation) */}
        {!loading && challenge && !done && (
          <div className="flex justify-center">
            <button
              onClick={generateChallenge}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Generate a different challenge
            </button>
          </div>
        )}

        {/* Streak history */}
        {completedHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Your streak</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {completedHistory.slice(-14).reverse().map((h, i) => {
                const isToday = h.date === today();
                return (
                  <div
                    key={h.date}
                    title={`${h.date}: ${h.title}`}
                    className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm
                      ${isToday
                        ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white"
                        : "bg-gradient-to-br from-amber-400 to-orange-400 text-white"
                      }`}
                  >
                    {isToday ? <Flame className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                );
              })}
            </div>
            {streak >= 3 && (
              <p className="text-xs text-gray-500 mt-3">
                {streak} days in a row — you&apos;re building something real.
              </p>
            )}
          </motion.div>
        )}

        {/* No companion history nudge */}
        {!loading && challenge && (
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Challenges get more personal over time</p>
              <p className="text-xs text-gray-500 mt-0.5">The more you share with your AI Companion, the more specific your daily challenge becomes.</p>
              <a href="/account/companion" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2">
                Open Companion <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
