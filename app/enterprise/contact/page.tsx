"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, CheckCircle2, Loader2, ArrowRight, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const COMPANY_SIZES = ["10–50", "51–150", "151–500", "500–1,000", "1,000+"];
const INDUSTRIES = [
  "Finance & Banking", "Technology", "Healthcare & Pharma", "Legal",
  "Creative & Media", "Retail & Hospitality", "Manufacturing", "Education",
  "Consulting", "Government / Public sector", "Other",
];
const CHALLENGES = [
  "Burnout & exhaustion",
  "High stress & anxiety",
  "Low morale & engagement",
  "Remote / hybrid isolation",
  "Leadership pressure",
  "High turnover",
  "Post-restructuring recovery",
  "Work-life balance",
];

interface FormState {
  contactName: string;
  contactEmail: string;
  companyName: string;
  companySize: string;
  industry: string;
  challenges: string[];
  requirements: string;
  demoPreference: "call" | "email";
}

const EMPTY: FormState = {
  contactName: "",
  contactEmail: "",
  companyName: "",
  companySize: "",
  industry: "",
  challenges: [],
  requirements: "",
  demoPreference: "call",
};

export default function EnterpriseContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toggleChallenge(c: string) {
    setForm(f => ({
      ...f,
      challenges: f.challenges.includes(c)
        ? f.challenges.filter(x => x !== c)
        : [...f.challenges, c],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contactName || !form.contactEmail || !form.companyName || !form.companySize) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enterprise/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-3">We&apos;ve got your enquiry</h1>
          <p className="text-muted-foreground mb-2">
            Thank you, <strong>{form.contactName}</strong>. Your request for <strong>{form.companyName}</strong> has been received.
          </p>
          <p className="text-muted-foreground mb-8">
            {form.demoPreference === "call"
              ? "We'll reach out to schedule your demo call within one business day."
              : "We'll send you a personalised proposal and pricing within 24 hours."}
          </p>
          <Link href="/enterprise">
            <Button variant="outline">← Back to C4U for Teams</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      {/* Header */}
      <div className="mb-10">
        <Link href="/enterprise" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6">
          ← C4U for Teams
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl gradient-c4u-soft flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Get a custom quote</h1>
        </div>
        <p className="text-muted-foreground">
          Tell us about your team and what matters most. We&apos;ll send a tailored proposal — or book a 20-minute demo call — within one business day.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-7">

        {/* Contact details */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Your name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                placeholder="Alex Johnson"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Work email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                placeholder="alex@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Company details */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your company</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Company name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              placeholder="Acme Corp"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Team size <span className="text-rose-500">*</span></label>
              <select
                value={form.companySize}
                onChange={e => setForm(f => ({ ...f, companySize: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                required
              >
                <option value="">Select size…</option>
                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Industry</label>
              <select
                value={form.industry}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">Biggest challenges</h2>
          <p className="text-xs text-muted-foreground mb-4">Select all that apply — this helps us personalise your package.</p>
          <div className="flex flex-wrap gap-2">
            {CHALLENGES.map(c => {
              const selected = form.challenges.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChallenge(c)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-muted-foreground border-border hover:border-teal-400 hover:text-teal-700"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Requirements & preferences */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Anything else?</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Specific requirements or questions</label>
            <textarea
              value={form.requirements}
              onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
              rows={4}
              placeholder="Tell us anything specific — integration needs, budget range, rollout timeline, cultural considerations, languages your team speaks…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">How would you prefer to hear back?</label>
            <div className="flex gap-3">
              {[
                { value: "call" as const, label: "Schedule a demo call" },
                { value: "email" as const, label: "Send me a proposal" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, demoPreference: opt.value }))}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                    form.demoPreference === opt.value
                      ? "bg-teal-500 text-white border-teal-500"
                      : "border-border text-muted-foreground hover:border-teal-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-2xl font-semibold text-base shadow-md"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending…</>
          ) : (
            <>{form.demoPreference === "call" ? "Book my demo call" : "Send me a proposal"} <ArrowRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          We respond within one business day. No spam. No hard sell.
        </p>
      </form>
    </div>
  );
}
