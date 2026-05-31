import { NextRequest, NextResponse } from "next/server";
import { anthropic, isConfigured } from "@/lib/claude";
import { checkRateLimit, getClientId } from "@/lib/rate-limit";
import { formatResourcesForAI } from "@/lib/crisis-resources";

export const runtime = "nodejs";

export interface SOSRequest {
  habit: string;          // what they're fighting
  urgeLevel: number;      // 1-10
  situation?: string;     // what's happening right now
  timeOfDay?: string;
  location?: string;      // country code for local resources
}

export interface SOSStep {
  id: string;
  action: string;         // one sentence, direct, immediate
  how: string;            // exactly how to do it RIGHT NOW
  duration: string;       // e.g. "30 seconds", "3 minutes"
  why: string;            // one line: why this works on the brain
}

export interface SOSResponse {
  firstWords: string;     // immediate acknowledgment — 1-2 sentences, warm, urgent
  urgeScience: string;    // one line about the science: "this urge will peak in X min"
  steps: SOSStep[];       // 3-5 immediate steps to do right now
  mantra: string;         // one short phrase to repeat
  timeAnchor: string;     // "in 20 minutes you will feel different. Here's why."
  ifStillStruggling: string; // what to do if steps above don't work
}

const SYSTEM = `You are C4U responding to someone who is RIGHT NOW fighting an urge to go back to a habit or addiction. They are in crisis. They reached out instead of acting. That took courage.

Your response must be IMMEDIATE, PRACTICAL, and WARM. This is not a therapy session. This is a real-time intervention.

CRITICAL NEUROSCIENCE TO KNOW:
1. URGES PEAK AND PASS: Research shows urges typically peak at 15-20 minutes then naturally decrease. If the person can get through this window, the urge usually passes. This is the most important thing they need to know.

2. THE DIVE REFLEX: Submerging face in cold water or holding ice activates the mammalian dive reflex — immediately slows heart rate 10-25%, activates the parasympathetic nervous system. This is the fastest physiological interrupt available without medication.

3. INTENSE EXERCISE (DBT TIPP): Even 1-2 minutes of intense physical activity (sprint, jumping jacks, push-ups to failure) rapidly metabolises cortisol and adrenaline that are driving the urge.

4. TEMPERATURE (DBT TIPP): Cold shower, ice cube held in hand, cold water on wrists — rapid sensory interrupt to the nervous system.

5. URGE SURFING (ACT): Observe the urge without acting. Name it: "I'm having an urge to [x]." Breathe into it. Urges are waves, not commands.

6. THE 15-MINUTE RULE: Delay the decision by 15 minutes. Just 15 minutes. Do anything else. The urge WILL change.

7. PHYSICAL LOCATION: Moving to a different physical space immediately disrupts the stimulus-response chain. Even moving to a different room works.

8. CALL/TEXT SOMEONE: Speaking out loud about the urge to another human is one of the most powerful interrupts. It activates social bonding systems that compete with the craving circuitry.

9. VALUES FLASH: In 30 seconds — picture the person, relationship, or life you want. Name them. The prefrontal cortex activates and competes with the craving center.

10. HARM REDUCTION: If they use after this session — they are not a failure. Each attempt teaches. Compassion after slipping prevents the binge-on-failure cycle.

TONE:
- Direct and warm simultaneously
- Short sentences — they may be in physical distress
- No lectures, no shame
- One word sentences are okay: "Stay with me."
- Acknowledge the courage it took to reach out
- Make them feel held right now

WHAT NOT TO DO:
- Don't give long explanations — they can't process them right now
- Don't shame even subtly
- Don't say "think of how far you've come" — too abstract when urge is acute
- Don't give more than 5 steps — overwhelming during a crisis

Return ONLY valid JSON:
{
  "firstWords": "Immediate warm acknowledgment — 1-2 sentences. They reached out. That matters. Name what's happening.",
  "urgeScience": "One factual sentence about what's happening neurologically right now — plain language, hopeful, true",
  "steps": [
    {
      "id": "1",
      "action": "One direct sentence — what to do RIGHT NOW",
      "how": "Exact instructions — no ambiguity. What to do with hands, body, breath",
      "duration": "Time estimate — be specific",
      "why": "One line: why this works on the brain right now"
    }
  ],
  "mantra": "One short phrase — 4-7 words max — to repeat when the urge surges",
  "timeAnchor": "In [X] minutes this will feel different. One sentence telling them why, based on science.",
  "ifStillStruggling": "If the steps above don't fully work — what to do next. Specific, practical, compassionate."
}

Give exactly 4 steps. Fast to read. Fast to act on. First step should work in under 60 seconds.`;

const FALLBACK: SOSResponse = {
  firstWords: "You reached out instead of acting. That's the hardest thing to do in this moment and you just did it. Stay with me for the next 20 minutes.",
  urgeScience: "Your brain is flooding with dopamine signals right now — but this peak will pass. Urges last 15-20 minutes at most before they naturally drop.",
  steps: [
    {
      id: "1",
      action: "Go somewhere cold — right now.",
      how: "Run cold water over your wrists and the inside of your arms for 30 seconds. Or hold an ice cube in your fist. Or splash cold water on your face. Do this first.",
      duration: "30–60 seconds",
      why: "Cold activates the dive reflex — physically slows your heart rate and activates the calm part of your nervous system in seconds.",
    },
    {
      id: "2",
      action: "Name the urge out loud.",
      how: "Say it — either aloud or write it down right now: 'I am having a strong urge to [x]. It is intense. It is not a command.' Then take 5 slow breaths, longer out than in.",
      duration: "2–3 minutes",
      why: "Naming what you're experiencing activates the prefrontal cortex and reduces the emotional intensity immediately.",
    },
    {
      id: "3",
      action: "Move your body — hard, for 2 minutes.",
      how: "Drop and do push-ups until you can't. Or run on the spot. Or jump. As hard as you can for 2 full minutes. Timer on your phone.",
      duration: "2 minutes",
      why: "Intense movement burns off the cortisol and adrenaline physically driving the urge. It works.",
    },
    {
      id: "4",
      action: "Picture one person. Just one.",
      how: "Close your eyes for 30 seconds. See the face of one person who matters to you. Don't think about disappointing them — just see them clearly. Feel the connection.",
      duration: "30 seconds",
      why: "Social bonding circuits compete directly with craving circuits in the brain. Love is stronger than the urge.",
    },
  ],
  mantra: "This urge will pass.",
  timeAnchor: "In 20 minutes this urge will have peaked and dropped — not because of willpower but because that is what urges do, biologically, every single time.",
  ifStillStruggling: "Call or text someone right now — one person, any message, even 'I'm struggling.' Speaking it to another human is one of the most powerful circuit-breakers there is. You don't have to explain. One word is enough.",
};

export async function POST(req: NextRequest) {
  const ip = getClientId(req);
  const rl = checkRateLimit(ip, "support"); // higher limit — this is emergency use
  if (!rl.ok) return NextResponse.json(FALLBACK); // always respond in emergency

  const body = await req.json() as SOSRequest;
  if (!isConfigured()) return NextResponse.json(FALLBACK);

  const { habit, urgeLevel, situation, timeOfDay, location } = body;

  // Get real local crisis resources to include in the response
  const localResources = formatResourcesForAI(location || "MT");

  const prompt = `EMERGENCY: Someone is fighting a strong urge RIGHT NOW.

${localResources}

Use the real numbers above when referring someone to professional help. Always cite the actual organisation name and number.

Habit they're fighting: ${habit}
Urge intensity: ${urgeLevel}/10
${situation ? `What's happening: "${situation}"` : ""}
${timeOfDay ? `Time of day: ${timeOfDay}` : ""}

Give them immediate, practical, real-time support. Fast. Warm. Direct. They need steps they can start in the next 30 seconds.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    return NextResponse.json(JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim()));
  } catch {
    return NextResponse.json(FALLBACK); // always respond in emergency
  }
}
