import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Resumetion',
  description: 'Privacy Policy for Resumetion AI Resume Builder.',
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: 'var(--font-onest), system-ui, sans-serif' }}>
      <style>{`
        .back-btn:hover { background: #F7F8FA !important; }
        .back-btn:hover .back-arrow { transform: translateX(-3px); }
        .back-arrow { transition: transform .15s; flex-shrink: 0; }
      `}</style>

      {/* Fixed back button */}
      <div style={{ position: 'fixed', top: 59, right: 'calc(50% + 376px)', zIndex: 20 }}>
        <Link href="/" className="back-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', whiteSpace: 'nowrap',
          fontSize: 14, fontWeight: 600, color: '#4A4A4D',
          padding: '10px 24px', borderRadius: 38,
          border: '1px solid rgba(175,178,178,0.3)', background: '#fff',
          boxSizing: 'border-box', transition: 'background .15s',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="back-arrow">
            <path d="M1.00065 6L3.33398 3.00002" stroke="#4A4A4D" strokeWidth="2" strokeLinecap="round"/>
            <path d="M1.00065 6.00002L3.33398 9" stroke="#4A4A4D" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 6L1 6" stroke="#4A4A4D" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Back
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#05070A', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#AFB2B2', fontSize: 14, margin: '4px 0 40px' }}>Last updated: June 9, 2025</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, color: '#4A4A4D', lineHeight: 1.7, fontSize: 15 }}>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>1. Introduction</h2>
            <p style={{ margin: 0 }}>Resumetion ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI resume builder at resumetion.com.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>2. Information We Collect</h2>
            <p style={{ margin: '0 0 10px' }}>We collect the following types of information:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Resume content:</strong> Information you enter to build your resume (name, contact details, work experience, education, skills, etc.). This data is processed to generate your resume and is stored locally in your browser (localStorage).</li>
              <li><strong>Payment information:</strong> When you make a purchase, payment is processed by Creem. We do not store your credit card or payment details on our servers.</li>
              <li><strong>Usage analytics:</strong> We use PostHog to collect anonymous usage data such as page views, button clicks, and feature usage to improve the Service. This data does not identify you personally.</li>
              <li><strong>Email address:</strong> If you provide an email in your resume, it is used solely for generating your resume content and is not stored by us beyond your browser session.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>3. How We Use Your Information</h2>
            <p style={{ margin: '0 0 10px' }}>We use the information we collect to:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Generate your AI-powered resume</li>
              <li>Process payments for paid plans</li>
              <li>Improve and optimize the Service</li>
              <li>Respond to customer support inquiries</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>4. AI Processing</h2>
            <p style={{ margin: 0 }}>Resumetion is powered by <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: '#05070A' }}>Anthropic's Claude</a>. The resume content you provide is sent to Anthropic's Claude API to generate professional resume text. Anthropic processes this data according to their own privacy policy. We do not retain your resume data on our servers after generation is complete — your data is stored in your browser's localStorage only.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>5. Data Sharing</h2>
            <p style={{ margin: '0 0 10px' }}>We do not sell your personal information. We share data only with the following service providers:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Anthropic</strong> — for AI resume generation</li>
              <li><strong>Creem</strong> — for payment processing</li>
              <li><strong>PostHog</strong> — for anonymous usage analytics</li>
              <li><strong>Vercel</strong> — for website hosting</li>
            </ul>
            <p style={{ margin: '10px 0 0' }}>Each of these providers has their own privacy policy and processes data in accordance with applicable laws.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>6. Cookies and Tracking</h2>
            <p style={{ margin: 0 }}>We use minimal tracking. PostHog may set cookies for analytics purposes. Your resume data is stored in your browser's localStorage, not in cookies. You can clear your browser's localStorage at any time to remove stored resume data.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>7. Data Retention</h2>
            <p style={{ margin: 0 }}>Resume content is stored only in your browser's localStorage and is never persisted on our servers. Payment records are retained by Creem in accordance with their data retention policy. Anonymous analytics data is retained by PostHog for up to 12 months.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>8. Your Rights</h2>
            <p style={{ margin: '0 0 10px' }}>You have the right to:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Opt out of analytics tracking</li>
              <li>Clear your locally stored resume data by clearing your browser's localStorage</li>
            </ul>
            <p style={{ margin: '10px 0 0' }}>To exercise these rights, contact us at <a href="mailto:support@resumetion.com" style={{ color: '#05070A' }}>support@resumetion.com</a>.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>9. Children's Privacy</h2>
            <p style={{ margin: 0 }}>The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>10. Changes to This Policy</h2>
            <p style={{ margin: 0 }}>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Your continued use of the Service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>11. Contact Us</h2>
            <p style={{ margin: 0 }}>If you have questions or concerns about this Privacy Policy, please contact us at: <a href="mailto:support@resumetion.com" style={{ color: '#05070A', fontWeight: 500 }}>support@resumetion.com</a></p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(175,178,178,0.3)',
        padding: '24px',
        display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center',
        fontSize: 13, color: '#AFB2B2',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Resumetion" width={120} height={26} style={{ display: 'block', opacity: 0.5 }} />
        </Link>
        <span>·</span>
        <a href="mailto:support@resumetion.com" style={{ color: '#AFB2B2', textDecoration: 'none' }}>support@resumetion.com</a>
        <span>·</span>
        <Link href="/pricing" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Pricing</Link>
        <span>·</span>
        <Link href="/terms" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Terms</Link>
      </footer>
    </div>
  )
}
