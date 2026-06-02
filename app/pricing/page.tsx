export default function PricingPage() {
  const wrap: React.CSSProperties = {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 800,
    margin: '0 auto',
    padding: '60px 24px',
    color: '#111827',
  }
  const check = '✓'

  return (
    <main style={wrap}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.6 }}>
          Download your professional AI-generated resume
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 48 }}>

        {/* One-time Download */}
        <div style={{
          border: '1.5px solid #E5E7EB',
          borderRadius: 16,
          padding: '32px 28px',
          background: '#fff',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            One-time Download
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em' }}>$1.20</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Single PDF download', 'All 6 templates', 'Instant delivery'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                <span style={{ color: '#534AB7', fontWeight: 700, fontSize: 13 }}>{check}</span> {f}
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

        {/* Weekly Access */}
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
          <p style={{ fontSize: 13, fontWeight: 600, color: '#534AB7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Weekly Access
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em' }}>$1.80</span>
            <span style={{ fontSize: 15, color: '#6B7280' }}>/week</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Unlimited downloads', 'All 6 templates', 'Cancel anytime'].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                <span style={{ color: '#534AB7', fontWeight: 700, fontSize: 13 }}>{check}</span> {f}
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

      {/* Trust note */}
      <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
        Secure payment · Card, Google Pay, Apple Pay
      </p>

      {/* Footer links */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
        <a href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms of Service</a>
        <a href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="/refund" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Refund Policy</a>
        <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>← Back to builder</a>
      </div>
    </main>
  )
}
