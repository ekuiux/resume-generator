'use client';

import { useState } from 'react';

const PLANS = [
  {
    id: 'one_time',
    type: 'one_time',
    label: 'One-time Download',
    price: '$2.75',
    period: null,
    badge: null,
    description: 'Download your resume once as PDF',
    features: ['Single PDF download', 'All 6 templates', 'Instant delivery'],
  },
  {
    id: 'weekly',
    type: 'recurring',
    label: 'Weekly Access',
    price: '$3.45',
    period: '/week',
    badge: 'Best value',
    description: 'Unlimited downloads with auto-renewal',
    features: ['Unlimited PDF downloads', 'All 6 templates', 'Auto-renewing weekly', 'Cancel anytime'],
  },
];

export default function PaywallModal({ isOpen, onClose, resumeData, selectedTemplate, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);

      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.type,
          resumeData,
          selectedTemplate,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');

      // Load LemonSqueezy overlay script if not already loaded
      if (!window.LemonSqueezy) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://assets.lemonsqueezy.com/lemon.js';
          script.defer = true;
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      window.LemonSqueezy.Url.Open(data.checkoutUrl);

      window.addEventListener('LemonSqueezyEvent', (event) => {
        if (event.detail?.event === 'Checkout.Success') {
          onClose();
          if (onSuccess) onSuccess();
        }
      }, { once: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>
              Download your resume
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
              Choose a plan to get your PDF
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#999',
              padding: '0 0 0 8px',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  background: isSelected ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                }}
              >
                {/* Radio */}
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid #2563eb' : '2px solid #d1d5db',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'all 0.15s',
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#111' }}>{plan.label}</span>
                    {plan.badge && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#2563eb',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>{plan.description}</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>{plan.price}</span>
                  {plan.period && (
                    <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>{plan.period}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            background: loading ? '#93c5fd' : '#2563eb',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Redirecting to checkout…' : 'Continue to Payment →'}
        </button>

        {/* Trust */}
        <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          🔒 Secure payment via LemonSqueezy · No card stored on our end
        </p>
      </div>
    </div>
  );
}