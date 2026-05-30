"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

const DISMISSED_KEY = "c4u_push_dismissed";

export function PWAInit() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [reg, setReg]               = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((r) => {
        setReg(r);
      }).catch(() => {});
    }

    // Show push prompt after 30 seconds if not dismissed and not already granted
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const t = setTimeout(() => setShowPrompt(true), 30_000);
    return () => clearTimeout(t);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted" && reg) {
      // Subscribe to push (requires VAPID key in production)
      // For now just show a local test notification
      reg.showNotification("C4U is here for you 💙", {
        body: "You'll now get gentle check-ins and daily challenge reminders.",
        icon: "/icon-192.png",
      });
    }
    setShowPrompt(false);
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShowPrompt(false);
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-sm mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-4 pointer-events-auto border border-slate-700">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Stay on track</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Get your daily challenge reminder and gentle check-ins from C4U.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestPermission}
                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-xs font-semibold transition-colors"
              >
                Yes, notify me
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={dismiss} className="text-slate-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
