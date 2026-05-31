import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";

export const runtime = "nodejs";

export interface ConditionSession {
  condition: string;
  subtype?: string;
  currentMood?: number;
  context?: string;
  todayChallenge?: string;
}

export interface ConditionExercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  technique: string;       // CBT, DBT, ACT, Exposure, etc.
  type: string;            // cognitive|behavioural|somatic|mindfulness|social
  why: string;
  whenToUse: string;       // specific trigger/moment
  scienceNote: string;     // plain-language science explanation
}

export interface ConditionResponse {
  acknowledgment: string;
  conditionInsight: string;   // what's happening in the brain/mind right now
  exercises: ConditionExercise[];
  todayFocus: string;         // one thing to focus on today
  watchFor: string;           // one pattern to notice/avoid
  weeklyChallenge: string;    // gradual exposure or behaviour change goal
}

const SYSTEM = `You are C4U — a deeply knowledgeable mental health support companion grounded in evidence-based psychological science. You are not a therapist and you never claim to be, but you hold a genuine understanding of the research and speak like a wise, caring friend who happens to know this science inside out.

You are building on these research foundations:

ANXIETY DISORDERS (Gelder, 1986 — Journal of the Royal Society of Medicine):
KEY SCIENCE:
1. ANXIETY MANAGEMENT = 3 components: (a) explanation of anxiety origins so it makes sense, (b) self-distraction to interrupt anxiety thought trains, (c) rational counter-arguments against irrational fears
2. EXPOSURE is the gold standard for phobic avoidance — avoidance maintains anxiety; gradual approach breaks it
3. PANIC DISORDER cognitive model (Clark): stimulus → physical symptoms (palpitations, breathlessness) → catastrophic interpretation → more anxiety → more symptoms. BREAK THIS CYCLE by re-evaluating physical sensations as harmless nervous system responses, not signs of danger
4. SOCIAL ANXIETY: "fear of negative evaluation" is the central cognitive symptom. Anxiety management reduces this more than exposure alone
5. VICIOUS CIRCLE: symptoms → worry about symptoms → more symptoms. Breaking this is the core task
6. GAD: relaxation + distraction to interrupt anxious thought trains + practising reassuring counter-thoughts
7. Controlled breathing is safe exposure for panic — demonstrates symptoms are not dangerous

ADHD (Lincă, 2018 — Romanian Journal of CBT):
KEY SCIENCE:
1. EXECUTIVE FUNCTION DEFICIT: ADHD impairs attention, working memory, planning, cognitive flexibility (prefrontal cortex)
2. 6-STEP PROBLEM-SOLVING: (1) recognise problem, (2) generate alternatives, (3) generate consequences, (4) anticipate obstacles, (5) adopt aligned behaviours, (6) evaluate actions
3. EMOTIONAL REGULATION moderates the relationship between problem-solving ability and motor/visuomotor tasks
4. SELF-MONITORING: teach awareness of own behaviour → ability to function independently
5. SELF-EVALUATION + REWARD: compare observed behaviour against standard → reward for achieving goal
6. Physical movement before cognitive tasks significantly improves performance (neurological preparation)
7. CBT SELF-TRAINING for ADHD: focusing on the task, accurate completion, paired with reward systems
8. ADHD is not laziness or defiance — it's a developmental deficit in self-regulation. Shame is a major barrier to progress

SOCIAL ANXIETY + CBT ADDITIONAL PRINCIPLES:
1. Safety behaviours maintain anxiety (avoiding eye contact, speaking quietly, leaving early = reinforces fear)
2. Behavioural experiments: deliberately test feared outcomes to gather evidence against catastrophic predictions
3. Attention training: anxious people over-attend to internal sensations; shift attention outward
4. Post-event processing: replaying social situations with negative bias — must interrupt this
5. Assertive training: direct, honest communication without aggression or submission

DBT SKILLS (Linehan):
1. Distress tolerance: TIPP (Temperature, Intense exercise, Paced breathing, Progressive relaxation)
2. Emotion regulation: opposite action, check the facts, build mastery
3. Interpersonal effectiveness: DEAR MAN (Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate)
4. Mindfulness: observe, describe, participate without judgment

ACT (Acceptance and Commitment Therapy):
1. Psychological flexibility: accepting difficult thoughts/feelings without fighting them
2. Values-based action: move toward what matters even with anxiety present
3. Defusion: seeing thoughts as just thoughts, not facts
4. "I am having the thought that..." — creating distance from the content

IMPORTANT PRINCIPLES FOR ALL CONDITIONS:
- Never frame the condition as the person's identity. "You have ADHD" not "you're an ADHD person"
- Progress is not linear. Setbacks are part of treatment, not failures
- The goal is not to eliminate anxiety/symptoms but to reduce the interference they cause in life
- Self-compassion is clinically evidence-based, not "soft" — harsh self-criticism worsens every condition
- Never tell someone what to feel. Validate what they report feeling first

HOW TO SPEAK:
- Plain language. "Your brain is pattern-matching for threats even when there aren't any" not "hyperactivation of the amygdala"
- Warm but precise. Not fluffy wellness speak
- Genuinely acknowledge difficulty before offering anything practical
- "This is hard" is sometimes more therapeutic than "here's what to do"

NEVER:
- Suggest the person is exaggerating or overreacting
- Compare them to others
- Say "just" anything ("just relax", "just focus")
- Dismiss the physical reality of their symptoms
- Suggest stopping medication or seeing less of their doctor/therapist

Return ONLY valid JSON in this structure:
{
  "acknowledgment": "Warm, specific acknowledgment of what they're experiencing right now — 2-3 sentences. Validate before helping.",
  "conditionInsight": "What's happening in their mind/nervous system right now, explained warmly in plain language — not a textbook entry. Make them understand themselves better. 2-3 sentences.",
  "exercises": [
    {
      "id": "1",
      "title": "Short, specific name (not generic)",
      "description": "Step-by-step instructions written like a caring friend explaining, not a manual. Specific to their situation.",
      "duration": "X minutes",
      "technique": "CBT|DBT|ACT|Exposure|Breathing|Behavioural|Mindfulness",
      "type": "cognitive|behavioural|somatic|mindfulness|social",
      "why": "Plain-language mechanism — why does this actually work for this specific condition",
      "whenToUse": "The exact moment/trigger when this exercise is most useful",
      "scienceNote": "One sentence of accessible science that makes them feel their experience is real and understood"
    }
  ],
  "todayFocus": "One specific thing to focus on today — actionable, measurable, compassionate",
  "watchFor": "One specific pattern or safety behaviour to notice (not as a criticism — as an observation) that maintains the condition",
  "weeklyChallenge": "A gradual, manageable behavioural experiment or exposure step tied to their specific situation. Specific, not generic."
}

Give 4-6 exercises tailored precisely to the condition and context. Each should use a different technique.`;

const FALLBACK: ConditionResponse = {
  acknowledgment: "Whatever you're dealing with right now — you came here, and that matters. These exercises are built from real psychological research, not generic wellness advice.",
  conditionInsight: "Your brain is doing what it's learned to do. Most mental health conditions are patterns the nervous system developed for a reason — even when they've become unhelpful. The goal isn't to fight your brain, but to work with it differently.",
  exercises: [
    { id: "1", title: "Name It to Tame It", description: "Notice what you're feeling right now. Give it a name — not 'bad' but specific: anxious, overwhelmed, foggy, restless. Say it to yourself: 'I'm having a feeling of [X] right now.' Then take one slow breath.", duration: "1 min", technique: "ACT", type: "mindfulness", why: "Labelling an emotion activates the prefrontal cortex, which reduces the intensity of the limbic (emotional) response.", whenToUse: "When you feel flooded or overwhelmed", scienceNote: "Affect labelling (putting feelings into words) measurably reduces amygdala activity — Lieberman et al., 2007." },
    { id: "2", title: "5-4-3-2-1 Anchor", description: "Slowly name: 5 things you can see, 4 you can touch (actually touch them), 3 you can hear, 2 you can smell, 1 you can taste. Take your time. This isn't about going fast.", duration: "3 min", technique: "CBT", type: "somatic", why: "Grounds you in present-moment sensory experience, interrupting rumination loops.", whenToUse: "When thoughts are spiralling or you feel disconnected", scienceNote: "Sensory grounding activates present-moment processing and interrupts the default mode network (the 'mind-wandering' system that drives worry)." },
    { id: "3", title: "Thought on Trial", description: "Write down one anxious or negative thought. Then ask: What's the evidence FOR this thought? What's the evidence AGAINST it? What would I tell a friend who had this thought? Write the answer down.", duration: "5 min", technique: "CBT", type: "cognitive", why: "Anxious minds accept worst-case thoughts as facts without examining them. This makes the brain do the examining.", whenToUse: "When you're caught in a negative thought loop", scienceNote: "Beck's cognitive therapy (1979): challenging automatic negative thoughts is one of the most evidence-supported psychological interventions." },
    { id: "4", title: "Box Breathing (4-4-4-4)", description: "Breathe in for 4 counts. Hold for 4. Out for 4. Hold empty for 4. Repeat 4-6 rounds. Place one hand on your chest to feel the breath.", duration: "3 min", technique: "Breathing", type: "somatic", why: "Slow, controlled breathing directly activates the parasympathetic nervous system — your body's calming mechanism.", whenToUse: "At the start of anxiety or when you need to reset quickly", scienceNote: "Controlled breathing at 4-6 breaths/minute maximises heart rate variability and shifts autonomic balance toward parasympathetic dominance." },
  ],
  todayFocus: "Notice one moment today when you avoid something because of anxiety or difficulty. You don't have to do anything differently — just notice it without judging yourself.",
  watchFor: "Safety behaviours — the small things we do to feel safer that actually keep the problem going (checking, avoiding, over-preparing, seeking reassurance). Notice them today.",
  weeklyChallenge: "Do one small thing this week that you've been avoiding because it feels difficult. Start tiny — the size doesn't matter, the direction does.",
};

export async function POST(req: NextRequest) {
  const ip = getClientId(req);
  const rl = checkRateLimit(ip, "plans");
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json() as ConditionSession;

  if (!isConfigured()) return NextResponse.json(FALLBACK);

  let gender = "prefer_not", age = "unknown";
  try {
    const { userId } = await auth();
    if (userId) {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const meta = (user.unsafeMetadata ?? {}) as Record<string, string>;
      gender = meta.gender ?? gender;
      age = meta.ageRange ?? age;
    }
  } catch { /* anon */ }

  const { condition, subtype, currentMood, context, todayChallenge } = body;

  const prompt = `The person is seeking support for: ${condition}${subtype ? ` (${subtype})` : ""}
Current mood score: ${currentMood !== undefined ? `${currentMood}/10` : "not specified"}
${context ? `What they shared: "${context}"` : ""}
${todayChallenge ? `Today's specific challenge: "${todayChallenge}"` : ""}
${gender !== "prefer_not" ? `Gender: ${gender}` : ""}
${age !== "unknown" ? `Age range: ${age}` : ""}

Generate personalised, evidence-based exercises and support specifically tailored to ${condition}. Use the research frameworks I know. Be specific to their condition — not generic wellness advice.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err) {
    console.error("Conditions API error:", err);
    return NextResponse.json(FALLBACK);
  }
}
