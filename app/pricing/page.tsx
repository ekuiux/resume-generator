import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Resumetion',
  description: 'Simple, transparent pricing. Download your AI-generated resume once or get unlimited access.',
}

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="8" cy="8" r="8" fill="#9DD162" />
    <path d="M4.5 8L7 10.5L11.5 6" stroke="#05070A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PLANS = [
  {
    id: 'single',
    name: 'Single download',
    price: '$4.90',
    period: null,
    priceNote: 'one-time · no subscription',
    badge: null,
    forWho: 'For one-time job applications',
    features: [
      '1 AI-generated resume',
      'Download as PDF',
      'Choose from 6 templates',
      'Yours to keep forever',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.90',
    period: '/month',
    priceNote: 'cancel anytime',
    badge: 'Most popular',
    forWho: 'For active job seekers',
    features: [
      'Unlimited resume downloads',
      'All 6 templates, switch anytime',
      'Edit & regenerate unlimited times',
      'Tailored to any job description',
    ],
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <>
      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 40px 24px 0;
          max-width: 880px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (max-width: 680px) {
          .plans-grid { grid-template-columns: 1fr; }
        }
        .cta-btn:hover { background: #1f2024 !important; }
        .cta-btn:hover .cta-arrow { transform: translateX(3px); }
        .cta-arrow { transition: transform .15s; flex-shrink: 0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: 'var(--font-onest), system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ height: 68, display: 'flex', alignItems: 'center', padding: '0 24px', maxWidth: 1280, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Resumetion" width={154} height={34} style={{ display: 'block' }} />
          </Link>
        </header>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '48px 24px 16px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: '110%', color: '#000', margin: '0 0 12px' }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: '170%', color: '#000', margin: 0 }}>
            Pay once or get unlimited access. No hidden fees.
          </p>
        </div>

        {/* Plan cards */}
        <div className="plans-grid">
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: '#fff',
              border: plan.highlight ? '2px solid #05070A' : '1.5px solid rgba(175,178,178,0.4)',
              borderRadius: 20,
              padding: '32px 28px',
              display: 'flex', flexDirection: 'column', gap: 20,
              position: 'relative',
            }}>
              {/* Badge */}
              {plan.badge && (
                <span style={{
                  position: 'absolute', top: -12, left: 28,
                  background: '#9DD162', color: '#05070A',
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 12px', borderRadius: 20,
                }}>{plan.badge}</span>
              )}

              {/* Name + price */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#05070A' }}>{plan.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#05070A' }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 14, color: '#AFB2B2' }}>{plan.period}</span>}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#AFB2B2' }}>{plan.priceNote}</p>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#4A4A4D' }}>{plan.forWho}</p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(175,178,178,0.25)' }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#4A4A4D' }}>
                    {CHECK} {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA below cards */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 24px 80px' }}>
          <Link href="/" className="cta-btn" style={{
            fontSize: 14, fontWeight: 600, color: '#fff',
            textDecoration: 'none', padding: '20px 32px',
            background: '#05070A', borderRadius: 38,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            height: 55, boxSizing: 'border-box', transition: 'background .15s',
          }}>
            Build my resume
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="cta-arrow">
              <path d="M10.9998 6L8.6665 8.99998" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10.9998 5.99998L8.6665 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M1 6L11 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(175,178,178,0.3)',
          padding: '24px',
          display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center',
          fontSize: 13, color: '#AFB2B2',
        }}>
          <span>© {new Date().getFullYear()} Resumetion</span>
          <span>·</span>
          <a href="mailto:support@resumetion.com" style={{ color: '#AFB2B2', textDecoration: 'none' }}>support@resumetion.com</a>
          <span>·</span>
          <Link href="/terms" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Terms</Link>
          <span>·</span>
          <Link href="/privacy" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Privacy</Link>
        </footer>
      </div>
    </>
  )
}
