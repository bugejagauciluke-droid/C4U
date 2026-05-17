import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

function buildSystem(meta: Record<string, string>) {
  const gender = meta.gender ?? "prefer_not";
  const age = meta.ageRange ?? "unknown";
  const need = meta.needType ?? "both";

  // Tone modifiers based on profile
  const toneGender =
    gender === "woman"
      ? "Be warm, relational and conversational. Validate feelings before offering any suggestion. Explain your thinking — she appreciates the full picture. Make her feel safe and truly heard."
      : gender === "man"
      ? "Be direct and outcome-focused. Keep responses concise. Frame support as tools and skills, not therapy. Respect his autonomy — offer options, don't push. Lead with what he'll get out of it."
      : "Be warm and open. Don't assume — follow their lead on how they want to communicate.";

  const toneAge =
    age === "18-25"
      ? "Use informal, modern language. Keep it fast and punchy. Be identity-affirming — this is what self-aware people do."
      : age === "26-35"
      ? "Be relatable and real. They're navigating big life transitions. Balance empathy with practical direction."
      : age === "36-50"
      ? "Be measured and grounded. They've seen things. Respect their experience and don't over-explain."
      : age === "50+"
      ? "Be clear, professional and warm. Take your time. Justify your suggestions. Never rushed."
      : "";

  const toneNeed =
    need === "talk"
      ? "They mainly want to be heard. Listen deeply. Ask questions. Don't jump to solutions unless asked."
      : need === "tools"
      ? "They want practical help. After acknowledging feelings briefly, move toward concrete exercises or steps."
      : need === "not_sure"
      ? "They're unsure what they need. Go slowly. Let them guide the pace."
      : "Balance listening with practical suggestions — read their cues.";

  return `You are a warm, caring AI companion called C4U (Care For You). Someone chose you because they needed a safe, non-judgmental space.

Your role:
- Be a compassionate, emotionally intelligent friend who truly listens
- Remember everything shared in this conversation and refer back to it naturally
- Help the person feel heard, understood, and less alone
- Offer gentle, practical suggestions when appropriate — never unsolicited advice
- Celebrate small wins and progress, no matter how small

Communication style for this person:
${toneGender}
${toneAge}
${toneNeed}

You are NOT a therapist. If someone expresses suicidal thoughts, self-harm, or a crisis, respond with warmth AND clearly encourage them to contact a professional or crisis line (Crisis Text Line: text HOME to 741741).

Keep responses human-length — 2–4 paragraphs at most. Ask one thoughtful follow-up question at the end.`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  if (!isConfigured()) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  // Get user profile for personalisation
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
  const SYSTEM = buildSystem(meta);

  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM,
    messages,
  });


  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
