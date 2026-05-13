import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  if (!isConfigured()) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const { situation, goal } = (await req.json()) as { situation: string; goal: string };

  const prompt = `Create a compassionate, practical 7-day emotional wellness plan for someone dealing with the following:

Situation: ${situation}
What they want to feel by the end: ${goal}

Return ONLY valid JSON in this exact format:
{
  "title": "Short empathetic plan title",
  "intention": "One sentence of warmth and encouragement for the week ahead",
  "days": [
    {
      "day": 1,
      "theme": "Short theme title (e.g. 'Acknowledge & Rest')",
      "morning": "Morning micro-practice (2–5 min)",
      "afternoon": "Afternoon check-in or activity (5–10 min)",
      "evening": "Evening reflection or wind-down (5 min)",
      "affirmation": "One short, genuine affirmation for this day"
    }
  ]
}

Make all 7 days. Keep each practice brief, doable, and emotionally intelligent. Avoid toxic positivity. Be warm, human, and real.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    const json = raw.replace(/^```json\s*/m, "").replace(/```\s*$/m, "").trim();
    const plan = JSON.parse(json);
    return NextResponse.json(plan);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
