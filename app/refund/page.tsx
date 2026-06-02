export default function RefundPage() {
  const wrap: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
    padding: '60px 24px',
    color: '#111827',
  }
  const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10 }
  const p: React.CSSProperties = { fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 12 }

  return (
    <main style={wrap}>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Last updated: June 2026</p>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Refund Policy</h1>
      <p style={{ ...p, color: '#6B7280' }}>
        This Refund Policy applies to all purchases made on <strong>resumetion.com</strong>.
      </p>

      <h2 style={h2}>All Sales Are Final</h2>
      <p style={p}>
        Because Resumetion delivers a digital product (PDF file) instantly upon payment, all sales are
        final. We do not offer refunds once a PDF has been generated and downloaded. This applies to
        both one-time purchases and weekly subscriptions.
      </p>

      <h2 style={h2}>Technical Delivery Issues</h2>
      <p style={p}>
        If your PDF was not delivered due to a technical error on our side — for example, a server
        failure or generation error — please contact us at{' '}
        <a href="mailto:support@resumetion.com" style={{ color: '#534AB7' }}>support@resumetion.com</a>{' '}
        within <strong>24 hours</strong> of your purchase. We will investigate and either resolve the
        issue or issue a refund at our discretion.
      </p>

      <h2 style={h2}>Weekly Subscriptions</h2>
      <p style={p}>
        Weekly subscriptions can be cancelled at any time — no questions asked. Cancellation stops
        future billing immediately. However, we do not provide partial refunds for the current billing
        period. You retain access until the end of the period you have already paid for.
      </p>

      <h2 style={h2}>Contact Us</h2>
      <p style={p}>
        For any questions or concerns about a purchase, reach out to:{' '}
        <a href="mailto:support@resumetion.com" style={{ color: '#534AB7' }}>support@resumetion.com</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms of Service</a>
        <a href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="/pricing" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Pricing</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
