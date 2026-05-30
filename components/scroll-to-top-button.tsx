"use client";

import { Heart } from "lucide-react";

export function ScrollToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-violet-600 text-white font-bold text-base shadow-xl hover:opacity-90 transition-opacity"
    >
      <Heart className="h-5 w-5 fill-white" /> Talk to C4U now
    </button>
  );
}
