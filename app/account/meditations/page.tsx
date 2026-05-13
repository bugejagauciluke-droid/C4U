import { Headphones, Clock, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MEDITATIONS = [
  { title: "Arrive in Your Body",       duration: "8 min",  tag: "Grounding",    gradient: "from-teal-500 to-emerald-600",   desc: "A gentle body scan to bring you back to the present moment." },
  { title: "Letting Go of the Day",     duration: "12 min", tag: "Release",      gradient: "from-indigo-500 to-violet-700",  desc: "Release tension and soften into rest at the end of a hard day." },
  { title: "You Are Not Alone",         duration: "10 min", tag: "Connection",   gradient: "from-rose-500 to-pink-600",      desc: "A loving-kindness practice for when loneliness feels heavy." },
  { title: "Breathing Through It",      duration: "6 min",  tag: "Anxiety",      gradient: "from-sky-500 to-blue-600",       desc: "Calm an anxious mind with guided breathwork." },
  { title: "The Calm After the Storm",  duration: "14 min", tag: "Grief",        gradient: "from-slate-500 to-gray-700",     desc: "A soft, compassionate practice for navigating grief and loss." },
  { title: "Finding Ground",            duration: "9 min",  tag: "Overwhelm",    gradient: "from-amber-500 to-orange-600",   desc: "When everything feels too much — come back to this." },
  { title: "Morning Intention",         duration: "7 min",  tag: "Morning",      gradient: "from-fuchsia-500 to-purple-700", desc: "Set a compassionate intention for the day ahead." },
  { title: "Rest Without Guilt",        duration: "15 min", tag: "Sleep",        gradient: "from-violet-600 to-indigo-800",  desc: "A slow, soothing practice to ease you into sleep." },
];

export default function MeditationsPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
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

      <div className="grid sm:grid-cols-2 gap-4">
        {MEDITATIONS.map((m) => (
          <div key={m.title} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className={`h-2 bg-gradient-to-r ${m.gradient}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <Badge variant="secondary" className="text-[10px] mb-2">{m.tag}</Badge>
                  <p className="font-bold text-base leading-snug">{m.title}</p>
                </div>
                <div className="shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer">
                  <Play className="h-4 w-4 ml-0.5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{m.desc}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {m.duration}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
        <Headphones className="h-6 w-6 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">New meditations added weekly</p>
        <p className="text-xs mt-1">Audio player coming in the next update</p>
      </div>
    </div>
  );
}
