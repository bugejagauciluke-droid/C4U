"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Loader2, Clock, ChevronRight, RefreshCw, Phone, AlertTriangle, ExternalLink } from "lucide-react";
import type { SOSResponse, SOSStep } from "@/app/api/habits/sos/route";

// Hard drugs that need extra safety layer
const HIGH_RISK_HABITS = ["drugs", "alcohol", "cannabis"];
const OPIOID_HABITS = ["drugs"]; // heroin, fentanyl etc — needs overdose warning

function SafetyCard({ habit }: { habit: string }) {
  if (!OPIOID_HABITS.includes(habit)) return null;
  return (
    <div className="bg-red-950 border-2 border-red-500 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300 font-bold text-sm mb-2">⚠️ Medical emergency? Call now.</p>
          <p className="text-red-200 text-xs leading-relaxed">
            If you or anyone near you is unconscious, not breathing, or unresponsive —
            this is a medical emergency. <strong className="text-white">Call 112 immediately</strong> before anything else.
          </p>
        </div>
      </div>
      {/* Emergency call button */}
      <a href="tel:112" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base transition-colors">
        <Phone className="h-5 w-5" /> Call 112 — Emergency
      </a>
      <p className="text-red-400 text-[10px] text-center">
        C4U does not provide medical advice. In any life-threatening situation, call emergency services first.
      </p>
    </div>
  );
}

function AloneProtocol({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="bg-indigo-950 border border-indigo-600 rounded-2xl p-4 space-y-3">
      <p className="text-indigo-200 font-bold text-sm flex items-center gap-2">
        <Phone className="h-4 w-4 text-indigo-400" /> You said you're alone — this matters
      </p>
      <p className="text-indigo-300 text-xs leading-relaxed">
        Being alone makes this harder and more dangerous. The most important thing you can do right now
        is get a real human voice on the line. These lines are free, 24/7, and trained for exactly this.
      </p>
      <div className="space-y-2">
        <a href="tel:179" className="flex items-center justify-between w-full bg-indigo-900 hover:bg-indigo-800 rounded-xl px-4 py-3 transition-colors">
          <div>
            <p className="text-white font-bold text-sm">SEDQA Malta — 179</p>
            <p className="text-indigo-300 text-xs">Drug & alcohol support · 24/7 · Free · Will stay on the line</p>
          </div>
          <Phone className="h-4 w-4 text-indigo-400" />
        </a>
        <a href="tel:116123" className="flex items-center justify-between w-full bg-indigo-900 hover:bg-indigo-800 rounded-xl px-4 py-3 transition-colors">
          <div>
            <p className="text-white font-bold text-sm">Samaritans — 116 123</p>
            <p className="text-indigo-300 text-xs">Emotional crisis · 24/7 · Free · No judgment</p>
          </div>
          <Phone className="h-4 w-4 text-indigo-400" />
        </a>
        <a href="tel:25903500" className="flex items-center justify-between w-full bg-indigo-900 hover:bg-indigo-800 rounded-xl px-4 py-3 transition-colors">
          <div>
            <p className="text-white font-bold text-sm">Caritas Malta — 2590 3500</p>
            <p className="text-indigo-300 text-xs">Addiction support · Free · Confidential</p>
          </div>
          <Phone className="h-4 w-4 text-indigo-400" />
        </a>
      </div>
      <p className="text-indigo-400 text-[10px] text-center">
        You do not have to be "in crisis enough" to call. That is what they are there for.
      </p>
    </div>
  );
}

function Level2Escalation({ habit }: { habit: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 8 * 60 * 1000); // show after 8 min
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const isHardDrug = OPIOID_HABITS.includes(habit);

  return (
    <div className="bg-red-950/60 border border-red-700 rounded-2xl p-5 space-y-4">
      <p className="text-red-300 font-bold text-sm text-center">Still losing the fight?</p>
      <p className="text-red-200 text-xs text-center">The steps above work for most people. If they're not working right now — escalate immediately.</p>

      <div className="space-y-3">
        {/* Level 2 Step 1 */}
        <div className="bg-slate-900 rounded-xl p-3">
          <p className="text-white font-bold text-sm">1. Call someone — anyone — right now</p>
          <p className="text-slate-300 text-xs mt-1">Not to explain. Just to speak out loud. A call activates social circuits that directly compete with craving. Even "can you just talk to me for a minute" is enough.</p>
        </div>

        {/* Level 2 Step 2 */}
        <div className="bg-slate-900 rounded-xl p-3">
          <p className="text-white font-bold text-sm">2. Get physically outside</p>
          <p className="text-slate-300 text-xs mt-1">Stand up, go outside, start walking — any direction. 10 minutes of walking while the urge is this strong is one of the most effective interventions known. Don't stop.</p>
        </div>

        {/* Level 2 Step 3 - hard drugs: professional help only */}
        {isHardDrug && (
          <div className="bg-red-900/40 rounded-xl p-4 border border-red-700 space-y-2">
            <p className="text-red-200 font-bold text-sm">3. A trained person needs to hear you right now</p>
            <p className="text-red-300 text-xs">These services exist specifically for this moment. They will not judge you. They will not report you. Call one:</p>
            <a href="tel:179" className="flex items-center justify-between bg-red-900/60 rounded-xl px-3 py-2.5 hover:bg-red-900 transition-colors">
              <div><p className="text-white font-bold text-sm">SEDQA Malta — 179</p><p className="text-red-300 text-xs">Drug & alcohol · 24/7 · Free</p></div>
              <Phone className="h-4 w-4 text-red-300" />
            </a>
            <a href="tel:116123" className="flex items-center justify-between bg-red-900/60 rounded-xl px-3 py-2.5 hover:bg-red-900 transition-colors">
              <div><p className="text-white font-bold text-sm">Samaritans — 116 123</p><p className="text-red-300 text-xs">Crisis support · 24/7 · Free</p></div>
              <Phone className="h-4 w-4 text-red-300" />
            </a>
            <a href="tel:112" className="flex items-center justify-between bg-red-700 rounded-xl px-3 py-2.5 hover:bg-red-600 transition-colors">
              <div><p className="text-white font-bold text-sm">Emergency — 112</p><p className="text-red-200 text-xs">If there is any immediate danger to life</p></div>
              <Phone className="h-4 w-4 text-white" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const HABITS = [
  { value: "alcohol",        label: "Alcohol",         emoji: "🍷" },
  { value: "cannabis",       label: "Cannabis",        emoji: "🌿" },
  { value: "pornography",    label: "Pornography",     emoji: "📱" },
  { value: "gambling",       label: "Gambling",        emoji: "🎲" },
  { value: "smoking",        label: "Smoking",         emoji: "🚬" },
  { value: "social_media",   label: "Social media",    emoji: "📲" },
  { value: "food",           label: "Food / bingeing", emoji: "🍫" },
  { value: "drugs",          label: "Drugs",           emoji: "💊" },
  { value: "other",          label: "Something else",  emoji: "⚡" },
];

function UrgTimer({ onDone }: { onDone: () => void }) {
  const [seconds, setSeconds] = useState(20 * 60); // 20 minutes
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (seconds <= 0) { onDone(); return; }
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [active, seconds, onDone]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = ((20 * 60 - seconds) / (20 * 60)) * 100;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-teal-400" />
          <p className="text-sm font-semibold text-slate-200">Urge timer</p>
        </div>
        <p className="text-xs text-slate-400">urges peak then drop — always</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-black tabular-nums text-teal-400">
          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
        </div>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-1000"
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {!active ? (
          <button onClick={() => setActive(true)}
            className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold transition-colors">
            Start urge timer
          </button>
        ) : (
          <button onClick={() => { setActive(false); setSeconds(20*60); }}
            className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors">
            Reset
          </button>
        )}
      </div>
      {active && <p className="text-xs text-slate-400 mt-2 text-center">Do the steps below while this counts down</p>}
    </div>
  );
}

function StepCard({ step, index }: { step: SOSStep; index: number }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`rounded-2xl border-2 p-4 transition-all ${done ? "border-teal-500 bg-teal-50" : "border-border bg-white"}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => setDone(!done)}
          className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-all
            ${done ? "bg-teal-500 border-teal-500 text-white" : "border-slate-300 text-slate-400 hover:border-teal-400"}`}>
          {done ? "✓" : index}
        </button>
        <div className="flex-1">
          <p className={`font-bold text-sm mb-1 ${done ? "line-through text-teal-600" : "text-gray-900"}`}>{step.action}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{step.how}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {step.duration}
            </span>
            <span className="text-xs text-indigo-600 italic">{step.why}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SOSPage() {
  const [phase, setPhase]         = useState<"select"|"urgency"|"support">("select");
  const [habit, setHabit]         = useState("");
  const [urgency, setUrgency]     = useState(7);
  const [situation, setSituation] = useState("");
  const [isAlone, setIsAlone]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<SOSResponse | null>(null);
  const [timerDone, setTimerDone] = useState(false);

  const getTimeOfDay = () => {
    const h = new Date().getHours();
    if (h < 6)  return "middle of the night";
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    if (h < 21) return "evening";
    return "late night";
  };

  const fetchSOS = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/habits/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit,
          urgeLevel: urgency,
          situation: situation.trim() || undefined,
          timeOfDay: getTimeOfDay(),
          isAlone,
          location: "MT",
        }),
      });
      setResult(await res.json());
      setPhase("support");
    } catch { /* use fallback gracefully */ }
    setLoading(false);
  }, [habit, urgency, situation]);

  // Phase 1: Select habit
  if (phase === "select") return (
    <div className="min-h-full bg-slate-950 flex flex-col">
      <div className="max-w-lg mx-auto px-4 py-8 w-full space-y-6">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">You reached out.</h1>
          <p className="text-slate-400 mt-2 text-sm">That's the hardest step. C4U is here right now.</p>
        </div>

        <div>
          <p className="text-slate-300 text-sm font-semibold mb-3 text-center">What are you fighting right now?</p>
          <div className="grid grid-cols-3 gap-2">
            {HABITS.map(h => (
              <button key={h.value} onClick={() => { setHabit(h.value); setPhase("urgency"); }}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all">
                <span className="text-2xl">{h.emoji}</span>
                <span className="text-xs font-medium text-slate-300 text-center leading-tight">{h.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Phase 2: Urgency + situation
  if (phase === "urgency") return (
    <div className="min-h-full bg-slate-950 flex flex-col">
      <div className="max-w-lg mx-auto px-4 py-8 w-full space-y-6">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Fighting: <span className="text-white font-semibold capitalize">{habit.replace("_"," ")}</span></p>
          <h2 className="text-xl font-black text-white mt-1">How strong is the urge right now?</h2>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Mild</span><span>Moderate</span><span>Overwhelming</span>
          </div>
          <input type="range" min={1} max={10} value={urgency} onChange={e => setUrgency(Number(e.target.value))}
            className="w-full accent-rose-500" />
          <div className="text-center">
            <span className="text-3xl font-black text-white">{urgency}</span>
            <span className="text-slate-400 text-sm">/10</span>
          </div>
        </div>

        {/* Are you alone? — critical safety question */}
        <div className="bg-slate-800 rounded-2xl p-5">
          <p className="text-slate-300 text-sm font-semibold mb-3">Are you completely alone right now?</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setIsAlone(true)}
              className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${isAlone ? "border-indigo-500 bg-indigo-900/40 text-indigo-200" : "border-slate-600 text-slate-300 hover:border-slate-400"}`}>
              Yes, alone
            </button>
            <button onClick={() => setIsAlone(false)}
              className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${!isAlone ? "border-slate-500 bg-slate-700 text-slate-200" : "border-slate-600 text-slate-300 hover:border-slate-400"}`}>
              Someone nearby
            </button>
          </div>
          {isAlone && HIGH_RISK_HABITS.includes(habit) && (
            <p className="text-indigo-300 text-xs mt-2 bg-indigo-950/50 rounded-lg p-2">
              Being alone + this situation = higher risk. We'll show you phone lines with real people available immediately.
            </p>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-5">
          <p className="text-slate-300 text-sm font-semibold mb-2">What's happening right now? <span className="font-normal text-slate-500">(optional)</span></p>
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            rows={2}
            placeholder="e.g. just had a fight, at a club, stressed, celebrating..."
            className="w-full bg-slate-900 text-white text-sm rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-slate-600 border border-slate-700"
          />
        </div>

        <button onClick={fetchSOS} disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-lg shadow-xl hover:from-rose-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Getting your support…</>
            : <><Shield className="h-5 w-5" /> Get me through this</>
          }
        </button>

        <button onClick={() => setPhase("select")} className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors">
          ← Change habit
        </button>
      </div>
    </div>
  );

  // Phase 3: Active support
  if (phase === "support" && result) return (
    <div className="min-h-full bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-8 w-full space-y-5">

        {/* Safety card for hard drugs - ALWAYS first */}
        <SafetyCard habit={habit} />

        {/* Alone protocol - shows immediately if alone + high risk */}
        <AloneProtocol visible={isAlone && HIGH_RISK_HABITS.includes(habit)} />

        {/* First words */}
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-white/70" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-wide">C4U Emergency Support</span>
          </div>
          <p className="text-white font-semibold leading-relaxed">{result.firstWords}</p>
        </div>

        {/* Science + mantra */}
        <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">{result.urgeScience}</p>
          <div className="bg-slate-900 rounded-xl px-4 py-3 text-center">
            <p className="text-teal-400 font-black text-lg">"{result.mantra}"</p>
            <p className="text-slate-500 text-xs mt-1">Repeat this. Out loud if you can.</p>
          </div>
        </div>

        {/* Urge timer */}
        <UrgTimer onDone={() => setTimerDone(true)} />
        {timerDone && (
          <div className="bg-teal-900/40 border border-teal-500/30 rounded-2xl p-4 text-center">
            <p className="text-teal-300 font-bold text-sm">20 minutes. You made it through the peak.</p>
            <p className="text-teal-400/70 text-xs mt-1">That took real strength.</p>
          </div>
        )}

        {/* Steps */}
        <div>
          <p className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-rose-400" /> Do these steps now — in order
          </p>
          <div className="space-y-3">
            {result.steps.map((step, i) => <StepCard key={step.id} step={step} index={i + 1} />)}
          </div>
        </div>

        {/* Time anchor */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-slate-300 text-sm leading-relaxed">{result.timeAnchor}</p>
        </div>

        {/* If still struggling */}
        <div className="bg-amber-900/30 border border-amber-500/30 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">If you're still struggling hard</p>
          <p className="text-amber-200 text-sm leading-relaxed">{result.ifStillStruggling}</p>
        </div>

        {/* Level 2 escalation — appears after 8 minutes */}
        <Level2Escalation habit={habit} />

        {/* Crisis line */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center gap-3">
          <Phone className="h-5 w-5 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Need to talk to someone right now?</p>
            <p className="text-sm text-slate-200 font-medium">Text HOME to 741741 · Call 116 123 (Samaritans)</p>
          </div>
        </div>

        {/* Reset */}
        <button onClick={() => { setPhase("select"); setResult(null); setHabit(""); setUrgency(7); setSituation(""); setTimerDone(false); }}
          className="flex items-center justify-center gap-1.5 w-full text-slate-500 hover:text-slate-300 text-sm transition-colors py-2">
          <RefreshCw className="h-3.5 w-3.5" /> Start over
        </button>
      </div>
    </div>
  );

  return null;
}
