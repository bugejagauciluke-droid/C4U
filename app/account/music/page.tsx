"use client";

import { useState } from "react";
import { Music, ExternalLink, Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Each playlist has a YouTube embed ID + a fallback Spotify link
// YouTube IDs are from publicly curated playlists matching the mood
const PLAYLISTS = [
  {
    title: "Deep Calm",
    tag: "Anxiety relief",
    duration: "2h+",
    gradient: "from-sky-400 to-blue-600",
    desc: "Slow, minimal ambient music to quiet a racing mind.",
    youtubeId: "1ZYbU82GVz4", // Relaxing ambient music
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY",
    colors: ["bg-sky-200", "bg-blue-300", "bg-sky-300"],
  },
  {
    title: "Inner Warmth",
    tag: "Loneliness",
    duration: "1h 48m",
    gradient: "from-rose-400 to-pink-600",
    desc: "Warm, gentle piano and strings for when you need to feel held.",
    youtubeId: "aLqc8TW8Bgc", // Emotional piano
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX7gIoKXt0gmx",
    colors: ["bg-rose-200", "bg-pink-300", "bg-rose-300"],
  },
  {
    title: "Clear Focus",
    tag: "Productivity",
    duration: "3h+",
    gradient: "from-teal-400 to-emerald-600",
    desc: "Flow-state music to help you concentrate when overwhelmed.",
    youtubeId: "jfKfPfyJRdk", // Lofi hip hop radio
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
    colors: ["bg-teal-200", "bg-emerald-300", "bg-teal-300"],
  },
  {
    title: "Gentle Mornings",
    tag: "Morning routine",
    duration: "1h 22m",
    gradient: "from-amber-400 to-orange-500",
    desc: "Soft, hopeful music to start the day with intention.",
    youtubeId: "g7BBcFcO8_Y", // Morning motivation
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX0UrRvztWcTL",
    colors: ["bg-amber-200", "bg-orange-300", "bg-amber-300"],
  },
  {
    title: "Let It Out",
    tag: "Grief & loss",
    duration: "1h 55m",
    gradient: "from-slate-500 to-gray-700",
    desc: "Music that makes space for sadness — because sometimes you need to feel it.",
    youtubeId: "hlWiI4xVXKY", // Melancholic piano
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX59NCqCqJtoH",
    colors: ["bg-slate-200", "bg-gray-300", "bg-slate-300"],
  },
  {
    title: "Confidence",
    tag: "Self-worth",
    duration: "1h 30m",
    gradient: "from-violet-500 to-purple-700",
    desc: "Uplifting, empowering sounds to reconnect with your strength.",
    youtubeId: "inpok4MKVLM", // Uplifting orchestral
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh",
    colors: ["bg-violet-200", "bg-purple-300", "bg-violet-300"],
  },
  {
    title: "Sleep Drift",
    tag: "Sleep",
    duration: "4h+",
    gradient: "from-indigo-600 to-violet-900",
    desc: "Ultra-slow, sleep-inducing soundscapes for restless nights.",
    youtubeId: "1vx8iUvfyCY", // Deep sleep music
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
    colors: ["bg-indigo-200", "bg-violet-300", "bg-indigo-300"],
  },
  {
    title: "Breathe Through",
    tag: "Breathing",
    duration: "58m",
    gradient: "from-fuchsia-400 to-purple-600",
    desc: "Music timed to guided breathing patterns for instant calm.",
    youtubeId: "O-6f5wQXSu8", // Calming breathing music
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa",
    colors: ["bg-fuchsia-200", "bg-purple-300", "bg-fuchsia-300"],
  },
];

export default function MusicPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Healing Music</h1>
            <p className="text-sm text-muted-foreground">Curated playlists for every emotional state — updated weekly</p>
          </div>
        </div>
      </div>

      {/* Active player */}
      {activeId && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-border shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full aspect-video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Music player"
          />
        </div>
      )}

      {/* Playlist grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {PLAYLISTS.map((p) => {
          const isActive = activeId === p.youtubeId;
          return (
            <div
              key={p.title}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              {/* Artwork */}
              <div
                className={`h-28 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}
                onClick={() => setActiveId(isActive ? null : p.youtubeId)}
              >
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="flex gap-1.5 items-end">
                    {p.colors.map((c, i) => (
                      <div key={i} className={`w-1.5 rounded-full ${c} opacity-60 ${isActive ? "animate-pulse" : ""}`}
                        style={{ height: `${20 + i * 8}px` }} />
                    ))}
                    {p.colors.map((c, i) => (
                      <div key={`b${i}`} className={`w-1.5 rounded-full ${c} opacity-40 ${isActive ? "animate-pulse" : ""}`}
                        style={{ height: `${32 - i * 6}px`, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-[10px] bg-white/90">{p.tag}</Badge>
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="h-5 w-5 text-gray-800 ml-0.5" />
                  </div>
                </div>
                {isActive && (
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[10px] font-bold text-white/90 bg-black/30 px-2 py-0.5 rounded-full">▶ Playing</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-bold mb-1">{p.title}</p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {p.duration}
                  </span>
                  <a
                    href={p.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" /> Spotify
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-5 text-center text-muted-foreground">
        <Music className="h-6 w-6 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">New playlists added every week</p>
        <p className="text-xs mt-1">Click any card to play · Also available on Spotify</p>
      </div>
    </div>
  );
}
