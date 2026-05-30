import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStore } from "@netlify/blobs";

export const runtime = "nodejs";

// Save a push subscription for a user
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const subscription = await req.json();

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  try {
    const store = getStore({ name: "push-subscriptions", consistency: "strong" });
    const key = userId ?? `anon-${Buffer.from(subscription.endpoint).toString("base64").slice(0, 16)}`;
    await store.setJSON(key, { subscription, userId, savedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    // Silently succeed — push is enhancement, not core feature
    return NextResponse.json({ ok: true });
  }
}

// Delete a subscription (unsubscribe)
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: true });

  try {
    const store = getStore({ name: "push-subscriptions", consistency: "strong" });
    await store.delete(userId);
  } catch { /* ignore */ }

  return NextResponse.json({ ok: true });
}
