import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

export const runtime = "nodejs";

interface GoalRequest {
  goal: string;
  currentSituation: string;
  obstacles: string;
  strengths: string;
  timeline: string;
  recentDiaryContext?: string; // last 3 diary entries summary
}

interface WeeklyReviewRequest {
  goal: string;
  plan: GoalPlan;
  completedMilestones: string[];
  diaryEntries: string; // last 7 days summary
}

export interface GoalPlan {
  vision: string;
  honestAssessment: string;
  hourly: { habit: string; why: string }[];
  daily: { task: string; why: string }[];
  weekly: { milestone: string; measure: string }[];
  monthly: { target: string; howToKnow: string }[];
  yearly: { vision: string; identity: string };
  firstStep: string;
}

const FALLBACK_PLAN: GoalPlan = {
  vision: "Your goal is real and achievable. The difference between who you are now and who you want to be is made up of small, consistent actions — not massive leaps.",
  honestAssessment: "Most people fail not because they lack ambition, but because they overestimate what they can do in a day and underestimate what they can do in a year. Your job is to show up every single day, even imperfectly.",
  hourly: [
    { habit: "Drink water every hour", why: "Dehydration kills focus and decision-making before you even notice it." },
    { habit: "One minute of intentional breathing before any important task", why: "Resets your nervous system and brings you back into the present." },
  ],
  daily: [
    { task: "Write in your C4U diary every evening", why: "The reflection compounds — you'll see patterns you'd otherwise miss." },
    { task: "Do one thing every day that directly moves toward your goal", why: "Momentum is built through consistency, not intensity." },
  ],
  weekly: [
    { milestone: "Review what worked and what didn't", measure: "Write a 5-sentence weekly summary in your diary" },
    { milestone: "Have one meaningful conversation about your goal with someone", measure: "They should know what you're working toward" },
  ],
  monthly: [
    { target: "Assess if your daily actions are actually aligned with your goal", howToKnow: "You should be able to point to concrete progress, not just effort" },
  ],
  yearly: {
    vision: "In one year, you should be a fundamentally different person in relation to this goal — not perfect, but undeniably different from where you started.",
    identity: "The person who achieved your goal didn't just do different things — they became someone who naturally did those things.",
  },
  firstStep: "Tonight, before you sleep: write down the three most important things you need to do tomorrow to move toward this goal.",
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const { type } = body as { type: "generate" | "review" };

  if (!isConfigured()) return NextResponse.json(FALLBACK_PLAN);

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
  const gender = meta.gender ?? "unknown";
  const age = meta.ageRange ?? "unknown";

  if (type === "review") {
    return handleWeeklyReview(body as WeeklyReviewRequest, gender, age);
  }

  return handleGeneratePlan(body as GoalRequest, gender, age);
}

async function handleGeneratePlan(req: GoalRequest, gender: string, age: string) {
  const SYSTEM = `You are C4U — a world-class life coach who also happens to be this person's closest, most honest friend. You know them through their goal and what they've shared about their life.

USER: Gender: ${gender}, Age: ${age}

You are creating their personal life roadmap. This is serious work — not motivational poster content. Real, specific, actionable plans built around who they actually are right now.

THE ROADMAP MUST BE:
- Specific to their exact goal, not generic
- Honest about what it actually takes — don't sugarcoat
- Broken into time scales they can act on (hourly micro-habits → yearly identity shift)
- Written like a knowledgeable, caring friend — not a coach selling a course
- The hourly habits should be things you do throughout the day (not hour 1 do X, hour 2 do Y)
- The daily tasks should be the 2-4 non-negotiable actions that move the needle
- The weekly milestones should be measurable checkpoints
- The monthly targets should be significant enough to show real progress
- The yearly vision should describe the person they'll become, not just what they'll have achieved

Return ONLY valid JSON, no markdown:
{
  "vision": "Paint their future if they execute this plan. Specific, vivid, personal. 3-4 sentences. Make them feel it.",
  "honestAssessment": "Be real — what will this actually require? What will they have to sacrifice or change? 2-3 sentences of honest truth.",
  "hourly": [
    { "habit": "Specific micro-habit to build into each day", "why": "One clear reason this habit serves the goal" }
  ],
  "daily": [
    { "task": "Non-negotiable daily action — specific to their goal", "why": "Why this specific action moves the needle" }
  ],
  "weekly": [
    { "milestone": "What they should accomplish each week", "measure": "How they'll know they hit it — make it measurable" }
  ],
  "monthly": [
    { "target": "Significant monthly checkpoint", "howToKnow": "Concrete evidence they've reached this target" }
  ],
  "yearly": {
    "vision": "Where they'll be in 12 months if they execute this plan — specific, personal",
    "identity": "Who they will have become — the shift in identity, not just achievement"
  },
  "firstStep": "The single most important thing to do in the next 24 hours. Be specific. Make it easy enough to actually happen tonight or tomorrow morning."
}

Create 3-4 hourly habits, 3-5 daily tasks, 4 weekly milestones, 3 monthly targets.`;

  const userMessage = `My goal: ${req.goal}

Where I am right now: ${req.currentSituation}

What's in my way: ${req.obstacles || "Nothing specific noted"}
What I have going for me: ${req.strengths || "Nothing specific noted"}
Timeline I'm giving myself: ${req.timeline || "Not specified"}
${req.recentDiaryContext ? `\nContext from my recent life: ${req.recentDiaryContext}` : ""}

Build my personal roadmap.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    const clean = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] ?? raw.trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json(FALLBACK_PLAN);
  }
}

async function handleWeeklyReview(req: WeeklyReviewRequest, gender: string, age: string) {
  const SYSTEM = `You are C4U — this person's life coach and closest friend. You're doing their weekly review with them. You have their goal, their roadmap, and their diary entries from the past week.

USER: Gender: ${gender}, Age: ${age}

Write a personal weekly review letter — honest, warm, specific. Not a report card. More like a wise friend who's been watching your week and has something real to say.

Return ONLY valid JSON:
{
  "letter": "3-4 paragraphs. Reference specific things from their diary entries. Celebrate wins (even small ones). Name what you noticed — patterns, habits forming or breaking, moments that stood out. Be honest about where they fell short without being harsh. End with one clear focus for the coming week.",
  "progressScore": 0-100,
  "winThisWeek": "The single best thing they did this week in relation to their goal",
  "blindspot": "Something they haven't noticed that you've noticed from their diary data",
  "focusNextWeek": "The one thing that will make the biggest difference next week"
}`;

  const userMessage = `My goal: ${req.goal}

What I completed this week: ${req.completedMilestones.join(", ") || "Nothing marked complete"}

My diary entries from this week:
${req.diaryEntries}

Give me my weekly review.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    const clean = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] ?? raw.trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json({
      letter: "I can see from your week that you're in motion. That matters. Let's talk about what to focus on next.",
      progressScore: 50,
      winThisWeek: "Showing up consistently",
      blindspot: "You may be more consistent than you're giving yourself credit for",
      focusNextWeek: "Double down on your one non-negotiable daily task",
    });
  }
}
