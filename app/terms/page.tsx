import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Resumetion',
  description: 'Terms of Service for Resumetion AI Resume Builder.',
}

export default function TermsPage() {
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
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#05070A', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: '#AFB2B2', fontSize: 14, margin: '4px 0 40px' }}>Last updated: June 9, 2025</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, color: '#4A4A4D', lineHeight: 1.7, fontSize: 15 }}>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>1. Acceptance of Terms</h2>
            <p style={{ margin: 0 }}>By accessing or using Resumetion ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>2. Description of Service</h2>
            <p style={{ margin: 0 }}>Resumetion is an AI-powered resume builder that allows users to create, customize, and download professional PDF resumes. The Service uses artificial intelligence to generate resume content based on the information you provide.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>3. Payments and Pricing</h2>
            <p style={{ margin: '0 0 10px' }}>Resumetion offers the following paid plans:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>Single Download</strong> — $9.90 one-time payment. Includes one PDF resume download. No subscription.</li>
              <li><strong>Monthly</strong> — $14.90 per month. Includes unlimited resume downloads, all templates, and unlimited edits. You may cancel at any time.</li>
              <li><strong>Annual</strong> — $79.90 per year ($6.66/month, billed annually). Includes unlimited resume downloads, all templates, and unlimited edits. You may cancel at any time.</li>
            </ul>
            <p style={{ margin: '10px 0 0' }}>All payments are processed securely by Creem. Prices are listed in USD. We reserve the right to change pricing with reasonable notice.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>4. Refunds and Cancellations</h2>
            <p style={{ margin: '0 0 10px' }}>
              <strong>Single Download:</strong> Due to the digital nature of the product, all one-time purchases are final and non-refundable once the PDF has been generated and made available for download. If you experience a technical issue preventing download, please contact us at <a href="mailto:support@resumetion.com" style={{ color: '#05070A' }}>support@resumetion.com</a>.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Pro Subscription:</strong> You may cancel your Pro subscription at any time. Cancellation takes effect at the end of the current billing period. No partial refunds are issued for unused time within a billing period.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>5. User Responsibilities</h2>
            <p style={{ margin: '0 0 10px' }}>When using Resumetion, you agree to:</p>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Provide accurate and truthful information in your resume</li>
              <li>Not use the Service to create false, fraudulent, or misleading content</li>
              <li>Not use the Service for any unlawful purpose</li>
              <li>Not attempt to reverse-engineer, scrape, or otherwise misuse the Service</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>6. Intellectual Property</h2>
            <p style={{ margin: 0 }}>The resume content you generate using Resumetion belongs to you. The Service, its design, templates, and underlying technology are owned by Resumetion and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from the Service itself.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>7. AI-Generated Content</h2>
            <p style={{ margin: 0 }}>Resumetion uses <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: '#05070A' }}>Anthropic's Claude</a> to assist in generating resume content. While we strive for quality, AI-generated content may occasionally contain inaccuracies. You are responsible for reviewing and verifying all content in your resume before use. Resumetion is not liable for any consequences arising from the use of AI-generated content.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>8. Disclaimer of Warranties</h2>
            <p style={{ margin: 0 }}>The Service is provided "as is" without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that the AI-generated content will meet your specific needs or guarantee employment outcomes.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>9. Limitation of Liability</h2>
            <p style={{ margin: 0 }}>To the fullest extent permitted by law, Resumetion shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to lost profits or loss of data.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>10. Changes to Terms</h2>
            <p style={{ margin: 0 }}>We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes by updating the date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 10 }}>11. Contact</h2>
            <p style={{ margin: 0 }}>If you have questions about these Terms of Service, please contact us at: <a href="mailto:support@resumetion.com" style={{ color: '#05070A', fontWeight: 500 }}>support@resumetion.com</a></p>
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
        <Link href="/privacy" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Privacy</Link>
      </footer>
    </div>
  )
}
