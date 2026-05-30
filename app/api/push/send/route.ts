import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getStore } from "@netlify/blobs";

export const runtime = "nodejs";

webpush.setVapidDetails(
  "mailto:landbandg@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  // Admin-only: require secret header
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, url = "/" } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const payload = JSON.stringify({ title, body, url });

  try {
    const store = getStore({ name: "push-subscriptions", consistency: "strong" });
    const { blobs } = await store.list();

    let sent = 0;
    let failed = 0;

    await Promise.allSettled(
      blobs.map(async ({ key }) => {
        try {
          const data = await store.get(key, { type: "json" }) as { subscription: webpush.PushSubscription };
          if (data?.subscription) {
            await webpush.sendNotification(data.subscription, payload);
            sent++;
          }
        } catch (err: unknown) {
          failed++;
          // Remove invalid/expired subscriptions
          if ((err as { statusCode?: number }).statusCode === 410) {
            await store.delete(key).catch(() => {});
          }
        }
      })
    );

    return NextResponse.json({ ok: true, sent, failed, total: blobs.length });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

// GET: count subscribers
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const store = getStore({ name: "push-subscriptions", consistency: "strong" });
    const { blobs } = await store.list();
    return NextResponse.json({ subscribers: blobs.length });
  } catch {
    return NextResponse.json({ subscribers: 0 });
  }
}
