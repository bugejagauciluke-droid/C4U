import Link from "next/link";

export const metadata = { title: "Terms of Service — C4U" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">Last updated: May 2025</p>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground text-lg">By using C4U, you agree to these terms. Please read them carefully.</p>
      </div>

      <div className="space-y-8">
        <Section title="1. What C4U is">
          <p>C4U ("Care For You") is an emotional wellness application that provides AI-generated exercises and support content to help users manage difficult emotional situations.</p>
          <p><strong>C4U is not a medical service, therapy, or crisis intervention tool.</strong> It is a self-help wellness application. See our <Link href="/disclaimer" className="text-primary underline">Mental Health Disclaimer</Link> for full details.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 18 years old to use C4U. By creating an account, you confirm you meet this requirement. C4U is not designed for use by minors.</p>
        </Section>

        <Section title="3. Your account">
          <ul>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must provide accurate information when signing up.</li>
            <li>You may not share your account with others.</li>
            <li>Notify us immediately at <a href="mailto:landbandg@gmail.com" className="text-primary underline">landbandg@gmail.com</a> if you suspect unauthorised access.</li>
          </ul>
        </Section>

        <Section title="4. Subscriptions and payments">
          <ul>
            <li>Paid plans are billed monthly in EUR via Stripe.</li>
            <li>Prices: Base €10/mo, Plus €20/mo, Transform €30/mo.</li>
            <li>A 7-day free trial is offered on all paid plans. You will not be charged until the trial ends.</li>
            <li>You may cancel at any time. Cancellation takes effect at the end of the current billing period — you retain access until then.</li>
            <li>We do not offer refunds for partial months, except where required by applicable law (including EU consumer rights legislation).</li>
            <li>EU consumers have a 14-day right of withdrawal from the date of purchase, unless digital content delivery has begun with your explicit consent.</li>
          </ul>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree not to:</p>
          <ul>
            <li>Use C4U for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, scrape, or copy the service</li>
            <li>Use the AI system to generate harmful, abusive, or illegal content</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>Interfere with the operation of the service</li>
          </ul>
        </Section>

        <Section title="6. AI-generated content">
          <p>C4U uses Anthropic's Claude AI to generate personalised exercises. This content is:</p>
          <ul>
            <li>Generated in real time based on what you share</li>
            <li>Not reviewed by a human before delivery</li>
            <li>Intended as general wellness guidance, not professional advice</li>
            <li>Not guaranteed to be accurate, complete, or suitable for your specific situation</li>
          </ul>
          <p>Always use your own judgement. If you are in distress, please contact a qualified mental health professional or crisis service.</p>
        </Section>

        <Section title="7. Intellectual property">
          <p>All content, design, and code in C4U is owned by us or our licensors. You may not reproduce, distribute, or create derivative works without our written permission.</p>
          <p>The text you submit during support sessions remains yours. We do not claim ownership over your inputs.</p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>C4U is provided "as is" without warranty of any kind.</li>
            <li>We are not liable for any indirect, incidental, or consequential damages arising from your use of C4U.</li>
            <li>Our total liability to you shall not exceed the amount you paid us in the 3 months before the claim arose.</li>
          </ul>
          <p>Nothing in these terms limits liability for death, personal injury, or fraud caused by our negligence.</p>
        </Section>

        <Section title="9. Termination">
          <p>We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time from your account settings. Upon termination, your data will be deleted in accordance with our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.</p>
        </Section>

        <Section title="10. Governing law">
          <p>These terms are governed by the laws of Malta / the European Union. Any disputes shall be subject to the exclusive jurisdiction of the courts of Malta, without prejudice to your rights as an EU consumer.</p>
        </Section>

        <Section title="11. Changes to these terms">
          <p>We may update these terms. We will notify you by email at least 14 days before material changes take effect. Continued use after that date constitutes acceptance.</p>
        </Section>

        <Section title="12. Contact">
          <p>Questions? Email <a href="mailto:landbandg@gmail.com" className="text-primary underline">landbandg@gmail.com</a>.</p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex gap-6 text-sm text-muted-foreground">
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="/disclaimer" className="hover:text-primary transition-colors">Mental Health Disclaimer</Link>
        <Link href="/" className="hover:text-primary transition-colors">← Back to C4U</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="text-muted-foreground space-y-3 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">{children}</div>
    </section>
  );
}
