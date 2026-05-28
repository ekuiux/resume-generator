export default function TermsPage() {
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
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ ...p, color: '#6B7280' }}>
        Please read these Terms of Service carefully before using the resume builder service.
        By accessing or using the service, you agree to be bound by these terms.
      </p>

      <h2 style={h2}>1. Service Description</h2>
      <p style={p}>
        ResumeBuilder is an AI-powered web application that helps users create professional resumes.
        Users provide their personal and professional information; the service uses that information
        to generate a polished, formatted resume document (PDF). The service is provided on an
        as-is basis and is intended for personal, non-commercial use.
      </p>

      <h2 style={h2}>2. Payment Terms</h2>
      <p style={p}>
        The service offers two payment options:
      </p>
      <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 12 }}>
        <li><strong>One-time download ($2.75):</strong> A single payment that grants one PDF download of your generated resume.</li>
        <li><strong>Weekly subscription ($3.45/week):</strong> A recurring subscription that grants unlimited PDF downloads while the subscription is active. Billing occurs weekly and auto-renews until cancelled.</li>
      </ul>
      <p style={p}>
        All payments are processed securely by LemonSqueezy. By completing a purchase, you
        authorize the applicable charge. Subscription charges will recur on the same day each week
        until you cancel.
      </p>

      <h2 style={h2}>3. Cancellation</h2>
      <p style={p}>
        Weekly subscribers may cancel at any time through the LemonSqueezy customer portal linked
        in your purchase confirmation email. Cancellation takes effect at the end of the current
        billing period; you retain access until that date.
      </p>

      <h2 style={h2}>4. Refund Policy</h2>
      <p style={p}>
        Because the service delivers a digital product (PDF file) immediately upon payment, all
        sales are final and <strong>no refunds are issued</strong> once a download has been
        completed. If you experience a technical issue that prevents you from receiving your PDF,
        contact us at support@resumebuilder.app within 48 hours and we will resolve it promptly.
      </p>

      <h2 style={h2}>5. Acceptable Use</h2>
      <p style={p}>You agree not to:</p>
      <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, paddingLeft: 20, marginBottom: 12 }}>
        <li>Submit false, misleading, or fraudulent information for inclusion in a resume</li>
        <li>Use the service to generate content that violates any applicable law or regulation</li>
        <li>Attempt to reverse-engineer, scrape, or overload the service</li>
        <li>Resell, redistribute, or sublicense access to the service</li>
      </ul>
      <p style={p}>
        We reserve the right to terminate access for users who violate these terms.
      </p>

      <h2 style={h2}>6. Intellectual Property</h2>
      <p style={p}>
        The resume content generated is based on information you provide and belongs to you.
        The service's design, code, templates, and branding remain the property of ResumeBuilder.
      </p>

      <h2 style={h2}>7. Disclaimer of Warranties</h2>
      <p style={p}>
        The service is provided "as is" without warranties of any kind. We do not guarantee that
        the generated resume will result in employment or meet any particular employer's requirements.
        AI-generated content should be reviewed and edited by you before use.
      </p>

      <h2 style={h2}>8. Limitation of Liability</h2>
      <p style={p}>
        To the maximum extent permitted by law, ResumeBuilder shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the service. Our total
        liability shall not exceed the amount you paid for the service.
      </p>

      <h2 style={h2}>9. Governing Law</h2>
      <p style={p}>
        These Terms shall be governed by and construed in accordance with the laws of the
        European Union, without regard to conflict of law principles. Any disputes shall be
        resolved in the courts of competent jurisdiction.
      </p>

      <h2 style={h2}>10. Changes to Terms</h2>
      <p style={p}>
        We may update these Terms from time to time. Changes will be posted on this page with
        an updated date. Continued use of the service after changes constitutes acceptance.
      </p>

      <h2 style={h2}>11. Contact</h2>
      <p style={p}>
        For questions about these Terms, contact us at:{' '}
        <a href="mailto:support@resumebuilder.app" style={{ color: '#534AB7' }}>support@resumebuilder.app</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="/pricing" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Pricing</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
