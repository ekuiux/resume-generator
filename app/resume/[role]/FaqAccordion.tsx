'use client'
import { useState } from 'react'

type Faq = { q: string; a: string }

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 760 }}>
      {faqs.map((f, i) => (
        <div key={i} style={i < faqs.length - 1 ? { borderBottom: '1px solid var(--border-soft)' } : undefined}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}
          >
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{f.q}</span>
            <svg
              width="18" height="18" viewBox="0 0 16 16" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0, transition: 'transform .2s', transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ display: 'grid', gridTemplateRows: open === i ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
            <div style={{ minHeight: 0, overflow: 'hidden' }}>
              <p style={{ fontSize: 16, lineHeight: '170%', color: 'var(--text)', margin: '0 0 22px' }}>{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
