/**
 * Terra API — OAuth widget session generator
 * Terra connects Apple Health, Samsung Health, Fitbit, Garmin, Polar,
 * Oura, Whoop, and 50+ wearable platforms via a single OAuth flow.
 *
 * Setup:
 * 1. Sign up at developer.tryterra.co (free tier: 15 users)
 * 2. Add TERRA_API_KEY and TERRA_DEV_ID to Netlify env vars
 *
 * Docs: https://docs.tryterra.co/reference/generate-authentication-token
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const TERRA_API_KEY = process.env.TERRA_API_KEY;
  const TERRA_DEV_ID  = process.env.TERRA_DEV_ID;

  if (!TERRA_API_KEY || !TERRA_DEV_ID) {
    return NextResponse.json({
      error: "Terra not configured",
      setup: "Add TERRA_API_KEY and TERRA_DEV_ID to Netlify environment variables. Get free keys at developer.tryterra.co",
    }, { status: 503 });
  }

  try {
    // Generate a Terra widget session — this creates an OAuth URL
    // the user visits to connect their wearable
    const res = await fetch("https://api.tryterra.co/v2/auth/generateWidgetSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TERRA_API_KEY,
        "dev-id": TERRA_DEV_ID,
      },
      body: JSON.stringify({
        reference_id: userId,        // links Terra user to our Clerk user
        language: "EN",
        show_disconnect: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Terra API error:", err);
      return NextResponse.json({ error: "Failed to create Terra session." }, { status: 500 });
    }

    const data = await res.json();
    // data.url = the OAuth widget URL the user should be redirected to
    return NextResponse.json({ url: data.url, session_id: data.session_id });
  } catch (err) {
    console.error("Terra route error:", err);
    return NextResponse.json({ error: "Network error connecting to Terra." }, { status: 500 });
  }
}
