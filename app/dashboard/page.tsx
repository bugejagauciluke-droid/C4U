import Link from "next/link";
import { ArrowUpRight, Heart, Users, MessageCircle, TrendingUp, PenSquare, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "Support sessions today", value: "247", change: "+18%", Icon: Heart, tone: "from-teal-400 to-emerald-500" },
  { label: "Active users this week", value: "1,842", change: "+12%", Icon: Users, tone: "from-violet-400 to-purple-600" },
  { label: "Exercises delivered", value: "8,931", change: "+31%", Icon: MessageCircle, tone: "from-rose-400 to-pink-600" },
  { label: "Premium subscribers", value: "214", change: "+8%", Icon: TrendingUp, tone: "from-amber-400 to-orange-500" },
];

const QUICK_ACTIONS = [
  { label: "Edit homepage content", href: "/dashboard/site?tab=landing" },
  { label: "Edit support situations", href: "/dashboard/site?tab=support" },
  { label: "Edit subscription pricing", href: "/dashboard/site?tab=subscription" },
  { label: "Update branding", href: "/dashboard/site?tab=branding" },
  { label: "Preview live site", href: "/" },
];

export default function DashboardOverview() {
  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's how C4U is doing today.</p>
        </div>
        <Link href="/dashboard/site">
          <Button variant="gradient" size="sm">
            <PenSquare className="h-4 w-4" /> Edit site
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                  <s.Icon className="h-5 w-5 text-white" />
                </div>
                <Badge variant="green" className="text-[10px]">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />{s.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-4">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick actions</h2>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(a => (
                <Link key={a.label} href={a.href}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted text-sm transition-colors group">
                  <span>{a.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent support sessions</h2>
            <div className="space-y-3">
              {[
                { situation: "Lonely in a crowd", exercises: 5, ago: "2 min ago", tone: "bg-indigo-100 text-indigo-700" },
                { situation: "Loss or heartbreak", exercises: 4, ago: "8 min ago", tone: "bg-rose-100 text-rose-700" },
                { situation: "Overwhelmed & anxious", exercises: 5, ago: "15 min ago", tone: "bg-sky-100 text-sky-700" },
                { situation: "Work & career pain", exercises: 4, ago: "23 min ago", tone: "bg-amber-100 text-amber-700" },
                { situation: "Just feeling low", exercises: 5, ago: "31 min ago", tone: "bg-slate-100 text-slate-700" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.tone}`}>{s.situation}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{s.exercises} exercises</span>
                    <span className="text-xs">{s.ago}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health banner */}
      <Card className="mt-6 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl gradient-c4u-soft flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <p className="font-semibold">All systems healthy ✓</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI support API responding in ~2.1s avg. All 6 situation types active. Crisis footer shown on all sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
