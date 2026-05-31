/**
 * Crisis Resources — Real organisations, verified numbers
 * C4U's legal and ethical position: we support, we guide, we refer.
 * We never replace professional help. These resources are shown
 * prominently in all addiction/crisis/SOS contexts.
 *
 * Sources verified May 2025.
 */

export interface CrisisOrg {
  name: string;
  description: string;
  phone?: string;
  text?: string;
  web?: string;
  hours: string;
  type: "addiction" | "mental_health" | "emergency" | "general" | "domestic";
  free: boolean;
}

export interface CountryResources {
  country: string;
  code: string;         // ISO 2-letter
  emergency: string;    // emergency number
  orgs: CrisisOrg[];
}

// ── MALTA (primary market) ────────────────────────────────────────────────────
export const MALTA: CountryResources = {
  country: "Malta",
  code: "MT",
  emergency: "112",
  orgs: [
    {
      name: "Agenzija SEDQA",
      description: "Malta's national agency against drug and alcohol abuse. Free counselling, treatment, rehabilitation. The main government service for substance use.",
      phone: "179",
      web: "https://sedqa.gov.mt",
      hours: "24/7 helpline",
      type: "addiction",
      free: true,
    },
    {
      name: "Caritas Malta — Addiction Services",
      description: "Confidential counselling and residential rehabilitation for people with substance use problems. Faith-based but open to all.",
      phone: "2590 3500",
      web: "https://caritasmalta.org",
      hours: "Mon–Fri 8am–5pm",
      type: "addiction",
      free: true,
    },
    {
      name: "Oasis — Therapeutic Community",
      description: "Residential rehabilitation programme in Malta for people with serious drug dependency. Long-term recovery support.",
      phone: "2157 0034",
      web: "https://oasismalta.org",
      hours: "Office hours — call for intake",
      type: "addiction",
      free: true,
    },
    {
      name: "Richmond Foundation Malta",
      description: "Mental health support, counselling and crisis intervention. Also supports families affected by addiction.",
      phone: "2122 4443",
      web: "https://richmond.org.mt",
      hours: "Mon–Fri 8:30am–4:30pm",
      type: "mental_health",
      free: true,
    },
    {
      name: "Supportline Malta",
      description: "Free, confidential emotional support helpline for anyone in distress, including addiction struggles.",
      phone: "179",
      hours: "24/7",
      type: "general",
      free: true,
    },
    {
      name: "Emergency Services Malta",
      description: "For life-threatening emergencies — overdose, unconsciousness, acute crisis.",
      phone: "112",
      hours: "24/7",
      type: "emergency",
      free: true,
    },
    {
      name: "AĠENZIJA APPOĠĠ",
      description: "Government social welfare agency — support for families, children, domestic situations and crisis intervention.",
      phone: "179",
      web: "https://agenzijappogg.gov.mt",
      hours: "24/7 helpline",
      type: "general",
      free: true,
    },
  ],
};

// ── UNITED KINGDOM ─────────────────────────────────────────────────────────────
export const UK: CountryResources = {
  country: "United Kingdom",
  code: "GB",
  emergency: "999",
  orgs: [
    {
      name: "FRANK",
      description: "UK government drug information and addiction support service. Non-judgmental, free, confidential.",
      phone: "0300 123 6600",
      text: "Text 82111",
      web: "https://talktofrank.com",
      hours: "24/7",
      type: "addiction",
      free: true,
    },
    {
      name: "Samaritans",
      description: "Free emotional support for anyone in distress, struggling, or at risk. Available any time.",
      phone: "116 123",
      web: "https://samaritans.org",
      hours: "24/7",
      type: "general",
      free: true,
    },
    {
      name: "Change Grow Live (CGL)",
      description: "UK's largest drug and alcohol support charity. Local services across England and Wales.",
      web: "https://cgl.org.uk",
      hours: "Mon–Fri — varies by location",
      type: "addiction",
      free: true,
    },
    {
      name: "Alcoholics Anonymous UK",
      description: "Peer support for alcohol dependency. Meetings across the UK, available to anyone.",
      phone: "0800 9177 650",
      web: "https://alcoholics-anonymous.org.uk",
      hours: "24/7 helpline",
      type: "addiction",
      free: true,
    },
    {
      name: "Crisis Text Line UK",
      description: "Text-based crisis support — good for when you can't speak out loud.",
      text: "Text SHOUT to 85258",
      hours: "24/7",
      type: "general",
      free: true,
    },
    {
      name: "Narcotics Anonymous UK",
      description: "Peer support for drug dependency. Meetings available across the UK.",
      phone: "0300 999 1212",
      web: "https://ukna.org",
      hours: "24/7 helpline",
      type: "addiction",
      free: true,
    },
  ],
};

// ── IRELAND ────────────────────────────────────────────────────────────────────
export const IRELAND: CountryResources = {
  country: "Ireland",
  code: "IE",
  emergency: "112",
  orgs: [
    {
      name: "Samaritans Ireland",
      description: "Free 24/7 emotional support — available any time, any reason.",
      phone: "116 123",
      web: "https://samaritans.org",
      hours: "24/7",
      type: "general",
      free: true,
    },
    {
      name: "HSE Drug and Alcohol Helpline",
      description: "Government drug and alcohol support service. Free, confidential.",
      phone: "1800 459 459",
      web: "https://hse.ie",
      hours: "Mon–Fri 9:30am–5:30pm",
      type: "addiction",
      free: true,
    },
    {
      name: "Alcoholics Anonymous Ireland",
      description: "Peer support for alcohol dependency.",
      phone: "01 842 0700",
      web: "https://alcoholicsanonymous.ie",
      hours: "24/7 helpline",
      type: "addiction",
      free: true,
    },
  ],
};

// ── ITALY ──────────────────────────────────────────────────────────────────────
export const ITALY: CountryResources = {
  country: "Italy",
  code: "IT",
  emergency: "112",
  orgs: [
    {
      name: "Telefono Amico",
      description: "Emotional support helpline — available for anyone in crisis.",
      phone: "02 2327 2327",
      web: "https://telefonoamico.it",
      hours: "10am–10pm daily",
      type: "general",
      free: true,
    },
    {
      name: "Numero Verde Droga e Alcol",
      description: "National drug and alcohol helpline — free, anonymous.",
      phone: "800 274 274",
      hours: "24/7",
      type: "addiction",
      free: true,
    },
    {
      name: "Telefono Azzurro",
      description: "Support line for vulnerable individuals including those with addiction.",
      phone: "19696",
      web: "https://azzurro.it",
      hours: "24/7",
      type: "general",
      free: true,
    },
  ],
};

// ── INTERNATIONAL FALLBACK ─────────────────────────────────────────────────────
export const INTERNATIONAL: CountryResources = {
  country: "International",
  code: "INT",
  emergency: "112",
  orgs: [
    {
      name: "Crisis Text Line",
      description: "Text-based crisis support — works in many countries.",
      text: "Text HOME to 741741",
      web: "https://crisistextline.org",
      hours: "24/7",
      type: "general",
      free: true,
    },
    {
      name: "Befrienders Worldwide",
      description: "Emotional support available in 32 countries. Find your local Samaritans equivalent.",
      web: "https://befrienders.org",
      hours: "Varies by country",
      type: "general",
      free: true,
    },
    {
      name: "Alcoholics Anonymous (International)",
      description: "Peer support for alcohol dependency — groups in almost every country.",
      web: "https://aa.org",
      hours: "Varies by location",
      type: "addiction",
      free: true,
    },
    {
      name: "Narcotics Anonymous (International)",
      description: "Peer support for drug dependency worldwide.",
      web: "https://na.org",
      hours: "Varies by location",
      type: "addiction",
      free: true,
    },
    {
      name: "Emergency Services",
      description: "If life is at risk — call emergency services immediately.",
      phone: "112 (EU) / 999 (UK) / 911 (USA)",
      hours: "24/7",
      type: "emergency",
      free: true,
    },
  ],
};

// ── Country lookup ─────────────────────────────────────────────────────────────
const COUNTRY_MAP: Record<string, CountryResources> = {
  MT: MALTA,
  GB: UK,
  UK: UK,
  IE: IRELAND,
  IT: ITALY,
};

export function getResources(location?: string): CountryResources {
  if (!location) return MALTA; // default to Malta (primary market)
  const upper = location.toUpperCase();

  // Check direct code match
  if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper];

  // Check country name
  if (upper.includes("MALTA") || upper.includes("MALTESE")) return MALTA;
  if (upper.includes("UK") || upper.includes("BRITAIN") || upper.includes("ENGLAND") || upper.includes("SCOTLAND")) return UK;
  if (upper.includes("IRELAND") || upper.includes("IRISH")) return IRELAND;
  if (upper.includes("ITALY") || upper.includes("ITALIAN")) return ITALY;

  return INTERNATIONAL;
}

/** Get addiction-specific orgs only */
export function getAddictionResources(location?: string): CrisisOrg[] {
  const resources = getResources(location);
  return resources.orgs.filter(o => o.type === "addiction" || o.type === "emergency");
}

/** Format for display in system prompt */
export function formatResourcesForAI(location?: string): string {
  const r = getResources(location);
  const lines = [`CRISIS RESOURCES FOR ${r.country.toUpperCase()} (Emergency: ${r.emergency}):`];
  r.orgs.forEach(o => {
    let line = `• ${o.name}: ${o.description.slice(0, 80)}`;
    if (o.phone) line += ` | Call: ${o.phone}`;
    if (o.text) line += ` | Text: ${o.text}`;
    line += ` | ${o.hours}`;
    lines.push(line);
  });
  return lines.join("\n");
}
