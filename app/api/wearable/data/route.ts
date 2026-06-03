/**
 * Wearable data API — serves stored health data from Clerk metadata.
 * Terra webhook writes here. File imports write here.
 * The wearable dashboard reads from here.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { DailyHealthData } from "@/lib/wearable-types";

export const runtime = "nodejs";

// GET — retrieve user's stored wearable data
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;
    const data: DailyHealthData[] = (meta.wearableData as DailyHealthData[]) ?? [];
    const connected: string = (meta.wearablePlatform as string) ?? "";
    const lastSync: string  = (meta.wearableLastSync as string) ?? "";

    return NextResponse.json({ data, connected, lastSync });
  } catch (err) {
    console.error("Wearable data GET error:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

// POST — save/merge wearable data (used by file imports)
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { entries, platform }: { entries: DailyHealthData[]; platform: string } = await req.json();
    if (!entries?.length) return NextResponse.json({ error: "No entries provided" }, { status: 400 });

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;
    const existing: DailyHealthData[] = (meta.wearableData as DailyHealthData[]) ?? [];

    // Merge: server data wins for Terra-synced, import wins for file-imported
    const merged = [...existing];
    for (const entry of entries) {
      const idx = merged.findIndex(e => e.date === entry.date);
      if (idx >= 0) {
        // Only overwrite fields that have real values (don't blank out existing data)
        merged[idx] = {
          ...merged[idx],
          ...Object.fromEntries(Object.entries(entry).filter(([,v]) => v !== undefined && v !== null)),
        };
      } else {
        merged.push(entry);
      }
    }

    const trimmed = merged.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 90);

    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...meta,
        wearableData: trimmed,
        wearablePlatform: platform || meta.wearablePlatform,
        wearableLastSync: new Date().toISOString(),
      },
    });

    return NextResponse.json({ saved: trimmed.length, new: entries.length });
  } catch (err) {
    console.error("Wearable data POST error:", err);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
