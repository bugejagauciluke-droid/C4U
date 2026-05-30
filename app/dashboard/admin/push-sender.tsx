"use client";

import { useState } from "react";
import { Bell, Send, Loader2, CheckCircle, Users } from "lucide-react";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "";

const TEMPLATES = [
  { label: "Daily challenge", title: "Your daily challenge is ready 💪", body: "Open C4U to see today's challenge. Small steps build big change.", url: "/account/challenge" },
  { label: "Check-in", title: "How are you doing? 💙", body: "C4U is here. Take a moment to check in with yourself today.", url: "/" },
  { label: "New meditation", title: "New meditation added ✨", body: "A new guided meditation is waiting for you in C4U.", url: "/account/meditations" },
  { label: "Weekend support", title: "Weekends can be hard too 🌿", body: "Whatever you're carrying — C4U is here. No sign-in needed.", url: "/" },
];

export function PushSender({ adminSecret }: { adminSecret: string }) {
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [url, setUrl]         = useState("/");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError]     = useState("");
  const [subscribers, setSubscribers] = useState<number | null>(null);

  async function loadSubscribers() {
    try {
      const res = await fetch("/api/push/send", { headers: { "x-admin-secret": adminSecret } });
      const data = await res.json();
      setSubscribers(data.subscribers ?? 0);
    } catch { setSubscribers(0); }
  }

  async function send() {
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({ title, body, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setTitle(""); setBody(""); setUrl("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Subscriber count */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" /> Push Notifications
        </h3>
        <button onClick={loadSubscribers} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Users className="h-3 w-3" />
          {subscribers === null ? "Check subscribers" : `${subscribers} subscribers`}
        </button>
      </div>

      {/* Quick templates */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map(t => (
          <button key={t.label} onClick={() => { setTitle(t.title); setBody(t.body); setUrl(t.url); }}
            className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-muted transition-colors">
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Notification title"
          className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Message body"
          rows={2}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Deep link (e.g. /account/challenge)"
          className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={send}
          disabled={loading || !title.trim() || !body.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? "Sending…" : "Send to all subscribers"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Sent to {result.sent}/{result.total} subscribers
          {result.failed > 0 && ` · ${result.failed} expired (cleaned up)`}
        </div>
      )}
      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>
      )}
    </div>
  );
}
