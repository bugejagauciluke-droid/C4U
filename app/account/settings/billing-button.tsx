"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";

export function BillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Could not open billing portal. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity font-medium disabled:opacity-50">
      {loading
        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening…</>
        : <>Manage billing <ArrowRight className="h-3.5 w-3.5" /></>}
    </button>
  );
}
