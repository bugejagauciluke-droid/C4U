import { clerkClient } from "@clerk/nextjs/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { Users, CreditCard, TrendingUp, Heart, Building2, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getStats() {
  const clerk = await clerkClient();

  // Get all users (up to 500)
  const { data: users, totalCount } = await clerk.users.getUserList({ limit: 500 });

  // Count by tier from privateMetadata
  const tiers = { free: 0, base: 0, plus: 0, transform: 0 };
  const recentUsers: { name: string; email: string; tier: string; joined: string }[] = [];

  for (const user of users) {
    const meta = (user.privateMetadata ?? {}) as Record<string, string>;
    const tier = meta.tier ?? "free";
    tiers[tier as keyof typeof tiers] = (tiers[tier as keyof typeof tiers] ?? 0) + 1;
  }

  // Recent 10 signups
  const sorted = [...users].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  for (const u of sorted) {
    const meta = (u.privateMetadata ?? {}) as Record<string, string>;
    recentUsers.push({
      name: u.fullName ?? u.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "—",
      email: u.emailAddresses[0]?.emailAddress ?? "—",
      tier: meta.tier ?? "free",
      joined: new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    });
  }

  // Stripe revenue (last 30 days) — only if configured
  let mrr = "—";
  let activeSubscriptions = 0;
  if (isStripeConfigured()) {
    try {
      const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
      activeSubscriptions = subs.data.length;
      const monthly = subs.data.reduce((sum, s) => {
        const item = s.items.data[0];
        const amount = item?.price?.unit_amount ?? 0;
        const interval = item?.price?.recurring?.interval;
        return sum + (interval === "month" ? amount : interval === "year" ? amount / 12 : 0);
      }, 0);
      mrr = `€${(monthly / 100).toFixed(0)}`;
    } catch { /* Stripe not configured */ }
  }

  return { totalCount, tiers, recentUsers, mrr, activeSubscriptions };
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-600",
  base: "bg-teal-100 text-teal-700",
  plus: "bg-violet-100 text-violet-700",
  transform: "bg-amber-100 text-amber-700",
};

export default async function AdminPage() {
  const { totalCount, tiers, recentUsers, mrr, activeSubscriptions } = await getStats();
  const paid = tiers.base + tiers.plus + tiers.transform;
  const conversionRate = totalCount > 0 ? ((paid / totalCount) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin — Live Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Real numbers from Clerk + Stripe</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total users", value: totalCount.toLocaleString(), Icon: Users, color: "from-teal-400 to-emerald-500" },
          { label: "Paid subscribers", value: paid.toLocaleString(), Icon: CreditCard, color: "from-violet-400 to-purple-600" },
          { label: "MRR", value: mrr, Icon: TrendingUp, color: "from-amber-400 to-orange-500" },
          { label: "Conversion rate", value: `${conversionRate}%`, Icon: Heart, color: "from-rose-400 to-pink-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tier breakdown */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" /> Subscribers by tier
            </h2>
            <div className="space-y-3">
              {(["transform", "plus", "base", "free"] as const).map(tier => {
                const count = tiers[tier];
                const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_COLORS[tier]}`}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent signups */}
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Recent signups
            </h2>
            <div className="space-y-2">
              {recentUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${TIER_COLORS[u.tier]}`}>
                      {u.tier}
                    </span>
                    <span className="text-xs text-muted-foreground">{u.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe status */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" /> Payment status
          </h2>
          <div className="flex items-start gap-3">
            {isStripeConfigured() ? (
              <>
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Stripe connected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeSubscriptions} active subscription{activeSubscriptions !== 1 ? "s" : ""} · MRR {mrr}
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    ⚠ Currently in test mode — switch to live keys to accept real payments
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Stripe not configured</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add STRIPE_SECRET_KEY to Netlify env vars</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
