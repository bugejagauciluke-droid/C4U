import Link from "next/link";
import { AlertTriangle, Heart, Phone } from "lucide-react";

export const metadata = { title: "Mental Health Disclaimer — C4U" };

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">Last updated: May 2025</p>
        <h1 className="text-4xl font-bold mb-4">Mental Health Disclaimer</h1>
        <p className="text-muted-foreground text-lg">Please read this before using C4U.</p>
      </div>

      {/* Crisis box — top priority */}
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-6 mb-10">
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-800 mb-2">If you are in crisis or immediate danger</p>
            <p className="text-rose-700 text-sm mb-3">C4U is not a crisis service. If you are thinking about harming yourself or others, or are in immediate danger, please contact emergency services or a crisis line now.</p>
            <ul className="text-sm text-rose-700 space-y-1">
              <li><strong>Emergency services:</strong> 112 (EU) · 999 (UK) · 911 (US)</li>
              <li><strong>Crisis Text Line:</strong> Text HOME to 741741 (US/UK)</li>
              <li><strong>International Association for Suicide Prevention:</strong> <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener" className="underline">Find your local centre</a></li>
              <li><strong>Befrienders Worldwide:</strong> <a href="https://www.befrienders.org" target="_blank" rel="noopener" className="underline">befrienders.org</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Section title="C4U is not a medical or mental health service" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}>
          <p>C4U is a self-help wellness application. It is <strong>not</strong>:</p>
          <ul>
            <li>A substitute for professional mental health treatment, therapy, or counselling</li>
            <li>A medical device or diagnostic tool</li>
            <li>A crisis intervention service</li>
            <li>A replacement for prescribed medication or a treatment plan</li>
          </ul>
          <p>Nothing in C4U constitutes medical advice, psychological advice, or a therapeutic relationship.</p>
        </Section>

        <Section title="Who C4U is designed for" icon={<Heart className="h-5 w-5 text-teal-500" />}>
          <p>C4U is designed for adults (18+) who are experiencing <strong>everyday emotional difficulties</strong> such as:</p>
          <ul>
            <li>Situational stress, anxiety, or low mood</li>
            <li>Loneliness or social disconnection</li>
            <li>Adjustment to life changes (job loss, relationship difficulties, grief)</li>
            <li>General emotional overwhelm</li>
          </ul>
          <p>C4U is <strong>not</strong> designed for individuals with severe mental illness, active suicidal ideation, psychosis, or those requiring clinical intervention.</p>
        </Section>

        <Section title="How C4U works">
          <p>C4U uses artificial intelligence (Anthropic's Claude) to generate personalised wellness exercises based on what you share. This content:</p>
          <ul>
            <li>Is generated automatically — it is not reviewed by a human or licensed professional before delivery</li>
            <li>Is based on general wellness principles and may not be appropriate for every individual situation</li>
            <li>Should be treated as suggestions, not instructions</li>
            <li>May occasionally be inaccurate, incomplete, or unsuitable for your specific circumstances</li>
          </ul>
          <p>Use your own judgement. Stop using any exercise that causes discomfort or distress.</p>
        </Section>

        <Section title="Limitations of AI">
          <p>AI-generated content has known limitations. The AI:</p>
          <ul>
            <li>Cannot assess your full mental health history or situation</li>
            <li>Cannot diagnose or rule out mental health conditions</li>
            <li>May not recognise when a situation requires urgent professional help</li>
            <li>Can make mistakes or generate inappropriate content</li>
          </ul>
        </Section>

        <Section title="When to seek professional help">
          <p>Please consult a qualified mental health professional if you:</p>
          <ul>
            <li>Have persistent, severe, or worsening symptoms</li>
            <li>Are experiencing suicidal or self-harm thoughts</li>
            <li>Have a diagnosed mental health condition</li>
            <li>Are using or dependent on alcohol or substances to cope</li>
            <li>Feel that self-help tools alone are not enough</li>
          </ul>
          <p>Your GP (family doctor) is a good first point of contact. They can refer you to appropriate services.</p>
        </Section>

        <Section title="No liability for outcomes">
          <p>C4U and its operators accept no liability for any outcome — positive or negative — arising from your use of the exercises or content provided. You use C4U entirely at your own risk.</p>
          <p>By using C4U, you acknowledge and accept the limitations described in this disclaimer.</p>
        </Section>

        <Section title="Feedback and concerns">
          <p>If you believe C4U generated content that was harmful, inappropriate, or dangerous, please report it immediately to <a href="mailto:landbandg@gmail.com" className="text-primary underline">landbandg@gmail.com</a>. We take these reports seriously.</p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex gap-6 text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        <Link href="/" className="hover:text-primary transition-colors">← Back to C4U</Link>
      </div>
    </div>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="text-muted-foreground space-y-3 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">{children}</div>
    </section>
  );
}
