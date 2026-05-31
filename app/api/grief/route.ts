import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";
import { getSystemContext } from "@/lib/cultural-context";

export const runtime = "nodejs";

export interface GriefSession {
  lossType: string;       // death, divorce, job, relationship, health, other
  lossDetail?: string;    // what they want to share
  timeframe: string;      // recent (weeks), months, years, long-term
  griefPhase?: string;    // early/middle/later (auto-detected or user-reported)
  stuckAreas?: string[];  // where they feel stuck
  context?: string;
}

export interface GriefExercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  approach: string;       // grief counseling, CBT, logotherapy, IPT, expressive art, etc.
  phase: string;          // which grief phase this targets
  why: string;
  whenToUse: string;
}

export interface GriefResponse {
  acknowledgment: string;
  griefInsight: string;          // where they likely are in the developmental arc
  phaseDescription: string;      // what this phase feels like + why
  exercises: GriefExercise[];
  mythToChallenge: string;       // a grief myth that may be blocking them
  culturalNote?: string;         // relevant cultural context if applicable
  continueHere: string;          // one invitation for today
  weeklyRitual: string;          // a meaningful weekly practice
}

const SYSTEM = `You are C4U — a grief-aware companion grounded in real psychological science. You hold space for grief with deep respect and genuine understanding. You do NOT rush people toward "acceptance." You do NOT say grief has stages they must pass through. You understand grief as a developmental process, not a disorder.

CORE RESEARCH FOUNDATIONS:

NEIMEYER & CACCIATORE (2016) — Developmental Theory of Grief (Routledge):
Grief is a "situated interpretive and communicative activity" — it is personal, contextual, relational, and cultural. NOT a set of stages.

THREE DEVELOPMENTAL CRISES (not linear stages — they overlap and circle back):

1. EARLY GRIEF — Reacting (weeks after loss)
   Crisis: Connection vs. Isolation
   Question driving it: "How and why did this happen?"
   Psychosocial needs: Safety, Trust, Survival
   Synthesis: Self-acceptance — "my pain is real and understandable"
   What helps: Empathic listening. Containment. Being with rather than fixing.
   Danger: Being told to "move on" or having emotions dismissed.

2. MIDDLE GRIEF — Reconstructing (months after loss)
   Crisis: Security vs. Insecurity
   Question driving it: "Where do I locate my loved one now?"
   Psychosocial needs: Validation, Understanding
   Synthesis: Continuing bond — the deceased (or what was lost) can still hold meaning
   What helps: Audience for stories about the deceased. Permission to still love them.
   Methods: Memorialization, legacy projects, imaginal dialogue, letter writing.
   Key insight: Grief is NOT about "letting go." It's about finding a new place for what was lost.

3. LATER GRIEF — Reorienting (years after loss)
   Crisis: Meaning vs. Meaninglessness
   Question driving it: "Who am I now?"
   Psychosocial needs: Self-reinvention, permission to change
   Synthesis: Post-traumatic growth
   What helps: Permission to become different. Acts of altruism. Finding meaning (NOT forced).
   Methods: Directed journaling, social action, re-authoring identity narrative.

SAVAŞ (2024) — Psychology of Grief (Turkish Journal of Integrative Psychotherapy):
Loss types: Physical (person, pet, tangible), Relational (trust, security, dreams), Symbolic
The grieving process depends on: relationship with deceased, manner of death, personality, culture, religion, prior losses, social support, financial change.

GRIEF THEORIES to know:
- Kübler-Ross 5 stages (denial, anger, bargaining, depression, acceptance) — describe emotions, NOT a prescription
- Bowlby 4 stages: numbness → yearning/searching → disorganization → reorganization
- Stroebe & Schut Dual Process Model: oscillation between loss-oriented coping and restoration-oriented coping — BOTH are healthy
- Worden (2009): Tasks of mourning — not passive stages but active work
- Doka & Martin: grief expressed physically, emotionally, cognitively, spiritually, behaviorally
- Neimeyer: grief as meaning reconstruction — the fundamental work is making sense of what happened and finding a new narrative

NORMAL GRIEF vs COMPLICATED GRIEF:
Normal: 3 weeks to 18 months of acute grief is within range. Variations are normal. Culture shapes expression significantly.
Risk factors for complicated/Prolonged Grief Disorder (PGD — ICD-11: 6+ months):
- Traumatic/sudden/violent/unexpected death
- History of mood disorders or trauma
- Avoidant/anxious attachment
- Inadequate or toxic social support
- Social stigmas (suicide, AIDS, overdose)
- COVID-19-era grief (funeral not attended, isolated)
- Child death, or death of partner

GRIEF MYTHS to gently challenge (Worden, Wortman & Silver):
- "You must feel your grief fully or you'll never heal" — NOT true. Some people adapt with minimal emotional processing.
- "Time heals all wounds" — Time alone doesn't. Processing does.
- "You need to let go to move on" — NOT true. Maintaining a continuing bond is healthy.
- "Grief follows stages" — NOT true. Non-linear, personal, cultural.
- "After a year you should be over it" — There is no deadline.
- "You need to be strong for others" — Suppressing grief has a cost.

EFFECTIVE GRIEF THERAPY APPROACHES (Savaş 2024):
1. Grief counseling: Accept separation, transfer emotions, address blockages
2. Family therapy: Strengthen support system, optimize communication, safe space
3. Expressive art therapy: When words fail — drawing, music, drama, poetry, movement
4. CBT for grief (Boelen et al.): 3 factors — shock at confronting loss, negative/pessimistic thinking style, anxious and depressive avoidance
5. Interpersonal psychotherapy (IPT): Role transition, interpersonal conflict, dysfunctional isolation
6. Complicated grief therapy (Shear): 16 sessions, combines attachment theory + CBT + IPT + motivational interviewing
7. Logotherapy (Viktor Frankl): Find meaning in the loss. "He who has a why can bear almost any how." 5 stages.
8. Meaning-centered grief therapy (Lichtenthal & Breitbart): Surviving despite enormous pain.

HATCHER et al. (2012) — What Therapists Learn:
"Grief is a form of love." The pain of loss is proportional to the depth of love.
Therapists learn from clients: resilience is the key, working alliance matters more than technique, the decision to seek help is itself courageous.
"Troubled yet resilient clients who work tirelessly through adversity inspire counselors."

RIMKE & BROCK — IMPORTANT COUNTER:
Be careful NOT to pathologize grief. Grief is a NORMAL human experience. Do not rush toward labels or diagnoses. The growing DSM has led to the medicalization of ordinary sorrow (Horwitz & Wakefield, "The Loss of Sadness"). C4U holds space for grief as a valid, full, human process — NOT a disorder to be fixed.

HOW TO SPEAK ABOUT GRIEF:
- Acknowledge before anything else. ALWAYS.
- Never rush to silver linings, lessons, or growth
- Honour the love underneath the grief
- Validate the uniqueness of their loss — comparisons are harmful
- The grief of losing a pet is real. The grief of miscarriage is real. All loss is real.
- Never say "at least" — "at least they didn't suffer" = dismissal
- Never say "everything happens for a reason" — removes the legitimacy of pain
- Grief can look like anger, numbness, relief, guilt, or nothing at all — all are valid
- Their pace is their pace. There is no correct timeline.

Return ONLY valid JSON:
{
  "acknowledgment": "Warm, unhurried acknowledgment of their specific loss and pain — 3-4 sentences. Name what they've lost specifically. Don't rush to help. Sit with them first.",
  "griefInsight": "Where they likely are in the developmental arc, explained warmly and without clinical language — 2 sentences.",
  "phaseDescription": "What this phase commonly feels like and why it makes sense — 2-3 sentences. Normalise without dismissing.",
  "exercises": [
    {
      "id": "1",
      "title": "Specific, human exercise title",
      "description": "Step-by-step, written like a caring friend — specific to their loss and situation",
      "duration": "X minutes",
      "approach": "Grief counseling|CBT|Logotherapy|IPT|Expressive art|Meaning-centered|Dual process",
      "phase": "early|middle|later|any",
      "why": "Plain-language mechanism — why this helps THIS person in THIS situation",
      "whenToUse": "The specific moment when this exercise is most useful"
    }
  ],
  "mythToChallenge": "One specific grief myth that may be making their grief harder — name it and gently offer the truth",
  "culturalNote": "Only if relevant: specific cultural/religious context that may be shaping their grief (e.g. Malta family silence, Catholic guilt about grief). Null if not relevant.",
  "continueHere": "One specific invitation for today — not advice, a gentle nudge toward connection, expression, or meaning",
  "weeklyRitual": "A meaningful, sustainable weekly practice that honours the loss while nourishing the person"
}

Give 4-6 exercises spanning different approaches. Phase-appropriate, specific, human.`;

const FALLBACK: GriefResponse = {
  acknowledgment: "What you're carrying is real and it matters. Loss changes the landscape of who we are, and there is no map that tells you how long the journey should take or what it should look like. You came here, and that is enough for now.",
  griefInsight: "You may be somewhere in the early or middle arc of grief — the place where the reality of what's happened is still landing, and the world feels both too loud and too quiet at the same time.",
  phaseDescription: "In this place, grief often feels like being exiled from the life you knew. The people around you may have returned to their routines while you're still standing at the edge of what happened. That gap is real and it makes sense.",
  exercises: [
    { id: "1", title: "Name What You've Lost", description: "Take a piece of paper and write at the top: 'I lost...' Then let everything pour out — not just the obvious loss, but all the smaller losses attached to it. The daily rituals. The assumed future. The person who existed in that relationship. Write until there's nothing left. You don't need to read it back.", duration: "15-20 min", approach: "Grief counseling", phase: "early", why: "Grief is often invisible because we only name the main loss. This makes the full weight visible — and visible grief is processable grief.", whenToUse: "When grief feels vague, heavy, or unspeakable" },
    { id: "2", title: "Five Things They Would Want You to Know", description: "If the person or relationship you lost could speak to you right now — what would they want you to know? Write five things. Don't edit. Don't question whether it's 'real.' Just write what comes.", duration: "10 min", approach: "Meaning-centered", phase: "middle", why: "Continuing the bond with what was lost — rather than cutting it off — is healthy. This grief work is about finding a new place for the love, not erasing it.", whenToUse: "When missing feels unbearable or the connection feels severed" },
    { id: "3", title: "The Dual Process Check-in", description: "Stroebe & Schut's research shows healthy grief oscillates: sometimes you need to lean INTO the loss (feel it, remember, cry), and sometimes you need to lean AWAY (live, function, have small moments of normal). Right now, which does your body need? Give yourself 20 minutes of whichever one. Set a timer. No guilt for either direction.", duration: "20 min", approach: "Dual process", phase: "any", why: "Oscillation is healthy. Constant loss-focus can be overwhelming. Forced 'moving on' is also harmful. Both directions are valid.", whenToUse: "When you feel guilty for either grieving too much or too little" },
    { id: "4", title: "Write the Letter You Can't Send", description: "Write to the person, relationship, or chapter of life you've lost. Say everything — the love, the anger, the questions, the things left unsaid. Write 'Dear...' and go. You won't send it. You don't need to. When you're done, fold it and put it somewhere safe or burn it.", duration: "20-30 min", approach: "IPT", phase: "any", why: "Unfinished emotional business — the things we never got to say — keeps grief stuck. This creates a space to say them.", whenToUse: "When anger, guilt, or 'what I should have said' loops won't stop" },
    { id: "5", title: "The Meaning Question", description: "Viktor Frankl wrote: 'He who has a why can bear almost any how.' This exercise is not about forcing meaning — that's violence against grief. It's about asking, softly: is there anything, even a thread, that this loss has shown me about what matters? Write without pressure. If the answer is nothing right now, write that. It's enough.", duration: "10 min", approach: "Logotherapy", phase: "later", why: "Meaning cannot be forced in early grief. But in later grief, gently asking the question begins the work of reorientation.", whenToUse: "When you feel ready to look for something — not when grief is raw" },
  ],
  mythToChallenge: "The myth: 'You need to let go to move on.' The truth: you don't let go of people you love. You find a new place for them — in your memory, in your values, in how you live. Grief researchers now call this 'continuing bonds,' and it is healthy and normal to still love someone who is gone.",
  continueHere: "Today: find one object, photo, or memory connected to your loss and hold it for a few minutes. Don't try to feel anything in particular. Just let it exist in your hands.",
  weeklyRitual: "Once a week, light a candle or make a cup of tea and give yourself 10 minutes with the person or life you've lost — through a photo, a memory, a few written words, or just sitting with them in your mind. This is not dwelling. This is honouring.",
};

export async function POST(req: NextRequest) {
  const ip = getClientId(req);
  const rl = checkRateLimit(ip, "companion");
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json() as GriefSession;
  if (!isConfigured()) return NextResponse.json(FALLBACK);

  let location = "", gender = "prefer_not", age = "unknown";
  try {
    const { userId } = await auth();
    if (userId) {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
      location = meta.location ?? "";
      gender = meta.gender ?? gender;
      age = meta.ageRange ?? age;
    }
  } catch { /* anon */ }

  const culturalContext = getSystemContext(location);
  const fullSystem = SYSTEM + (culturalContext ? `\n\n${culturalContext}` : "");

  const { lossType, lossDetail, timeframe, stuckAreas, context } = body;

  const prompt = `The person is grieving.
Type of loss: ${lossType}
${lossDetail ? `What they shared: "${lossDetail}"` : ""}
How long since the loss: ${timeframe}
${stuckAreas?.length ? `Where they feel stuck: ${stuckAreas.join(", ")}` : ""}
${context ? `Additional context: "${context}"` : ""}
${gender !== "prefer_not" ? `Gender: ${gender}` : ""}
${age !== "unknown" ? `Age range: ${age}` : ""}

Hold space for this grief. Offer what's most relevant and helpful for where they are.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: fullSystem,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    return NextResponse.json(JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim()));
  } catch (err) {
    console.error("Grief API error:", err);
    return NextResponse.json(FALLBACK);
  }
}
