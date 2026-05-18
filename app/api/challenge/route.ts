import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";

export const runtime = "nodejs";

interface ChallengeRequest {
  recentMessages: { role: string; content: string }[];
  completedChallenges: string[]; // Titles of last 7 completed challenges
  date: string; // YYYY-MM-DD
}

const FALLBACK_CHALLENGES = [
  {
    title: "Send one message that matters",
    mission: "Think of someone you've been meaning to reach out to — a friend, a family member, anyone. Send them one genuine message today. It doesn't have to be long. 'Been thinking about you' is enough.",
    category: "connection",
    difficulty: "gentle",
    why: "Connection is the most powerful antidote to the feelings that brought you here. One message can shift everything.",
    suggestion: null,
  },
  {
    title: "Take 15 minutes outside alone",
    mission: "Step outside — not to do anything, just to be somewhere that isn't here. Walk slowly. Notice three things you wouldn't normally notice. Your only rule is no phone for 15 minutes.",
    category: "movement",
    difficulty: "gentle",
    why: "Your nervous system resets in open space. The mind that feels stuck indoors often moves freely outside.",
    suggestion: null,
  },
];

function pickFallback(date: string) {
  const idx = new Date(date).getDay() % FALLBACK_CHALLENGES.length;
  return FALLBACK_CHALLENGES[idx];
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  if (!isConfigured()) {
    const { date } = (await req.json()) as ChallengeRequest;
    return NextResponse.json(pickFallback(date ?? new Date().toISOString().split("T")[0]));
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
  const gender = meta.gender ?? "unknown";
  const age = meta.ageRange ?? "unknown";

  const { recentMessages, completedChallenges, date } = (await req.json()) as ChallengeRequest;

  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  const conversationSummary = recentMessages
    .filter(m => m.role === "user")
    .slice(-8)
    .map(m => m.content)
    .join("\n---\n");

  const SYSTEM = `You are C4U's Daily Challenge engine. You create one personalised daily challenge for this person — like a close friend who knows their situation and is giving them a specific mission for today.

The challenge must be:
- Deeply personal to what they've actually shared (not generic wellness advice)
- Achievable today, in their current real life
- A genuine stretch — not comfortable, but not impossible
- Something with a clear moment of completion — they'll know when they've done it
- Written like a friend giving you a mission, not a wellness app

USER PROFILE: Gender: ${gender}, Age: ${age}
TODAY: ${dayOfWeek}, ${date}

CHALLENGES TO AVOID (already completed recently):
${completedChallenges.length > 0 ? completedChallenges.join(", ") : "None yet"}

WHAT THEY'VE SHARED RECENTLY:
${conversationSummary || "No recent conversation yet — create a general first challenge."}

CHALLENGE CATEGORIES:
- "social": reach out to someone, have a real conversation, do something with another person
- "courage": face something they've been avoiding (a crush, a difficult conversation, a fear)
- "movement": get the body moving — specific, not "exercise"
- "mindset": reframe something, write something, challenge a belief they're holding
- "connection": build or strengthen a real relationship
- "growth": learn something, try something new, get uncomfortable in a good way

DIFFICULTY:
- "gentle": a small step, easy to complete — good for hard days
- "bold": requires some courage or effort — the standard
- "brave": facing something specific they've been avoiding — for when they're ready

SUBTLE SUGGESTION (include in 1 out of every 3 challenges):
Sometimes include a genuine recommendation — a book, a physical journal, a practice, or a product — that would genuinely help with their situation. Write it like a knowledgeable friend who happens to know: "By the way — [suggestion]. Here's why it helps: [brief reason]." Never make it sound like an ad. Only suggest if it genuinely fits.

Return ONLY valid JSON, no markdown:
{
  "title": "Short, personal challenge title — like 'Call Marco today' or 'Say what you've been holding back' (not generic)",
  "mission": "2-3 sentences. What to do, how, and when. Written directly to them as a caring friend. Make it feel specific and real.",
  "category": "social|courage|movement|mindset|connection|growth",
  "difficulty": "gentle|bold|brave",
  "why": "One honest sentence — why THIS challenge for THIS person right now.",
  "suggestion": null or "A book / journal / resource suggestion written as a genuine friend recommendation. Max 2 sentences."
}`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: "user", content: `Generate today's challenge for ${dayOfWeek}, ${date}.` }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    const clean = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] ?? raw.trim();
    return NextResponse.json(JSON.parse(clean));
  } catch {
    return NextResponse.json(pickFallback(date));
  }
}
