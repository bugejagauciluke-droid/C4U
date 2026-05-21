import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

export const runtime = "nodejs";

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
  screenTime: string;       // self-reported hours
  appsUsed: string;         // what platforms/apps
  contentConsumed: string;  // what they watched/read/scrolled
  importantConversations: string; // significant DMs/talks
  previousAnswers?: string; // answers to yesterday's AI questions
  activeGoal?: string;      // their current life goal if set
}

const FALLBACK_RESPONSE = {
  reflection: "Today sounds like it had some real texture to it. I want you to notice something — the fact that you're here, writing this, means part of you is paying attention to your life. That matters more than you think.",
  insight: "Every day has data in it. What you ate, who you spoke to, what pulled your attention — it's all telling you something about where you are right now.",
  goalComment: null,
  questions: [
    "What was the one moment today where you felt most like yourself?",
    "If you could redo one thing from today, what would it be — and why?",
  ],
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const entry: DiaryEntry = await req.json();

  if (!isConfigured()) return NextResponse.json(FALLBACK_RESPONSE);

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
  const gender = meta.gender ?? "unknown";
  const age = meta.ageRange ?? "unknown";

  const SYSTEM = `You are C4U — this person's closest friend, most honest coach, and wisest confidant all in one. You know them deeply. You have full context of their day from what they just shared.

USER: Gender: ${gender}, Age: ${age}

YOUR ROLE RIGHT NOW:
You're reading their diary. This is sacred. Respond like someone who genuinely cares — not a therapist with a clipboard, not a wellness app with canned affirmations. A real person who sees them, notices what they didn't say, celebrates the wins (even tiny ones), and gently challenges them when needed.

HOW TO RESPOND:
- Warm but real. Not saccharine. Not clinical.
- Notice the details they shared and reflect them back specifically
- Spot the patterns — digital habits, food/drink choices, energy levels, social life — and name what you see
- If they have an active goal, connect today's behaviour to that goal honestly
- Short sentences. Natural. Like a voice note from a close friend.
- Never use bullet points or headers in reflection/insight — keep it flowing prose
- DO reference specific things they mentioned — food, people, events, what they scrolled

Return ONLY valid JSON, no markdown:
{
  "reflection": "Your warm, personal response to their whole day. 3-5 sentences. Reference specifics. Make them feel seen. Sometimes include honest challenge if they're off track.",
  "insight": "One sharp observation about a pattern you noticed — digital habits vs mood, food vs energy, social life vs goal, screen time vs sleep. Make it feel like a revelation, not a lecture. 2-3 sentences max.",
  "goalComment": null or "If they have an active goal: one direct, honest sentence about how today's choices are helping or hurting their progress toward it.",
  "questions": ["Question 1 — personal, specific, something they'll actually think about", "Question 2 — could be about something they mentioned but didn't expand on"]
}`;

  const userMessage = `Here's what I want to share about my day (${entry.date}):

${entry.freeWrite}

Mood today: ${entry.mood}/10
Energy: ${entry.energy}/10
Sleep last night: ${entry.sleep} hours
What I ate: ${entry.ate || "didn't log this"}
What I drank: ${entry.drank || "didn't log this"}
Physical activity: ${entry.activity || "nothing noted"}
Social life: ${entry.socialLife || "nothing notable"}
Screen time: ${entry.screenTime || "didn't track"} hours
Main apps/platforms used: ${entry.appsUsed || "didn't log"}
Content I consumed (videos, posts, news): ${entry.contentConsumed || "didn't log"}
Significant conversations: ${entry.importantConversations || "nothing to report"}
${entry.activeGoal ? `\nMy current life goal: ${entry.activeGoal}` : ""}
${entry.previousAnswers ? `\nAnswers to your questions from yesterday: ${entry.previousAnswers}` : ""}`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    const clean = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] ?? raw.trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}
