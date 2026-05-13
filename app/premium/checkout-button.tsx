"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({ tier, highlighted }: { tier: string; highlighted?: boolean }) {
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  async function handleClick() {
    if (!isSignedIn) {
      openSignIn({ fallbackRedirectUrl: "/premium" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Could not connect to payment server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      variant={highlighted ? "gradient" : "outline"}
      size="sm"
      className="w-full"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
      ) : (
        <>Start {tier} <ArrowRight className="h-3.5 w-3.5" /></>
      )}
    </Button>
  );
}
