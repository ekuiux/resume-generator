export default function PrivacyPage() {
  const wrap: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
    padding: '60px 20px',
    color: '#111827',
  }
  const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10 }
  const p: React.CSSProperties = { fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 12 }

  return (
    <main style={wrap}>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Last updated: May 2025</p>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ ...p, color: '#6B7280' }}>
        This Privacy Policy explains how ResumeBuilder collects, uses, and protects
        your information when you use our service.
      </p>

      <h2 style={h2}>1. Information We Collect</h2>
      <p style={p}>When you use ResumeBuilder, we collect the information you enter into the resume form:</p>
      <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 12 }}>
        <li><strong>Personal details:</strong> name, email address, phone number, city, country</li>
        <li><strong>Professional information:</strong> work experience, job titles, skills, languages</li>
        <li><strong>Education history:</strong> institutions, degrees, dates</li>
        <li><strong>Social links:</strong> LinkedIn and GitHub URLs (optional)</li>
      </ul>
      <p style={p}>
        If you make a purchase, your payment is handled entirely by LemonSqueezy. We do not
        collect or store your credit card number or billing details — these go directly to
        LemonSqueezy's secure payment infrastructure.
      </p>

      <h2 style={h2}>2. How We Use Your Information</h2>
      <p style={p}>The information you provide is used solely to:</p>
      <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 12 }}>
        <li>Generate your resume using our AI service (Anthropic Claude API)</li>
        <li>Render and deliver your PDF download</li>
        <li>Temporarily store your form data in your browser's localStorage for convenience</li>
      </ul>
      <p style={p}>
        We do not use your data for advertising, profiling, or any purpose unrelated to
        generating your resume.
      </p>

      <h2 style={h2}>3. Data Storage & Retention</h2>
      <p style={p}>
        Your resume form data is stored only in your browser's <strong>localStorage</strong> —
        it never leaves your device except when sent to our AI API for generation. We do not
        maintain a database of user resumes. Once your PDF is generated and downloaded, no copy
        is retained on our servers.
      </p>
      <p style={p}>
        Data sent to the Anthropic Claude API for resume generation is subject to
        <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#534AB7' }}> Anthropic's Privacy Policy</a>.
      </p>

      <h2 style={h2}>4. We Do Not Sell Your Data</h2>
      <p style={p}>
        We do not sell, rent, or trade your personal information to any third party, ever.
        Your resume data is your own.
      </p>

      <h2 style={h2}>5. Third-Party Services</h2>
      <p style={p}>We use the following third-party services:</p>
      <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 12 }}>
        <li><strong>Anthropic (Claude API)</strong> — processes your resume content to generate polished text</li>
        <li><strong>LemonSqueezy</strong> — processes payments securely; has its own privacy policy</li>
        <li><strong>Vercel</strong> — hosts the application; may log request metadata (IP, timestamps)</li>
      </ul>

      <h2 style={h2}>6. Cookies</h2>
      <p style={p}>
        We do not use tracking cookies or advertising cookies. The only browser storage we use
        is <strong>localStorage</strong> to save your resume form progress between sessions.
        You can clear this at any time through your browser settings.
      </p>

      <h2 style={h2}>7. Children's Privacy</h2>
      <p style={p}>
        ResumeBuilder is not directed at children under 16. We do not knowingly collect
        personal information from anyone under 16. If you believe a child has provided us
        with their data, please contact us so we can remove it.
      </p>

      <h2 style={h2}>8. Your Rights</h2>
      <p style={p}>
        Since we don't store your personal data on our servers, there is nothing to delete
        or export from our side. To remove your data, simply clear your browser's localStorage.
        For any questions or concerns, contact us directly.
      </p>

      <h2 style={h2}>9. Changes to This Policy</h2>
      <p style={p}>
        We may update this Privacy Policy from time to time. We will post the revised version
        on this page with an updated date. Your continued use of the service after changes
        constitutes acceptance of the new policy.
      </p>

      <h2 style={h2}>10. Contact Us</h2>
      <p style={p}>
        If you have any questions about this Privacy Policy or how we handle your data, please
        contact us at:{' '}
        <a href="mailto:support@resumebuilder.app" style={{ color: '#534AB7' }}>support@resumebuilder.app</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms of Service</a>
        <a href="/pricing" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Pricing</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
