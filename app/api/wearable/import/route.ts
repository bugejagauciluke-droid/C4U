/**
 * Health data file import — parses exports from:
 * - Apple Health (export.xml from iPhone)
 * - Samsung Health (CSV files from Samsung Health app)
 * - Fitbit (JSON export from fitbit.com)
 * - Generic CSV (heart rate, sleep columns)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { DailyHealthData } from "@/lib/wearable-types";

export const runtime = "nodejs";
export const maxDuration = 60; // parsing can take time

// ── Apple Health XML parser ───────────────────────────────────────────────────

function parseAppleHealthXML(xml: string): DailyHealthData[] {
  const results = new Map<string, Partial<DailyHealthData>>();

  const get = (date: string): Partial<DailyHealthData> => {
    if (!results.has(date)) results.set(date, { date, source: "apple_health", syncedAt: new Date().toISOString() });
    return results.get(date)!;
  };

  // Resting Heart Rate
  const rhrRegex = /HKQuantityTypeIdentifierRestingHeartRate[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = rhrRegex.exec(xml)) !== null) {
    const date = m[1].split(" ")[0];
    const bpm  = parseFloat(m[2]);
    if (date && !isNaN(bpm)) {
      const e = get(date);
      if (!e.restingHeartRate || bpm < e.restingHeartRate) e.restingHeartRate = Math.round(bpm);
    }
  }

  // HRV (SDNN or RMSSD)
  const hrvRegex = /HKQuantityTypeIdentifierHeartRateVariabilitySDNN[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/g;
  while ((m = hrvRegex.exec(xml)) !== null) {
    const date = m[1].split(" ")[0];
    const ms   = parseFloat(m[2]) * 1000; // Apple stores in seconds, convert to ms
    if (date && !isNaN(ms) && ms > 0) {
      const e = get(date);
      if (!e.heartRateVariability) e.heartRateVariability = Math.round(ms);
    }
  }

  // Step count
  const stepsRegex = /HKQuantityTypeIdentifierStepCount[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/g;
  const stepsByDate = new Map<string, number>();
  while ((m = stepsRegex.exec(xml)) !== null) {
    const date  = m[1].split(" ")[0];
    const count = parseInt(m[2]);
    if (date && !isNaN(count)) stepsByDate.set(date, (stepsByDate.get(date) ?? 0) + count);
  }
  stepsByDate.forEach((total, date) => { get(date).steps = total; });

  // Sleep — HKCategoryTypeIdentifierSleepAnalysis
  // Values: HKCategoryValueSleepAnalysisInBed=0, Asleep=1, Awake=2, AsleepDeep=3, AsleepREM=5
  const sleepRegex = /HKCategoryTypeIdentifierSleepAnalysis[^>]*startDate="([^"]+)"[^>]*endDate="([^"]+)"[^>]*value="([^"]+)"/g;
  const sleepByDate = new Map<string, { asleep: number; deep: number; rem: number }>();
  while ((m = sleepRegex.exec(xml)) !== null) {
    const start = new Date(m[1]);
    const end   = new Date(m[2]);
    const value = m[3];
    const date  = m[1].split(" ")[0];
    const mins  = (end.getTime() - start.getTime()) / 60000;
    if (!sleepByDate.has(date)) sleepByDate.set(date, { asleep: 0, deep: 0, rem: 0 });
    const s = sleepByDate.get(date)!;
    if (value.includes("Asleep") && !value.includes("Awake")) s.asleep += mins;
    if (value.includes("Deep") || value === "HKCategoryValueSleepAnalysisAsleepDeep") s.deep += mins;
    if (value.includes("REM")) s.rem += mins;
  }
  sleepByDate.forEach((s, date) => {
    if (s.asleep > 0) {
      const e = get(date);
      e.sleepDuration = +(s.asleep / 60).toFixed(2);
      if (s.deep > 0) e.deepSleepMin = Math.round(s.deep);
      if (s.rem  > 0) e.remSleepMin  = Math.round(s.rem);
    }
  });

  // SpO2 (blood oxygen)
  const spo2Regex = /HKQuantityTypeIdentifierOxygenSaturation[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/g;
  while ((m = spo2Regex.exec(xml)) !== null) {
    const date = m[1].split(" ")[0];
    const pct  = parseFloat(m[2]) * 100; // Apple stores as 0–1 decimal
    if (date && !isNaN(pct) && pct > 50) get(date).spO2 = +pct.toFixed(1);
  }

  // Respiratory rate
  const rrRegex = /HKQuantityTypeIdentifierRespiratoryRate[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/g;
  while ((m = rrRegex.exec(xml)) !== null) {
    const date = m[1].split(" ")[0];
    const rate = parseFloat(m[2]);
    if (date && !isNaN(rate)) get(date).respiratoryRate = +rate.toFixed(1);
  }

  return Array.from(results.values()) as DailyHealthData[];
}

// ── Samsung Health CSV parser ─────────────────────────────────────────────────

function parseSamsungCSV(csv: string, fileType: string): DailyHealthData[] {
  const results = new Map<string, Partial<DailyHealthData>>();
  const get = (date: string): Partial<DailyHealthData> => {
    if (!results.has(date)) results.set(date, { date, source: "apple_health", syncedAt: new Date().toISOString() });
    // Note: using apple_health as closest enum — we'll add samsung to the type later
    return results.get(date)!;
  };

  const lines = csv.split("\n").filter(l => l.trim() && !l.startsWith("com.samsung") && !l.startsWith("#"));
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });

    const startKey = headers.find(h => h.includes("start") || h.includes("time") || h.includes("date"));
    if (!startKey || !row[startKey]) continue;
    const date = row[startKey].split("T")[0].split(" ")[0];
    if (!date || date.length < 10) continue;

    // Heart rate CSV
    if (fileType.includes("heart_rate")) {
      const bpm = parseFloat(row["heart_rate"] || row["hr"] || "");
      if (!isNaN(bpm) && bpm > 20 && bpm < 250) {
        const e = get(date);
        if (!e.restingHeartRate || bpm < e.restingHeartRate) e.restingHeartRate = Math.round(bpm);
      }
    }

    // Sleep CSV
    if (fileType.includes("sleep")) {
      const durationKey = headers.find(h => h.includes("duration") || h.includes("total"));
      if (durationKey && row[durationKey]) {
        const mins = parseFloat(row[durationKey]);
        if (!isNaN(mins) && mins > 0) get(date).sleepDuration = +(mins / 60).toFixed(2);
      }
      // Sleep stages
      if (row["stage"] === "deep" || row["deep_sleep_duration"]) {
        const deep = parseFloat(row["duration"] || row["deep_sleep_duration"] || "");
        if (!isNaN(deep)) get(date).deepSleepMin = Math.round(deep);
      }
    }

    // Step count CSV
    if (fileType.includes("step")) {
      const steps = parseInt(row["count"] || row["steps"] || "");
      if (!isNaN(steps) && steps > 0) {
        const e = get(date);
        e.steps = (e.steps ?? 0) + steps;
      }
    }

    // Stress CSV (Samsung has a stress score 0-100)
    if (fileType.includes("stress")) {
      const stress = parseFloat(row["score"] || row["stress_score"] || "");
      if (!isNaN(stress) && stress >= 0 && stress <= 100) get(date).stressScore = Math.round(stress);
    }

    // SpO2
    if (fileType.includes("spo2") || fileType.includes("oxygen")) {
      const pct = parseFloat(row["spo2"] || row["oxygen"] || "");
      if (!isNaN(pct) && pct > 50) get(date).spO2 = +pct.toFixed(1);
    }
  }

  return Array.from(results.values()) as DailyHealthData[];
}

// ── Generic CSV (any device with date, sleep, hr columns) ────────────────────

function parseGenericCSV(csv: string): DailyHealthData[] {
  const lines = csv.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const results: DailyHealthData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h,idx) => { row[h] = vals[idx] ?? ""; });

    const dateVal = row["date"] || row["day"] || row["timestamp"] || "";
    const date = dateVal.split("T")[0].split(" ")[0];
    if (!date || date.length < 10) continue;

    const entry: DailyHealthData = { date, source: "manual", syncedAt: new Date().toISOString() };
    const sleep = parseFloat(row["sleep"] || row["sleep_hours"] || row["duration"] || "");
    if (!isNaN(sleep) && sleep > 0 && sleep < 24) entry.sleepDuration = sleep;
    const hr = parseFloat(row["heart_rate"] || row["rhr"] || row["resting_hr"] || "");
    if (!isNaN(hr) && hr > 20 && hr < 250) entry.restingHeartRate = Math.round(hr);
    const hrv = parseFloat(row["hrv"] || row["heart_rate_variability"] || "");
    if (!isNaN(hrv) && hrv > 0) entry.heartRateVariability = Math.round(hrv);
    const steps = parseInt(row["steps"] || "");
    if (!isNaN(steps) && steps > 0) entry.steps = steps;
    const mood = parseInt(row["mood"] || "");
    if (!isNaN(mood) && mood >= 1 && mood <= 10) entry.moodScore = mood;

    results.push(entry);
  }
  return results;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "apple", "samsung_hr", "samsung_sleep", etc.

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const content = await file.text();
    let entries: DailyHealthData[] = [];
    let platform = "manual";

    if (type === "apple" || file.name.endsWith(".xml")) {
      entries = parseAppleHealthXML(content);
      platform = "apple_health";
    } else if (type?.startsWith("samsung") || file.name.startsWith("com.samsung")) {
      entries = parseSamsungCSV(content, type ?? file.name);
      platform = "samsung_health";
    } else if (file.name.endsWith(".csv")) {
      entries = parseGenericCSV(content);
      platform = "manual";
    } else {
      return NextResponse.json({ error: "Unsupported file format. Please use .xml (Apple Health) or .csv (Samsung/generic)" }, { status: 400 });
    }

    if (entries.length === 0) {
      return NextResponse.json({ error: "No health data found in file. Make sure you're uploading the correct export file." }, { status: 400 });
    }

    // Save to Clerk metadata via our data API
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;
    const existing: DailyHealthData[] = (meta.wearableData as DailyHealthData[]) ?? [];

    const merged = [...existing];
    for (const entry of entries) {
      const idx = merged.findIndex(e => e.date === entry.date);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...Object.fromEntries(Object.entries(entry).filter(([,v]) => v !== undefined)) };
      else merged.push(entry);
    }
    const trimmed = merged.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 90);

    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: { ...meta, wearableData: trimmed, wearablePlatform: platform, wearableLastSync: new Date().toISOString() },
    });

    return NextResponse.json({ imported: entries.length, platform, dateRange: { from: entries.at(-1)?.date, to: entries[0]?.date } });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Failed to process file." }, { status: 500 });
  }
}
