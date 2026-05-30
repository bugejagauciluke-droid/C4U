import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const clerk = await clerkClient();

    // Delete the Clerk user — this cascades to all sessions and metadata
    await clerk.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: "Could not delete account. Please email landbandg@gmail.com for manual deletion." },
      { status: 500 }
    );
  }
}
