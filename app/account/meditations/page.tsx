"use client";

import { useState, useRef, useEffect } from "react";
import { Headphones, Clock, Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MEDITATIONS = [
  { title: "Arrive in Your Body",      duration: "8 min",  tag: "Grounding", gradient: "from-teal-500 to-emerald-600",   desc: "A gentle body scan to bring you back to the present moment.",        file: "/audio/meditation-1.mp3" },
  { title: "Letting Go of the Day",    duration: "12 min", tag: "Release",   gradient: "from-indigo-500 to-violet-700",  desc: "Release tension and soften into rest at the end of a hard day.",     file: "/audio/meditation-2.mp3" },
  { title: "You Are Not Alone",        duration: "10 min", tag: "Connection",gradient: "from-rose-500 to-pink-600",      desc: "A loving-kindness practice for when loneliness feels heavy.",         file: "/audio/meditation-3.mp3" },
  { title: "Breathing Through It",     duration: "6 min",  tag: "Anxiety",   gradient: "from-sky-500 to-blue-600",       desc: "Calm an anxious mind with guided breathwork.",                        file: "/audio/meditation-4.mp3" },
  { title: "The Calm After the Storm", duration: "14 min", tag: "Grief",     gradient: "from-slate-500 to-gray-700",     desc: "A soft, compassionate practice for navigating grief and loss.",       file: "/audio/meditation-5.mp3" },
  { title: "Finding Ground",           duration: "9 min",  tag: "Overwhelm", gradient: "from-amber-500 to-orange-600",   desc: "When everything feels too much — come back to this.",                 file: "/audio/meditation-6.mp3" },
  { title: "Morning Intention",        duration: "7 min",  tag: "Morning",   gradient: "from-fuchsia-500 to-purple-700", desc: "Set a compassionate intention for the day ahead.",                    file: "/audio/meditation-7.mp3" },
  { title: "Rest Without Guilt",       duration: "15 min", tag: "Sleep",     gradient: "from-violet-600 to-indigo-800",  desc: "A slow, soothing practice to ease you into sleep.",                   file: "/audio/meditation-8.mp3" },
];

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function MeditationsPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [activeIndex]);

  function selectTrack(index: number) {
    if (activeIndex === index) {
      togglePlay();
      return;
    }
    setActiveIndex(index);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    }, 50);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  }

  function restart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => setPlaying(true)).catch(() => {});
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  }

  function toggleMute() {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
  }

  const active = activeIndex !== null ? MEDITATIONS[activeIndex] : null;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Guided Meditations</h1>
            <p className="text-sm text-muted-foreground">Tailored to what you're going through — available anytime</p>
          </div>
        </div>
      </div>

      {/* Sticky player */}
      {active && (
        <div className="sticky top-4 z-10 mb-6 bg-white rounded-2xl border border-border shadow-lg p-4">
          <div className="flex items-center gap-4">
            {/* Gradient dot */}
            <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${active.gradient} flex items-center justify-center`}>
              <Headphones className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{active.title}</p>

              {/* Progress bar */}
              <div
                className="mt-1.5 h-2 bg-muted rounded-full cursor-pointer relative overflow-hidden"
                onClick={seek}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${active.gradient} transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={restart} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={togglePlay}
                className={`h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br ${active.gradient} text-white shadow-md hover:opacity-90 transition-opacity`}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                {muted ? <VolumeX className="h-3.5 w-3.5 text-muted-foreground" /> : <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={handleVolume}
                className="w-16 accent-teal-600 hidden sm:block"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      {activeIndex !== null && (
        <audio ref={audioRef} src={MEDITATIONS[activeIndex].file} preload="metadata" />
      )}

      {/* Track grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {MEDITATIONS.map((m, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={m.title}
              onClick={() => selectTrack(i)}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              <div className={`h-2 bg-gradient-to-r ${m.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <Badge variant="secondary" className="text-[10px] mb-2">{m.tag}</Badge>
                    <p className="font-bold text-base leading-snug">{m.title}</p>
                  </div>
                  <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all ${isActive && playing ? `bg-gradient-to-br ${m.gradient} text-white` : "bg-muted group-hover:bg-primary group-hover:text-white"}`}>
                    {isActive && playing
                      ? <Pause className="h-4 w-4" />
                      : <Play className="h-4 w-4 ml-0.5" />}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{m.desc}</p>
                {isActive && duration > 0 ? (
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${m.gradient}`} style={{ width: `${progress}%` }} />
                  </div>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {m.duration}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
        <Headphones className="h-6 w-6 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">New meditations added weekly</p>
        <p className="text-xs mt-1">Tap any card to begin</p>
      </div>
    </div>
  );
}
