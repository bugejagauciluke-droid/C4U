import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data/site.config.json");

export interface SituationConfig {
  id: string;
  title: string;
  subtitle: string;
  placeholder: string;
  gradient: string;
}

export interface SubscriptionTier {
  name: string;
  price: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
}

export interface SiteConfig {
  branding: {
    appName: string;
    tagline: string;
    heroBadge: string;
    footerText: string;
  };
  landing: {
    heroHeadline: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    howItWorksTitle: string;
    steps: { title: string; desc: string }[];
  };
  support: {
    pageHeadline: string;
    pageSubtitle: string;
    situations: SituationConfig[];
    pricingHeadline: string;
    price: string;
    pricingSubtext: string;
  };
  subscription: {
    tiers: SubscriptionTier[];
    freeTrialText: string;
    footerNote: string;
  };
}

export const DEFAULT_CONFIG: SiteConfig = {
  branding: {
    appName: "C4U",
    tagline: "Care For You — when you need it most",
    heroBadge: "Free emotional support · No sign-up needed",
    footerText: "C4U — Care For You. Always here.",
  },
  landing: {
    heroHeadline: "You don't have to feel this alone.",
    heroSubtitle:
      "Tell C4U what's happening. In seconds, you'll have personalised exercises to help you through it — wherever you are, whatever you're feeling.",
    ctaPrimary: "Get support now — it's free",
    ctaSecondary: "See how it works",
    howItWorksTitle: "Three steps to feeling better",
    steps: [
      {
        title: "Tell us what's happening",
        desc: "Pick your situation or just type freely. No judgment. No forms. No sign-up required.",
      },
      {
        title: "Get personalised exercises",
        desc: "C4U reads your situation and returns 4–5 exercises you can do in the next few minutes, wherever you are.",
      },
      {
        title: "Feel steadier, step by step",
        desc: "Premium members also get guided meditations, healing music, an AI companion, and a personalised daily plan.",
      },
    ],
  },
  support: {
    pageHeadline: "You don't have to feel this alone.",
    pageSubtitle:
      "Tell me what's happening. I'll find exercises you can do right now — wherever you are — to help you through it.",
    situations: [
      {
        id: "lonely-crowd",
        title: "Lonely in a crowd",
        subtitle: "Surrounded by people but feeling invisible or disconnected",
        placeholder:
          "Tell me what's happening... Are you at an event, a party, a family gathering? What does the loneliness feel like right now?",
        gradient: "from-indigo-500 to-violet-700",
      },
      {
        id: "loss-heartbreak",
        title: "Loss or heartbreak",
        subtitle: "Divorce, breakup, grief, or a relationship ending",
        placeholder:
          "Tell me what's happening... How long ago did this start? What's the hardest part right now?",
        // rose→pink softened: healing warmth — not too intense for grief/loss context
        gradient: "from-rose-400 to-pink-600",
      },
      {
        id: "job-career",
        title: "Work & career pain",
        subtitle: "Job loss, workplace stress, or feeling stuck professionally",
        placeholder:
          "Tell me what's happening... When did this start? What are you most worried about right now?",
        // amber→emerald: growth + hope vs amber→orange (orange raises cortisol)
        gradient: "from-amber-500 to-emerald-600",
      },
      {
        id: "social-pressure",
        title: "Pressure to perform",
        subtitle: "Expected to be 'on' but feeling flat or disconnected",
        placeholder:
          "Tell me what's happening... Who are you with? What's the expectation you're feeling?",
        // violet→indigo: calm confidence vs fuchsia→purple (fuchsia is over-stimulating)
        gradient: "from-violet-500 to-indigo-700",
      },
      {
        id: "overwhelmed",
        title: "Overwhelmed & anxious",
        subtitle: "Too much at once. Mind racing. Can't breathe.",
        placeholder:
          "Tell me what's happening... What's piling up? What does the anxiety feel like in your body right now?",
        // sky→blue: max parasympathetic activation — perfect for anxiety/overwhelm
        gradient: "from-sky-400 to-blue-600",
      },
      {
        id: "just-low",
        title: "Just feeling low",
        subtitle: "No specific reason. Empty. Heavy. You need support.",
        placeholder:
          "Tell me what's happening... You don't need to explain everything. Just share what you can.",
        // slate→indigo: CRITICAL change. Gray amplifies depressive mood (research).
        // Indigo = calm dignity, quiet hope — never dark gray for low mood cards.
        gradient: "from-slate-400 to-indigo-600",
      },
    ],
    pricingHeadline: "Go deeper with Premium",
    price: "10",
    pricingSubtext:
      "Cancel any time. Includes all meditations, music, an unlimited AI companion, and a personalized daily support plan.",
  },
  subscription: {
    tiers: [
      {
        name: "Base",
        price: "10",
        features: [
          "8 guided meditations (grief, anxiety, sleep & more)",
          "Healing & focus music library",
          "New content added every week",
          "AI support — type anything, get help instantly",
          "Always-on crisis resources",
        ],
      },
      {
        name: "Plus",
        price: "20",
        badge: "Most Popular",
        highlighted: true,
        features: [
          "Everything in Base",
          "AI Companion — unlimited, 24/7",
          "Voice mode — speak to C4U, it speaks back",
          "Personalised Daily Challenge + streaks",
          "Mental health conditions support (CBT/DBT/ACT)",
          "Grief support — evidence-based exercises",
          "Habit breaking + emergency SOS button",
          "Crisis detection & real-time emergency support",
        ],
      },
      {
        name: "Transform",
        price: "30",
        features: [
          "Everything in Plus",
          "Personalised 7-day support plans",
          "Daily Diary with AI reflection & insights",
          "Life Goals + personalised roadmap",
          "Nutrition & Mood — food-brain science",
          "Body & Mind Tracker — smartwatch sync",
          "Hourly → yearly milestone tracking",
          "Weekly life review letter",
          "Digital habits & screen time analysis",
        ],
      },
    ],
    freeTrialText: "7-day free trial · Full Transform access · Cancel anytime",
    footerNote: "Billed monthly in EUR. Cancel any time. No hidden fees.",
  },
};

export function readSiteConfig(): SiteConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return {
      branding: { ...DEFAULT_CONFIG.branding, ...parsed.branding },
      landing: {
        ...DEFAULT_CONFIG.landing,
        ...parsed.landing,
        steps: parsed.landing?.steps ?? DEFAULT_CONFIG.landing.steps,
      },
      support: {
        ...DEFAULT_CONFIG.support,
        ...parsed.support,
        situations:
          parsed.support?.situations ?? DEFAULT_CONFIG.support.situations,
      },
      subscription: {
        ...DEFAULT_CONFIG.subscription,
        ...parsed.subscription,
        tiers:
          parsed.subscription?.tiers ?? DEFAULT_CONFIG.subscription.tiers,
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function writeSiteConfig(config: SiteConfig): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}
