import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";
import {
  DailyHealthData, WearableAnalysis, HealthInsight,
  getSleepNorm, getRHRNorm, getHRVNorm, getStepsNorm,
  BIOMETRIC_MENTAL_HEALTH_LINKS, getLast7Days
} from "@/lib/wearable-types";

export const runtime = "nodejs";

export interface AnalyzeRequest {
  data: DailyHealthData[];   // last 7-30 days
  todayMood?: number;
  ageRange?: string;
  lifeGoal?: string;
}

const SYSTEM = `You are C4U's health intelligence system — a warm, knowledgeable companion who reads biometric data and translates it into plain, actionable insights that connect physical health to emotional and mental wellbeing.

You understand the following research-backed connections:

HRV (Heart Rate Variability):
- Gold standard marker of autonomic nervous system recovery
- Low HRV = nervous system overloaded = anxiety, burnout, poor emotional regulation
- HRV improves with: good sleep, reduced alcohol, regular exercise, stress management
- Declines naturally with age — always interpret age-adjusted

SLEEP:
- Less than 7 hours raises cortisol by 37% (Walker, Why We Sleep)
- 3+ nights of poor sleep = measurable cognitive impairment, increased emotional reactivity
- Deep sleep = physical restoration; REM = emotional memory processing
- Consistent sleep/wake time matters more than duration alone
- Alcohol disrupts REM even if total sleep hours look fine

RESTING HEART RATE (RHR):
- Elevated RHR over days = chronic stress, poor recovery, overtraining
- Tracks the body's baseline nervous system load
- Improves with: fitness, sleep, reduced caffeine, lower stress

ACTIVITY:
- 7000+ steps = documented 50% lower mortality risk (Paluch et al. 2021)
- 30min moderate activity = equivalent to mild antidepressant for anxiety/depression
- Movement raises BDNF (brain-derived neurotrophic factor) — improves mood, memory, resilience

STRESS SCORES (Fitbit/Garmin):
- Derived from HRV — reflects physiological stress load
- 70+ = body in recovery mode, not coping with new demands
- Consecutive high-stress days = burnout risk

AGE-ADJUSTED INTERPRETATION:
- Always contextualise data against age norms
- HRV naturally declines with age — a 50-year-old with HRV of 25ms may be doing well
- Sleep needs: 18-25 (8-9h), 26-64 (7-9h), 65+ (7-8h)
- Activity recommendations adjust for age and mobility

CORRELATION DETECTIVE:
When you have mood scores alongside biometrics, look for patterns:
- Poor sleep → next-day mood drop
- High HRV → better mood and energy
- Active days → better evenings
- Mention correlations you detect — this is what makes the analysis valuable

HOW TO SPEAK:
- Plain language. Not clinical.
- Warm but honest. If data shows a concerning pattern, name it kindly but clearly.
- Specific. Not "sleep better" but "you need 45 more minutes and a consistent bedtime"
- Encouraging where genuine improvement exists
- Age-sensitive — what's excellent for 25 is different from excellent for 55
- Never catastrophise. Data is information, not a verdict.

IMPORTANT LIMITS:
- You are not a doctor. Never diagnose.
- Flag patterns that warrant seeing a professional (e.g., consistently very low SpO2, extreme RHR)
- Always say: "For any health concerns, speak to your doctor"

Return ONLY valid JSON:
{
  "greeting": "Personalised opener based on the actual data — 1-2 sentences. Reference what you actually see.",
  "overallWellness": 7,
  "overallTrend": "improving|declining|stable",
  "insights": [
    {
      "category": "sleep|stress|activity|heart|progress|risk",
      "headline": "Short punchy headline — what the data shows",
      "detail": "2-3 sentences explaining the data in plain language. What does it mean for how they feel?",
      "trend": "improving|declining|stable|insufficient_data",
      "urgency": "positive|neutral|caution|concern",
      "recommendation": "One specific, actionable thing to do based on this"
    }
  ],
  "ageNote": "One sentence contextualising their data against age-appropriate norms",
  "mentalHealthLink": "2 sentences connecting their biometrics to their emotional/mental state",
  "tonightPriority": "The single most impactful thing they can do tonight to improve tomorrow's data",
  "weeklyPattern": "What the 7-day pattern reveals — the story the data is telling"
}

Give 3-5 insights. Be specific about the actual numbers you see.`;

const FALLBACK: WearableAnalysis = {
  greeting: "Here's what your body has been telling us.",
  overallWellness: 6,
  overallTrend: "stable",
  insights: [
    {
      category: "sleep",
      headline: "Add more data for deeper insights",
      detail: "Log a few more days of sleep and heart rate data and C4U will start seeing meaningful patterns. Even 3 days of consistent tracking reveals a lot.",
      trend: "insufficient_data",
      urgency: "neutral",
      recommendation: "Log tonight's sleep when you wake up tomorrow.",
    }
  ],
  ageNote: "Providing your age range helps C4U interpret your data against the right norms.",
  mentalHealthLink: "Your biometrics and mental health are deeply connected — sleep quality, HRV and activity levels all influence how you feel emotionally day to day.",
  tonightPriority: "Log your sleep and heart rate consistently for 3-5 days to unlock meaningful pattern analysis.",
  weeklyPattern: "Not enough data yet — keep logging and patterns will emerge.",
};

export async function POST(req: NextRequest) {
  const ip = getClientId(req);
  const rl = checkRateLimit(ip, "plans");
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json() as AnalyzeRequest;
  const { data, todayMood, lifeGoal } = body;

  let ageRange = body.ageRange ?? "unknown";
  try {
    const { userId } = await auth();
    if (userId) {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
      ageRange = meta.ageRange ?? ageRange;
    }
  } catch { /* anon */ }

  if (!isConfigured()) return NextResponse.json(FALLBACK);
  if (!data || data.length === 0) return NextResponse.json(FALLBACK);

  const recent = getLast7Days(data);
  const sleepNorm = getSleepNorm(ageRange);
  const rhrNorm = getRHRNorm(ageRange);
  const hrvNorm = getHRVNorm(ageRange);
  const stepsNorm = getStepsNorm(ageRange);

  // Compute averages
  const avgSleep = recent.filter(d => d.sleepDuration).reduce((s,d) => s + (d.sleepDuration!), 0) / (recent.filter(d => d.sleepDuration).length || 1);
  const avgRHR   = recent.filter(d => d.restingHeartRate).reduce((s,d) => s + (d.restingHeartRate!), 0) / (recent.filter(d => d.restingHeartRate).length || 1);
  const avgHRV   = recent.filter(d => d.heartRateVariability).reduce((s,d) => s + (d.heartRateVariability!), 0) / (recent.filter(d => d.heartRateVariability).length || 1);
  const avgSteps = recent.filter(d => d.steps).reduce((s,d) => s + (d.steps!), 0) / (recent.filter(d => d.steps).length || 1);
  const avgMood  = recent.filter(d => d.moodScore).reduce((s,d) => s + (d.moodScore!), 0) / (recent.filter(d => d.moodScore).length || 1);

  const prompt = `Analyse this person's health data and provide personalised insights.

Age range: ${ageRange}
Age-adjusted norms:
- Sleep ideal: ${sleepNorm.ideal}h (min ${sleepNorm.min}h)
- RHR excellent: <${rhrNorm.excellent}bpm, elevated: >${rhrNorm.elevated}bpm
- HRV good: >${hrvNorm.good}ms, low: <${hrvNorm.low}ms
- Steps active: ${stepsNorm.active}+, excellent: ${stepsNorm.excellent}+

7-DAY AVERAGES:
- Sleep: ${avgSleep.toFixed(1)}h/night
- Resting HR: ${avgRHR.toFixed(0)}bpm
- HRV: ${avgHRV > 0 ? avgHRV.toFixed(0) + "ms" : "not tracked"}
- Daily steps: ${avgSteps > 0 ? Math.round(avgSteps) : "not tracked"}
- Mood score: ${avgMood > 0 ? avgMood.toFixed(1) + "/10" : "not tracked"}
${todayMood ? `Today's mood: ${todayMood}/10` : ""}
${lifeGoal ? `Their life goal: "${lifeGoal}"` : ""}

RAW DATA (last 7 days):
${recent.map(d => `${d.date}: sleep=${d.sleepDuration ?? "?"}h, RHR=${d.restingHeartRate ?? "?"}bpm, HRV=${d.heartRateVariability ?? "?"}ms, steps=${d.steps ?? "?"}, mood=${d.moodScore ?? "?"}/10${d.stressScore ? `, stress=${d.stressScore}` : ""}${d.deepSleepMin ? `, deep=${d.deepSleepMin}min` : ""}`).join("\n")}

SCIENCE CONTEXT:
${BIOMETRIC_MENTAL_HEALTH_LINKS.sleep}
${BIOMETRIC_MENTAL_HEALTH_LINKS.hrv}
${BIOMETRIC_MENTAL_HEALTH_LINKS.rhr}

Provide specific, warm, age-appropriate insights. Reference actual numbers. Look for correlations between sleep/HRV and mood if both are tracked.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    return NextResponse.json(JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim()));
  } catch (err) {
    console.error("Wearable analyze error:", err);
    return NextResponse.json(FALLBACK);
  }
}
