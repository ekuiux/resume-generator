export default function PrivacyPage() {
  const wrap: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
    padding: '60px 24px',
    color: '#111827',
  }
  const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10 }
  const p: React.CSSProperties = { fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 12 }
  const ul: React.CSSProperties = { fontSize: 15, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 12 }

  return (
    <main style={wrap}>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Last updated: June 2026</p>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ ...p, color: '#6B7280' }}>
        This Privacy Policy explains how Resumetion (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) handles your information when you use{' '}
        <strong>resumetion.com</strong>.
      </p>

      <h2 style={h2}>1. What We Collect</h2>
      <p style={p}>When you use the resume builder, you enter the following information into the form:</p>
      <ul style={ul}>
        <li>Personal details: name, email address, phone number, location</li>
        <li>Professional information: work experience, job titles, skills, languages</li>
        <li>Education history: institutions, degrees, dates</li>
        <li>Links: LinkedIn and portfolio/GitHub URLs (optional)</li>
      </ul>
      <p style={p}>
        No account is required to use the service. We do not collect any information beyond what
        you voluntarily enter into the form.
      </p>

      <h2 style={h2}>2. How We Use Your Information</h2>
      <p style={p}>The information you provide is used solely to generate your resume using our AI service.
        We do not use your data for advertising, profiling, or any purpose unrelated to creating your resume.</p>

      <h2 style={h2}>3. We Do Not Sell or Share Your Data</h2>
      <p style={p}>
        We do not sell, rent, or share your personal information with third parties. Your resume data
        is your own and is never used for any purpose other than generating your document.
      </p>

      <h2 style={h2}>4. Payment Data</h2>
      <p style={p}>
        Payment processing is handled entirely by our payment provider. We never store, access, or
        process your card details — all payment information goes directly to the payment provider&apos;s
        secure infrastructure. We only receive confirmation that a payment was completed.
      </p>

      <h2 style={h2}>5. Data Retention</h2>
      <p style={p}>
        Your form data is stored only in your browser&apos;s <strong>localStorage</strong> — it never leaves
        your device except when sent to our AI API for resume generation. We do not maintain a database
        of user resumes. Once your PDF is generated and downloaded, no copy is retained on our servers.
      </p>
      <p style={p}>
        To remove your data, simply clear your browser&apos;s localStorage through your browser settings.
      </p>

      <h2 style={h2}>6. Cookies</h2>
      <p style={p}>
        We do not use tracking cookies or advertising cookies. The only browser storage we use is
        <strong> localStorage</strong> to save your resume form progress between sessions. No third-party
        tracking scripts are loaded on the site.
      </p>

      <h2 style={h2}>7. Changes to This Policy</h2>
      <p style={p}>
        We may update this Privacy Policy from time to time. We will post the revised version on this
        page with an updated date. Your continued use of the service after changes constitutes
        acceptance of the new policy.
      </p>

      <h2 style={h2}>8. Contact Us</h2>
      <p style={p}>
        If you have any questions about this Privacy Policy, please contact us at:{' '}
        <a href="mailto:support@resumetion.com" style={{ color: '#534AB7' }}>support@resumetion.com</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms of Service</a>
        <a href="/refund" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Refund Policy</a>
        <a href="/pricing" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Pricing</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
