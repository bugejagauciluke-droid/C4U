"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export function DeleteAccountButton() {
  const { signOut } = useClerk();
  const [phase, setPhase]     = useState<"idle" | "confirm" | "loading" | "error">("idle");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");

  async function handleDelete() {
    if (confirm.toLowerCase() !== "delete") return;
    setPhase("loading");
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Deletion failed.");
      }
      // Account deleted — sign out and redirect to home
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }

  if (phase === "idle") {
    return (
      <button
        onClick={() => setPhase("confirm")}
        className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete my account
      </button>
    );
  }

  if (phase === "confirm") {
    return (
      <div className="space-y-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-rose-800">This cannot be undone.</p>
              <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                <li>Your account and all personal data will be permanently deleted</li>
                <li>Your subscription will be cancelled immediately</li>
                <li>Your diary, goals, and companion history will be erased</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">
            Type <strong>delete</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="delete"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={confirm.toLowerCase() !== "delete"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold disabled:opacity-40 hover:bg-rose-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Yes, delete my account
          </button>
          <button
            onClick={() => { setPhase("idle"); setConfirm(""); }}
            className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Deleting your account…
      </div>
    );
  }

  // error state
  return (
    <div className="space-y-3">
      <p className="text-sm text-rose-700">{error}</p>
      <button
        onClick={() => { setPhase("idle"); setConfirm(""); setError(""); }}
        className="text-xs text-muted-foreground underline hover:text-foreground"
      >
        Try again
      </button>
    </div>
  );
}
