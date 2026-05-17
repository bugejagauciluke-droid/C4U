import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

export const runtime = "nodejs";

function buildSystem(gender: string, age: string, need: string) {
  const toneGender =
    gender === "woman"
      ? `Tone for acknowledgment: Make her feel emotionally seen and safe first — this is the most important thing. Validate her feelings completely before moving toward exercises. Use warm, relational language. She responds to how you make her feel more than what you say. Lead with empathy, take your time with the pain, then gently offer exercises framed as things that will help her feel better.`
      : gender === "man"
      ? `Tone for acknowledgment: Be direct and respect his strength. Acknowledge what he's going through without dwelling too long — he wants to feel capable, not pitied. Frame exercises as tools and techniques that work, not as emotional support. Lead with "here's what you can do right now." Appeal to his competence and ability to handle this.`
      : `Tone for acknowledgment: Be warm and genuine. Follow their lead — validate first, then offer practical help.`;

  const toneAge =
    age === "18-25" ? "Use informal, modern language. Keep it relatable and fast. They want to feel understood by someone who gets their world." :
    age === "26-35" ? "Be real and direct. They're in the thick of life. Balance empathy with practical action." :
    age === "36-50" ? "Be measured and respectful. They've been through things. Don't over-explain — get to what helps." :
    age === "50+" ? "Be clear, warm and professional. Take your time. They appreciate thoroughness and genuine care." : "";

  const toneNeed =
    need === "talk" ? "They want to feel heard more than fixed. Make the acknowledgment especially warm and full. Keep exercises gentle and connecting." :
    need === "tools" ? "They want practical help fast. Keep acknowledgment brief and move quickly to clear, actionable exercises." :
    need === "not_sure" ? "Go gently — they're unsure. Be extra warm in the acknowledgment and offer a variety of exercise types." : "";

  return `You are C4U — Care For You — a compassionate mental wellness companion. Someone has reached out because they are struggling emotionally right now. Your role is to provide immediate, warm, practical support through exercises they can do right now, wherever they are.

${toneGender}
${toneAge}
${toneNeed}

Analyse their situation carefully and provide 4-5 specific, actionable exercises tailored exactly to their circumstances. Be deeply specific — if they're at a party feeling lonely, give party-specific exercises. If they're going through divorce, give divorce-specific ones. Never give vague, generic advice.

Each exercise must be something they can start doing within the next 60 seconds.

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "acknowledgment": "Warm, empathetic 2-3 sentence acknowledgment of exactly what they're feeling. Be specific to their situation. Do not minimise or rush past the pain.",
  "exercises": [
    {
      "id": "1",
      "title": "Short exercise name (3-6 words)",
      "description": "Clear, kind, step-by-step instructions. 3-4 sentences. Tell them exactly what to do, how, and for how long.",
      "duration": "X minutes",
      "type": "breathing|grounding|social|movement|cognitive|journaling",
      "why": "One sentence on why this helps specifically in their situation."
    }
  ],
  "closingMessage": "Warm, encouraging 1-2 sentence closing. Remind them this feeling will pass and that reaching out took courage."
}`;

function extractJSON(text: string) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1] : text.trim();
}

const FALLBACK = {
  acknowledgment:
    "What you're feeling right now is real and valid. You reached out, and that takes real courage. Let's find something that helps you right now.",
  exercises: [
    {
      id: "1",
      title: "Box Breathing Reset",
      description:
        "Breathe in for 4 counts, hold for 4, out for 4, hold for 4. Place one hand on your chest. Repeat 4 rounds. Feel your nervous system slow down with each breath.",
      duration: "2 minutes",
      type: "breathing" as const,
      why: "Slow controlled breathing activates your parasympathetic nervous system — the fastest path to calm.",
    },
    {
      id: "2",
      title: "5-4-3-2-1 Grounding",
      description:
        "Name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Say each quietly to yourself. Take your time with each one.",
      duration: "3 minutes",
      type: "grounding" as const,
      why: "This anchors you in the present moment and interrupts the spiral of overwhelming emotion.",
    },
    {
      id: "3",
      title: "Send One Kind Message",
      description:
        "Think of one person who cares about you. Send them a message — even 'thinking of you'. You don't need to explain anything. Just reach out.",
      duration: "1 minute",
      type: "social" as const,
      why: "Even the smallest act of connection can shift the feeling of isolation.",
    },
  ],
  closingMessage:
    "You reached out, and that matters more than you know. This feeling is temporary — you have more strength than it feels like right now.",
};

export async function POST(req: NextRequest) {
  try {
    const { situation, details } = (await req.json()) as {
      situation: string;
      details: string;
    };

    if (!details?.trim()) {
      return NextResponse.json({ error: "Please share what you're feeling." }, { status: 400 });
    }

    if (!isConfigured()) return NextResponse.json(FALLBACK);

    // Read user profile if signed in — adapt tone accordingly
    let gender = "prefer_not", age = "unknown", need = "both";
    try {
      const { userId } = await auth();
      if (userId) {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
        gender = meta.gender ?? gender;
        age = meta.ageRange ?? age;
        need = meta.needType ?? need;
      }
    } catch { /* not signed in — use neutral defaults */ }

    const SYSTEM = buildSystem(gender, age, need);
    const msg = `My situation: ${situation || "General need for support"}\n\nWhat I'm experiencing: ${details}`;

    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1800,
      system: SYSTEM,
      messages: [{ role: "user", content: msg }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    return NextResponse.json(JSON.parse(extractJSON(raw)));
  } catch (err) {
    console.error("support API error:", err);
    return NextResponse.json(FALLBACK);
  }
}
