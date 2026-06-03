/**
 * Wearable & biometric data types for C4U health tracking.
 * Normalised across Fitbit, Garmin, Google Fit, and manual entry.
 */

export interface DailyHealthData {
  date: string;             // YYYY-MM-DD

  // Sleep
  sleepDuration?: number;   // hours (e.g. 7.5)
  sleepQuality?: number;    // 1-10 (subjective or device-derived)
  deepSleepMin?: number;    // minutes of deep sleep
  remSleepMin?: number;     // minutes of REM sleep
  sleepStart?: string;      // HH:MM
  sleepEnd?: string;        // HH:MM

  // Heart
  restingHeartRate?: number; // bpm
  maxHeartRate?: number;     // bpm during day
  heartRateVariability?: number; // HRV in ms (RMSSD)
  avgHeartRate?: number;     // average across day

  // Activity
  steps?: number;
  activeMinutes?: number;   // moderate+ activity minutes
  caloriesBurned?: number;

  // Stress / ANS
  stressScore?: number;     // 0-100 (Fitbit/Garmin specific, if available)
  spO2?: number;            // blood oxygen % (if device supports)
  respiratoryRate?: number; // breaths per minute (resting)

  // Mood (from diary if linked)
  moodScore?: number;       // 1-10 from C4U diary
  energyScore?: number;     // 1-10 from diary

  // Metadata
  source: "fitbit" | "garmin" | "google_fit" | "apple_health" | "manual";
  syncedAt: string;         // ISO timestamp
}

export interface WearableProfile {
  connected: boolean;
  platform?: "fitbit" | "garmin" | "google_fit" | "apple_health" | "manual";
  lastSync?: string;
  data: DailyHealthData[];  // last 30 days
  ageRange?: string;        // from Clerk metadata
}

export interface HealthInsight {
  category: "sleep" | "stress" | "activity" | "heart" | "progress" | "risk";
  headline: string;         // one punchy line
  detail: string;           // 2-3 sentences
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  urgency: "positive" | "neutral" | "caution" | "concern";
  recommendation: string;   // one specific action
}

export interface WearableAnalysis {
  greeting: string;         // personalised opener based on data
  overallWellness: number;  // 1-10 composite score
  overallTrend: "improving" | "declining" | "stable";
  insights: HealthInsight[];
  ageNote: string;          // age-adjusted context
  mentalHealthLink: string; // how today's biometrics connect to mental health
  tonightPriority: string;  // one thing to do tonight for tomorrow's data
  weeklyPattern: string;    // what the 7-day pattern reveals
}

// ── Age-adjusted norms ───────────────────────────────────────────────────────

export function getSleepNorm(ageRange: string): { min: number; ideal: number; max: number } {
  if (ageRange === "18-25") return { min: 7, ideal: 9, max: 10 };
  if (ageRange === "26-35") return { min: 7, ideal: 8, max: 9 };
  if (ageRange === "36-50") return { min: 7, ideal: 7.5, max: 9 };
  return { min: 7, ideal: 7.5, max: 9 }; // 50+
}

export function getRHRNorm(ageRange: string): { excellent: number; good: number; elevated: number } {
  // Resting heart rate norms (bpm) — lower is generally better
  if (ageRange === "18-25") return { excellent: 55, good: 65, elevated: 80 };
  if (ageRange === "26-35") return { excellent: 58, good: 68, elevated: 82 };
  if (ageRange === "36-50") return { excellent: 60, good: 70, elevated: 85 };
  return { excellent: 62, good: 72, elevated: 88 }; // 50+
}

export function getHRVNorm(ageRange: string): { good: number; average: number; low: number } {
  // HRV (RMSSD in ms) — higher is better, declines with age
  if (ageRange === "18-25") return { good: 60, average: 35, low: 20 };
  if (ageRange === "26-35") return { good: 50, average: 30, low: 18 };
  if (ageRange === "36-50") return { good: 40, average: 25, low: 15 };
  return { good: 30, average: 20, low: 12 }; // 50+
}

export function getStepsNorm(ageRange: string): { sedentary: number; active: number; excellent: number } {
  if (ageRange === "50+") return { sedentary: 3000, active: 6000, excellent: 8000 };
  return { sedentary: 4000, active: 7500, excellent: 10000 };
}

// ── Mental health connections (research-based) ────────────────────────────────

export const BIOMETRIC_MENTAL_HEALTH_LINKS = {
  hrv: "HRV (heart rate variability) is the gold standard marker of how well your autonomic nervous system handles stress. Low HRV = your nervous system is working too hard and recovering too little — directly linked to anxiety, burnout and mood disorders.",
  sleep: "Sleep is when the brain processes emotional memories and resets stress hormones. Less than 7 hours consistently raises cortisol by 37%, increases anxiety and depressive symptoms, and impairs the prefrontal cortex (the part that helps you make good decisions).",
  rhr: "Elevated resting heart rate over sustained periods is a physical marker of chronic stress. Your heart is working harder to maintain baseline — a sign the nervous system is in low-level fight-or-flight.",
  activity: "30+ minutes of movement daily is one of the most evidence-backed interventions for anxiety and depression — equivalent to medication in mild-moderate cases. It works by raising BDNF (brain-derived neurotrophic factor) which supports neural plasticity.",
  stress_score: "Stress scores from wearables are derived from heart rate variability and reflect your body's physiological response to demands. Consistently high scores over days indicate accumulated stress load that the body hasn't recovered from.",
};

// ── localStorage keys ─────────────────────────────────────────────────────────
export const WEARABLE_KEY = "c4u_wearable_data";
export const WEARABLE_PROFILE_KEY = "c4u_wearable_profile";

export function loadWearableData(): DailyHealthData[] {
  try { return JSON.parse(localStorage.getItem(WEARABLE_KEY) ?? "[]"); }
  catch { return []; }
}

export function saveWearableEntry(entry: DailyHealthData): void {
  const all = loadWearableData();
  const idx = all.findIndex(e => e.date === entry.date);
  if (idx >= 0) all[idx] = entry;
  else all.unshift(entry);
  // Keep last 90 days
  const trimmed = all.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 90);
  localStorage.setItem(WEARABLE_KEY, JSON.stringify(trimmed));
}

export function getLast7Days(data: DailyHealthData[]): DailyHealthData[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return data.filter(d => new Date(d.date) >= cutoff);
}
