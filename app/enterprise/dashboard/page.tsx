import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Users, TrendingUp, Heart, Zap, ArrowUpRight,
  BarChart3, Shield, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// In production these come from a real DB query scoped to companyId
// For now: realistic mock data to demonstrate the dashboard
function getMockInsights(companyId: string) {
  return {
    activeEmployees: 87,
    totalInvited: 120,
    engagementRate: 73,          // % active in last 7 days
    challengeCompletionRate: 61,
    avgSessionsPerWeek: 3.2,
    topChallenges: [
      { name: "Work-related stress", pct: 42 },
      { name: "Sleep difficulties", pct: 31 },
      { name: "Feeling disconnected", pct: 24 },
      { name: "Low motivation", pct: 19 },
    ],
    moodTrend: [58, 61, 59, 65, 68, 71, 74], // 7-week trend (0-100)
    weeklyActivity: [34, 41, 38, 52, 49, 61, 64], // active users per week
    recentMilestones: [
      { text: "14 employees completed a 7-day support plan this month", type: "positive" },
      { text: "Challenge completion rate up 12% vs last month", type: "positive" },
      { text: "4 employees have been inactive for 3+ weeks", type: "warning" },
    ],
  };
}

export default async function EnterpriseDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.privateMetadata ?? {}) as Record<string, unknown>;
  const companyId = (meta.companyId as string) ?? "demo";
  const companyName = (meta.companyName as string) ?? "Your Company";

  const insights = getMockInsights(companyId);
  const joinRate = Math.round((insights.activeEmployees / insights.totalInvited) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wellness Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {companyName} · Data is anonymous and aggregated · Updated daily
          </p>
        </div>
        <Link href="/enterprise/dashboard/employees">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-1.5" /> Manage employees
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active employees",
            value: `${insights.activeEmployees}`,
            sub: `of ${insights.totalInvited} invited (${joinRate}%)`,
            Icon: Users,
            color: "from-teal-500 to-emerald-600",
          },
          {
            label: "Engagement rate",
            value: `${insights.engagementRate}%`,
            sub: "active in past 7 days",
            Icon: TrendingUp,
            color: "from-sky-500 to-blue-600",
          },
          {
            label: "Challenge completion",
            value: `${insights.challengeCompletionRate}%`,
            sub: "of daily challenges done",
            Icon: Zap,
            color: "from-violet-500 to-indigo-700",
          },
          {
            label: "Avg sessions / week",
            value: insights.avgSessionsPerWeek.toFixed(1),
            sub: "per active employee",
            Icon: Heart,
            color: "from-rose-500 to-pink-600",
          },
        ].map(({ label, value, sub, Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5">
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="h-4.5 w-4.5 text-white h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Mood trend chart (visual bars) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm">Team wellbeing trend</h3>
              <p className="text-xs text-muted-foreground">7-week rolling average (anonymous)</p>
            </div>
            <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />+16pts this period
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {insights.moodTrend.map((val, i) => {
              const isLast = i === insights.moodTrend.length - 1;
              const height = `${Math.round((val / 100) * 100)}%`;
              const weeks = ["6w ago", "5w ago", "4w ago", "3w ago", "2w ago", "Last wk", "This wk"];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-700">{val}</span>
                  <div className="w-full relative" style={{ height: "72px" }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                        isLast ? "bg-gradient-to-t from-teal-500 to-emerald-400" : "bg-teal-100"
                      }`}
                      style={{ height: `${Math.round((val / 100) * 72)}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{weeks[i]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Score is derived from anonymous session sentiment, challenge completion, and voluntary mood check-ins.
          </p>
        </div>

        {/* Top stressors */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-1">Top stressors this month</h3>
          <p className="text-xs text-muted-foreground mb-5">Anonymous · % of employees experiencing each</p>
          <div className="space-y-3">
            {insights.topChallenges.map(({ name, pct }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{name}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 bg-slate-50 rounded-xl p-3">
            💡 Work-related stress is the top concern — consider running a team challenge around boundaries and recovery.
          </p>
        </div>
      </div>

      {/* Milestones & alerts */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-sm mb-4">Recent milestones</h3>
        <div className="space-y-3">
          {insights.recentMilestones.map(({ text, type }, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${type === "warning" ? "bg-amber-50" : "bg-teal-50"}`}>
              {type === "warning"
                ? <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                : <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
              }
              <p className={`text-sm ${type === "warning" ? "text-amber-800" : "text-teal-800"}`}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy reminder */}
      <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-5 py-4">
        <Shield className="h-5 w-5 text-teal-600 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-gray-700">Privacy guarantee:</strong> All data shown is anonymous and aggregated. No individual employee&apos;s data, conversations, or identity is ever visible in this dashboard. C4U is GDPR compliant.
        </p>
      </div>
    </div>
  );
}
