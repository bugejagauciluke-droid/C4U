import Link from "next/link";

export const metadata = { title: "Privacy Policy — C4U" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-2">Last updated: May 2025</p>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">C4U ("Care For You") is committed to protecting your privacy. This policy explains what data we collect, why, and how we protect it.</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <Section title="1. Who we are">
          <p>C4U is an emotional support application. For privacy matters, you can contact us at: <a href="mailto:landbandg@gmail.com" className="text-primary underline">landbandg@gmail.com</a>.</p>
          <p>As we serve users in the European Union, we comply with the General Data Protection Regulation (GDPR).</p>
        </Section>

        <Section title="2. What data we collect">
          <ul>
            <li><strong>Account data:</strong> Your email address and name, collected when you create an account via Clerk.</li>
            <li><strong>Subscription data:</strong> Your subscription tier and Stripe customer ID, stored securely in your account metadata.</li>
            <li><strong>Support session data:</strong> The text you enter during a support session is sent to Anthropic's AI API to generate your exercises. <strong>We do not store your support session text.</strong> It is processed in real time and discarded.</li>
            <li><strong>Payment data:</strong> Handled entirely by Stripe. We never see or store your card details.</li>
            <li><strong>Usage data:</strong> Standard server logs (IP address, browser type, pages visited) retained for up to 90 days for security and debugging.</li>
          </ul>
        </Section>

        <Section title="3. Legal basis for processing (GDPR)">
          <ul>
            <li><strong>Contract:</strong> We process your account and subscription data to deliver the service you signed up for.</li>
            <li><strong>Legitimate interest:</strong> We process usage logs to maintain security and improve the service.</li>
            <li><strong>Consent:</strong> Where required (e.g. marketing emails), we will ask for your explicit consent.</li>
          </ul>
        </Section>

        <Section title="4. How we use your data">
          <ul>
            <li>To create and manage your account</li>
            <li>To process payments and manage your subscription</li>
            <li>To generate personalised AI support exercises during your session</li>
            <li>To send transactional emails (subscription confirmation, password reset)</li>
            <li>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="5. Third-party services">
          <ul>
            <li><strong>Clerk</strong> — authentication and user management. <a href="https://clerk.com/privacy" target="_blank" rel="noopener" className="text-primary underline">Clerk Privacy Policy</a></li>
            <li><strong>Stripe</strong> — payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener" className="text-primary underline">Stripe Privacy Policy</a></li>
            <li><strong>Anthropic</strong> — AI exercise generation. Your session text is sent to Anthropic's API and subject to their <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener" className="text-primary underline">Privacy Policy</a>. Anthropic does not use API inputs for model training by default.</li>
          </ul>
        </Section>

        <Section title="6. Data retention">
          <ul>
            <li>Account data: retained for as long as your account exists, deleted within 30 days of account deletion.</li>
            <li>Support session text: not stored — discarded immediately after your exercises are generated.</li>
            <li>Payment records: retained for 7 years as required by financial regulations.</li>
            <li>Server logs: retained for 90 days.</li>
          </ul>
        </Section>

        <Section title="7. Your rights under GDPR">
          <p>If you are in the EU/EEA, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data ("right to be forgotten")</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with your national data protection authority</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:landbandg@gmail.com" className="text-primary underline">landbandg@gmail.com</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="8. Cookies">
          <p>We use only strictly necessary cookies for authentication (session tokens via Clerk). We do not use tracking or advertising cookies. No cookie banner is needed for strictly necessary cookies under GDPR.</p>
        </Section>

        <Section title="9. Data transfers">
          <p>Our service providers (Clerk, Stripe, Anthropic) may process data outside the EU. All providers are either EU-US Data Privacy Framework certified or use Standard Contractual Clauses to ensure adequate protection.</p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>We may update this policy. We will notify you by email of any material changes. The "last updated" date at the top will always reflect the current version.</p>
        </Section>

        <Section title="11. Contact">
          <p>Questions? Email <a href="mailto:landbandg@gmail.com" className="text-primary underline">landbandg@gmail.com</a>.</p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex gap-6 text-sm text-muted-foreground">
        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
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
      <div className="text-muted-foreground space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
