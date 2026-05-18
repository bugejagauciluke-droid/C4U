"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Building2, Palette, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOCUS_AREAS = [
  "Burnout prevention",
  "Stress management",
  "Work-life balance",
  "Leadership & pressure",
  "Team dynamics",
  "Remote / hybrid wellbeing",
  "Anxiety & overwhelm",
  "Grief & loss",
  "Career transitions",
  "Relationship difficulties",
  "Sleep & recovery",
  "Confidence & self-worth",
];

const LANGUAGES = ["English", "Italian", "Swedish", "German", "French", "Spanish", "Dutch", "Portuguese"];

export default function EnterpriseSettingsPage() {
  const [companyName, setCompanyName] = useState("Your Company");
  const [primaryColour, setPrimaryColour] = useState("#0d9488");
  const [focusAreas, setFocusAreas] = useState<string[]>(["Burnout prevention", "Stress management"]);
  const [language, setLanguage] = useState("English");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleFocus(f: string) {
    setFocusAreas(a => a.includes(f) ? a.filter(x => x !== f) : [...a, f]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // In production: POST to /api/enterprise/settings
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalise C4U for your team.</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Branding */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-teal-500" /> Company branding
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            />
            <p className="text-xs text-muted-foreground mt-1">Shown in the employee dashboard and welcome messages.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> Brand colour
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColour}
                onChange={e => setPrimaryColour(e.target.value)}
                className="h-10 w-20 rounded-xl border border-border cursor-pointer bg-white p-0.5"
              />
              <span className="text-sm font-mono text-muted-foreground">{primaryColour}</span>
              <span className="text-xs text-muted-foreground">Used in employee-facing UI accents</span>
            </div>
          </div>
        </div>

        {/* Focus areas */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-violet-500" /> Wellness focus areas
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              C4U&apos;s AI will prioritise these when generating challenges, companion conversations, and content recommendations for your team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map(f => {
              const selected = focusAreas.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFocus(f)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? "bg-violet-500 text-white border-violet-500"
                      : "bg-white text-muted-foreground border-border hover:border-violet-400"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
          {focusAreas.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              Select at least one focus area for best results.
            </p>
          )}
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-sky-500" /> Primary language
          </h2>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white max-w-xs"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <p className="text-xs text-muted-foreground">
            The AI companion and challenge copy will default to this language for your employees.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl px-8"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> :
           saved  ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved!</> :
                    "Save settings"}
        </Button>
      </form>
    </div>
  );
}
