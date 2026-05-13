"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Palette, Globe, HandHeart, CreditCard, Save, ExternalLink,
  CheckCircle, AlertCircle, Plus, Trash2, Eye, EyeOff, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SiteConfig, SituationConfig } from "@/lib/site-config";
import Link from "next/link";

type Tab = "branding" | "landing" | "support" | "subscription";
type SaveState = "idle" | "saving" | "saved" | "error";

const TABS: { id: Tab; label: string; Icon: typeof Palette; href?: string }[] = [
  { id: "branding",      label: "Branding",     Icon: Palette,    },
  { id: "landing",       label: "Landing Page",  Icon: Globe,      href: "/" },
  { id: "support",       label: "Support Page",  Icon: HandHeart,  href: "/support" },
  { id: "subscription",  label: "Subscription",  Icon: CreditCard, },
];

const GRADIENTS = [
  "from-indigo-500 to-violet-700","from-rose-500 to-pink-700","from-amber-500 to-orange-600",
  "from-fuchsia-500 to-purple-700","from-sky-500 to-blue-700","from-slate-600 to-gray-800",
  "from-teal-500 to-emerald-700","from-violet-500 to-indigo-700",
];

// ─── Field primitives ─────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
const TI = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input className="input-base" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
);
const TA = ({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) => (
  <textarea className="input-base resize-none" rows={rows} value={value} onChange={e => onChange(e.target.value)} />
);
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${checked ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground"}`}>
      {checked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      {label}: {checked ? "Visible" : "Hidden"}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-5">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold mb-4 pb-3 border-b border-border">{title}</h3>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

// ─── Situation editor ─────────────────────────────────────────────────────────

function SituationEditor({ situations, onChange }: { situations: SituationConfig[]; onChange: (s: SituationConfig[]) => void }) {
  const upd = (i: number, f: keyof SituationConfig, v: string) => onChange(situations.map((s, j) => j === i ? { ...s, [f]: v } : s));

  return (
    <div className="space-y-4">
      {situations.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-border bg-white overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${s.gradient}`} />
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 grid sm:grid-cols-2 gap-3">
                <Field label="Title"><TI value={s.title} onChange={v => upd(i, "title", v)} /></Field>
                <Field label="Subtitle"><TI value={s.subtitle} onChange={v => upd(i, "subtitle", v)} /></Field>
              </div>
              <button onClick={() => onChange(situations.filter((_, j) => j !== i))}
                className="mt-6 p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Field label="Textarea placeholder" hint="What users see when they select this card">
              <TA value={s.placeholder} onChange={v => upd(i, "placeholder", v)} rows={2} />
            </Field>
            <Field label="Card gradient">
              <div className="flex flex-wrap gap-2 mt-1">
                {GRADIENTS.map(g => (
                  <button key={g} onClick={() => upd(i, "gradient", g)}
                    className={`h-7 w-14 rounded-md bg-gradient-to-r ${g} border-2 transition-all ${s.gradient === g ? "border-foreground scale-110" : "border-transparent"}`} />
                ))}
              </div>
            </Field>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...situations, {
        id: `situation-${Date.now()}`, title: "New situation", subtitle: "Short description",
        placeholder: "Tell me what's happening...", gradient: GRADIENTS[situations.length % GRADIENTS.length],
      }])} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
        <Plus className="h-4 w-4" /> Add situation
      </button>
    </div>
  );
}

// ─── Steps editor ─────────────────────────────────────────────────────────────

function StepsEditor({ steps, onChange }: { steps: { title: string; desc: string }[]; onChange: (s: { title: string; desc: string }[]) => void }) {
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-6 w-6 rounded-full gradient-c4u-soft text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
          </div>
          <Field label="Title"><TI value={s.title} onChange={v => onChange(steps.map((st, j) => j === i ? { ...st, title: v } : st))} /></Field>
          <Field label="Description"><TA value={s.desc} onChange={v => onChange(steps.map((st, j) => j === i ? { ...st, desc: v } : st))} rows={2} /></Field>
        </div>
      ))}
    </div>
  );
}

// ─── Feature list editor ──────────────────────────────────────────────────────

function FeatureListEditor({ features, onChange }: { features: string[]; onChange: (f: string[]) => void }) {
  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className="input-base flex-1" value={f} onChange={e => onChange(features.map((ff, j) => j === i ? e.target.value : ff))} />
          <button onClick={() => onChange(features.filter((_, j) => j !== i))} className="p-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...features, "New feature"])} className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80">
        <Plus className="h-4 w-4" /> Add feature
      </button>
    </div>
  );
}

// ─── Save banner ──────────────────────────────────────────────────────────────

function SaveBanner({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <div className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-3 shadow-sm mb-6">
      <div className="flex items-center gap-2 text-sm">
        {state === "saved" && <><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-emerald-700 font-medium">Saved — live site updated</span></>}
        {state === "error" && <><AlertCircle className="h-4 w-4 text-destructive" /><span className="text-destructive font-medium">Failed to save — try again</span></>}
        {(state === "idle" || state === "saving") && <span className="text-muted-foreground">Edit any field then save when ready.</span>}
      </div>
      <Button variant="gradient" size="sm" onClick={onSave} disabled={state === "saving"}>
        {state === "saving" ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save changes</>}
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SiteEditorPage() {
  const [tab, setTab] = useState<Tab>("branding");
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/site-config").then(r => r.json()).then(d => { setConfig(d as SiteConfig); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    if (!config) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/site-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      if (!res.ok) throw new Error();
      setSaveState("saved"); setTimeout(() => setSaveState("idle"), 3000);
    } catch { setSaveState("error"); setTimeout(() => setSaveState("idle"), 4000); }
  }, [config]);

  function set<S extends keyof SiteConfig>(section: S, field: keyof SiteConfig[S], value: unknown) {
    if (!config) return;
    setConfig({ ...config, [section]: { ...config[section], [field]: value } });
    if (saveState === "saved") setSaveState("idle");
  }

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (!config) return <div className="p-8 text-center text-muted-foreground">Failed to load config.</div>;

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Site Editor</h1>
          <p className="text-muted-foreground mt-1">Edit every piece of text and content on C4U.</p>
        </div>
        {activeTab.href && (
          <Link href={activeTab.href} target="_blank">
            <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> Preview</Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`}>
            <t.Icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      <SaveBanner state={saveState} onSave={save} />

      {/* ── BRANDING ── */}
      {tab === "branding" && (
        <>
          <Section title="App Identity">
            <Field label="App name"><TI value={config.branding.appName} onChange={v => set("branding", "appName", v)} /></Field>
            <Field label="Tagline" hint="Browser tab and meta description"><TI value={config.branding.tagline} onChange={v => set("branding", "tagline", v)} /></Field>
            <Field label="Hero badge text" hint="Small pill label in the hero section"><TI value={config.branding.heroBadge} onChange={v => set("branding", "heroBadge", v)} /></Field>
            <Field label="Footer text"><TI value={config.branding.footerText} onChange={v => set("branding", "footerText", v)} /></Field>
          </Section>
          <div className="rounded-xl bg-muted border border-border p-4 text-sm">
            <p className="font-semibold mb-2">Preview</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full gradient-c4u-soft flex items-center justify-center"><span className="text-white text-xs font-bold">C</span></div>
              <span className="font-bold gradient-text text-lg">{config.branding.appName}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-muted-foreground text-sm">{config.branding.tagline}</span>
            </div>
          </div>
        </>
      )}

      {/* ── LANDING ── */}
      {tab === "landing" && (
        <>
          <Section title="Hero Section">
            <Field label="Hero headline"><TA value={config.landing.heroHeadline} onChange={v => set("landing", "heroHeadline", v)} rows={2} /></Field>
            <Field label="Hero subtitle"><TA value={config.landing.heroSubtitle} onChange={v => set("landing", "heroSubtitle", v)} rows={3} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Primary CTA button"><TI value={config.landing.ctaPrimary} onChange={v => set("landing", "ctaPrimary", v)} /></Field>
              <Field label="Secondary CTA button"><TI value={config.landing.ctaSecondary} onChange={v => set("landing", "ctaSecondary", v)} /></Field>
            </div>
          </Section>
          <Section title="How It Works Section">
            <Field label="Section title"><TI value={config.landing.howItWorksTitle} onChange={v => set("landing", "howItWorksTitle", v)} /></Field>
            <Field label="Steps">
              <StepsEditor steps={config.landing.steps} onChange={v => set("landing", "steps", v)} />
            </Field>
          </Section>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Hero preview
            </div>
            <div className="gradient-hero px-6 py-8 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-3">{config.branding.heroBadge}</p>
              <h1 className="text-2xl font-bold leading-snug">{config.landing.heroHeadline}</h1>
              <p className="text-sm text-white/70 mt-2">{config.landing.heroSubtitle}</p>
              <div className="flex gap-2 mt-4 flex-wrap">
                <span className="px-4 py-2 rounded-full gradient-c4u-soft text-white text-xs font-semibold">{config.landing.ctaPrimary} →</span>
                <span className="px-4 py-2 rounded-full border border-white/20 text-white/80 text-xs font-semibold">{config.landing.ctaSecondary}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── SUPPORT ── */}
      {tab === "support" && (
        <>
          <Section title="Page Header">
            <Field label="Page headline"><TI value={config.support.pageHeadline} onChange={v => set("support", "pageHeadline", v)} /></Field>
            <Field label="Page subtitle"><TA value={config.support.pageSubtitle} onChange={v => set("support", "pageSubtitle", v)} rows={2} /></Field>
          </Section>
          <Section title="Situation Cards">
            <p className="text-xs text-muted-foreground -mt-2 mb-2">The cards users pick from on the Support page.</p>
            <SituationEditor situations={config.support.situations} onChange={v => set("support", "situations", v)} />
          </Section>
          <Section title="Pricing & Upgrade">
            <Field label="Pricing headline"><TI value={config.support.pricingHeadline} onChange={v => set("support", "pricingHeadline", v)} /></Field>
            <Field label="Monthly price ($)" hint="Numbers only"><TI value={config.support.price} onChange={v => set("support", "price", v)} placeholder="9.99" /></Field>
            <Field label="Pricing subtext"><TA value={config.support.pricingSubtext} onChange={v => set("support", "pricingSubtext", v)} rows={2} /></Field>
            <div className="rounded-xl gradient-c4u p-5 text-white mt-2">
              <h3 className="font-bold text-base">{config.support.pricingHeadline}</h3>
              <p className="text-white/80 text-xs mt-1.5">{config.support.pricingSubtext}</p>
              <span className="inline-block mt-3 bg-white text-primary text-xs font-bold px-4 py-1.5 rounded-full">Start free · Upgrade when ready →</span>
            </div>
          </Section>
        </>
      )}

      {/* ── SUBSCRIPTION ── */}
      {tab === "subscription" && (
        <>
          <Section title="Global Copy">
            <Field label="Free trial / header text" hint="Shown at top of the pricing page"><TI value={config.subscription.freeTrialText} onChange={v => set("subscription", "freeTrialText", v)} /></Field>
            <Field label="Footer note" hint="Shown below the pricing grid"><TI value={config.subscription.footerNote} onChange={v => set("subscription", "footerNote", v)} /></Field>
          </Section>
          <Section title="Pricing Tiers">
            <p className="text-xs text-muted-foreground -mt-2 mb-3">Edit the name, price (€), and features for each tier. Mark &quot;highlighted&quot; to show it with a purple ring.</p>
            <div className="space-y-4">
              {config.subscription.tiers.map((tier, i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Tier name"><TI value={tier.name} onChange={v => {
                      const tiers = config.subscription.tiers.map((t, j) => j === i ? { ...t, name: v } : t);
                      set("subscription", "tiers", tiers);
                    }} /></Field>
                    <Field label="Price (€/mo)"><TI value={tier.price} onChange={v => {
                      const tiers = config.subscription.tiers.map((t, j) => j === i ? { ...t, price: v } : t);
                      set("subscription", "tiers", tiers);
                    }} /></Field>
                    <Field label="Badge label (optional)"><TI value={tier.badge ?? ""} placeholder="e.g. Most Popular" onChange={v => {
                      const tiers = config.subscription.tiers.map((t, j) => j === i ? { ...t, badge: v || undefined } : t);
                      set("subscription", "tiers", tiers);
                    }} /></Field>
                  </div>
                  <Field label="Features">
                    <FeatureListEditor features={tier.features} onChange={v => {
                      const tiers = config.subscription.tiers.map((t, j) => j === i ? { ...t, features: v } : t);
                      set("subscription", "tiers", tiers);
                    }} />
                  </Field>
                </div>
              ))}
            </div>
          </Section>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Tier preview
            </div>
            <div className="p-6 bg-white flex flex-wrap gap-4">
              {config.subscription.tiers.map((tier, i) => (
                <div key={i} className={`rounded-xl border p-4 text-sm w-44 ${tier.highlighted ? "border-violet-400 ring-1 ring-violet-400" : "border-border"}`}>
                  {tier.badge && <Badge variant="purple" className="mb-2 text-[10px]">{tier.badge}</Badge>}
                  <p className="font-bold">{tier.name}</p>
                  <p className="text-2xl font-black">€{tier.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  <ul className="mt-2 space-y-1">
                    {tier.features.slice(0, 3).map((f, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-teal-400 shrink-0" />{f}</li>
                    ))}
                    {tier.features.length > 3 && <li className="text-xs text-muted-foreground">+{tier.features.length - 3} more</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
