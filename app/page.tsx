import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { LandingCarousel } from './components/LandingCarousel'
import { LandingScripts } from './components/LandingScripts'
import './landing.css'

export const metadata: Metadata = {
  title: 'AI Resume Builder — Tailored to the Job, ATS-Ready | Resumetion',
  description: 'Paste the job posting and Resumetion rewrites your resume to match it — keyword-aligned to pass ATS scans, written like a person, not a buzzword machine.',
  metadataBase: new URL('https://resumetion.com'),
  alternates: { canonical: 'https://resumetion.com' },
  openGraph: {
    title: 'AI Resume Builder — Tailored to the Job, ATS-Ready | Resumetion',
    description: 'Paste the job posting and Resumetion rewrites your resume to match it — keyword-aligned to pass ATS scans, written like a person, not a buzzword machine.',
    url: 'https://resumetion.com',
    siteName: 'Resumetion',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Resumetion — AI Resume Builder' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder — Tailored to the Job, ATS-Ready | Resumetion',
    description: 'Paste the job posting and Resumetion rewrites your resume — ATS-ready, written like a person.',
    images: ['/og-image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Resumetion',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://resumetion.com',
      offers: [
        { '@type': 'Offer', price: '9.90', priceCurrency: 'USD', name: 'Single download' },
        { '@type': 'Offer', price: '14.90', priceCurrency: 'USD', name: 'Monthly' },
        { '@type': 'Offer', price: '79.90', priceCurrency: 'USD', name: 'Annual' },
      ],
      description: 'AI-powered resume builder that tailors your resume to each job posting — ATS-ready, no clichés.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Will it pass ATS?', acceptedAnswer: { '@type': 'Answer', text: "Yes. Every template uses a clean, single-column-friendly structure with standard section headings that applicant tracking systems parse reliably — and the AI aligns your wording to the posting's keywords." } },
        { '@type': 'Question', name: 'Is my data safe?', acceptedAnswer: { '@type': 'Answer', text: "Your information is used only to generate your resume. We don't sell it, and we don't share it with third parties for advertising." } },
        { '@type': 'Question', name: 'Do I need an account?', acceptedAnswer: { '@type': 'Answer', text: 'No. Start building immediately and see your tailored resume for free — no signup required. You only pay when you download.' } },
        { '@type': 'Question', name: 'Can I edit after generating?', acceptedAnswer: { '@type': 'Answer', text: 'Always. Edit any field, switch templates, and regenerate as many times as you like — your content carries over.' } },
        { '@type': 'Question', name: 'Refunds?', acceptedAnswer: { '@type': 'Answer', text: "If something goes wrong with a download, reach out to support and we'll make it right. Pro subscriptions can be cancelled anytime from your billing portal." } },
      ],
    },
  ],
}

const Arrow = ({ color = 'white' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="cta-arrow" style={{ flexShrink: 0 }}>
    <path d="M10.9998 6L8.6665 8.99998" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M10.9998 5.99998L8.6665 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M1 6L11 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M3 8.5L6.5 12L13 5" stroke="#05070A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevDown = () => (
  <svg className="chev" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8 9.77L3.75 6.23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 9.77L12.25 6.23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const WHY_ITEMS = [
  {
    title: 'Tailored to the posting',
    desc: "Mirrors the role's keywords and reorders your strengths to match what they're actually asking for.",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#05070A" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" stroke="#05070A" strokeWidth="1.5"/><path d="M10 1v3M10 16v3M1 10h3M16 10h3" stroke="#05070A" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    title: 'ATS-friendly',
    desc: "Clean structure that recruiters' resume-scanning software can actually read and parse.",
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="2" height="12" rx="1" fill="#05070A"/><rect x="6" y="4" width="1" height="12" rx="0.5" fill="#05070A"/><rect x="9" y="4" width="2" height="12" rx="1" fill="#05070A"/><rect x="13" y="4" width="1" height="12" rx="0.5" fill="#05070A"/><rect x="16" y="4" width="2" height="12" rx="1" fill="#05070A"/></svg>,
  },
  {
    title: 'No clichés, no invented facts',
    desc: 'Concrete wording drawn only from your real experience — never fabricated achievements.',
    icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5v5c0 4 3.1 7.3 7 8 3.9-.7 7-4 7-8V5L10 2z" stroke="#05070A" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 10l2 2 4-4" stroke="#05070A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
]

const SINGLE_FEATURES = ['1 AI-generated resume', 'Choose from all 6 templates', 'Download as PDF — yours to keep', 'Tailored to one job description']
const PRO_FEATURES    = ['Unlimited resume downloads', 'All 6 templates, switch anytime', 'Edit & regenerate unlimited times', 'Tailored to each job description', 'Priority support']

const FAQ_ITEMS = [
  { n: '01', q: 'Will it pass ATS?',         a: "Yes. Every template uses a clean, single-column-friendly structure with standard section headings that applicant tracking systems parse reliably — and the AI aligns your wording to the posting's keywords.", open: true },
  { n: '02', q: 'Is my data safe?',           a: "Your information is used only to generate your resume. We don't sell it, and we don't share it with third parties for advertising." },
  { n: '03', q: 'Do I need an account?',      a: 'No. Start building immediately and see your tailored resume for free — no signup required. You only pay when you download.' },
  { n: '04', q: 'Can I edit after generating?', a: 'Always. Edit any field, switch templates, and regenerate as many times as you like — your content carries over.' },
  { n: '05', q: 'Refunds?',                   a: "If something goes wrong with a download, reach out to support and we'll make it right. Pro subscriptions can be cancelled anytime from your billing portal." },
]

const CTA_STATS = [
  { val: '0',      label: 'clichés or invented facts' },
  { val: '6',      label: 'designer templates' },
  { val: '4.9',    label: 'average user rating', star: true },
  { val: '10 min', label: 'to a tailored resume' },
]

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div id="top" style={{ position: 'absolute', top: 0, left: 0 }} />

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(247,248,250,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#top" style={{ textDecoration: 'none', display: 'flex' }}>
            <img src="/logo.svg" alt="Resumetion" height={32} />
          </a>
          <div className="nav-links-el" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
            {[['#how', 'How it works'], ['#why', "Why it's different"], ['#templates', 'Templates'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="nav-link" style={{ fontSize: 14, color: 'var(--text)', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, height: 44, padding: '0 22px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Build my resume
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <section className="hero-grid" style={{ paddingTop: 100, paddingBottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border-soft)', padding: '7px 14px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-card)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} /> AI resume builder
            </span>
            <h1 className="hero-title-el" style={{ fontSize: 52, fontWeight: 600, lineHeight: '108%', letterSpacing: '-0.02em', margin: '22px 0 0', maxWidth: 640 }}>
              Most resumes get filtered out. Yours won't.
            </h1>
            <p style={{ fontSize: 18, lineHeight: '165%', color: 'var(--text)', margin: '20px 0 0', maxWidth: 500 }}>
              Paste the job posting. Our AI rewrites your resume to match it — keyword-aligned to pass ATS scans, and written like a person, not a buzzword machine.
            </p>
            <div className="hero-feats" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginTop: 32, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#05070A" strokeWidth="1.5"/><path d="M10 6.5V10L12.5 12" stroke="#05070A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', lineHeight: '100%' }}>Ready in 10 minutes</span>
              </div>
              <div className="feat-divider" style={{ width: 1, height: 14, background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8C6.17835 8 8 6.24204 8 2C8 6.24204 9.80893 8 14 8C9.80893 8 8 9.80893 8 14C8 9.80893 6.17835 8 2 8Z" fill="#05070A" stroke="#05070A" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', lineHeight: '100%' }}>Tailored to each role</span>
              </div>
              <div className="feat-divider" style={{ width: 1, height: 14, background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3.5" y="2.5" width="13" height="15" rx="2" stroke="#05070A" strokeWidth="1.5"/><path d="M7 7h6M7 10.5h6M7 14h4" stroke="#05070A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', lineHeight: '100%' }}>6 designer templates</span>
              </div>
            </div>
            <div className="hero-cta" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, height: 55, padding: '0 30px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Build my resume <Arrow />
              </Link>
              <span className="hero-microcopy" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--text)' }}>
                No signup. See your tailored resume free.
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hero-visual" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', left: -40, top: 20, zIndex: 0 }}>
            <div className="hero-box" style={{ width: 484, height: 484, background: '#F7F8FA', boxShadow: 'inset 0px 0px 114px rgba(0,0,0,0.08)', borderRadius: 28, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hero-img" src="/hero-portrait.webp" alt="Job seeker celebrating her tailored, ATS-ready resume" width={582} height={582} fetchPriority="high" style={{ width: 582, height: 582 }} />
            </div>
            {/* ATS badge */}
            <div id="badge-ats" style={{ position: 'absolute', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-pop)', padding: 16, display: 'flex', alignItems: 'center', background: '#fff', gap: 12, top: -40, left: -102, transition: 'transform .05s linear' }}>
              <svg width="48" height="48" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" fill="none" stroke="#EEF0F2" strokeWidth="5"/>
                <circle cx="32" cy="32" r="27" fill="none" stroke="#9DD162" strokeWidth="5" strokeLinecap="round" strokeDasharray="169.6" strokeDashoffset="14" transform="rotate(-90 32 32)"/>
                <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="600" fill="#05070A" fontFamily="Onest,sans-serif">92%</text>
              </svg>
              <div style={{ paddingRight: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', lineHeight: '100%' }}>Match score</div>
                <div style={{ fontSize: 14, color: 'var(--dim)', lineHeight: '100%' }}>to the job post</div>
              </div>
            </div>
            {/* AI badge */}
            <div id="badge-ai" style={{ position: 'absolute', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-pop)', display: 'flex', alignItems: 'center', background: '#fff', padding: 16, gap: 12, right: -36, bottom: 49, transition: 'transform .05s linear' }}>
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none"><path d="M2 8C6.17835 8 8 6.24204 8 2C8 6.24204 9.80893 8 14 8C9.80893 8 8 9.80893 8 14C8 9.80893 6.17835 8 2 8Z" fill="#05070A" stroke="#05070A" strokeWidth="2" strokeLinejoin="round"/></svg>
              <div style={{ paddingRight: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', lineHeight: '100%' }}>AI-written bullets</div>
                <div style={{ fontSize: 14, color: 'var(--dim)', lineHeight: '100%' }}>polished, never invented</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <section style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="sec-head" style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 32px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#20AFDE' }}>How it works</div>
            <h2 className="sec-h2" style={{ fontSize: 38, fontWeight: 600, lineHeight: '112%', letterSpacing: '-0.015em', margin: '8px 0 0' }}>Three steps to a tailored resume</h2>
            <p className="sec-body" style={{ fontSize: 16, lineHeight: '168%', color: 'var(--text)', margin: '14px 0 0' }}>No blank-page paralysis. Give rough notes and the posting — the AI does the matching.</p>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>

            {/* Step 1 */}
            <div className="step-card" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 10px', maxWidth: 140 }}>Paste your info + the job post</h3>
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--border)', lineHeight: 1, flexShrink: 0 }}>1</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: '162%', color: 'var(--text)', margin: '0 0 24px' }}>Drop in your experience as rough notes, then paste the posting you're applying to. That's the whole setup.</p>
              <div style={{ marginTop: 'auto', height: 195, overflow: 'hidden', background: 'var(--bg-page)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 4 }}>Target role</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Senior Product Designer</div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 4 }}>Job description</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>We're looking for a Senior Designer to lead our product design team, owning end-to-end UX…</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 10px', maxWidth: 140 }}>AI tailors and rewrites</h3>
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--border)', lineHeight: 1, flexShrink: 0 }}>2</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: '162%', color: 'var(--text)', margin: '0 0 24px' }}>Keyword-aligned, ATS-ready, written in plain language — matched to the role.</p>
              <div style={{ marginTop: 'auto', height: 195, overflow: 'hidden', background: 'var(--bg-page)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8C6.17835 8 8 6.24204 8 2C8 6.24204 9.80893 8 14 8C9.80893 8 8 9.80893 8 14C8 9.80893 6.17835 8 2 8Z" fill="#9DD162" stroke="#9DD162" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Generating your resume…</span>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 4 }}>Summary</div>
                  <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.6 }}>Senior Product Designer with 6 years leading end-to-end UX. Reduced onboarding drop-off 34% at Acme by redesigning the…</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-xl)', padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 10px', maxWidth: 140 }}>Pick a template, download PDF</h3>
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--border)', lineHeight: 1, flexShrink: 0 }}>3</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: '162%', color: 'var(--text)', margin: '0 0 24px' }}>Six designs — from minimal to bold. Export a clean, recruiter-ready PDF. Yours to keep.</p>
              <div style={{ marginTop: 'auto', height: 195, overflow: 'hidden', background: 'var(--bg-page)', borderRadius: 12, padding: 16, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ height: '100%', aspectRatio: '210/297', flexShrink: 0, borderRadius: 8, overflow: 'hidden', outline: '1px solid var(--border-soft)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/templates/minimal.jpg" alt="Minimal template" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                </div>
                <div style={{ height: '100%', aspectRatio: '210/297', flexShrink: 0, borderRadius: 8, overflow: 'hidden', outline: '1px solid var(--border-soft)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/templates/prime.jpg" alt="Prime template" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* ── WHY DIFFERENT ── */}
      <div id="why" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <section style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="diff-grid" style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 120, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#FFBE18' }}>Why it's different</div>
              <h2 className="sec-h2" style={{ fontSize: 38, fontWeight: 600, lineHeight: '112%', letterSpacing: '-0.015em', margin: '8px 0 0' }}>
                Most AI tools fill your resume with "results-driven team player." We don't.
              </h2>
              <div className="sec-body" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
                {WHY_ITEMS.map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-page)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, margin: '2px 0 4px' }}>{item.title}</h4>
                      <p style={{ fontSize: 14, lineHeight: '160%', color: 'var(--text)', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-3xl)', padding: 12, boxShadow: 'var(--shadow-card)' }}>
              <div className="diff-panel" style={{ padding: '24px 26px', borderBottom: '1px solid var(--border-soft)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 20, background: 'var(--error-bg)', color: 'var(--danger-soft)' }}>Before · generic AI</span>
                <p style={{ fontSize: 16, lineHeight: '158%', margin: '14px 0 0', color: 'var(--dim)', textDecoration: 'line-through', textDecorationColor: 'rgba(175,178,178,0.6)' }}>
                  Results-driven team player who leveraged synergies to drive impact across cross-functional stakeholders.
                </p>
              </div>
              <div className="diff-panel" style={{ padding: '24px 26px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 20, background: 'var(--green)', color: 'var(--ink)' }}>After · Resumetion</span>
                <p style={{ fontSize: 16, lineHeight: '158%', margin: '14px 0 0', color: 'var(--ink)', fontWeight: 500 }}>
                  Led a 4-person team to ship a checkout redesign that cut cart abandonment 18% in one quarter.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── TEMPLATES ── */}
      <div id="templates" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="sec-head" style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 52px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#FF5674' }}>Templates</div>
            <h2 className="sec-h2" style={{ fontSize: 38, fontWeight: 600, lineHeight: '112%', letterSpacing: '-0.015em', margin: '8px 0 0' }}>Designed to get read</h2>
            <p className="sec-body" style={{ fontSize: 16, lineHeight: '168%', color: 'var(--text)', margin: '14px 0 0' }}>Every template parses cleanly through applicant tracking systems — pick the look, keep the structure.</p>
          </div>
        </div>
        <LandingCarousel />
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <section style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="sec-head" style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 52px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#9DD162' }}>Pricing</div>
            <h2 className="sec-h2" style={{ fontSize: 38, fontWeight: 600, lineHeight: '112%', letterSpacing: '-0.015em', margin: '8px 0 0' }}>Pay once, or go unlimited</h2>
            <p className="sec-body" style={{ fontSize: 16, lineHeight: '168%', color: 'var(--text)', margin: '14px 0 0' }}>No hidden fees. See your tailored resume free — pay only to download.</p>
          </div>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, maxWidth: 1140, margin: '0 auto' }}>

            {/* Single */}
            <div className="plan-card" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-2xl)', padding: 36, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div className="plan-label" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 16 }}>One-time</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                <span className="plan-price" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>$9.90</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 4 }}>one-time · no subscription</div>
              <div className="plan-name" style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 6px' }}>Single download</div>
              <div className="plan-desc" style={{ fontSize: 14, color: 'var(--text)', marginBottom: 24 }}>Best for one targeted application.</div>
              <div className="plan-divider" style={{ height: 1, background: 'var(--border-soft)', marginBottom: 24 }} />
              <div className="plan-features" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {SINGLE_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)' }}><Check /> {f}</div>
                ))}
              </div>
              <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 55, borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginTop: 'auto' }}>
                Get started
              </Link>
            </div>

            {/* Monthly */}
            <div className="plan-card" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-2xl)', padding: 36, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div className="plan-label" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 16 }}>Monthly</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                <span className="plan-price" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>$14.90</span>
                <span style={{ fontSize: 16, color: 'var(--dim)', marginBottom: 8 }}>/month</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 4 }}>cancel anytime</div>
              <div className="plan-name" style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 6px' }}>Monthly</div>
              <div className="plan-desc" style={{ fontSize: 14, color: 'var(--text)', marginBottom: 24 }}>For a single, focused job search.</div>
              <div className="plan-divider" style={{ height: 1, background: 'var(--border-soft)', marginBottom: 24 }} />
              <div className="plan-features" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {PRO_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)' }}><Check /> {f}</div>
                ))}
              </div>
              <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 55, borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginTop: 'auto' }}>
                Start Monthly
              </Link>
            </div>

            {/* Annual */}
            <div className="plan-card" style={{ background: 'var(--bg)', border: '1.5px solid var(--ink)', borderRadius: 'var(--radius-2xl)', padding: 36, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <span className="plan-popular" style={{ position: 'absolute', top: -14, left: 28, background: 'var(--ink)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20 }}>Most Popular</span>
              <div className="plan-label" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 16 }}>Annual</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                <span className="plan-price" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)' }}>$6.66</span>
                <span style={{ fontSize: 16, color: 'var(--dim)', marginBottom: 8 }}>/month</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>billed annually · $79.90/year</div>
              <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 4 }}>save 55% vs monthly</div>
              <div className="plan-name" style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 6px', color: 'var(--ink)' }}>Annual</div>
              <div className="plan-desc" style={{ fontSize: 14, color: 'var(--text)', marginBottom: 24 }}>Best value for an ongoing job hunt.</div>
              <div className="plan-divider" style={{ height: 1, background: 'var(--border-soft)', marginBottom: 24 }} />
              <div className="plan-features" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {PRO_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)' }}><Check /> {f}</div>
                ))}
              </div>
              <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 55, borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', marginTop: 'auto' }}>
                Start Annual
              </Link>
            </div>

          </div>
          <div className="plan-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, fontSize: 14, color: 'var(--dim)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M7 10.5L4.5 8 7 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.5 8h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.5"/></svg>
            Payments securely processed by <a href="https://creem.io" target="_blank" rel="noopener noreferrer" className="creem-link" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Creem</a>
          </div>
        </section>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <section style={{ padding: '40px 0 40px' }}>
          <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#20AFDE' }}>FAQ</div>
              <h2 className="sec-h2" style={{ fontSize: 38, fontWeight: 600, lineHeight: '112%', letterSpacing: '-0.015em', margin: '8px 0 0', color: 'var(--ink)' }}>Questions, answered.</h2>
              <p className="sec-body" style={{ fontSize: 16, lineHeight: '168%', color: 'var(--text)', margin: '16px 0 0' }}>Everything you need to know. If you don't see your question here, drop us a line.</p>
              <div className="faq-content" style={{ marginTop: 32, background: 'var(--bg)', borderRadius: 16, padding: '22px 24px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Still have a question?</div>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>We reply within a few hours.</div>
                <a href="mailto:support@resumetion.com" className="email-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                  support@resumetion.com <Arrow color="currentColor" />
                </a>
              </div>
            </div>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <details
                  key={item.n}
                  open={item.open ? true : undefined}
                  style={i < FAQ_ITEMS.length - 1 ? { borderBottom: '1px solid var(--border-soft)' } : undefined}
                >
                  <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: '#9DD162', minWidth: 18, fontFeatureSettings: "'tnum'" }}>{item.n}</span>
                      <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{item.q}</span>
                    </span>
                    <ChevDown />
                  </summary>
                  <div className="faq-body">
                    <div className="faq-body-inner">
                      <p style={{ fontSize: 16, lineHeight: '170%', color: 'var(--text)', padding: '0 0 28px 36px', margin: 0 }}>{item.a}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <section style={{ paddingBottom: 0 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-3xl)', overflow: 'hidden' }}>
            <div className="cta-inner" style={{ padding: '64px 72px' }}>

              {/* Stats row */}
              <div className="cta-stats" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 56, paddingBottom: 48, borderBottom: '1px solid var(--border-soft)' }}>
                {CTA_STATS.map((stat, i) => (
                  <Fragment key={stat.label}>
                    {i > 0 && <div className="cta-divider" style={{ width: 1, height: 40, background: 'var(--border-soft)', flexShrink: 0 }} />}
                    <div style={{ flex: 1, paddingLeft: i > 0 ? 48 : 0 }}>
                      <div className="stat-val" style={{ fontSize: 38, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: '100%', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {stat.val}
                        {stat.star && (
                          <svg width="28" height="28" viewBox="0 0 16 16" fill="#FFBE18" style={{ flexShrink: 0, transform: 'translateY(1px)' }}><path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z" /></svg>
                        )}
                      </div>
                      <div className="stat-label" style={{ fontSize: 14, color: 'var(--dim)', marginTop: 7 }}>{stat.label}</div>
                    </div>
                  </Fragment>
                ))}
              </div>

              {/* Two-col */}
              <div className="cta-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
                <div>
                  <h2 className="sec-h2-lg" style={{ fontSize: 42, fontWeight: 600, lineHeight: '110%', letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>
                    Get past the filter.<br />Land the interview.
                  </h2>
                  <p className="cta-lead" style={{ fontSize: 16, color: 'var(--text)', margin: '18px 0 32px', lineHeight: '165%' }}>
                    Paste the job posting. Get a keyword-aligned, ATS-ready resume in five minutes — written like a person, not a robot.
                  </p>
                  <Link href="/build" className="cta-btn cta-section-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 55, padding: '0 30px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    Build my resume <Arrow />
                  </Link>
                </div>

                {/* Testimonial */}
                <div className="review-card" style={{ background: '#fff', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '32px 34px', boxShadow: 'var(--shadow-card)' }}>
                  <div className="review-stars" style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="15" height="15" viewBox="0 0 16 16" fill="#FFBE18"><path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z"/></svg>
                    ))}
                  </div>
                  <p className="review-text" style={{ fontSize: 18, lineHeight: '168%', color: 'var(--ink)', margin: '0 0 24px', fontStyle: 'italic' }}>
                    "My old resume read like every other template. I pasted the job post, and it rewrote everything around the actual role — specific, and finally in my own voice."
                  </p>
                  <div className="review-divider" style={{ height: 1, background: 'var(--border-soft)', marginBottom: 20 }} />
                  <div className="review-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(32,175,222,0.12)', border: '1px solid rgba(32,175,222,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#20AFDE', flexShrink: 0 }}>MK</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Maya K.</div>
                        <div style={{ fontSize: 12, color: 'var(--dim)' }}>Marketing Manager</div>
                      </div>
                    </div>
                    <div className="review-hired" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-page)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '5px 12px' }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Tailored to the role</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ paddingTop: 32, paddingBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', fontSize: 14, color: 'var(--dim)' }}>
            <span>© 2026 Resumetion</span>
            <span>·</span>
            <a href="mailto:support@resumetion.com" className="footer-link" style={{ color: 'var(--dim)', textDecoration: 'none' }}>support@resumetion.com</a>
            <span>·</span>
            <a href="#pricing" className="footer-link" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Pricing</a>
            <span>·</span>
            <Link href="/terms"   className="footer-link" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Terms</Link>
            <span>·</span>
            <Link href="/privacy" className="footer-link" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Privacy</Link>
          </div>
        </div>
      </footer>

      <LandingScripts />
    </>
  )
}
