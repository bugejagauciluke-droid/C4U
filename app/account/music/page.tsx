import { Music, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PLAYLISTS = [
  {
    title: "Deep Calm",        tag: "Anxiety relief",   duration: "2h 14m", tracks: 18, gradient: "from-sky-400 to-blue-600",
    desc: "Slow, minimal ambient music to quiet a racing mind.",
    colors: ["bg-sky-200", "bg-blue-300", "bg-sky-300"],
  },
  {
    title: "Inner Warmth",     tag: "Loneliness",       duration: "1h 48m", tracks: 14, gradient: "from-rose-400 to-pink-600",
    desc: "Warm, gentle piano and strings for when you need to feel held.",
    colors: ["bg-rose-200", "bg-pink-300", "bg-rose-300"],
  },
  {
    title: "Clear Focus",      tag: "Productivity",     duration: "3h 02m", tracks: 24, gradient: "from-teal-400 to-emerald-600",
    desc: "Flow-state music to help you concentrate when overwhelmed.",
    colors: ["bg-teal-200", "bg-emerald-300", "bg-teal-300"],
  },
  {
    title: "Gentle Mornings",  tag: "Morning routine",  duration: "1h 22m", tracks: 11, gradient: "from-amber-400 to-orange-500",
    desc: "Soft, hopeful music to start the day with intention.",
    colors: ["bg-amber-200", "bg-orange-300", "bg-amber-300"],
  },
  {
    title: "Let It Out",       tag: "Grief & loss",     duration: "1h 55m", tracks: 15, gradient: "from-slate-500 to-gray-700",
    desc: "Music that makes space for sadness — because sometimes you need to feel it.",
    colors: ["bg-slate-200", "bg-gray-300", "bg-slate-300"],
  },
  {
    title: "Confidence",       tag: "Self-worth",       duration: "1h 30m", tracks: 12, gradient: "from-violet-500 to-purple-700",
    desc: "Uplifting, empowering sounds to reconnect with your strength.",
    colors: ["bg-violet-200", "bg-purple-300", "bg-violet-300"],
  },
  {
    title: "Sleep Drift",      tag: "Sleep",            duration: "4h 10m", tracks: 20, gradient: "from-indigo-600 to-violet-900",
    desc: "Ultra-slow, sleep-inducing soundscapes for restless nights.",
    colors: ["bg-indigo-200", "bg-violet-300", "bg-indigo-300"],
  },
  {
    title: "Breathe Through",  tag: "Breathing",        duration: "58m",    tracks: 8,  gradient: "from-fuchsia-400 to-purple-600",
    desc: "Music timed to guided breathing patterns for instant calm.",
    colors: ["bg-fuchsia-200", "bg-purple-300", "bg-fuchsia-300"],
  },
];

export default function MusicPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
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

      <div className="grid sm:grid-cols-2 gap-4">
        {PLAYLISTS.map((p) => (
          <div key={p.title} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
            {/* Album art placeholder */}
            <div className={`h-28 bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 flex items-end p-4">
                <div className="flex gap-1.5">
                  {p.colors.map((c, i) => (
                    <div key={i} className={`h-8 w-1.5 rounded-full ${c} opacity-60`} style={{ height: `${20 + i * 8}px` }} />
                  ))}
                  {p.colors.map((c, i) => (
                    <div key={`b${i}`} className={`h-8 w-1.5 rounded-full ${c} opacity-40`} style={{ height: `${32 - i * 6}px` }} />
                  ))}
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="text-[10px] bg-white/90">{p.tag}</Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="font-bold mb-1">{p.title}</p>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{p.desc}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.duration}</span>
                <span>{p.tracks} tracks</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
        <Music className="h-6 w-6 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">New playlists added every week</p>
        <p className="text-xs mt-1">Streaming integration coming in the next update</p>
      </div>
    </div>
  );
}
