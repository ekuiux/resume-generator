export default function TermsPage() {
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
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ ...p, color: '#6B7280' }}>
        Please read these Terms of Service carefully before using Resumetion. By accessing or using the service at{' '}
        <strong>resumetion.com</strong>, you agree to be bound by these terms.
      </p>

      <h2 style={h2}>1. Service Description</h2>
      <p style={p}>
        Resumetion is an AI-powered PDF document generation tool that helps users create professional resumes.
        Users provide their personal and professional information; the service uses that information to generate
        a polished, formatted resume as a PDF file. The service is provided on an as-is basis and is intended
        for personal, non-commercial use.
      </p>

      <h2 style={h2}>2. Payment Terms</h2>
      <p style={p}>The service offers two payment options:</p>
      <ul style={ul}>
        <li><strong>One-time purchase ($1.20):</strong> A single payment that grants one PDF download of your generated resume.</li>
        <li><strong>Weekly subscription ($1.80/week):</strong> A recurring subscription granting unlimited PDF downloads while active. Billing occurs weekly and auto-renews until cancelled.</li>
      </ul>
      <p style={p}>
        All payments are processed securely. By completing a purchase, you authorize the applicable charge.
        Subscription charges recur on the same day each week until you cancel.
      </p>

      <h2 style={h2}>3. Refund Policy</h2>
      <p style={p}>
        Due to the digital nature of our product, <strong>all sales are final</strong>. Refunds are not provided
        once a PDF has been generated and downloaded. If you experience a technical issue that prevented delivery
        of your PDF, contact us at{' '}
        <a href="mailto:support@resumetion.com" style={{ color: '#534AB7' }}>support@resumetion.com</a>{' '}
        within 24 hours and we will resolve it promptly.
      </p>

      <h2 style={h2}>4. Acceptable Use</h2>
      <p style={p}>You agree not to:</p>
      <ul style={ul}>
        <li>Submit false, misleading, or fraudulent information for inclusion in a resume</li>
        <li>Use the service to generate content that violates any applicable law or regulation</li>
        <li>Attempt to reverse-engineer, scrape, or overload the service</li>
        <li>Resell, redistribute, or sublicense access to the service</li>
      </ul>
      <p style={p}>We reserve the right to terminate access for users who violate these terms.</p>

      <h2 style={h2}>5. Intellectual Property</h2>
      <p style={p}>
        The resume content generated is based on information you provide and belongs to you.
        The service&apos;s design, code, templates, and branding remain the exclusive property of Resumetion.
        You may not copy, reproduce, or distribute any part of the service without prior written permission.
      </p>

      <h2 style={h2}>6. Limitation of Liability</h2>
      <p style={p}>
        The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the generated
        resume will result in employment or meet any particular employer&apos;s requirements. AI-generated content
        should be reviewed and edited by you before use.
      </p>
      <p style={p}>
        To the maximum extent permitted by law, Resumetion shall not be liable for any indirect, incidental,
        or consequential damages arising from your use of the service. Our total liability shall not exceed
        the amount you paid for the service.
      </p>

      <h2 style={h2}>7. Governing Law</h2>
      <p style={p}>
        These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
        USA, without regard to conflict of law principles. Any disputes shall be resolved in the courts of
        competent jurisdiction in Delaware.
      </p>

      <h2 style={h2}>8. Changes to Terms</h2>
      <p style={p}>
        We may update these Terms from time to time. We will post the revised version on this page with an
        updated date. Your continued use of the service after changes constitutes acceptance of the new terms.
      </p>

      <h2 style={h2}>9. Contact Us</h2>
      <p style={p}>
        If you have any questions about these Terms, please contact us at:{' '}
        <a href="mailto:support@resumetion.com" style={{ color: '#534AB7' }}>support@resumetion.com</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="/refund" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Refund Policy</a>
        <a href="/pricing" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Pricing</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
