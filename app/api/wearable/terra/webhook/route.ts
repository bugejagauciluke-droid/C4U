/**
 * Terra webhook — receives health data automatically after user connects
 * Terra posts to this URL every time new data is available from the user's device.
 *
 * Configure webhook URL in Terra dashboard:
 * https://caring4you.netlify.app/api/wearable/terra/webhook
 */
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { DailyHealthData } from "@/lib/wearable-types";

export const runtime = "nodejs";

interface TerraPayload {
  type: string;
  user: { user_id: string; reference_id: string }; // reference_id = our Clerk userId
  data?: TerraData;
}

interface TerraData {
  sleep?: TerraSleep[];
  heart_rate?: TerraHeartRate[];
  daily?: TerraDaily[];
  body?: TerraBody[];
}

interface TerraSleep {
  start_time: string;
  end_time: string;
  sleep_durations_data?: {
    total?: { duration_in_bed_seconds?: number; duration_asleep_state_seconds?: number };
    sleep_efficiency?: number;
    nap_duration_seconds?: number;
    deep?: { duration_deep_sleep_state_seconds?: number };
    rem?: { duration_REM_sleep_state_seconds?: number };
  };
}

interface TerraHeartRate {
  timestamp: string;
  bpm?: number;
  type?: string; // "resting", "average", "max"
}

interface TerraDaily {
  date: string;
  steps_data?: { steps?: number };
  calories_data?: { net_activity_calories?: number };
  active_durations_data?: { activity_seconds?: number };
  heart_rate_data?: {
    resting?: { bpm?: number };
    avg_hr_bpm?: number;
  };
  hrv_data?: { avg_hrv_rmssd?: number; avg_hrv_sdnn?: number };
  stress_data?: { avg_stress_level?: number };
  oxygen_data?: { avg_saturation_percentage?: number };
}

interface TerraBody {
  timestamp: string;
  heart_rate_data?: { resting?: { bpm?: number } };
  hrv_data?: { avg_hrv_rmssd?: number };
  oxygen_data?: { avg_saturation_percentage?: number };
  temperature_data?: { body?: number };
}

function terraToC4U(payload: TerraPayload): DailyHealthData[] {
  const results: Map<string, Partial<DailyHealthData>> = new Map();
  const userId = payload.user?.reference_id;
  if (!userId || !payload.data) return [];

  const getOrCreate = (date: string): Partial<DailyHealthData> => {
    if (!results.has(date)) {
      results.set(date, {
        date,
        source: "fitbit", // Terra normalises all to same schema
        syncedAt: new Date().toISOString(),
      });
    }
    return results.get(date)!;
  };

  // Sleep data
  payload.data.sleep?.forEach(s => {
    const date = s.start_time?.split("T")[0];
    if (!date) return;
    const entry = getOrCreate(date);
    const sd = s.sleep_durations_data;
    if (sd?.total?.duration_asleep_state_seconds) {
      entry.sleepDuration = +(sd.total.duration_asleep_state_seconds / 3600).toFixed(2);
    }
    if (sd?.deep?.duration_deep_sleep_state_seconds) {
      entry.deepSleepMin = Math.round(sd.deep.duration_deep_sleep_state_seconds / 60);
    }
    if (sd?.rem?.duration_REM_sleep_state_seconds) {
      entry.remSleepMin = Math.round(sd.rem.duration_REM_sleep_state_seconds / 60);
    }
    if (s.start_time) entry.sleepStart = s.start_time.split("T")[1]?.slice(0,5);
    if (s.end_time) entry.sleepEnd   = s.end_time.split("T")[1]?.slice(0,5);
  });

  // Daily summaries (steps, HR, HRV, stress)
  payload.data.daily?.forEach(d => {
    const date = d.date?.split("T")[0] ?? d.date;
    if (!date) return;
    const entry = getOrCreate(date);
    if (d.steps_data?.steps) entry.steps = d.steps_data.steps;
    if (d.active_durations_data?.activity_seconds) entry.activeMinutes = Math.round(d.active_durations_data.activity_seconds / 60);
    if (d.heart_rate_data?.resting?.bpm) entry.restingHeartRate = d.heart_rate_data.resting.bpm;
    if (d.heart_rate_data?.avg_hr_bpm) entry.avgHeartRate = d.heart_rate_data.avg_hr_bpm;
    if (d.hrv_data?.avg_hrv_rmssd) entry.heartRateVariability = Math.round(d.hrv_data.avg_hrv_rmssd);
    if (d.stress_data?.avg_stress_level) entry.stressScore = Math.round(d.stress_data.avg_stress_level * 100);
    if (d.oxygen_data?.avg_saturation_percentage) entry.spO2 = d.oxygen_data.avg_saturation_percentage;
  });

  // Body measurements
  payload.data.body?.forEach(b => {
    const date = b.timestamp?.split("T")[0];
    if (!date) return;
    const entry = getOrCreate(date);
    if (b.heart_rate_data?.resting?.bpm) entry.restingHeartRate = b.heart_rate_data.resting.bpm;
    if (b.hrv_data?.avg_hrv_rmssd) entry.heartRateVariability = Math.round(b.hrv_data.avg_hrv_rmssd);
    if (b.oxygen_data?.avg_saturation_percentage) entry.spO2 = b.oxygen_data.avg_saturation_percentage;
  });

  return Array.from(results.values()) as DailyHealthData[];
}

export async function POST(req: NextRequest) {
  // Verify Terra signature (optional but recommended)
  const sig = req.headers.get("terra-signature");
  const TERRA_SECRET = process.env.TERRA_WEBHOOK_SECRET;
  if (TERRA_SECRET && !sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  try {
    const payload: TerraPayload = await req.json();

    // Only process data payloads (not auth events)
    if (!["DAILY", "SLEEP", "BODY", "HEART_RATE", "ACTIVITY"].includes(payload.type)) {
      return NextResponse.json({ status: "ignored", type: payload.type });
    }

    const userId = payload.user?.reference_id;
    if (!userId) return NextResponse.json({ error: "No user reference" }, { status: 400 });

    const entries = terraToC4U(payload);
    if (entries.length === 0) return NextResponse.json({ status: "no data" });

    // Store in Clerk privateMetadata so it persists across devices
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const existingMeta = (user.privateMetadata ?? {}) as Record<string, unknown>;
    const existingData: DailyHealthData[] = (existingMeta.wearableData as DailyHealthData[]) ?? [];

    // Merge: update existing dates, add new ones
    const merged = [...existingData];
    for (const entry of entries) {
      const idx = merged.findIndex(e => e.date === entry.date);
      if (idx >= 0) merged[idx] = { ...merged[idx], ...entry };
      else merged.push(entry);
    }

    // Keep last 90 days
    const trimmed = merged
      .sort((a,b) => b.date.localeCompare(a.date))
      .slice(0, 90);

    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: { ...existingMeta, wearableData: trimmed },
    });

    console.log(`Terra webhook: synced ${entries.length} entries for user ${userId}`);
    return NextResponse.json({ status: "ok", entries: entries.length });
  } catch (err) {
    console.error("Terra webhook error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
