import { currentUser } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, CreditCard, Mail, Shield, AlertTriangle } from "lucide-react";
import { BillingButton } from "./billing-button";
import { DeleteAccountButton } from "./delete-button";

const TIER_LABELS: Record<string, string> = {
  free: "Free", base: "Base — €10/mo", plus: "Plus — €20/mo", transform: "Transform — €30/mo",
};
const TIER_VARIANTS: Record<string, "secondary" | "teal" | "purple" | "gold"> = {
  free: "secondary", base: "teal", plus: "purple", transform: "gold",
};

export default async function SettingsPage() {
  const [user, tier] = await Promise.all([currentUser(), getUserTier()]);

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

      {/* Profile */}
      <Section title="Profile" Icon={Mail}>
        <div className="flex items-center gap-4">
          <UserButton />
          <div>
            <p className="font-semibold">{user?.fullName ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress ?? "—"}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">To update your name, photo, or email, click your avatar above.</p>
      </Section>

      {/* Subscription */}
      <Section title="Subscription" Icon={CreditCard}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">Current plan</p>
            <Badge variant={TIER_VARIANTS[tier] ?? "secondary"}>{TIER_LABELS[tier] ?? "Free"}</Badge>
          </div>
          {tier !== "free" && <BillingButton />}
        </div>
        {tier === "free" ? (
          <div className="mt-4">
            <Link href="/premium" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
              Upgrade to Premium <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">
            To cancel or change your plan, click &ldquo;Manage billing&rdquo; above. You keep access until the end of your billing period.
          </p>
        )}
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Data" Icon={Shield}>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Your support session text is <strong>never stored</strong>. It is processed in real time to generate your exercises and immediately discarded.</p>
          <p>Your AI companion history is stored <strong>only on this device</strong> (browser storage). It is never sent to our servers.</p>
          <div className="flex gap-4 pt-1">
            <Link href="/privacy" className="text-primary hover:underline text-xs">Privacy Policy</Link>
            <Link href="/terms" className="text-primary hover:underline text-xs">Terms of Service</Link>
            <Link href="/disclaimer" className="text-primary hover:underline text-xs">Mental Health Disclaimer</Link>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Delete Account" Icon={AlertTriangle}>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
          If you have an active subscription, cancel it first in billing to avoid further charges.
        </p>
        <DeleteAccountButton />
      </Section>
    </div>
  );
}

function Section({ title, Icon, children }: { title: string; Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}
