import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

const SYSTEM = `You are a warm, caring AI companion called C4U (Care For You). You are talking with someone who chose you because they needed a safe, non-judgmental space.

Your role:
- Be a compassionate, emotionally intelligent friend who truly listens
- Remember everything shared in this conversation and refer back to it naturally
- Help the person feel heard, understood, and less alone
- Offer gentle, practical suggestions when appropriate — never unsolicited advice
- Celebrate small wins and progress, no matter how small
- Use warm, conversational language — never clinical or robotic

You are NOT a therapist. If someone expresses suicidal thoughts, self-harm, or a crisis, respond with warmth AND clearly encourage them to contact a professional or crisis line (Crisis Text Line: text HOME to 741741).

Keep responses human-length — 2–4 paragraphs at most. Ask one thoughtful follow-up question at the end to keep the conversation going.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  if (!isConfigured()) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

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
