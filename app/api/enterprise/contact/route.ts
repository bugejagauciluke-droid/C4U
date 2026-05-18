import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface EnterpriseEnquiry {
  id: string;
  submittedAt: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  companySize: string;
  industry: string;
  challenges: string[];
  requirements: string;
  demoPreference: "call" | "email";
  status: "new" | "contacted" | "proposal_sent" | "closed";
}

const LEADS_PATH = path.join(process.cwd(), "data/enterprise-leads.json");

function readLeads(): EnterpriseEnquiry[] {
  try {
    const dir = path.dirname(LEADS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LEADS_PATH)) return [];
    return JSON.parse(fs.readFileSync(LEADS_PATH, "utf8")) as EnterpriseEnquiry[];
  } catch {
    return [];
  }
}

function saveLeads(leads: EnterpriseEnquiry[]): void {
  const dir = path.dirname(LEADS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2), "utf8");
}

async function notifyWebhook(enquiry: EnterpriseEnquiry): Promise<void> {
  const webhookUrl = process.env.ENTERPRISE_WEBHOOK_URL;
  if (!webhookUrl) return;

  // Slack / Discord / Teams compatible message
  const text = [
    `🏢 *New Enterprise Enquiry*`,
    `*Company:* ${enquiry.companyName} (${enquiry.companySize} employees)`,
    `*Contact:* ${enquiry.contactName} — ${enquiry.contactEmail}`,
    `*Industry:* ${enquiry.industry || "Not specified"}`,
    `*Challenges:* ${enquiry.challenges.length ? enquiry.challenges.join(", ") : "Not specified"}`,
    `*Preference:* ${enquiry.demoPreference === "call" ? "Demo call" : "Email proposal"}`,
    enquiry.requirements ? `*Notes:* ${enquiry.requirements}` : null,
  ].filter(Boolean).join("\n");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).catch(() => {
    // Non-fatal — lead is already saved
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactName, contactEmail, companyName, companySize } = body;

    if (!contactName || !contactEmail || !companyName || !companySize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const enquiry: EnterpriseEnquiry = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      submittedAt: new Date().toISOString(),
      contactName,
      contactEmail,
      companyName,
      companySize,
      industry: body.industry ?? "",
      challenges: body.challenges ?? [],
      requirements: body.requirements ?? "",
      demoPreference: body.demoPreference ?? "call",
      status: "new",
    };

    // Save to file (works locally + persistent Netlify deployments)
    try {
      const leads = readLeads();
      leads.unshift(enquiry);
      saveLeads(leads);
    } catch {
      // On read-only filesystems (e.g. Netlify serverless), skip file save
      // Webhook notification is the primary alert mechanism
    }

    // Notify via webhook (Slack, Discord, Teams, Make, Zapier — any webhook URL)
    await notifyWebhook(enquiry);

    console.log(`✓ Enterprise enquiry from ${companyName} (${contactEmail})`);
    return NextResponse.json({ ok: true, id: enquiry.id });
  } catch (err) {
    console.error("Enterprise contact error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET — list all leads (for internal admin use)
export async function GET(req: NextRequest) {
  // Very basic auth — check for admin secret header
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = readLeads();
  return NextResponse.json({ leads, total: leads.length });
}
