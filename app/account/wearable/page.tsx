"use client";

import { useState, useEffect } from "react";
import {
  Watch, Heart, Moon, Zap, Activity, TrendingUp, TrendingDown,
  Minus, Loader2, Sparkles, Plus, CheckCircle2, AlertTriangle,
  Info, RefreshCw, Link2, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DailyHealthData, WearableAnalysis, HealthInsight,
  loadWearableData, saveWearableEntry, getLast7Days
} from "@/lib/wearable-types";

// ── Insight card ──────────────────────────────────────────────────────────────

const URGENCY_STYLES = {
  positive: { border: "border-teal-200", bg: "bg-teal-50",   icon: "text-teal-500",  heading: "text-teal-800"  },
  neutral:  { border: "border-slate-200", bg: "bg-white",    icon: "text-slate-400", heading: "text-slate-800" },
  caution:  { border: "border-amber-200", bg: "bg-amber-50", icon: "text-amber-500", heading: "text-amber-800" },
  concern:  { border: "border-rose-200",  bg: "bg-rose-50",  icon: "text-rose-500",  heading: "text-rose-800"  },
};

const TREND_ICONS = {
  improving:         <TrendingUp className="h-3.5 w-3.5 text-teal-500" />,
  declining:         <TrendingDown className="h-3.5 w-3.5 text-rose-500" />,
  stable:            <Minus className="h-3.5 w-3.5 text-slate-400" />,
  insufficient_data: <Info className="h-3.5 w-3.5 text-slate-300" />,
};

function InsightCard({ insight }: { insight: HealthInsight }) {
  const s = URGENCY_STYLES[insight.urgency];
  return (
    <div className={`rounded-2xl border p-5 ${s.border} ${s.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`font-bold text-sm leading-tight ${s.heading}`}>{insight.headline}</p>
        <div className="flex items-center gap-1 shrink-0">
          {TREND_ICONS[insight.trend]}
          {insight.urgency === "concern" && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
          {insight.urgency === "positive" && <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />}
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">{insight.detail}</p>
      <div className={`flex items-start gap-1.5 rounded-xl px-3 py-2 ${insight.urgency === "positive" ? "bg-teal-100/60" : "bg-white/70"}`}>
        <Zap className={`h-3 w-3 shrink-0 mt-0.5 ${s.icon}`} />
        <p className={`text-xs font-medium ${s.heading}`}>{insight.recommendation}</p>
      </div>
    </div>
  );
}

// ── Mini stat card ────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, sub, icon: Icon, color }: {
  label: string; value: string | number | undefined; unit: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className={`h-8 w-8 rounded-xl ${color} flex items-center justify-center mb-2`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-black text-gray-900">
        {value !== undefined ? value : <span className="text-lg text-gray-300">—</span>}
        {value !== undefined && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Sleep bar ─────────────────────────────────────────────────────────────────

function SleepBar({ hours, ideal = 8 }: { hours?: number; ideal?: number }) {
  if (!hours) return <div className="h-2 bg-slate-100 rounded-full" />;
  const pct = Math.min((hours / 10) * 100, 100);
  const color = hours >= ideal ? "bg-teal-400" : hours >= ideal - 1 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Manual entry form ─────────────────────────────────────────────────────────

function LogForm({ onSave }: { onSave: (entry: DailyHealthData) => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate]         = useState(today);
  const [sleep, setSleep]       = useState("");
  const [rhr, setRhr]           = useState("");
  const [hrv, setHrv]           = useState("");
  const [steps, setSteps]       = useState("");
  const [mood, setMood]         = useState("");
  const [energy, setEnergy]     = useState("");
  const [deepSleep, setDeepSleep] = useState("");
  const [stress, setStress]     = useState("");
  const [saved, setSaved]       = useState(false);

  function handleSave() {
    const entry: DailyHealthData = {
      date,
      source: "manual",
      syncedAt: new Date().toISOString(),
      ...(sleep   ? { sleepDuration: parseFloat(sleep) }        : {}),
      ...(rhr     ? { restingHeartRate: parseInt(rhr) }          : {}),
      ...(hrv     ? { heartRateVariability: parseInt(hrv) }      : {}),
      ...(steps   ? { steps: parseInt(steps) }                   : {}),
      ...(mood    ? { moodScore: parseInt(mood) }                : {}),
      ...(energy  ? { energyScore: parseInt(energy) }            : {}),
      ...(deepSleep ? { deepSleepMin: parseInt(deepSleep) }      : {}),
      ...(stress  ? { stressScore: parseInt(stress) }            : {}),
    };
    onSave(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const field = "border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-full";

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Log today's data</h3>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today}
          className="text-xs border border-border rounded-lg px-2 py-1 focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Moon className="h-3 w-3" />Sleep (hours)</label>
          <input type="number" step="0.5" min="0" max="14" value={sleep} onChange={e => setSleep(e.target.value)} placeholder="e.g. 7.5" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Moon className="h-3 w-3 text-indigo-400" />Deep sleep (min)</label>
          <input type="number" min="0" max="300" value={deepSleep} onChange={e => setDeepSleep(e.target.value)} placeholder="e.g. 90" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Heart className="h-3 w-3 text-rose-400" />Resting HR (bpm)</label>
          <input type="number" min="30" max="130" value={rhr} onChange={e => setRhr(e.target.value)} placeholder="e.g. 62" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Activity className="h-3 w-3 text-violet-400" />HRV (ms)</label>
          <input type="number" min="5" max="150" value={hrv} onChange={e => setHrv(e.target.value)} placeholder="e.g. 45" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400" />Steps</label>
          <input type="number" min="0" max="50000" value={steps} onChange={e => setSteps(e.target.value)} placeholder="e.g. 8000" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Stress score (0-100)</label>
          <input type="number" min="0" max="100" value={stress} onChange={e => setStress(e.target.value)} placeholder="from watch app" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Mood (1-10)</label>
          <input type="number" min="1" max="10" value={mood} onChange={e => setMood(e.target.value)} placeholder="how you feel" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Energy (1-10)</label>
          <input type="number" min="1" max="10" value={energy} onChange={e => setEnergy(e.target.value)} placeholder="energy level" className={field} />
        </div>
      </div>

      <Button onClick={handleSave} className="w-full" variant="gradient">
        {saved ? <><CheckCircle2 className="h-4 w-4 mr-2" />Saved!</> : <><Plus className="h-4 w-4 mr-2" />Log this entry</>}
      </Button>

      <p className="text-[11px] text-muted-foreground text-center">
        Data is stored on your device. <span className="font-medium">Tip:</span> check your watch app each morning and log the previous night.
      </p>
    </div>
  );
}

// ── Platform connection guide ─────────────────────────────────────────────────

function ConnectGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Link2 className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-800">Connect your smartwatch</p>
            <p className="text-xs text-muted-foreground">Find your device setup guide</p>
          </div>
        </div>
        <Smartphone className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
          <p className="text-xs text-muted-foreground">Tap your device below for setup instructions:</p>

          {[
            {
              name: "Fitbit / Google Pixel Watch",
              color: "bg-teal-500",
              steps: ["Open the Fitbit app on your phone", "Go to Today tab → sleep or heart rate data", "Note the daily values each morning", "Log them in C4U using the form above"],
              note: "Full API sync coming in the C4U mobile app.",
            },
            {
              name: "Apple Watch",
              color: "bg-slate-800",
              steps: ["Open Health app on iPhone", "Browse → Heart → Resting Heart Rate", "Browse → Sleep → Sleep Duration", "Log these values in C4U daily"],
              note: "Direct sync requires the C4U iOS app (coming soon). For now, manual works perfectly.",
            },
            {
              name: "Samsung Galaxy Watch",
              color: "bg-indigo-600",
              steps: ["Open Samsung Health app", "Check Sleep and Heart Rate sections", "Enable stress monitoring if available", "Log values in C4U daily"],
              note: "Samsung Health API integration in development.",
            },
            {
              name: "Garmin",
              color: "bg-sky-600",
              steps: ["Open Garmin Connect app", "View Body Battery and HRV Status", "Note your morning HRV and RHR", "Log in C4U — Garmin gives excellent HRV data"],
              note: "Garmin API integration in development.",
            },
            {
              name: "No smartwatch",
              color: "bg-emerald-500",
              steps: ["Track mood and energy manually (most important)", "Take resting heart rate manually: 60 seconds, wrist or neck", "Note sleep time when you wake up", "Even mood + sleep alone gives C4U useful patterns"],
              note: "You don't need a wearable to get value from this feature.",
            },
          ].map((device) => (
            <details key={device.name} className="group">
              <summary className="flex items-center gap-2.5 cursor-pointer py-2 list-none">
                <div className={`h-2 w-2 rounded-full ${device.color}`} />
                <p className="text-sm font-semibold text-gray-800 group-open:text-primary">{device.name}</p>
              </summary>
              <div className="mt-2 ml-5 space-y-1">
                {device.steps.map((s,i) => (
                  <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-primary font-bold shrink-0">{i+1}.</span> {s}
                  </p>
                ))}
                <p className="text-[11px] text-indigo-500 italic mt-2">{device.note}</p>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WearablePage() {
  const [data, setData]             = useState<DailyHealthData[]>([]);
  const [analysis, setAnalysis]     = useState<WearableAnalysis | null>(null);
  const [loading, setLoading]       = useState(false);
  const [showLog, setShowLog]       = useState(false);
  const [goal, setGoal]             = useState("");

  useEffect(() => {
    const d = loadWearableData();
    setData(d);
    try {
      const g = localStorage.getItem("c4u_life_goal");
      if (g) setGoal((JSON.parse(g) as { goal?: string }).goal ?? "");
    } catch { /* ignore */ }
  }, []);

  const recent = getLast7Days(data);
  const today  = data.find(d => d.date === new Date().toISOString().split("T")[0]);

  function handleSave(entry: DailyHealthData) {
    saveWearableEntry(entry);
    const updated = loadWearableData();
    setData(updated);
    setAnalysis(null); // reset analysis so they re-run it
  }

  async function runAnalysis() {
    if (data.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wearable/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: recent,
          todayMood: today?.moodScore,
          lifeGoal: goal || undefined,
        }),
      });
      setAnalysis(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  const avg = (key: keyof DailyHealthData) => {
    const vals = recent.filter(d => d[key] !== undefined).map(d => d[key] as number);
    return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : undefined;
  };

  return (
    <div className="min-h-full bg-serene">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center">
            <Watch className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Body & Mind Tracker</h1>
            <p className="text-sm text-gray-500 mt-0.5">Connect your health data to your mental wellbeing</p>
          </div>
        </div>

        {/* Science note */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            <strong>Why this matters:</strong> Your sleep, heart rate, and activity directly shape your emotional state.
            C4U reads the patterns in your data and translates them into plain language — telling you what your body is actually saying about your mental health.
          </p>
        </div>

        {/* 7-day overview */}
        {recent.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Avg Sleep"       value={avg("sleepDuration")?.toFixed(1)}  unit="h"   icon={Moon}    color="bg-indigo-500" sub="last 7 days" />
            <StatCard label="Resting HR"      value={avg("restingHeartRate")?.toFixed(0)} unit="bpm" icon={Heart}   color="bg-rose-500"  sub="avg bpm" />
            <StatCard label="HRV"             value={avg("heartRateVariability")?.toFixed(0)} unit="ms"  icon={Activity} color="bg-violet-500" sub="higher = better" />
            <StatCard label="Daily Steps"     value={avg("steps") ? Math.round(avg("steps")!) : undefined} unit="" icon={Zap} color="bg-amber-500" sub="avg steps" />
          </div>
        )}

        {/* Sleep bars for last 7 days */}
        {recent.length >= 2 && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" /> Sleep — last 7 nights
            </h3>
            <div className="space-y-2">
              {recent.slice(0,7).map(d => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-12 shrink-0">
                    {new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1"><SleepBar hours={d.sleepDuration} /></div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                    {d.sleepDuration ? `${d.sleepDuration}h` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {analysis ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-violet-500 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Watch className="h-4 w-4 text-violet-200" />
                <span className="text-xs font-semibold text-violet-200 uppercase tracking-wide">C4U Health Intelligence</span>
              </div>
              <p className="text-white/95 leading-relaxed">{analysis.greeting}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="text-center">
                  <p className="text-3xl font-black">{analysis.overallWellness}<span className="text-base font-normal text-white/60">/10</span></p>
                  <p className="text-xs text-white/60">Wellness score</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-xs text-white/70 mb-0.5">7-day trend</p>
                  <p className="text-sm font-semibold capitalize">{analysis.overallTrend}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {analysis.insights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
            </div>

            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Body ↔ Mind connection</p>
                <p className="text-sm text-gray-800 leading-relaxed">{analysis.mentalHealthLink}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">This week's pattern</p>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.weeklyPattern}</p>
              </div>
              {analysis.ageNote && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">For your age</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.ageNote}</p>
                </div>
              )}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <Moon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Tonight's priority</p>
                <p className="text-sm text-teal-900">{analysis.tonightPriority}</p>
              </div>
            </div>

            <button onClick={() => setAnalysis(null)} className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh analysis
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.length >= 2 && (
              <Button onClick={runAnalysis} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-indigo-700 text-white rounded-2xl py-3 font-semibold shadow-md">
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analysing your data…</>
                  : <><Sparkles className="h-4 w-4 mr-2" />Get my health insights</>
                }
              </Button>
            )}
            {data.length < 2 && (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center">
                <Watch className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Log at least 2 days to unlock insights</p>
                <p className="text-xs text-muted-foreground mt-1">C4U needs a few data points to find meaningful patterns</p>
              </div>
            )}
          </div>
        )}

        {/* Log data */}
        <div>
          <button onClick={() => setShowLog(!showLog)} className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-border hover:border-teal-300 transition-colors">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Plus className="h-4 w-4 text-teal-500" /> Log today's data
            </span>
            <span className="text-xs text-muted-foreground">{showLog ? "Close" : "Open"}</span>
          </button>
          {showLog && <div className="mt-3"><LogForm onSave={handleSave} /></div>}
        </div>

        {/* Connect guide */}
        <ConnectGuide />

        {/* Data summary */}
        {data.length > 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-sm font-semibold text-gray-700">{data.length} days tracked</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {recent.length} in the last 7 days · Data stored on your device
            </p>
          </div>
        )}

        {/* Medical disclaimer */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          C4U health tracking is for personal awareness only — not medical diagnosis.
          If you have concerns about your heart rate, sleep or health, speak to your doctor.
        </p>

      </div>
    </div>
  );
}
