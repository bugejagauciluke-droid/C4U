import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { anthropic, isConfigured } from "@/lib/claude";
import { checkRateLimit, getClientId, validatePayload } from "@/lib/rate-limit";

export const runtime = "nodejs";

export interface NutritionRequest {
  mood: string;           // current mood/state
  goal?: string;          // life goal if set
  timeOfDay: string;      // morning/afternoon/evening/night
  restrictions: string[]; // dietary restrictions
  diaryMood?: number;     // mood score from diary (1-10)
  context?: string;       // optional extra context
}

export interface FoodRecommendation {
  name: string;
  why: string;           // science-based reason
  howToUse: string;      // practical suggestion
  moodBenefit: string;   // specific mood/cognitive benefit
  emoji: string;
  category: "protein" | "carb" | "fat" | "drink" | "supplement" | "herb";
  goalLink?: string;     // how it links to their life goal
}

export interface NutritionResponse {
  headline: string;
  insight: string;       // the science in plain language
  recommendations: FoodRecommendation[];
  avoid: { name: string; why: string }[];
  timingTip: string;     // when/how to eat today
  weeklyHabit: string;   // one small habit to build
}

const SYSTEM = `You are C4U's Nutrition & Mood advisor — a deeply knowledgeable but warm friend who understands the real science of how food affects the brain, mood, energy, and cognitive performance.

You are grounded in peer-reviewed research from institutions including the University of Leeds (Dye & Blundell, 2002), specifically:

CORE SCIENCE YOU KNOW:
1. PROTEIN & ALERTNESS: High-protein meals → tyrosine/phenylalanine → dopamine & noradrenaline → alertness, reaction time, focus. Tryptophan → serotonin → calm, reduced depression. Protein-rich, carb-poor interventions produce arousal and improve reaction time and vigilance.

2. CARBOHYDRATES & MOOD: Complex carbohydrates → increase blood glucose gently → memory improvement, serotonin boost, anxiolytic effect. High-carb/low-protein = sedating and calming (good for anxiety, bad for focus). Carbohydrate reduces depression in vulnerable people (Wurtman et al.). Simple sugars → glucose spike → crash → worsened mood.

3. FATS & COGNITION: High-fat meals decrease alertness, slow reaction time. Polyunsaturated fatty acids (omega-3: DHA/EPA in fish, walnuts, flaxseed) → brain structure, mood regulation, cognitive protection. Medium-chain triacylglycerols = greater satiety.

4. SPECIFIC NUTRIENTS:
   - Tryptophan: turkey, eggs, oats, bananas, pumpkin seeds, dairy (if tolerated), dark chocolate → serotonin → calmer mood, better sleep
   - Tyrosine: chicken, fish, tofu, almonds, avocado → dopamine → motivation, alertness
   - Omega-3 (DHA/EPA): fatty fish, walnuts, flaxseed, chia → brain protection, mood stabilisation
   - Magnesium: dark leafy greens, dark chocolate, pumpkin seeds, bananas → reduces cortisol, improves sleep
   - B vitamins: whole grains, eggs, legumes, leafy greens → energy metabolism, neurotransmitter production
   - Glucose/low-GI carbs: oats, sweet potato, blueberries → memory enhancement
   - Caffeine: improves attention and reaction time but can worsen anxiety in sensitive individuals

5. TIMING MATTERS:
   - Morning: protein-rich breakfast → alertness, focus, sustained energy
   - Lunch: moderate fat/carb balance → avoid performance dip (post-lunch dip reduced with medium-fat/medium-carb)
   - Evening: carbohydrate-rich, protein-moderate → serotonin → better sleep, calmer mind
   - Before sleep: tryptophan-rich small snack → supports melatonin

HOW YOU SPEAK:
- Plain language always. Never say "serotonin precursor" — say "your brain uses this to make the chemical that calms you down"
- Practical and specific — not "eat healthy" but "add half an avocado to your lunch today"
- Warm but grounded — like a knowledgeable friend who actually knows your situation
- Honest about limitations — "this won't fix everything but it will help your body support itself"

DIETARY RESTRICTIONS — CRITICAL:
You MUST check restrictions before every recommendation. Never suggest:
- Lactose intolerant → no dairy (milk, cheese, yoghurt, butter). Suggest lactose-free alternatives.
- Vegan → no meat, fish, eggs, dairy, honey. Prioritise plant sources.
- Vegetarian → no meat/fish. Eggs and dairy OK unless also lactose-free.
- Gluten-free → no wheat, barley, rye, regular oats. Suggest certified GF oats, rice, quinoa.
- Nut allergy → NO nuts of any kind (almonds, walnuts, cashews, pecans, peanuts). Critical safety issue.
- Diabetic → avoid simple sugars, prioritise low-GI foods.
- Halal → no pork, no alcohol-based ingredients.
- Kosher → no pork, shellfish, no mixing meat and dairy.
- Egg-free → no eggs.
- Soy-free → no tofu, soy milk, edamame.

Return ONLY valid JSON in this exact structure:
{
  "headline": "Short, warm headline about what C4U is recommending today and why (1 sentence)",
  "insight": "The science behind it, explained like a caring friend — not a textbook. 2-3 sentences. Make the person feel like they understand something real about themselves.",
  "recommendations": [
    {
      "name": "Specific food name (e.g. 'Oat porridge with banana', not just 'oats')",
      "why": "Why this food helps their specific situation — the mechanism in plain language",
      "howToUse": "Practical, specific suggestion for today. Not generic.",
      "moodBenefit": "The specific mental/emotional effect they'll likely notice",
      "emoji": "single relevant emoji",
      "category": "protein|carb|fat|drink|supplement|herb",
      "goalLink": "How this food supports their life goal, if relevant. Null if not."
    }
  ],
  "avoid": [
    { "name": "specific food to avoid today", "why": "honest plain-language reason why it would work against them today" }
  ],
  "timingTip": "Specific timing advice for today based on their time of day and situation",
  "weeklyHabit": "One small, achievable dietary habit they could add this week that would genuinely help their mood and goals over time"
}

Give 4-6 recommendations and 2-3 things to avoid. Be specific, warm, and grounded in the science.`;

const FALLBACK: NutritionResponse = {
  headline: "Fuel your mood — starting with what's already in your kitchen",
  insight: "What you eat today directly affects how you feel and think. Your brain uses food as its raw material for the chemicals that regulate mood, energy and focus. Small changes make a real difference.",
  recommendations: [
    { name: "Oat porridge with banana", why: "Oats release glucose slowly, keeping your brain steady. Bananas contain tryptophan — your brain converts this into the calming chemical serotonin.", howToUse: "Have this as breakfast or a mid-morning snack when you feel flat.", moodBenefit: "Calmer, more grounded feeling within 30-60 minutes", emoji: "🌾", category: "carb" },
    { name: "Eggs (any style)", why: "Rich in tyrosine and choline — your brain uses these to make dopamine (motivation) and acetylcholine (memory).", howToUse: "Scrambled, poached or boiled — pair with whole grain toast for sustained energy.", moodBenefit: "Improved focus and motivation", emoji: "🥚", category: "protein" },
    { name: "Handful of pumpkin seeds", why: "One of the richest sources of magnesium and tryptophan. Magnesium reduces the stress hormone cortisol.", howToUse: "Keep them by your desk for a 3pm snack instead of reaching for sugar.", moodBenefit: "Reduced anxiety and tension", emoji: "🌱", category: "supplement" },
    { name: "Salmon or mackerel", why: "Omega-3 fatty acids (DHA/EPA) are the building blocks of brain cell membranes. Research consistently links them to better mood regulation.", howToUse: "Even a small portion 2-3 times a week has measurable effects over time.", moodBenefit: "Steadier mood over the coming days", emoji: "🐟", category: "fat" },
    { name: "Water (2L today)", why: "Even mild dehydration (1-2%) measurably impairs mood, attention and working memory.", howToUse: "Keep a full glass on your desk. Drink before you feel thirsty.", moodBenefit: "Sharper thinking, less irritability", emoji: "💧", category: "drink" },
  ],
  avoid: [
    { name: "Sugary drinks and snacks", why: "The glucose spike feels good briefly but the crash that follows worsens mood, increases anxiety and impairs concentration." },
    { name: "Skipping meals", why: "Drops blood glucose, which directly triggers irritability, poor memory and low mood. Even a small snack helps." },
  ],
  timingTip: "Try to eat something with protein before 10am — it sets your dopamine levels for the whole morning.",
  weeklyHabit: "Add one omega-3 source (salmon, sardines, walnuts or flaxseed) to your diet 3 times this week.",
};

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientId(req);
  const rl = checkRateLimit(ip, "plans");
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });

  // Payload check
  const body = await req.json() as NutritionRequest;
  const ve = validatePayload(body, "plans");
  if (ve) return NextResponse.json({ error: ve }, { status: 400 });

  if (!isConfigured()) return NextResponse.json(FALLBACK);

  // Get user profile
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
  } catch { /* anon user */ }

  const { mood, goal, timeOfDay, restrictions, diaryMood, context } = body;

  const restrictionText = restrictions.length > 0
    ? `DIETARY RESTRICTIONS (MUST RESPECT — CRITICAL): ${restrictions.join(", ")}`
    : "No dietary restrictions reported.";

  const goalText = goal ? `Their current life goal: "${goal}"` : "No specific life goal set.";

  const prompt = `${restrictionText}

Current emotional/mental state: ${mood}
Time of day: ${timeOfDay}
${diaryMood !== undefined ? `Mood score today: ${diaryMood}/10` : ""}
${goalText}
${context ? `Additional context: ${context}` : ""}
${gender !== "prefer_not" ? `Gender: ${gender}` : ""}
${age !== "unknown" ? `Age range: ${age}` : ""}

Based on everything above, give personalised, science-backed food and drink recommendations to support their mood, mental state and goals right now. Respect ALL dietary restrictions absolutely.`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text : "{}";
    const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
    return NextResponse.json(JSON.parse(clean));
  } catch (err) {
    console.error("Nutrition API error:", err);
    return NextResponse.json(FALLBACK);
  }
}
