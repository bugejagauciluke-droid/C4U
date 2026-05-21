"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Send, Loader2, ChevronLeft, ChevronRight,
  Moon, Zap, Utensils, Wine, Dumbbell, Users, Smartphone,
  MessageCircle, Sparkles, ChevronDown, ChevronUp, Calendar, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Data types ────────────────────────────────────────────────────────────────
interface DiaryEntry {
  date: string;
  freeWrite: string;
  mood: number;
  energy: number;
  sleep: number;
  ate: string;
  drank: string;
  activity: string;
  socialLife: string;
  screenTime: string;
  appsUsed: string;
  contentConsumed: string;
  importantConversations: string;
  aiResponse?: DiaryAIResponse;
  previousAnswers?: string;
}

interface DiaryAIResponse {
  reflection: string;
  insight: string;
  goalComment: string | null;
  questions: string[];
}

const DIARY_KEY = "c4u_diary_entries";
const GOAL_KEY  = "c4u_life_goal";

function today() { return new Date().toISOString().split("T")[0]; }

function loadEntries(): Record<string, DiaryEntry> {
  try { return JSON.parse(localStorage.getItem(DIARY_KEY) ?? "{}"); }
  catch { return {}; }
}

function saveEntry(entry: DiaryEntry) {
  const all = loadEntries();
  all[entry.date] = entry;
  localStorage.setItem(DIARY_KEY, JSON.stringify(all));
}

// ── Slider component ──────────────────────────────────────────────────────────
function Slider({ value, onChange, min = 1, max = 10, emoji }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; emoji: string[];
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const emojiIdx = Math.round(((value - min) / (max - min)) * (emoji.length - 1));
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji[emojiIdx]}</span>
      <div className="flex-1 relative h-2 bg-slate-100 rounded-full cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onChange(Math.round(min + x * (max - min)));
      }}>
        <div className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-teal-500 shadow-sm" style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-6 text-right">{value}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const [entry, setEntry]             = useState<DiaryEntry>({ date: today(), freeWrite: "", mood: 7, energy: 6, sleep: 7, ate: "", drank: "", activity: "", socialLife: "", screenTime: "", appsUsed: "", contentConsumed: "", importantConversations: "" });
  const [aiResponse, setAiResponse]   = useState<DiaryAIResponse | null>(null);
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDigital, setShowDigital] = useState(false);
  const [answers, setAnswers]         = useState<string[]>([]);
  const [viewDate, setViewDate]       = useState(today());
  const [allEntries, setAllEntries]   = useState<Record<string, DiaryEntry>>({});

  useEffect(() => {
    const entries = loadEntries();
    setAllEntries(entries);
    const goalRaw = localStorage.getItem(GOAL_KEY);
    const activeGoal = goalRaw ? (JSON.parse(goalRaw) as { goal?: string }).goal : undefined;

    if (entries[today()]) {
      const e = entries[today()];
      setEntry(e);
      if (e.aiResponse) { setAiResponse(e.aiResponse); setSubmitted(true); }
    } else {
      // Carry yesterday's questions as previous answers placeholder
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      if (entries[yStr]?.aiResponse?.questions) {
        setEntry(e => ({ ...e, activeGoal, previousAnswers: "" } as DiaryEntry & { activeGoal?: string }));
      }
      if (activeGoal) setEntry(e => ({ ...e } as DiaryEntry));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(k: keyof DiaryEntry, v: string | number) {
    setEntry(e => ({ ...e, [k]: v }));
  }

  async function submit() {
    if (!entry.freeWrite.trim()) return;
    setLoading(true);
    const goalRaw = localStorage.getItem(GOAL_KEY);
    const activeGoal = goalRaw ? (JSON.parse(goalRaw) as { goal?: string }).goal : undefined;

    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, activeGoal }),
      });
      const data: DiaryAIResponse = await res.json();
      setAiResponse(data);
      setSubmitted(true);
      const saved = { ...entry, aiResponse: data };
      saveEntry(saved);
      setAllEntries(prev => ({ ...prev, [entry.date]: saved }));
      setAnswers(new Array(data.questions.length).fill(""));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswers() {
    if (!aiResponse) return;
    const answersText = aiResponse.questions.map((q, i) => `Q: ${q}\nA: ${answers[i] ?? ""}`).join("\n\n");
    const updated = { ...entry, previousAnswers: answersText };
    setEntry(updated);
    saveEntry({ ...updated, aiResponse: aiResponse });
    setAnswers([]);
  }

  // Calendar navigation
  const dates = Object.keys(allEntries).sort().reverse().slice(0, 14);

  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Diary</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(today() + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {dates.slice(0, 5).map(d => (
              <button key={d}
                onClick={() => {
                  setViewDate(d);
                  const e = allEntries[d];
                  if (e) { setEntry(e); if (e.aiResponse) { setAiResponse(e.aiResponse); setSubmitted(true); } else { setAiResponse(null); setSubmitted(false); } }
                }}
                className={`h-7 w-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                  viewDate === d
                    ? "bg-teal-500 text-white"
                    : allEntries[d]
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-100 text-slate-400"
                }`}
                title={d}
              >
                {new Date(d + "T12:00:00").getDate()}
              </button>
            ))}
            <button onClick={() => { const e = allEntries[today()]; setViewDate(today()); if (e) { setEntry(e); if (e.aiResponse) { setAiResponse(e.aiResponse); setSubmitted(true); } else { setAiResponse(null); setSubmitted(false); } } else { setEntry({ date: today(), freeWrite: "", mood: 7, energy: 6, sleep: 7, ate: "", drank: "", activity: "", socialLife: "", screenTime: "", appsUsed: "", contentConsumed: "", importantConversations: "" }); setAiResponse(null); setSubmitted(false); } }}
              className="h-7 px-2 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Today
            </button>
          </div>
        </div>

        {/* Past entry notice */}
        {viewDate !== today() && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            Viewing entry from {new Date(viewDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
            <button onClick={() => { setViewDate(today()); const e = allEntries[today()]; if (e) { setEntry(e); setAiResponse(e.aiResponse ?? null); setSubmitted(!!e.aiResponse); } else { setEntry({ date: today(), freeWrite: "", mood: 7, energy: 6, sleep: 7, ate: "", drank: "", activity: "", socialLife: "", screenTime: "", appsUsed: "", contentConsumed: "", importantConversations: "" }); setAiResponse(null); setSubmitted(false); } }} className="underline font-medium ml-1">Back to today</button>
          </div>
        )}

        {/* Free write */}
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-500" />
            <h2 className="font-semibold text-sm text-gray-700">What happened today?</h2>
          </div>
          <textarea
            value={entry.freeWrite}
            onChange={e => update("freeWrite", e.target.value)}
            disabled={submitted && viewDate !== today()}
            rows={6}
            placeholder="Tell me everything. What went through your mind today? Who did you see? What bothered you? What felt good? Don't filter — this is just between us."
            className="w-full text-sm text-gray-800 leading-relaxed resize-none focus:outline-none placeholder-gray-300"
          />
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-sm text-gray-700">Rate your day</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-rose-400" /> Mood</p>
              <Slider value={entry.mood} onChange={v => update("mood", v)} emoji={["😞","😔","😕","😐","🙂","😊","😄","😁","🤩","🥳"]} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400" /> Energy</p>
              <Slider value={entry.energy} onChange={v => update("energy", v)} emoji={["💀","😴","🥱","😪","😑","😌","😤","⚡","🔥","🚀"]} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-indigo-400" /> Sleep last night (hours)</p>
              <Slider value={entry.sleep} onChange={v => update("sleep", v)} min={1} max={12} emoji={["😵","😩","😫","😔","😶","😐","🙂","😌","😴","💤"]} />
            </div>
          </div>
        </div>

        {/* Life details */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition-colors">
            <span className="flex items-center gap-2"><Utensils className="h-4 w-4 text-emerald-500" /> Food, drink & activity</span>
            {showDetails ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-6 pb-6 space-y-4 border-t border-border">
                  {[
                    { key: "ate", label: "What I ate", Icon: Utensils, placeholder: "Pizza for lunch, salad for dinner, skipped breakfast…", color: "text-emerald-500" },
                    { key: "drank", label: "What I drank", Icon: Wine, placeholder: "3 coffees, 2 glasses of wine, barely any water…", color: "text-amber-500" },
                    { key: "activity", label: "Physical activity", Icon: Dumbbell, placeholder: "30 min walk, skipped gym, stood at desk for most of the day…", color: "text-sky-500" },
                    { key: "socialLife", label: "Social life", Icon: Users, placeholder: "Met Sarah for lunch, had a long call with mum, saw the guys at the bar — ended up chatting to someone…", color: "text-violet-500" },
                  ].map(({ key, label, Icon, placeholder, color }) => (
                    <div key={key} className="mt-4">
                      <label className={`text-xs font-medium flex items-center gap-1.5 mb-1.5 ${color}`}><Icon className="h-3.5 w-3.5" />{label}</label>
                      <textarea rows={2} value={(entry as Record<string, unknown>)[key] as string} onChange={e => update(key as keyof DiaryEntry, e.target.value)} disabled={submitted && viewDate !== today()} placeholder={placeholder} className="w-full text-sm text-gray-700 resize-none focus:outline-none border border-border rounded-xl px-3 py-2 placeholder-gray-300 focus:ring-2 focus:ring-teal-300" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Digital life */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button onClick={() => setShowDigital(!showDigital)} className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-slate-50 transition-colors">
            <span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-indigo-500" /> Digital life & screen time</span>
            {showDigital ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          <AnimatePresence>
            {showDigital && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-6 pb-6 border-t border-border space-y-4">
                  <p className="text-xs text-muted-foreground mt-4 bg-indigo-50 rounded-xl p-3">
                    💡 Check your phone&apos;s Screen Time (iPhone) or Digital Wellbeing (Android) settings for accurate data. The AI uses this to spot patterns between your digital habits and your mood, energy, and goals.
                  </p>
                  {[
                    { key: "screenTime", label: "Total screen time today", Icon: Smartphone, placeholder: "e.g. 4.5 hours", color: "text-indigo-500", rows: 1 },
                    { key: "appsUsed", label: "Main apps / platforms used", Icon: Zap, placeholder: "Instagram 1.5h, YouTube 45min, WhatsApp 30min, LinkedIn 20min…", color: "text-sky-500", rows: 2 },
                    { key: "contentConsumed", label: "What I watched, scrolled, and read", Icon: Sparkles, placeholder: "Watched 3 YouTube videos about investing, scrolled TikTok for ages (mostly gym content and memes), read one news article…", color: "text-violet-500", rows: 3 },
                    { key: "importantConversations", label: "Significant conversations today", Icon: MessageCircle, placeholder: "Had a long DM conversation with Marco about the job opportunity. Replied to Sarah's message about Saturday. Sent a risky text to someone I like…", color: "text-rose-500", rows: 3 },
                  ].map(({ key, label, Icon, placeholder, color, rows }) => (
                    <div key={key}>
                      <label className={`text-xs font-medium flex items-center gap-1.5 mb-1.5 ${color}`}><Icon className="h-3.5 w-3.5" />{label}</label>
                      <textarea rows={rows} value={(entry as Record<string, unknown>)[key] as string} onChange={e => update(key as keyof DiaryEntry, e.target.value)} disabled={submitted && viewDate !== today()} placeholder={placeholder} className="w-full text-sm text-gray-700 resize-none focus:outline-none border border-border rounded-xl px-3 py-2 placeholder-gray-300 focus:ring-2 focus:ring-teal-300" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        {!submitted && viewDate === today() && (
          <Button
            onClick={submit}
            disabled={loading || !entry.freeWrite.trim()}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-2xl py-3 font-semibold text-base shadow-md"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Reading your day…</> : <><Send className="h-4 w-4 mr-2" /> Share with C4U</>}
          </Button>
        )}

        {/* AI Response */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Reflection */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 fill-white" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">C4U says</p>
                </div>
                <p className="leading-relaxed text-white/95">{aiResponse.reflection}</p>
              </div>

              {/* Insight */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">Pattern spotted</p>
                <p className="text-sm text-indigo-900 leading-relaxed">{aiResponse.insight}</p>
              </div>

              {/* Goal comment */}
              {aiResponse.goalComment && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Your goal</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{aiResponse.goalComment}</p>
                </div>
              )}

              {/* Questions */}
              {aiResponse.questions.length > 0 && (
                <div className="bg-white rounded-3xl border border-border p-6 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">I want to ask you…</p>
                  {aiResponse.questions.map((q, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-gray-800 mb-2">{q}</p>
                      {answers.length > 0 && (
                        <textarea
                          rows={2}
                          value={answers[i] ?? ""}
                          onChange={e => setAnswers(a => { const n = [...a]; n[i] = e.target.value; return n; })}
                          placeholder="Answer honestly — this feeds tomorrow's check-in…"
                          className="w-full text-sm text-gray-700 resize-none focus:outline-none border border-border rounded-xl px-3 py-2 placeholder-gray-300 focus:ring-2 focus:ring-teal-300"
                        />
                      )}
                    </div>
                  ))}
                  {answers.length > 0 && (
                    <Button onClick={submitAnswers} size="sm" variant="outline" className="border-teal-400 text-teal-600">
                      Save my answers
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
