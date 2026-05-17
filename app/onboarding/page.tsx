"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    question: "I identify as...",
    subtitle: "This helps C4U speak to you in a way that feels right.",
    field: "gender",
    options: [
      { value: "woman", label: "Woman", emoji: "🌸" },
      { value: "man",   label: "Man",   emoji: "🌊" },
      { value: "nonbinary", label: "Non-binary", emoji: "🌿" },
      { value: "prefer_not", label: "Prefer not to say", emoji: "💫" },
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
      { value: "talk",       label: "Someone to talk to",  emoji: "💬" },
      { value: "tools",      label: "Practical tools",     emoji: "🛠️" },
      { value: "both",       label: "Both",                emoji: "🤝" },
      { value: "not_sure",   label: "I'm not sure yet",    emoji: "🌙" },
    ],
  },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const selected = answers[current.field];
  const isLast = step === STEPS.length - 1;

  async function handleNext() {
    if (!selected) return;
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    // Save to Clerk unsafeMetadata
    setSaving(true);
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...answers,
          onboarded: true,
        },
      });
      router.push("/support");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="h-14 w-14 rounded-full gradient-c4u-soft flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-muted rounded-full max-w-xs mx-auto overflow-hidden">
            <div
              className="h-full gradient-c4u-soft rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{current.question}</h1>
          <p className="text-muted-foreground text-sm">{current.subtitle}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {current.options.map((opt) => {
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

        {/* Next button */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleNext}
          disabled={!selected || saving}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your experience…</>
          ) : isLast ? (
            <>Let's go <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>

        {step === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Your answers are private and never shared.
          </p>
        )}
      </div>
    </div>
  );
}
