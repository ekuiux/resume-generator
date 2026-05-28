'use client'
import { useState, useEffect, useRef } from 'react'

const PLANS = [
  {
    id: 'one_time',
    priceId: 'pri_01ksrbct5mczj6h7rsf9dszaaa',
    label: 'One-time Download',
    price: '$1.20',
    period: null,
    badge: null,
    features: ['Single PDF download', 'All 6 templates', 'Instant delivery'],
  },
  {
    id: 'weekly',
    priceId: 'pri_01ksrbh404nmt819d2herjz3ap',
    label: 'Weekly Access',
    price: '$1.80',
    period: '/week',
    badge: 'Best value',
    features: ['Unlimited PDF downloads', 'All 6 templates', 'Auto-renewing weekly', 'Cancel anytime'],
  },
]

export default function PaywallModal({ isOpen, onClose, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('weekly')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const paddleLoaded = useRef(false)

  useEffect(() => {
    if (paddleLoaded.current) return
    paddleLoaded.current = true
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = () => {
      // Use sandbox mode if the token starts with 'test_'
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? ''
      if (token.startsWith('test_')) {
        window.Paddle.Environment.set('sandbox')
      }
      window.Paddle.Initialize({
        token,
        eventCallback: (event) => {
          if (event.name === 'checkout.completed') {
            setCheckoutOpen(false)
            onClose()
            if (onSuccess) onSuccess()
          }
        }
      })
    }
    document.head.appendChild(script)
  }, [])

  const handleCheckout = () => {
    const plan = PLANS.find(p => p.id === selectedPlan)
    setCheckoutOpen(true)
    setTimeout(() => {
      window.Paddle.Checkout.open({
        items: [{ priceId: plan.priceId, quantity: 1 }],
        settings: {
          displayMode: 'inline',
          frameTarget: 'paddle-checkout-frame',
          frameInitialHeight: 450,
          frameStyle: 'width: 100%; background-color: transparent; border: none;',
        }
      })
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2rem',
        width: '100%', maxWidth: checkoutOpen ? 520 : 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        fontFamily: 'system-ui, sans-serif',
        transition: 'max-width 0.3s',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>
              {checkoutOpen ? 'Complete payment' : 'Download your resume'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>
              {checkoutOpen ? 'Secure checkout powered by Paddle' : 'Choose a plan to get your PDF'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: '#999', padding: '0 0 0 8px', lineHeight: 1,
          }}>×</button>
        </div>

        {/* Plan selection — hidden when checkout is open */}
        {!checkoutOpen && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
              {PLANS.map(plan => {
                const isSelected = selectedPlan === plan.id
                return (
                  <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16,
                    borderRadius: 12, border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    background: isSelected ? '#eff6ff' : '#fff',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: isSelected ? '5px solid #2563eb' : '2px solid #d1d5db',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>{plan.label}</span>
                        {plan.badge && (
                          <span style={{
                            fontSize: 11, fontWeight: 600, background: '#2563eb',
                            color: '#fff', padding: '2px 8px', borderRadius: 20,
                          }}>{plan.badge}</span>
                        )}
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {plan.features.map(f => (
                          <li key={f} style={{ fontSize: 12, color: '#555', display: 'flex', gap: 6, marginBottom: 2 }}>
                            <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{plan.price}</span>
                      {plan.period && <span style={{ fontSize: 12, color: '#888', display: 'block' }}>{plan.period}</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            <button onClick={handleCheckout} style={{
              width: '100%', padding: 14, borderRadius: 10, border: 'none',
              background: '#2563eb', color: '#fff', fontWeight: 700,
              fontSize: 15, cursor: 'pointer',
            }}>
              Continue to Payment →
            </button>

            <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
              🔒 Secure payment · Card, Google Pay, Apple Pay
            </p>
          </>
        )}

        {/* Paddle inline checkout renders here */}
        <div
          className="paddle-checkout-frame"
          style={{ display: checkoutOpen ? 'block' : 'none', minHeight: checkoutOpen ? 450 : 0 }}
        />
      </div>
    </div>
  )
}
