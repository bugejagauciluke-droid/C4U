"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, Loader2, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Step 0 is a multi-checkbox confirmation — ALL must be checked to proceed.
const CONFIRMATIONS = [
  { id: "age",     label: "I confirm I am 18 years of age or older",                                emoji: "✅" },
  { id: "notTherapy", label: "I understand C4U is not therapy or a medical service",               emoji: "💙" },
  { id: "terms",   label: "I have read and agree to the Terms of Service and Privacy Policy",       emoji: "📋" },
  { id: "ready",   label: "I understand exercises are suggestions, not instructions",               emoji: "🌱" },
];

const PREFERENCE_STEPS = [
  {
    question: "I identify as...",
    subtitle: "This helps C4U speak to you in a way that feels right.",
    field: "gender",
    options: [
      { value: "woman",      label: "Woman",              emoji: "🌸" },
      { value: "man",        label: "Man",                emoji: "🌊" },
      { value: "nonbinary",  label: "Non-binary",         emoji: "🌿" },
      { value: "prefer_not", label: "Prefer not to say",  emoji: "💫" },
    ],
  },
  {
    question: "My age range is...",
    subtitle: "C4U tailors its support style to where you are in life.",
    field: "ageRange",
    options: [
      { value: "18-25", label: "18 – 25", emoji: "✨" },
      { value: "26-35", label: "26 – 35", emoji: "🌱" },
      { value: "36-50", label: "36 – 50", emoji: "🌳" },
      { value: "50+",   label: "50+",     emoji: "🌟" },
    ],
  },
  {
    question: "Right now I mainly need...",
    subtitle: "You can change this anytime. There's no wrong answer.",
    field: "needType",
    options: [
      { value: "talk",     label: "Someone to talk to", emoji: "💬" },
      { value: "tools",    label: "Practical tools",    emoji: "🛠️" },
      { value: "both",     label: "Both",               emoji: "🤝" },
      { value: "not_sure", label: "I'm not sure yet",   emoji: "🌙" },
    ],
  },
  {
    question: "Where are you based?",
    subtitle: "Helps C4U understand your cultural context. Completely optional.",
    field: "location",
    options: [
      { value: "malta",         label: "Malta",           emoji: "🇲🇹" },
      { value: "uk",            label: "UK / Ireland",    emoji: "🇬🇧" },
      { value: "europe",        label: "Europe",          emoji: "🇪🇺" },
      { value: "international", label: "Somewhere else",  emoji: "🌍" },
    ],
  },
];

// Total steps = 1 confirmation screen + preference steps
const TOTAL_STEPS = 1 + PREFERENCE_STEPS.length;

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep]           = useState(0); // 0 = confirmations, 1+ = preferences
  const [checked, setChecked]     = useState<Record<string, boolean>>({});
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);

  const allConfirmed = CONFIRMATIONS.every(c => checked[c.id]);
  const prefStep     = step - 1; // index into PREFERENCE_STEPS
  const current      = step > 0 ? PREFERENCE_STEPS[prefStep] : null;
  const selected     = current ? answers[current.field] : null;
  const isLast       = step === TOTAL_STEPS - 1;

  function canProceed() {
    if (step === 0) return allConfirmed;
    return !!selected;
  }

  async function handleNext() {
    if (!canProceed()) return;
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...answers,
          ageConfirmed: true,
          onboarded: true,
        },
      });
      router.push("/");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-14 w-14 rounded-full gradient-c4u-soft flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {TOTAL_STEPS}</p>
          <div className="mt-3 h-1.5 bg-muted rounded-full max-w-xs mx-auto overflow-hidden">
            <div
              className="h-full gradient-c4u-soft rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 0: Confirmation checkboxes */}
        {step === 0 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Before we begin</h1>
              <p className="text-muted-foreground text-sm">Please confirm all of the following to continue.</p>
            </div>
            <div className="space-y-3 mb-8">
              {CONFIRMATIONS.map(c => {
                const isChecked = !!checked[c.id];
                return (
                  <button
                    key={c.id}
                    onClick={() => setChecked(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all
                      ${isChecked
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-white hover:border-primary/40"
                      }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{c.emoji}</span>
                    <span className={`text-sm font-medium flex-1 leading-snug ${isChecked ? "text-primary" : "text-foreground"}`}>
                      {c.label}
                    </span>
                    {isChecked
                      ? <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      : <Square className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    }
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground mb-6">
              By continuing you agree to our{" "}
              <Link href="/terms" className="text-primary underline" target="_blank">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary underline" target="_blank">Privacy Policy</Link>.
            </p>
          </>
        )}

        {/* Steps 1+: Preference questions */}
        {current && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{current.question}</h1>
              <p className="text-muted-foreground text-sm">{current.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {current.options.map(opt => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers({ ...answers, [current.field]: opt.value })}
                    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all text-center
                      ${isSelected
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                        : "border-border bg-white hover:border-primary/40 hover:bg-muted/30"
                      }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Next / submit button */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleNext}
          disabled={!canProceed() || saving}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your experience…</>
          ) : isLast ? (
            <>Let&apos;s go <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>

        {step > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Your answers are private and never shared.
          </p>
        )}
      </div>
    </div>
  );
}
