"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, Loader2, Heart, RefreshCw, ArrowRight,
  Wind, Anchor, Users, Activity, Brain, BookOpen, Clock,
  Sparkles, ChevronDown, ChevronUp, Shield
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  why: string;
}

interface SupportResponse {
  isCrisis?: boolean;
  acknowledgment: string;
  exercises: Exercise[];
  closingMessage: string;
}

const TYPE_CONFIG: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  breathing:  { Icon: Wind,     color: "text-sky-600",    bg: "bg-sky-50 border-sky-100"    },
  grounding:  { Icon: Anchor,   color: "text-teal-600",   bg: "bg-teal-50 border-teal-100"  },
  social:     { Icon: Users,    color: "text-rose-600",   bg: "bg-rose-50 border-rose-100"  },
  movement:   { Icon: Activity, color: "text-amber-600",  bg: "bg-amber-50 border-amber-100"},
  cognitive:  { Icon: Brain,    color: "text-violet-600", bg: "bg-violet-50 border-violet-100"},
  journaling: { Icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100"},
};

function ExerciseCard({ ex }: { ex: Exercise }) {
  const [showWhy, setShowWhy] = useState(false);
  const cfg = TYPE_CONFIG[ex.type] ?? TYPE_CONFIG.grounding;
  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm`}>
          <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{ex.title}</h3>
            <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              <Clock className="h-3 w-3" />{ex.duration}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{ex.description}</p>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className={`flex items-center gap-1 text-xs font-medium mt-2 ${cfg.color} hover:opacity-70 transition-opacity`}
          >
            {showWhy ? <><ChevronUp className="h-3 w-3" /> Hide reason</> : <><ChevronDown className="h-3 w-3" /> Why this helps</>}
          </button>
          <AnimatePresence>
            {showWhy && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-xs text-gray-500 mt-1.5 leading-relaxed overflow-hidden"
              >
                {ex.why}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function HeroChat() {
  const [text, setText]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [response, setResponse]   = useState<SupportResponse | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Auto-expand textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 280) + "px";
  }

  const submit = useCallback(async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: "", details: text.trim() }),
      });
      const data: SupportResponse = await res.json();
      setResponse(data);
      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      // fallback handled by API
    } finally {
      setLoading(false);
    }
  }, [text, loading]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {!response ? (
          /* ── Input state ── */
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 shadow-2xl shadow-black/20">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleInput}
                  onKeyDown={handleKey}
                  placeholder="Tell me what's going on. Whatever it is — I'm here and I'm listening."
                  disabled={loading}
                  rows={3}
                  className="w-full bg-transparent text-white placeholder-white/40 text-base leading-relaxed resize-none focus:outline-none min-h-[80px]"
                  style={{ height: "auto" }}
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <p className="text-white/35 text-xs">
                    <kbd className="bg-white/10 rounded px-1 py-0.5 text-[10px]">⌘ Enter</kbd> to send
                  </p>
                  <button
                    onClick={submit}
                    disabled={!text.trim() || loading}
                    className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-900/30 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                  >
                    {loading
                      ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                      : <ArrowUp className="h-4 w-4 text-white" />
                    }
                  </button>
                </div>
              </div>
              {loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/50 text-sm mt-4"
                >
                  Hearing you…
                </motion.p>
              )}
            </div>
            <p className="text-center text-white/30 text-xs mt-5 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Private</span>
              <span>·</span>
              <span>No sign-up needed</span>
              <span>·</span>
              <span>Always free to start</span>
            </p>
          </motion.div>
        ) : (
          /* ── Response state ── */
          <motion.div
            key="response"
            ref={responseRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Crisis banner */}
            {response.isCrisis && (
              <div className="bg-rose-900/80 border border-rose-500/50 rounded-2xl p-5 text-white">
                <p className="font-bold text-rose-200 mb-2">You are not alone. Help is here right now.</p>
                <div className="space-y-1.5 text-sm">
                  <p>📱 <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                  <p>🆘 <strong>Emergency:</strong> Call 112</p>
                  <p>🌍 <strong>Global support:</strong> befrienders.org</p>
                </div>
              </div>
            )}

            {/* Acknowledgment */}
            <div className="bg-gradient-to-br from-teal-600/90 to-emerald-700/90 backdrop-blur-md border border-teal-400/30 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-teal-200 fill-teal-200" />
                <span className="text-xs font-semibold text-teal-200 uppercase tracking-wide">C4U</span>
              </div>
              <p className="leading-relaxed text-white/95 text-[15px]">{response.acknowledgment}</p>
            </div>

            {/* Exercises */}
            <div className="space-y-3">
              {response.exercises.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
            </div>

            {/* Closing */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-white/80 text-sm leading-relaxed">
              {response.closingMessage}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-violet-600/80 to-indigo-700/80 backdrop-blur-md border border-violet-400/30 rounded-3xl p-6 text-white text-center">
              <Sparkles className="h-6 w-6 text-violet-200 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Want C4U to remember this?</p>
              <p className="text-white/65 text-sm mb-5">Start a free 7-day trial. Your AI companion learns your story, supports you daily, and never forgets what matters to you.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/premium">
                  <Button className="bg-white text-violet-700 hover:bg-white/90 font-bold w-full sm:w-auto">
                    Start free trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <button
                  onClick={() => { setResponse(null); setText(""); setTimeout(() => textareaRef.current?.focus(), 100); }}
                  className="flex items-center justify-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Talk about something else
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
