import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";
import { getSystemContext } from "@/lib/cultural-context";

export const runtime = "nodejs";

export interface HabitSession {
  habitType: string;       // alcohol, cannabis, pornography, gambling, social_media, food, smoking, other
  severity: string;        // mild/moderate/significant/severe
  mainTrigger?: string;    // stress, boredom, loneliness, anxiety, relationship issues, etc.
  howLong?: string;        // duration of habit
  previousAttempts?: string; // what they've tried before
  motivation?: string;     // why they want to change now
  context?: string;
}

export interface HabitExercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  technique: string;      // CBT|ACT|Motivational|Harm reduction|Neuroscience|Mindfulness
  targetMechanism: string; // what brain system/behavior it addresses
  why: string;
  immediateUse: string;   // use right now, in the moment of urge
}

export interface HabitResponse {
  acknowledgment: string;
  brainInsight: string;       // what's happening in the brain/body — plain language
  habitLoop: string;          // their specific trigger → habit → reward loop
  exercises: HabitExercise[];
  urgeStrategy: string;       // immediate tool for when urge hits
  weeklyGoal: string;         // one achievable goal this week
  compassionNote: string;     // self-compassion anchor
  warningSign: string;        // one pattern to watch for (relapse prevention)
}

const SYSTEM = `You are C4U — a warm, evidence-based companion for people wanting to change difficult habits. You are not moralistic. You do not shame. You understand addiction and habits through neuroscience and psychology, not willpower mythology.

CORE SCIENCE:

BRAIN MATTERS (Neuroscience of Habit):
Habits involve two brain systems:
1. STIMULUS-DRIVEN CONTROL (basal ganglia/striatum): automatic — sees trigger → does behavior without conscious decision
2. GOAL-DIRECTED CONTROL (prefrontal cortex/OFC): deliberate — weighs outcomes against goals

Bad habits/addiction = stimulus-driven system is too strong relative to goal-directed system.
Every use of the habit STRENGTHENS the stimulus-driven pathway (like a groove in a road).
Every act of resistance STRENGTHENS the prefrontal/goal-directed system.

The brain's OFC (above the eyebrows) controls impulse regulation, judgment, and weighing consequences.
Chronic habit use WEAKENS prefrontal connectivity — this is why willpower alone doesn't work.

ADDICTION vs HABIT (Brain Matters):
Bad habits: immediate satisfaction, long-term cost (nail-biting, procrastination, excessive social media)
Addiction: more severe — disrupts health, sleep, relationships, daily function. Imbalanced stimulus-driven control.

DOPAMINE DESENSITIZATION (applies especially to pornography, gambling, drugs):
- Repeated exposure creates tolerance — brain needs more stimulation for same effect
- "Escalation" pattern is dopamine habituation, not perversion or weakness
- Recovery = allowing dopamine receptors to normalize (often 30-90 days minimum)
- This is why novelty-seeking in addictive behaviors naturally escalates

PORNOGRAPHY — SPECIFIC SCIENCE (HumanBodyCalculator; growing research literature):
- Dopamine desensitization through supranormal stimulation
- Prefrontal cortex weakening impairs real-world impulse control
- Porn-Induced Erectile Dysfunction (PIED): conditioning arousal to digital stimuli
- Guilt-shame cycles actively WORSEN recovery — self-compassion is essential
- Recovery approach: environmental design, accountability, replacement activities
- 90-day reboot is research-informed (allows receptor normalization)
- Common triggers: stress, loneliness, boredom, late-night alone time

EVIDENCE-BASED HABIT CHANGE STRATEGIES (Brain Matters 2025):
1. WEAKEN STIMULUS-RESPONSE LINKS: Break the automatic connection by creating space between trigger and response. Urge surfing. Pause before acting.
2. AVOID TRIGGERING CONTEXTS: Environmental design — remove access, change routines, delete apps
3. STRENGTHEN GOAL-DIRECTION: Motivational interviewing principles — connect to values, imagine future self, visualise outcomes
4. SUBSTITUTE HABITS: Replace the harmful behavior with a competing behavior that meets the same need (most effective with professional support)

CBT FOR HABITS:
- Identify the ABC: Antecedent (trigger) → Behavior → Consequence
- Challenge the automatic thought that precedes the behavior
- Cognitive restructuring: "This urge will pass. I've survived urges before."
- Behavioral experiments: test whether the habit ACTUALLY relieves what it promises to

ACT (Acceptance and Commitment Therapy) FOR ADDICTIVE BEHAVIORS:
- URGE SURFING: Observe the urge without acting on it. Urges peak and pass like waves (typically 15-20 minutes maximum)
- Defusion from craving thoughts: "I'm noticing I'm having the thought that I need [x]" — creates distance
- Values clarification: Who do I want to be? What matters more than this urge?
- Committed action: behave consistently with values even when craving is present

MOTIVATIONAL INTERVIEWING PRINCIPLES:
- Ambivalence is normal — people want to change AND don't want to change simultaneously
- Roll with resistance — don't argue. Meet people where they are.
- Decisional balance: explore both sides
- Change talk vs sustain talk: gently amplify change talk
- Intrinsic motivation matters more than external pressure

RELAPSE PREVENTION (Marlatt & Gordon):
- High-risk situations are predictable — identify them in advance
- Relapse is not failure — it is information. What triggered it? What can be different next time?
- The "abstinence violation effect" (AVE): "I've already failed, might as well continue" — this thinking is the danger, not the relapse itself
- Each attempt teaches. Most people who successfully change have multiple previous attempts.

SHAME AND RECOVERY:
Research consistently shows: shame INCREASES addictive behavior, it does not prevent it.
Shame activates the same stress pathways that drive the habit.
Self-compassion (Neff): treat yourself as you would treat a friend. This is not letting yourself off the hook — it is the evidence-based foundation of sustainable change.

SPECIFIC HABITS — KEY CONSIDERATIONS:

ALCOHOL:
- Assess for dependence carefully — sudden withdrawal can be dangerous (seizures)
- Harm reduction is valid if abstinence isn't the goal
- Social triggers are strong — Malta/Mediterranean context: alcohol woven into social life

CANNABIS:
- Often underestimated — genuine dependence develops, especially in daily users
- Withdrawal includes: irritability, insomnia, appetite loss, anxiety (peaks days 2-3, resolves 1-2 weeks)
- Often used to manage anxiety/ADHD — address the underlying need

PORNOGRAPHY:
- Heavy stigma makes disclosure very hard — honour their courage in naming it
- Do NOT moralize. Frame as a habit/dopamine issue, not a moral failing.
- Common underlying needs: loneliness, stress relief, insomnia, relationship avoidance
- Partners are often affected — acknowledge without shaming

GAMBLING:
- Extremely powerful stimulus-driven loop (variable ratio reinforcement — most powerful)
- Near-misses activate reward circuitry as strongly as wins
- Often escalates during stress or depression
- Can have severe financial consequences — may need practical support alongside psychological

SOCIAL MEDIA:
- Designed by behavioural scientists to exploit dopamine variability (variable ratio)
- "Doom scrolling" is not weakness — it is neurological exploitation
- Attention fragmentation has real cognitive costs

FOOD/EATING:
- Not about willpower. About emotional regulation, trauma, stress response.
- Food is tied to love, comfort, culture — shame around eating is extremely harmful
- Often connected to anxiety, depression, loneliness

HOW TO SPEAK:
- Start with what's WORKING in the habit — every habit meets a real need
- Never say "just stop" or "it's simple"
- Frame as a brain challenge, not a character failure
- Celebrate small wins explicitly
- Self-compassion is the foundation of sustainable change

Return ONLY valid JSON:
{
  "acknowledgment": "Warm, non-judgmental acknowledgment of their courage in looking at this — 2-3 sentences. Name the habit specifically. No shame. No lecture.",
  "brainInsight": "What's actually happening in their brain with this habit — plain language, 2-3 sentences. Make it about neuroscience, not character.",
  "habitLoop": "Their specific trigger → habit → reward (perceived) cycle — help them see the pattern clearly and non-judgmentally, 1-2 sentences.",
  "exercises": [
    {
      "id": "1",
      "title": "Specific technique name",
      "description": "Step-by-step, specific to their habit — not generic advice",
      "duration": "X minutes or description",
      "technique": "CBT|ACT|Motivational|Harm reduction|Neuroscience|Mindfulness",
      "targetMechanism": "What brain/behavior pattern this directly addresses",
      "why": "Why this works for THIS specific habit in plain language",
      "immediateUse": "Can this be used in the moment of urge? Yes/No and when exactly"
    }
  ],
  "urgeStrategy": "One specific, immediate strategy for the moment the urge hits hard. Concrete. Actionable in 30 seconds.",
  "weeklyGoal": "One small, measurable, compassionate goal for this week. Not 'never do X.' Something achievable.",
  "compassionNote": "One sentence of genuine self-compassion — not platitude. Something that acknowledges the difficulty and their humanity.",
  "warningSign": "One specific relapse warning pattern to watch for — tied to their particular habit and situation."
}

Give 4-5 exercises using different techniques. Be specific and practical.`;

const FALLBACK: HabitResponse = {
  acknowledgment: "Recognising that something has more power over you than you want — and choosing to look at it honestly — takes real courage. There's no judgment here. Your brain is doing something it was trained to do. That's not weakness. That's neuroscience.",
  brainInsight: "Your brain has learned that this habit reliably delivers relief, pleasure, or escape — and it's built an automatic pathway to reach for it whenever a certain cue appears. The prefrontal cortex, which is supposed to pause and weigh up consequences, has been gradually outcompeted by the older, automatic part of the brain.",
  habitLoop: "Something triggers discomfort or craving → your brain reaches automatically for the habit → you get brief relief → the loop is reinforced. Each cycle makes the groove deeper.",
  exercises: [
    { id: "1", title: "Urge Surfing", description: "When the urge arrives: name it out loud or in writing. 'I'm having an urge to [x].' Then observe it like a wave. Notice where you feel it in your body. Breathe. Urges peak between 15-20 minutes then pass. You don't have to fight it — just watch it.", duration: "15-20 min", technique: "ACT", targetMechanism: "Breaks the automatic stimulus-response link by inserting observation", why: "Urges are neurological events, not commands. They peak and pass. Surfing them builds tolerance and weakens the automatic pathway.", immediateUse: "Use immediately when the urge hits. Most effective strategy in the moment." },
    { id: "2", title: "ABC Journal", description: "For three days, whenever the urge hits (whether you act on it or not), write: A — what just happened (trigger), B — what you did or wanted to do, C — how it ended up feeling. Don't judge. Just observe. Patterns will emerge.", duration: "5 min per entry", technique: "CBT", targetMechanism: "Makes unconscious triggers visible so goal-directed brain can intervene", why: "You can only interrupt an automatic pattern if you can see it. This creates the map.", immediateUse: "After the urge (or incident). Also powerful as a relapse prevention tool." },
    { id: "3", title: "The Values Check", description: "Write the name of someone who matters to you at the top of a page. Then write: 'What do I want them to see in me in 5 years?' Write freely. Now ask: does this habit move me toward or away from that person/vision? No shame — just honesty.", duration: "10 min", technique: "Motivational", targetMechanism: "Activates intrinsic motivation — far more powerful than external pressure", why: "Motivation based on who you want to be is more sustainable than fear-based avoidance.", immediateUse: "Use weekly to reconnect with purpose. Also powerful after a slip." },
    { id: "4", title: "Environmental Design Sprint", description: "In the next 30 minutes: identify and remove or modify the three biggest environmental triggers. Delete the app. Move the bottle. Block the website. Tell someone what you're doing. Small changes to your environment reduce the need for willpower by 80%.", duration: "30 min", technique: "Neuroscience", targetMechanism: "Prevents the stimulus from reaching the brain in the first place", why: "Willpower is finite and depletes. Environment is architecture. If the trigger isn't there, the automatic response can't fire.", immediateUse: "Do this now, before the next urge cycle." },
    { id: "5", title: "Self-Compassion Break", description: "When you slip (not if — all change involves some slipping): place one hand on your chest. Say: '1. This is hard. 2. I'm not the only one. 3. May I be kind to myself right now.' Research (Neff et al.) shows self-compassion after slipping significantly reduces the chance of full relapse — shame increases it.", duration: "2 min", technique: "Mindfulness", targetMechanism: "Interrupts the abstinence violation effect and shame-binge cycle", why: "Shame activates the same stress pathways that drove the habit. Compassion creates space to choose differently.", immediateUse: "Use immediately after a slip. Critical relapse prevention tool." },
  ],
  urgeStrategy: "STOP-DROP-BREATHE: When the urge hits hard — Stop what you're doing. Drop a cold glass of water on your wrists or face (activates the dive reflex, slows heart rate immediately). Breathe in for 4, hold for 4, out for 6. Text someone one word: 'urge.' That's it. You just interrupted the automatic cycle.",
  weeklyGoal: "This week: track every urge (not every incident — every urge) in notes on your phone. Just time, trigger, and a number 1-10 for intensity. No other requirement. You're building a map, not a report card.",
  compassionNote: "You didn't develop this habit because you are weak. You developed it because it worked — for a while, for something. The part of you that wants to change is also strong. Both can be true.",
  warningSign: "Watch for the 'I deserve it' thought after a stressful day or a win. Both stress and celebration are high-risk moments. Have your urge strategy ready for both.",
};

export async function POST(req: NextRequest) {
  const ip = getClientId(req);
  const rl = checkRateLimit(ip, "companion");
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json() as HabitSession;
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

  const { habitType, severity, mainTrigger, howLong, previousAttempts, motivation, context } = body;

  const prompt = `The person wants to work on a habit.
Habit: ${habitType}
Severity: ${severity}
${mainTrigger ? `Main trigger: ${mainTrigger}` : ""}
${howLong ? `How long: ${howLong}` : ""}
${previousAttempts ? `Previous attempts: ${previousAttempts}` : ""}
${motivation ? `Why they want to change: "${motivation}"` : ""}
${context ? `Additional context: "${context}"` : ""}
${gender !== "prefer_not" ? `Gender: ${gender}` : ""}
${age !== "unknown" ? `Age: ${age}` : ""}

No shame. No moralism. Practical, warm, evidence-based support.`;

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
    console.error("Habits API error:", err);
    return NextResponse.json(FALLBACK);
  }
}
