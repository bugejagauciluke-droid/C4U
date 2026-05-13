import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readSiteConfig, writeSiteConfig, type SiteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(readSiteConfig());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SiteConfig;
    writeSiteConfig(body);
    revalidatePath("/");
    revalidatePath("/support");
    revalidatePath("/premium");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("site-config error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
