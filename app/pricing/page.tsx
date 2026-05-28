export default function PricingPage() {
  const wrap: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
    padding: '60px 20px',
    color: '#111827',
  }

  return (
    <main style={wrap}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#534AB7', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
          Pricing
        </p>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Pay only when you're ready to download. No account required.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 48 }}>

        {/* One-time */}
        <div style={{
          border: '1.5px solid #E5E7EB',
          borderRadius: 16,
          padding: '32px 28px',
          background: '#fff',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>One-time</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em' }}>$2.75</span>
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Single PDF download</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['1 PDF download', 'All 6 premium templates', 'AI-polished content', 'Instant delivery'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                <span style={{ color: '#534AB7', fontWeight: 700, fontSize: 12 }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <a href="/" style={{
            display: 'block', textAlign: 'center',
            padding: '12px 24px', borderRadius: 10,
            border: '1.5px solid #534AB7', color: '#534AB7',
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Get started →
          </a>
        </div>

        {/* Weekly */}
        <div style={{
          border: '2px solid #534AB7',
          borderRadius: 16,
          padding: '32px 28px',
          background: '#EEEDFE',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
            background: '#534AB7', color: '#fff',
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
            padding: '3px 12px', borderRadius: 20, textTransform: 'uppercase',
          }}>
            Best value
          </span>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#534AB7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Weekly</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em' }}>$3.45</span>
            <span style={{ fontSize: 15, color: '#6B7280' }}>/week</span>
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Unlimited downloads, auto-renews</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Unlimited PDF downloads', 'All 6 premium templates', 'AI-polished content', 'Auto-renewing weekly', 'Cancel anytime'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                <span style={{ color: '#534AB7', fontWeight: 700, fontSize: 12 }}>✓</span> {f}
              </li>
            ))}
          </ul>
          <a href="/" style={{
            display: 'block', textAlign: 'center',
            padding: '12px 24px', borderRadius: 10,
            background: '#534AB7', color: '#fff',
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Get started →
          </a>
        </div>

      </div>

      {/* FAQ */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Common questions</h2>
        {[
          ['Do I need an account?', 'No. Fill in your details, generate your resume, and pay only when you want to download.'],
          ['What formats are supported?', 'PDF only — the format employers expect.'],
          ['Can I cancel my weekly subscription?', 'Yes, cancel anytime from your LemonSqueezy customer portal.'],
          ['Is my data safe?', 'Your resume data is processed to generate your PDF and is not stored on our servers permanently.'],
        ].map(([q, a]) => (
          <div key={q} style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{q}</p>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{a}</p>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms of Service</a>
        <a href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
