'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import dynamic from 'next/dynamic'

const ResumePreview = dynamic(
  () => import('./ResumePDF').then(m => m.ResumePreview),
  { ssr: false, loading: () => <div style={{ height: 600, background: '#f9fafb', borderRadius: 12 }} /> }
)
const ResumeDownloadButton = dynamic(
  () => import('./ResumePDF').then(m => m.ResumeDownloadButton),
  { ssr: false }
)

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'minimal',   name: 'Minimal',   swatch: '#f1efe8', accent: '#1a1a1a', badge: { text: 'Popular', bg: '#05070A', color: '#fff' } },
  { id: 'corporate', name: 'Corporate', swatch: '#B5D4F4', accent: '#1e3a5f', badge: null },
  { id: 'modern',    name: 'Modern',    swatch: '#c7d2fe', accent: '#6c63ff', badge: { text: 'New', bg: '#9DD162', color: '#05070A' } },
  { id: 'elegant',   name: 'Elegant',   swatch: '#e8e4dc', accent: '#2c2c2a', badge: null },
  { id: 'startup',   name: 'Startup',   swatch: '#1a1a2e', accent: '#4f46e5', badge: null },
  { id: 'academic',  name: 'Academic',  swatch: '#dce6f0', accent: '#003366', badge: null },
]

const INDUSTRIES = [
  { id: 'tech',      icon: '💻', name: 'Technology',  sub: 'Engineering · Product' },
  { id: 'design',    icon: '🎨', name: 'Design',      sub: 'UX · Brand · Motion' },
  { id: 'marketing', icon: '📣', name: 'Marketing',   sub: 'Growth · Content · SEO' },
  { id: 'finance',   icon: '📊', name: 'Finance',     sub: 'Banking · Accounting' },
  { id: 'sales',     icon: '📈', name: 'Sales',       sub: 'BD · Account Mgmt' },
  { id: 'hr',        icon: '👥', name: 'People & HR', sub: 'Recruiting · L&D' },
  { id: 'health',    icon: '❤️', name: 'Healthcare',  sub: 'Medical · Biotech' },
  { id: 'legal',     icon: '⚖️', name: 'Legal',       sub: 'Law · Compliance' },
  { id: 'other',     icon: '···', name: 'Other',      sub: '' },
]

const LANG_LEVELS  = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STEP_NAMES   = ['Basic Info', 'Experience', 'Skills', 'Links']
const LANG_SUGG    = ['English','Spanish','French','German','Portuguese','Italian','Russian','Chinese','Japanese','Korean','Arabic','Hindi','Dutch','Swedish','Norwegian','Danish','Finnish','Polish','Turkish','Ukrainian','Hebrew','Persian','Thai','Vietnamese','Indonesian','Malay','Romanian','Hungarian','Greek','Czech']

const SKILL_SUGGESTIONS = {
  design:    ['Figma', 'Design Systems', 'UX Research', 'Prototyping', 'Product Thinking', 'A/B Testing', 'Sketch', 'Adobe XD', 'User Testing', 'Wireframing', 'Typography', 'Visual Design'],
  dev:       ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Git', 'REST APIs', 'SQL', 'Docker', 'AWS', 'CSS', 'HTML', 'GraphQL'],
  product:   ['Product Strategy', 'Roadmapping', 'Agile', 'Scrum', 'Stakeholder Management', 'OKRs', 'Analytics', 'Jira', 'User Research', 'A/B Testing'],
  marketing: ['SEO', 'Google Analytics', 'Content Strategy', 'Email Marketing', 'Social Media', 'Copywriting', 'CRO', 'Paid Ads', 'HubSpot', 'Data Analysis'],
  finance:   ['Financial Modeling', 'Excel', 'Data Analysis', 'SQL', 'Python', 'Forecasting', 'Budgeting', 'Bloomberg', 'Risk Management'],
  sales:     ['CRM', 'Salesforce', 'Negotiation', 'Pipeline Management', 'Cold Outreach', 'LinkedIn Sales Navigator', 'Account Management'],
  hr:        ['Recruiting', 'Talent Acquisition', 'Onboarding', 'HRIS', 'Performance Management', 'Employee Relations', 'Workday', 'BambooHR'],
}
function getSkillSuggestions(targetRole) {
  const r = (targetRole || '').toLowerCase()
  if (/design|ux|ui|visual/.test(r))                               return SKILL_SUGGESTIONS.design
  if (/developer|engineer|frontend|backend|fullstack|software/.test(r)) return SKILL_SUGGESTIONS.dev
  if (/product manager|pm |product owner|program manager/.test(r)) return SKILL_SUGGESTIONS.product
  if (/market|growth|seo|content|social/.test(r))                  return SKILL_SUGGESTIONS.marketing
  if (/financ|analyst|account|banker|invest/.test(r))              return SKILL_SUGGESTIONS.finance
  if (/sales|account exec|business dev/.test(r))                   return SKILL_SUGGESTIONS.sales
  if (/\bhr\b|recruit|people ops|talent|human res/.test(r))        return SKILL_SUGGESTIONS.hr
  return []
}
const PDF_TEMPLATE_MAP = {
  minimal:   'minimal',
  corporate: 'corporate',
  startup:   'startup',
  academic:  'academic',
  modern:    'creative',
  elegant:   'elegant',
}
const ROW_H = 44

let _uid = 0
const uid = () => ++_uid

const INITIAL_FORM = {
  template:        null,
  // Step 1
  targetRole:      '',
  name:            '',
  email:           '',
  jobDescription:  '',
  // Step 2
  experience:      [],
  // Step 3
  skills:          [],           // string[]
  languages:       [{ id: uid(), name: '', level: 3 }],
  education:       [],           // { id, text }[]
  // Step 4
  phone:           '',
  location:        '',
  linkedin:        '',
  portfolio:       '',
}

const LS_KEY = 'resume-form-v2'

function loadSavedForm() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_FORM
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  text1: '#111827', text2: '#6B7280', text3: '#9CA3AF',
  border1: '#E5E7EB', border2: '#F3F4F6',
  bg1: '#ffffff', bg2: '#F3F4F6',
  accent: '#534AB7', accentL: '#EEEDFE', accentD: '#3C3489',
  success: '#4CAF50',
  r8: 8, r10: 10, r12: 12,
  f11: 11, f12: 12, f13: 13, f14: 14, f15: 15, f20: 20,
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return isMobile
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Input({ style, error, ...props }) {
  const [focused, setFocused] = useState(false)
  const borderColor = error ? '#EF4444' : focused ? '#05070A' : 'rgba(175,178,178,0.5)'
  const shadow = focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none'
  return (
    <input
      {...props}
      style={{
        width: '100%', fontFamily: 'inherit', fontSize: 14,
        color: '#05070A', background: '#fff',
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        height: 47, padding: '0 16px', outline: 'none',
        boxSizing: 'border-box',
        boxShadow: shadow,
        transition: 'border-color .15s, box-shadow .15s', ...style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

function AutoInput({ value, onChange, placeholder, suggestions = [], style, showOnFocus = false, ...rest }) {
  const [open, setOpen]       = useState(false)
  const [dropRect, setDropRect] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const wrapRef = useRef(null)
  const q = (value || '').toLowerCase()

  // showOnFocus: full list on focus, filter only when actively typing
  const filterQ = showOnFocus ? (isTyping ? q : '') : q
  const hits = open
    ? (filterQ.length > 0
        ? suggestions.filter(s => s.toLowerCase().startsWith(filterQ))
        : showOnFocus ? suggestions
        : []
      ).slice(0, 12)
    : []

  function calcRect() {
    if (wrapRef.current) setDropRect(wrapRef.current.getBoundingClientRect())
  }

  function handleChange(e) {
    setIsTyping(true)
    onChange(e)
  }

  return (
    <div ref={wrapRef}>
      <Input value={value} onChange={handleChange} placeholder={placeholder} style={style}
        onFocus={() => { calcRect(); setOpen(true); setIsTyping(false) }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        {...rest}
      />
      {open && hits.length > 0 && dropRect && (
        <div style={{
          position: 'fixed',
          top: dropRect.bottom + 4,
          left: dropRect.left,
          width: dropRect.width,
          zIndex: 9999,
          background: T.bg1,
          border: `1.5px solid ${T.border1}`,
          borderRadius: T.r10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          maxHeight: 240,
          overflowY: 'auto',
        }}>
          {hits.map((s, i) => (
            <div key={s} onMouseDown={() => { onChange({ target: { value: s } }); setOpen(false); setIsTyping(false) }}
              style={{
                padding: '10px 14px', fontSize: T.f13, cursor: 'pointer', color: T.text1,
                borderBottom: i < hits.length - 1 ? `0.5px solid ${T.border2}` : 'none',
                background: T.bg1, transition: 'background .1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg2}
              onMouseLeave={e => e.currentTarget.style.background = T.bg1}
            >{s}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function Textarea({ style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      rows={4}
      style={{
        width: '100%', fontFamily: 'inherit', fontSize: 14,
        color: T.text1, background: T.bg1,
        border: `1px solid ${focused ? '#05070A' : 'rgba(175,178,178,0.5)'}`,
        borderRadius: 12, padding: '11px 16px', outline: 'none',
        boxSizing: 'border-box', resize: 'none', minHeight: 88, lineHeight: 1.6,
        boxShadow: focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none',
        transition: 'border-color .15s, box-shadow .15s', ...style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

function Lbl({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: 12, fontWeight: 600,
      letterSpacing: '.04em', textTransform: 'uppercase', color: '#AFB2B2',
    }}>{children}</label>
  )
}

function Field({ label, hint, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <Lbl>{label}</Lbl>}
      {children}
      {hint && <p style={{ fontSize: 12, color: '#AFB2B2', marginTop: 0, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

function Grid2({ children, style }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...style }}>{children}</div>
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(175,178,178,0.3)' }} />
}

function SecLbl({ children }) {
  return (
    <span style={{
      display: 'block', fontSize: T.f11, fontWeight: 600,
      letterSpacing: '.07em', textTransform: 'uppercase', color: T.text3, marginBottom: '.75rem',
    }}>{children}</span>
  )
}


function BtnPrimary({ children, disabled, onClick, style }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{
      fontSize: 14, fontWeight: 600, padding: '20px 32px',
      borderRadius: 38, border: 'none',
      background: disabled ? '#AFB2B2' : '#05070A',
      color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit', height: 55,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'background .15s', ...style,
    }}>{children}</button>
  )
}

function BtnSecondary({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      fontSize: 14, fontWeight: 600, padding: '20px 32px',
      borderRadius: 38, border: '1px solid rgba(175,178,178,0.3)',
      background: '#fff', color: '#4A4A4D',
      cursor: 'pointer', fontFamily: 'inherit', height: 55,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  )
}

function BtnTextAdd({ children, onClick, style }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(175,178,178,0.12)' : 'none',
        border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 600, color: '#05070A',
        fontFamily: 'inherit', padding: '8px 16px',
        textAlign: 'left', borderRadius: 20,
        transition: 'background .15s',
        ...style,
      }}>{children}</button>
  )
}

function BtnAdd({ children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: 11, borderRadius: T.r10, fontFamily: 'inherit',
        border: `1.5px dashed ${hov ? T.accent : T.border1}`,
        background: 'none', color: hov ? T.accent : T.text2,
        fontSize: T.f13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'border-color .15s, color .15s',
      }}>{children}</button>
  )
}


// ─── Shared header ────────────────────────────────────────────────────────────

function AppHeader({ children }) {
  return (
    <div style={{
      background: '#F7F8FA',
      height: 68,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── Logo mark ────────────────────────────────────────────────────────────────

function LogoMark({ style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, ...style }}>
      <img src="/logo.svg" alt="Resumetion" width={154} height={34} style={{ display: 'block' }} />
    </div>
  )
}

// ─── Header progress bar ──────────────────────────────────────────────────────

function HeaderProgress({ step }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <span style={{ fontSize: 13, fontWeight: 600, color: '#05070A' }}>
        Step {step} of 4
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      {STEP_NAMES.map((name, i) => {
        const num = i + 1
        const done = step === 0 ? true : num < step
        const active = step === 0 ? false : num === step
        const dotBg   = done ? '#9DD162' : active ? '#05070A' : '#E5E5EA'
        const dotColor = done ? '#05070A' : active ? '#ffffff' : '#05070A'
        const textColor = active ? '#05070A' : '#4A4A4D'
        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: dotBg, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: dotColor,
              fontFamily: 'var(--font-onest), system-ui, sans-serif',
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="#05070A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : num}
            </div>
            <span style={{
              fontSize: 12, lineHeight: '110%', color: textColor,
              fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
              fontFamily: 'var(--font-onest), system-ui, sans-serif',
            }}>
              {name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Footer({ step, onBack, onNext, nextLabel }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: '#fff', padding: '12px 16px 28px',
        borderTop: '1px solid rgba(175,178,178,0.3)',
        display: 'flex', gap: 10,
      }}>
        <BtnSecondary onClick={onBack}>← Back</BtnSecondary>
        <BtnPrimary onClick={onNext} style={{ flex: 1 }}>{nextLabel || 'Continue →'}</BtnPrimary>
      </div>
    )
  }

  return (
    <>
      <div style={{ height: 1, background: 'rgba(175,178,178,0.3)', margin: '0' }} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0',
      }}>
        <BtnSecondary onClick={onBack}>← Back</BtnSecondary>
        <BtnPrimary onClick={onNext}>{nextLabel || 'Continue →'}</BtnPrimary>
      </div>
    </>
  )
}

// ─── Skeleton preview ─────────────────────────────────────────────────────────

const STEP_BADGE = { 1: 'Header', 2: 'Profile', 3: 'Experience', 4: 'Skills', 0: 'Review' }

function ResumeDocPreview({ step }) {
  const accent = '#9DD162'

  // [y, height] per step — based on Figma section positions
  const bounds = {
    1: [3,  43],   // Basic Info → header (y=8..38) with padding
    2: [89, 95],   // Experience → both jobs (y=97..175)
    3: [183, 86],  // Skills → skills + edu (y=192..261)
    4: [46, 43],   // Links → contact pills row (y=26..29)
  }[step]

  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect width={220} height={310} fill="#fff" />

      {/* ── Header (Frame 153, y=8, h=30) ── */}
      {/* Frame 138 centered in Frame 153: offset=(30-21)/2=4.5 → starts at y=12.5 */}
      {/* Name (112×6) */}
      <rect x={10} y={12.5} width={112} height={6}  rx={2}   fill="black" fillOpacity={0.25} />
      {/* Subtitle (82×4), y=12.5+6+4=22.5 */}
      <rect x={10} y={22.5} width={82}  height={4}  rx={1.5} fill="black" fillOpacity={0.15} />
      {/* Contact pills (Frame 137, y=22.5+4+4=30.5, gap=6) */}
      <rect x={10}  y={30.5} width={48} height={3}  rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={64}  y={30.5} width={42} height={3}  rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={112} y={30.5} width={50} height={3}  rx={1.5} fill="black" fillOpacity={0.1} />
      {/* Avatar circle (Frame 152, x=180, y=8, 30×30, r=15) */}
      <rect x={180} y={8} width={30} height={30} rx={15} fill="black" fillOpacity={0.1} />
      {/* Avatar head (10×10 circle): padding-top=5 → cy=8+5+5=18, cx=180+7+3+5=195 */}
      <circle cx={195} cy={18} r={5} fill="black" fillOpacity={0.15} />
      {/* Avatar body (16×10 rect): y=8+5+10+1=24, x=180+7=187 */}
      <rect x={187} y={24} width={16} height={10} rx={4} fill="black" fillOpacity={0.15} />

      {/* Divider 1 (y=46) */}
      <rect x={10} y={46} width={200} height={0.5} fill="black" fillOpacity={0.08} />

      {/* ── Profile / Summary (y=55, h=26) ── */}
      <rect x={10} y={55} width={34}  height={3} rx={1} fill="black" fillOpacity={0.2} />
      <rect x={10} y={64} width={155} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={71} width={125} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={78} width={95}  height={3} rx={1.5} fill="black" fillOpacity={0.1} />

      {/* Divider 2 (y=89) */}
      <rect x={10} y={89} width={200} height={0.5} fill="black" fillOpacity={0.08} />

      {/* ── Experience 1 (y=97, h=35) ── */}
      <rect x={10} y={97}  width={88} height={5} rx={2}   fill="black" fillOpacity={0.2} />
      <rect x={10} y={106} width={53} height={3} rx={1.5} fill="black" fillOpacity={0.15} />
      <rect x={10} y={115} width={173} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={122} width={152} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={129} width={135} height={3} rx={1.5} fill="black" fillOpacity={0.1} />

      {/* ── Experience 2 (y=140, h=35) ── */}
      <rect x={10} y={140} width={88} height={5} rx={2}   fill="black" fillOpacity={0.2} />
      <rect x={10} y={149} width={53} height={3} rx={1.5} fill="black" fillOpacity={0.15} />
      <rect x={10} y={158} width={173} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={165} width={152} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={172} width={135} height={3} rx={1.5} fill="black" fillOpacity={0.1} />

      {/* Divider 3 (y=183) */}
      <rect x={10} y={183} width={200} height={0.5} fill="black" fillOpacity={0.08} />

      {/* ── Skills (y=192, h=33) ── */}
      <rect x={10} y={192} width={30} height={3} rx={1} fill="black" fillOpacity={0.2} />
      {/* Left col (x=10), Right col (x=112), gap=4 between rows */}
      <rect x={10}  y={201} width={67} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={112} y={201} width={57} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10}  y={208} width={55} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={112} y={208} width={65} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10}  y={215} width={61} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={112} y={215} width={47} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10}  y={222} width={49} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={112} y={222} width={59} height={3} rx={1.5} fill="black" fillOpacity={0.1} />

      {/* Divider 4 (y=233) */}
      <rect x={10} y={233} width={200} height={0.5} fill="black" fillOpacity={0.08} />

      {/* ── Education (y=241, h=19) ── */}
      <rect x={10} y={241} width={40} height={3} rx={1}   fill="black" fillOpacity={0.2} />
      <rect x={10} y={250} width={71} height={3} rx={1.5} fill="black" fillOpacity={0.1} />
      <rect x={10} y={257} width={55} height={3} rx={1.5} fill="black" fillOpacity={0.1} />

      {/* ── Active section overlay ── */}
      <rect
        x={5} y={bounds ? bounds[0] : 3} width={210} height={bounds ? bounds[1] : 43} rx={6}
        fill={accent} fillOpacity={bounds ? 0.12 : 0}
        stroke={accent} strokeWidth={1} strokeOpacity={bounds ? 0.6 : 0}
        style={{ transition: 'y 0.35s ease, height 0.35s ease, fill-opacity 0.25s ease, stroke-opacity 0.25s ease' }}
      >
        <animate attributeName="strokeOpacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

// Card layout: gray page bg, white rounded card centered, progress in top header
function PageShell({ step, form, children, rightPanel }) {
  const isDark = form.template === 'startup'
  const badge = STEP_BADGE[step]
  const isMobile = useIsMobile()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F8FA',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top header */}
      <AppHeader>
        <LogoMark />
        <HeaderProgress step={step} />
        {!isMobile && <LogoMark style={{ opacity: 0, pointerEvents: 'none' }} />}
      </AppHeader>

      {/* Card */}
      <div style={{
        flex: 1,
        padding: isMobile ? '0' : '16px 80px 40px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
          borderRadius: isMobile ? 0 : 32,
          display: isMobile ? 'block' : 'flex',
          gap: 2,
          overflow: 'hidden',
        }}>
          {/* Form column */}
          <div style={{
            flex: isMobile ? 'unset' : '0 0 66%',
            maxWidth: isMobile ? '100%' : '66%',
            width: isMobile ? '100%' : undefined,
            padding: isMobile ? '1.25rem 1rem 0' : '40px',
            paddingBottom: isMobile ? '100px' : '40px',
            boxSizing: 'border-box',
            background: '#fff',
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>
            {children}
          </div>

          {/* Preview column — hidden on mobile */}
          {!isMobile && (
            <div style={{
              flex: 1,
              background: '#fff',
              display: 'flex', flexDirection: 'row',
              justifyContent: 'center', alignItems: 'flex-start',
              padding: '60px 0',
              gap: 10,
            }}>
              {/* Preview paper */}
              <div style={{
                width: 311, height: 424,
                background: isDark ? '#0f0f0f' : '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0px 30px 100px rgba(0, 0, 0, 0.06)',
              }}>
                <ResumeDocPreview step={step} />
              </div>

              {/* Right panel content (Generate box on summary) */}
              {rightPanel && (
                <div style={{ width: '100%', maxWidth: 240 }}>
                  {rightPanel}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Template picker ──────────────────────────────────────────────────────────

const DUMMY_RESUME = {
  name: 'Alex Johnson',
  title: 'Senior Product Designer',
  summary: 'Design-driven professional with 6 years building intuitive digital products for B2B SaaS companies. Led end-to-end product design from discovery to delivery.',
  experience: [
    {
      company: 'Acme Corp',
      role: 'Senior Product Designer',
      period: 'Jan 2021 — Present',
      achievements: [
        'Led core dashboard redesign, reducing task completion time by 34%',
        'Built design system adopted across 4 product teams',
        'Mentored 2 junior designers and ran weekly design critiques',
      ],
    },
    {
      company: 'Bright Studio',
      role: 'Product Designer',
      period: 'Mar 2018 — Dec 2020',
      achievements: [
        'Shipped mobile app from 0 to 50k downloads in 8 months',
        'Collaborated with engineering on 12 major features',
      ],
    },
  ],
  skills: {
    technical: ['Figma', 'Prototyping', 'User Research', 'Design Systems', 'Wireframing'],
    soft: ['Leadership', 'Communication', 'Problem Solving'],
  },
  education: [
    { institution: 'Boston University', degree: 'B.A. Graphic Design', year: '2018' },
  ],
  email: 'alex@email.com',
  phone: '+1 (415) 000-0000',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexjohnson',
  languages: ['English (C2)', 'Spanish (B2)'],
}

function TemplatePicker({ form, patch, onNext }) {
  const [hovered, setHovered] = useState(null)
  const isMobile = useIsMobile()

  const rows = [TEMPLATES.slice(0, 3), TEMPLATES.slice(3, 6)]

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F8FA' }}>
        <AppHeader><LogoMark /><div /><div /></AppHeader>
        <div style={{ padding: '1.5rem 1rem 3rem', marginTop: 68 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: '#000' }}>Choose a template</h1>
          <p style={{ fontSize: 14, color: '#4A4A4D', marginBottom: 24, lineHeight: 1.6 }}>
            Pick your favorite design. You can always change it later.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {TEMPLATES.map(tpl => {
              const isHov = hovered === tpl.id
              const pdfTemplate = PDF_TEMPLATE_MAP[tpl.id] ?? 'minimal'
              return (
                <div key={tpl.id}
                  onMouseEnter={() => setHovered(tpl.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { patch({ template: tpl.id }); onNext() }}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
                >
                  <div style={{
                    width: '100%', borderRadius: 12, overflow: 'hidden', position: 'relative',
                    boxShadow: isHov ? '0 16px 48px rgba(0,0,0,0.12)' : '0 8px 32px rgba(0,0,0,0.07)',
                    transform: isHov ? 'translateY(-3px)' : 'none',
                    transition: 'transform .2s ease, box-shadow .2s ease',
                  }}>
                    <A4Frame><ResumePreview data={DUMMY_RESUME} template={pdfTemplate} bare /></A4Frame>
                    {tpl.badge && (
                      <div style={{
                        position: 'absolute', top: 8, left: 8, zIndex: 2,
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: tpl.badge.bg, color: tpl.badge.color,
                      }}>{tpl.badge.text}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#05070A' }}>{tpl.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: 'inherit' }}>

      {/* Navbar — 1280 grid, normal flow */}
      <nav style={{
        width: '100%', height: 68,
        display: 'flex', alignItems: 'center',
        background: '#F7F8FA',
      }}>
        <div style={{
          width: 1280, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <LogoMark />
          <div style={{ opacity: 0, pointerEvents: 'none', width: 154 }} />
        </div>
      </nav>

      {/* Content wrapper */}
      <div style={{
        position: 'relative',
        width: 1280,
        left: '50%', transform: 'translateX(-50%)',
        paddingTop: 16,
        paddingBottom: 80,
        display: 'flex', flexDirection: 'column', gap: 40,
      }}>

        {/* Section header */}
        <div style={{
          width: 636,
          margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
        }}>
          <h1 style={{
            width: '100%', margin: 0,
            fontWeight: 600, fontSize: 32, lineHeight: '110%',
            textAlign: 'center', color: '#000',
          }}>
            Choose the right template for your needs
          </h1>
          <p style={{
            width: '100%', margin: 0,
            fontWeight: 400, fontSize: 16, lineHeight: '170%',
            textAlign: 'center', color: '#000',
          }}>
            Pick your favorite design. And don&apos;t worry, you can always change the design later.
          </p>
        </div>

        {/* Template rows */}
        {rows.map((row, ri) => (
          <div key={ri} style={{
            display: 'flex', flexDirection: 'row',
            alignItems: 'center', gap: 40, width: 1280,
          }}>
            {row.map(tpl => {
              const isHov = hovered === tpl.id
              const pdfTemplate = PDF_TEMPLATE_MAP[tpl.id] ?? 'minimal'
              return (
                <div
                  key={tpl.id}
                  onMouseEnter={() => setHovered(tpl.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { patch({ template: tpl.id }); onNext() }}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    gap: 16, width: 400, flexShrink: 0, cursor: 'pointer',
                  }}
                >
                  {/* Card */}
                  <div style={{
                    width: 400, height: 566,
                    borderRadius: 16, overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isHov
                      ? '0 30px 80px rgba(0,0,0,0.13)'
                      : '0 30px 100px rgba(0,0,0,0.06)',
                    transform: isHov ? 'scale(1.13)' : 'scale(1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    background: '#fff',
                  }}>
                    <A4Frame><ResumePreview data={DUMMY_RESUME} template={pdfTemplate} bare /></A4Frame>

                    {/* Hover overlay — Continue-style button */}
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 3,
                      background: 'rgba(0,0,0,0.58)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isHov ? 1 : 0,
                      transition: 'opacity 0.18s ease',
                      pointerEvents: 'none',
                    }}>
                      <div style={{
                        fontSize: 14, fontWeight: 600,
                        padding: '20px 32px', borderRadius: 38,
                        background: '#fff', color: '#05070A',
                        height: 55, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                      }}>
                        Use this template →
                      </div>
                    </div>
                  </div>

                  {/* Label row: name + badge */}
                  <div style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 16, lineHeight: '110%', color: '#05070A' }}>
                      {tpl.name}
                    </span>
                    {tpl.badge && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20,
                        background: tpl.badge.bg, color: tpl.badge.color,
                      }}>{tpl.badge.text}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

function StepBasic({ form, patch, onBack, onNext }) {
  const [showErr, setShowErr] = useState(false)

  function handleNext() {
    if (!form.name?.trim() || !form.targetRole?.trim() || !form.email?.trim()) {
      setShowErr(true); return
    }
    onNext()
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Basic information</h2>
          <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>Tell us who you are and what role you're targeting.</p>
        </div>

        <Field label="Target role *">
          <Input value={form.targetRole} onChange={e => { patch({ targetRole: e.target.value }); setShowErr(false) }}
            placeholder="Senior Product Designer" error={showErr && !form.targetRole?.trim()} />
        </Field>

        <Grid2>
          <Field label="Full name *">
            <Input value={form.name} onChange={e => { patch({ name: e.target.value }); setShowErr(false) }}
              placeholder="Alex Johnson" error={showErr && !form.name?.trim()} />
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={e => { patch({ email: e.target.value }); setShowErr(false) }}
              placeholder="alex@email.com" error={showErr && !form.email?.trim()} />
          </Field>
        </Grid2>

        <Field label="Job description" hint="Paste a vacancy to tailor your resume to this specific role.">
          <Textarea value={form.jobDescription} onChange={e => patch({ jobDescription: e.target.value })}
            placeholder="Paste the job description here to generate a more relevant resume." style={{ minHeight: 120 }} />
        </Field>
      </div>

      <Footer step={1} onBack={onBack} onNext={handleNext} />
    </>
  )
}

// ─── Step 2: Experience ───────────────────────────────────────────────────────

const EXP_CARD_H = 72

function ExpCard({ exp, isOpen, onToggle, onUpdate, onRemove, onHandleDown }) {
  const [isHov, setIsHov] = useState(false)
  const headName = [exp.role, exp.company].filter(Boolean).join(' · ') || 'New position'
  const headMeta = [exp.start, exp.end].filter(Boolean).join(' – ')

  return (
    <div
      data-expid={exp.id}
      style={{ position: 'relative', userSelect: 'none' }}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
    >
      {/* Drag handle — outside left */}
      <div
        onPointerDown={onHandleDown}
        style={{
          position: 'absolute', left: -32, top: 0,
          height: EXP_CARD_H, width: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', color: '#AFB2B2', fontSize: 16, lineHeight: 1,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
          userSelect: 'none', touchAction: 'none',
        }}
      >⠿</div>

      {/* Card */}
      <div className="exp-card-inner" style={{
        background: '#fff',
        border: '1px solid rgba(175,178,178,0.5)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div
          onClick={onToggle}
          style={{
            height: isOpen ? 'auto' : EXP_CARD_H,
            minHeight: isOpen ? EXP_CARD_H : undefined,
            display: 'flex', alignItems: 'center',
            padding: '0 24px', gap: 10,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#05070A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headName}</div>
            {headMeta && <div style={{ fontSize: 14, color: '#AFB2B2', marginTop: 2 }}>{headMeta}</div>}
          </div>
          <span style={{ color: '#AFB2B2', fontSize: 13, flexShrink: 0, display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>

        {isOpen && (
          <div style={{ padding: '24px', borderTop: '1px solid rgba(175,178,178,0.2)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Grid2>
              <Field label="Company"><Input value={exp.company} onChange={e => onUpdate({ company: e.target.value })} placeholder="Google" /></Field>
              <Field label="Job title"><Input value={exp.role} onChange={e => onUpdate({ role: e.target.value })} placeholder="Product Designer" /></Field>
              <Field label="Start date"><Input value={exp.start} onChange={e => onUpdate({ start: e.target.value })} placeholder="Jan 2022" /></Field>
              <Field label="End date"><Input value={exp.end} onChange={e => onUpdate({ end: e.target.value })} placeholder="Present" /></Field>
            </Grid2>
            <Field label="What you did & achieved" hint="Use numbers where you can. AI will polish the wording.">
              <Textarea value={exp.desc} onChange={e => onUpdate({ desc: e.target.value })}
                placeholder={'Led redesign of onboarding flow\nIncreased conversion by 15%\nBuilt design system used by 4 teams'} />
            </Field>
          </div>
        )}
      </div>

      {/* Delete × — outside right */}
      <button
        type="button"
        onClick={onRemove}
        style={{
          position: 'absolute', right: -32, top: 0,
          height: EXP_CARD_H, width: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, color: '#AFB2B2', padding: 0, lineHeight: 1,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
        onMouseLeave={e => e.currentTarget.style.color = '#AFB2B2'}
      >×</button>
    </div>
  )
}

function StepExperience({ form, patch, onBack, onNext }) {
  const [openId, setOpenId]       = useState(null)
  const [dragState, setDragState] = useState(null)
  const expRef        = useRef(form.experience)
  const lastBeforeRef = useRef(null)
  const snapRef       = useRef({}) // FLIP: id → top before reorder

  useEffect(() => { expRef.current = form.experience }, [form.experience])

  // FLIP animation: after every reorder, animate cards from their old positions
  useEffect(() => {
    if (!dragState) return
    const snap = snapRef.current
    form.experience.forEach(exp => {
      if (exp.id === dragState.id) return
      const el = document.querySelector(`[data-expid="${exp.id}"] .exp-card-inner`)
      if (!el || snap[exp.id] === undefined) return
      const newTop = el.getBoundingClientRect().top
      const delta = snap[exp.id] - newTop
      if (Math.abs(delta) < 1) return
      el.style.transition = 'none'
      el.style.transform = `translateY(${delta}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform .18s ease'
        el.style.transform = 'translateY(0)'
      })
    })
  }, [form.experience])

  // Auto-open first card on mount
  useEffect(() => {
    if (form.experience.length === 0) {
      const id = uid()
      patch({ experience: [{ id, company: '', role: '', start: '', end: '', desc: '' }] })
      setOpenId(id)
    }
  }, [])

  function addExp() {
    const id = uid()
    patch({ experience: [...form.experience, { id, company: '', role: '', start: '', end: '', desc: '' }] })
    setOpenId(id)
  }
  function removeExp(id) {
    patch({ experience: form.experience.filter(e => e.id !== id) })
    if (openId === id) setOpenId(null)
  }
  function updateExp(id, p) {
    patch({ experience: form.experience.map(e => e.id === id ? { ...e, ...p } : e) })
  }

  function startDrag(expId, e) {
    e.preventDefault()
    const cardEl = document.querySelector(`[data-expid="${expId}"]`)
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const offsetX = e.clientX - rect.left
    lastBeforeRef.current = null

    setDragState({ id: expId, top: rect.top, left: rect.left, width: rect.width, offsetY, offsetX })

    function takeSnap() {
      const snap = {}
      expRef.current.forEach(exp => {
        const el = document.querySelector(`[data-expid="${exp.id}"] .exp-card-inner`)
        if (el) snap[exp.id] = el.getBoundingClientRect().top
      })
      snapRef.current = snap
    }

    function onMove(ev) {
      setDragState(d => d ? { ...d, top: ev.clientY - offsetY, left: ev.clientX - offsetX } : null)

      const exps = expRef.current
      let beforeId = null
      for (const item of exps) {
        if (item.id === expId) continue
        const el = document.querySelector(`[data-expid="${item.id}"]`)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (ev.clientY < r.top + r.height / 2) { beforeId = item.id; break }
      }

      if (beforeId === lastBeforeRef.current) return
      lastBeforeRef.current = beforeId

      takeSnap()

      const from    = exps.findIndex(x => x.id === expId)
      const arr     = [...exps]
      const [moved] = arr.splice(from, 1)
      const insertAt = beforeId ? arr.findIndex(x => x.id === beforeId) : arr.length
      arr.splice(insertAt, 0, moved)
      patch({ experience: arr })
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      setDragState(null)
      lastBeforeRef.current = null
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const dragExp = dragState ? form.experience.find(e => e.id === dragState.id) : null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Work experience</h2>
          <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>Most recent first. Rough notes are fine — AI will polish everything.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.experience.map(exp => (
            <div key={exp.id} style={{ opacity: dragState?.id === exp.id ? 0 : 1 }}>
              <ExpCard exp={exp}
                isOpen={openId === exp.id}
                onToggle={() => setOpenId(openId === exp.id ? null : exp.id)}
                onUpdate={p => updateExp(exp.id, p)}
                onRemove={() => removeExp(exp.id)}
                onHandleDown={e => startDrag(exp.id, e)}
              />
            </div>
          ))}
          <BtnTextAdd onClick={addExp} style={{ paddingLeft: 24 }}>＋ Add position</BtnTextAdd>
        </div>
      </div>

      {/* Floating ghost */}
      {dragState && dragExp && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: dragState.top, left: dragState.left, width: dragState.width,
          height: EXP_CARD_H, display: 'flex', alignItems: 'center', padding: '0 24px',
          background: '#fff', borderRadius: 16,
          border: '1px solid rgba(175,178,178,0.5)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
          userSelect: 'none',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#05070A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[dragExp.role, dragExp.company].filter(Boolean).join(' · ') || 'New position'}
            </div>
            {[dragExp.start, dragExp.end].filter(Boolean).join(' – ') &&
              <div style={{ fontSize: 14, color: '#AFB2B2', marginTop: 2 }}>{[dragExp.start, dragExp.end].filter(Boolean).join(' – ')}</div>
            }
          </div>
          <span style={{ color: '#AFB2B2', fontSize: 13 }}>▾</span>
        </div>
      )}

      <Footer step={2} onBack={onBack} onNext={onNext} />
    </>
  )
}

// ─── Step 3: Skills, Languages & Education ───────────────────────────────────

function SkillChips({ skills, onChange, targetRole }) {
  const [input, setInput]     = useState('')
  const [focused, setFocused] = useState(false)
  const [dragSkill, setDragSkill] = useState(null)
  const [ghostPos, setGhostPos]   = useState(null)
  const inputRef    = useRef(null)
  const skillsRef   = useRef(skills)
  const lastOverRef = useRef(null)

  useEffect(() => { skillsRef.current = skills }, [skills])

  const suggestions = getSkillSuggestions(targetRole).filter(s => !skills.includes(s))

  function addSkill(skill) {
    const t = skill.trim()
    if (!t || skills.includes(t)) return
    onChange([...skills, t])
    setInput('')
  }
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input) }
    else if (e.key === 'Backspace' && !input && skills.length > 0) onChange(skills.slice(0, -1))
  }

  function startChipDrag(skill, e) {
    e.preventDefault()
    e.stopPropagation()
    setDragSkill(skill)
    lastOverRef.current = null

    function onMove(ev) {
      setGhostPos({ x: ev.clientX + 12, y: ev.clientY + 12 })

      const cur  = skillsRef.current
      const from = cur.indexOf(skill)
      if (from < 0) return

      // Find insertion point by iterating all chip rects
      // "insertBefore" = first chip where cursor is above its row OR left of its midX
      let insertBefore = null
      for (let i = 0; i < cur.length; i++) {
        if (cur[i] === skill) continue
        const el = document.querySelector(`[data-skill="${CSS.escape(cur[i])}"]`)
        if (!el) continue
        const r = el.getBoundingClientRect()
        const onSameRow = ev.clientY >= r.top - 4 && ev.clientY <= r.bottom + 4
        const aboveRow  = ev.clientY < r.top - 4
        if (aboveRow || (onSameRow && ev.clientX < r.left + r.width / 2)) {
          insertBefore = cur[i]
          break
        }
      }

      if (insertBefore === lastOverRef.current) return
      lastOverRef.current = insertBefore

      const arr = [...cur]
      const [removed] = arr.splice(from, 1)
      const to = insertBefore ? arr.indexOf(insertBefore) : arr.length
      arr.splice(to < 0 ? arr.length : to, 0, removed)
      onChange(arr)
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      setDragSkill(null)
      setGhostPos(null)
      lastOverRef.current = null
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  return (
    <div>
      {/* Ghost chip following cursor */}
      {dragSkill && ghostPos && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: ghostPos.y, left: ghostPos.x,
          display: 'inline-flex', alignItems: 'center',
          background: '#05070A', borderRadius: 6,
          padding: '4px 10px', fontSize: 13, color: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          userSelect: 'none', whiteSpace: 'nowrap',
        }}>
          {dragSkill}
        </div>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px',
          border: `1px solid ${focused ? '#05070A' : 'rgba(175,178,178,0.5)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none',
          borderRadius: 12, minHeight: 47, alignItems: 'center',
          cursor: 'text', transition: 'border-color .15s, box-shadow .15s', background: '#fff',
        }}
      >
        {skills.map(s => (
          <span
            key={s}
            data-skill={s}
            onPointerDown={e => startChipDrag(s, e)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#F7F8FA', border: '1px solid rgba(175,178,178,0.4)',
              borderRadius: 6, padding: '3px 8px', fontSize: 13, color: '#05070A',
              cursor: 'grab', userSelect: 'none', touchAction: 'none',
              opacity: dragSkill === s ? 0.35 : 1,
              transition: 'opacity .12s',
            }}
          >
            {s}
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onChange(skills.filter(x => x !== s)) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#AFB2B2', fontSize: 15, padding: 0,
                lineHeight: 1, display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#AFB2B2'}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (input.trim()) addSkill(input) }}
          placeholder={skills.length === 0 ? 'Figma, User Research, Design Systems…' : ''}
          style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#05070A', background: 'transparent', minWidth: 100, flex: 1 }}
        />
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {suggestions.slice(0, 8).map(s => (
            <button key={s} onClick={() => addSkill(s)} style={{
              fontSize: 12, padding: '4px 12px', borderRadius: 20,
              border: '1px solid rgba(175,178,178,0.5)', background: '#fff',
              color: '#4A4A4D', cursor: 'pointer', fontFamily: 'inherit',
            }}>+ {s}</button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Reusable sortable hook ───────────────────────────────────────────────────

function useSortable(items, onReorder, group) {
  const [dragState, setDragState] = useState(null)
  const itemsRef      = useRef(items)
  const lastBeforeRef = useRef(null)
  const snapRef       = useRef({})
  const sel = id => `[data-sk="${group}-${id}"]`

  useEffect(() => { itemsRef.current = items }, [items])

  // FLIP
  useEffect(() => {
    if (!dragState) return
    items.forEach(item => {
      if (item.id === dragState.id) return
      const el = document.querySelector(sel(item.id))
      if (!el || snapRef.current[item.id] === undefined) return
      const delta = snapRef.current[item.id] - el.getBoundingClientRect().top
      if (Math.abs(delta) < 1) return
      el.style.transition = 'none'
      el.style.transform = `translateY(${delta}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform .18s ease'
        el.style.transform = 'translateY(0)'
      })
    })
  }, [items])

  function startDrag(itemId, e) {
    e.preventDefault()
    const el = document.querySelector(sel(itemId))
    if (!el) return
    const rect = el.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const offsetX = e.clientX - rect.left
    lastBeforeRef.current = null
    setDragState({ id: itemId, top: rect.top, left: rect.left, width: rect.width, offsetY, offsetX })

    function takeSnap() {
      const snap = {}
      itemsRef.current.forEach(x => {
        const el2 = document.querySelector(sel(x.id))
        if (el2) snap[x.id] = el2.getBoundingClientRect().top
      })
      snapRef.current = snap
    }

    function onMove(ev) {
      setDragState(d => d ? { ...d, top: ev.clientY - offsetY, left: ev.clientX - offsetX } : null)
      const cur = itemsRef.current
      let beforeId = null
      for (const x of cur) {
        if (x.id === itemId) continue
        const el3 = document.querySelector(sel(x.id))
        if (!el3) continue
        const r = el3.getBoundingClientRect()
        if (ev.clientY < r.top + r.height / 2) { beforeId = x.id; break }
      }
      if (beforeId === lastBeforeRef.current) return
      lastBeforeRef.current = beforeId
      takeSnap()
      const from = cur.findIndex(x => x.id === itemId)
      const arr = [...cur]
      const [moved] = arr.splice(from, 1)
      const to = beforeId ? arr.findIndex(x => x.id === beforeId) : arr.length
      arr.splice(to < 0 ? arr.length : to, 0, moved)
      onReorder(arr)
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      setDragState(null)
      lastBeforeRef.current = null
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  return { dragState, startDrag, sel }
}

// ─── LangRow & EduRow ────────────────────────────────────────────────────────

function LangRow({ item, onNameChange, onLevelChange, onRemove, onHandleDown, isDragging, sortKey }) {
  const [isHov, setIsHov] = useState(false)
  return (
    <div
      data-sk={sortKey}
      style={{ position: 'relative', opacity: isDragging ? 0 : 1, transition: 'opacity .15s' }}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
    >
      {/* Drag handle outside left */}
      <div onPointerDown={onHandleDown} style={{
        position: 'absolute', left: -32, top: 0,
        height: 47, width: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'grab', color: '#AFB2B2', fontSize: 16, lineHeight: 1,
        opacity: isHov ? 1 : 0, transition: 'opacity .15s',
        userSelect: 'none', touchAction: 'none',
      }}>⠿</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center' }}>
        <AutoInput value={item.name} onChange={e => onNameChange(e.target.value)}
          placeholder="English" suggestions={LANG_SUGG} showOnFocus />
        <div style={{ display: 'flex', border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12, overflow: 'hidden', height: 47 }}>
          {LANG_LEVELS.map((lvl, i) => (
            <button key={lvl} type="button" onClick={() => onLevelChange(i)} style={{
              flex: 1, padding: '0 4px', border: 'none', fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              background: item.level === i ? '#05070A' : '#fff',
              color: item.level === i ? '#fff' : '#4A4A4D',
              borderRight: i < LANG_LEVELS.length - 1 ? '1px solid rgba(175,178,178,0.3)' : 'none',
              transition: 'background .12s',
            }}>{lvl}</button>
          ))}
        </div>
      </div>

      {/* × outside right */}
      <button type="button" onClick={onRemove}
        style={{
          position: 'absolute', right: -32, top: 0, height: 47, width: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, color: '#AFB2B2', padding: 0, lineHeight: 1,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
        onMouseLeave={e => e.currentTarget.style.color = '#AFB2B2'}
      >×</button>
    </div>
  )
}

function EduRow({ text, onChange, onRemove, onHandleDown, isDragging, sortKey }) {
  const [isHov, setIsHov] = useState(false)
  return (
    <div
      data-sk={sortKey}
      style={{ position: 'relative', opacity: isDragging ? 0 : 1, transition: 'opacity .15s' }}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
    >
      {/* Drag handle outside left */}
      <div onPointerDown={onHandleDown} style={{
        position: 'absolute', left: -32, top: 0,
        height: 47, width: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'grab', color: '#AFB2B2', fontSize: 16, lineHeight: 1,
        opacity: isHov ? 1 : 0, transition: 'opacity .15s',
        userSelect: 'none', touchAction: 'none',
      }}>⠿</div>

      <Input value={text} onChange={e => onChange(e.target.value)}
        placeholder="Bachelor of Computer Science — MIT" />

      {/* × outside right */}
      <button type="button" onClick={onRemove}
        style={{
          position: 'absolute', right: -32, top: 0, height: 47, width: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, color: '#AFB2B2', padding: 0, lineHeight: 1,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
        onMouseLeave={e => e.currentTarget.style.color = '#AFB2B2'}
      >×</button>
    </div>
  )
}

function StepSkillsLangEdu({ form, patch, onBack, onNext }) {
  const updLang = (id, p) => patch({ languages: form.languages.map(l => l.id === id ? { ...l, ...p } : l) })

  const { dragState: langDrag, startDrag: startLangDrag } = useSortable(
    form.languages, arr => patch({ languages: arr }), 'lang'
  )
  const { dragState: eduDrag, startDrag: startEduDrag } = useSortable(
    form.education, arr => patch({ education: arr }), 'edu'
  )

  const langDragItem = langDrag ? form.languages.find(l => l.id === langDrag.id) : null
  const eduDragItem  = eduDrag  ? form.education.find(e => e.id === eduDrag.id)  : null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Skills, languages & education</h2>
          <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>Add skills as chips. AI determines proficiency from your experience.</p>
        </div>

        {/* Skills */}
        <Field label="Skills">
          <SkillChips skills={form.skills} onChange={v => patch({ skills: v })} targetRole={form.targetRole} />
        </Field>

        {/* Languages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Lbl>Languages</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.languages.map(l => (
              <LangRow key={l.id} item={l}
                sortKey={`lang-${l.id}`}
                isDragging={langDrag?.id === l.id}
                onHandleDown={e => startLangDrag(l.id, e)}
                onNameChange={v => updLang(l.id, { name: v })}
                onLevelChange={v => updLang(l.id, { level: v })}
                onRemove={() => patch({ languages: form.languages.filter(x => x.id !== l.id) })}
              />
            ))}
            <BtnTextAdd onClick={() => patch({ languages: [...form.languages, { id: uid(), name: '', level: 3 }] })}>＋ Add language</BtnTextAdd>
          </div>
        </div>

        {/* Education */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Lbl>Education</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.education.map(edu => (
              <EduRow key={edu.id} text={edu.text}
                sortKey={`edu-${edu.id}`}
                isDragging={eduDrag?.id === edu.id}
                onHandleDown={e => startEduDrag(edu.id, e)}
                onChange={v => patch({ education: form.education.map(x => x.id === edu.id ? { ...x, text: v } : x) })}
                onRemove={() => patch({ education: form.education.filter(x => x.id !== edu.id) })}
              />
            ))}
            <BtnTextAdd onClick={() => patch({ education: [...form.education, { id: uid(), text: '' }] })}>＋ Add education</BtnTextAdd>
          </div>
        </div>
      </div>

      {/* Ghosts */}
      {langDrag && langDragItem && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: langDrag.top, left: langDrag.left, width: langDrag.width,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center',
          opacity: 0.9,
        }}>
          <div style={{ height: 47, background: '#fff', border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: '#05070A', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            {langDragItem.name || 'Language'}
          </div>
          <div style={{ height: 47, background: '#fff', border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
        </div>
      )}
      {eduDrag && eduDragItem && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: eduDrag.top, left: eduDrag.left, width: eduDrag.width,
          height: 47, background: '#fff',
          border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12,
          display: 'flex', alignItems: 'center', padding: '0 16px',
          fontSize: 14, color: '#05070A',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          opacity: 0.9,
        }}>
          {eduDragItem.text || 'Education'}
        </div>
      )}

      <Footer step={3} onBack={onBack} onNext={onNext} />
    </>
  )
}

// ─── Step 4: Links & Contact ──────────────────────────────────────────────────

function StepLinks({ form, patch, onBack, onNext }) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Links & contact</h2>
          <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>All optional. Add what's relevant for your role.</p>
        </div>

        <Grid2>
          <Field label="Phone">
            <Input value={form.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+1 (415) 555-1234" />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={e => patch({ location: e.target.value })} placeholder="San Francisco, CA" />
          </Field>
        </Grid2>

        <Field label="LinkedIn">
          <Input value={form.linkedin} onChange={e => patch({ linkedin: e.target.value })} placeholder="linkedin.com/in/alexjohnson" />
        </Field>

        <Field label="Portfolio / GitHub">
          <Input value={form.portfolio} onChange={e => patch({ portfolio: e.target.value })} placeholder="alexjohnson.com or github.com/alex" />
        </Field>
      </div>

      <Footer step={4} onBack={onBack} onNext={onNext} nextLabel="Review →" />
    </>
  )
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SumCard({ icon, title, statusOk, statusText, onEdit, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(175,178,178,0.5)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px', gap: 10,
        cursor: 'pointer', userSelect: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon slot — 20×20, черная иконка подставится снаружи */}
          <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#05070A' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: statusOk ? T.success : T.border1 }} />
          <span style={{ fontSize: 14, color: T.text3 }}>{statusText}</span>
          <button onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ fontSize: 14, padding: '4px 12px', borderRadius: 8, border: `1px solid rgba(175,178,178,0.5)`, background: '#fff', color: '#4A4A4D', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#05070A'; e.currentTarget.style.color = '#05070A' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(175,178,178,0.5)'; e.currentTarget.style.color = '#4A4A4D' }}>Edit</button>
          <span style={{ color: T.text3, fontSize: 14, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>
      </div>
      {/* Body */}
      {open && (
        <div style={{ padding: '12px 24px', borderTop: `1px solid rgba(175,178,178,0.2)` }}>{children}</div>
      )}
    </div>
  )
}

function SumRow({ label, value }) {
  const empty = !value || !value.toString().trim()
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0' }}>
      <span style={{ fontSize: 14, color: T.text3, width: 104, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: empty ? T.border1 : T.text1, fontStyle: empty ? 'italic' : 'normal', lineHeight: 1.5 }}>{empty ? '—' : value}</span>
    </div>
  )
}


function Summary({ form, goTo, onGenerate, generating, genError }) {
  const tpl = TEMPLATES.find(t => t.id === form.template)
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Review & generate</h2>
        <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>Expand any section to check details.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SumCard icon="🎨" title="Template" statusOk={!!form.template} statusText="Selected" onEdit={() => goTo(-1)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 38, borderRadius: 4, background: tpl?.swatch, border: `0.5px solid ${T.border1}`, flexShrink: 0 }} />
            <span style={{ fontSize: T.f13, fontWeight: 500 }}>{tpl?.name}</span>
          </div>
        </SumCard>

        <SumCard icon="👤" title="Basic info" statusOk={!!(form.name && form.email)} statusText={form.name ? 'Filled' : 'Empty'} onEdit={() => goTo(1)}>
          <SumRow label="Name" value={form.name} />
          <SumRow label="Target role" value={form.targetRole} />
          <SumRow label="Email" value={form.email} />
          <SumRow label="Job desc." value={form.jobDescription ? `${form.jobDescription.slice(0, 60)}…` : null} />
        </SumCard>

        <SumCard icon="💼" title="Experience"
          statusOk={form.experience.some(e => e.role || e.company)}
          statusText={`${form.experience.length} position${form.experience.length !== 1 ? 's' : ''}`}
          onEdit={() => goTo(2)}>
          {form.experience.length === 0
            ? <div style={{ fontSize: 14, color: T.text3 }}>No experience added</div>
            : form.experience.map((e, i) => (
              <div key={e.id} style={{ padding: i > 0 ? '8px 0 0' : '0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 14, fontWeight: (e.role || e.company) ? 500 : 400, color: (e.role || e.company) ? '#05070A' : T.text3 }}>
                  {e.role || e.company
                    ? <>{e.role}{e.role && e.company && <span style={{ fontWeight: 400, color: T.text3 }}> · {e.company}</span>}{!e.role && e.company}</>
                    : 'New position'
                  }
                </div>
                {(e.start || e.end) && (
                  <div style={{ fontSize: 13, color: T.text3 }}>{[e.start, e.end || 'Present'].filter(Boolean).join(' – ')}</div>
                )}
              </div>
            ))
          }
        </SumCard>

        <SumCard icon="⭐" title="Skills & languages"
          statusOk={form.skills.length > 0 || form.languages.some(l => l.name)}
          statusText={`${form.skills.length} skills, ${form.languages.filter(l => l.name).length} languages`}
          onEdit={() => goTo(3)}>
          <SumRow label="Skills" value={form.skills.join(', ')} />
          <SumRow label="Languages" value={form.languages.filter(l => l.name).map(l => `${l.name} (${LANG_LEVELS[l.level]})`).join(', ')} />
          <SumRow label="Education" value={form.education.filter(e => e.text).map(e => e.text).join('; ')} />
        </SumCard>

        <SumCard icon="🔗" title="Links & contact" statusOk={!!(form.phone || form.linkedin)} statusText={form.phone || form.linkedin ? 'Filled' : 'Optional'} onEdit={() => goTo(4)}>
          <SumRow label="Phone" value={form.phone} />
          <SumRow label="Location" value={form.location} />
          <SumRow label="LinkedIn" value={form.linkedin} />
          <SumRow label="Portfolio" value={form.portfolio} />
        </SumCard>
      </div>

      <div style={{ background: '#F7F8FA', borderRadius: 16, padding: '32px 64px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 8 }}>Ready to generate</div>
        <div style={{ fontSize: 16, color: '#4A4A4D', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          AI will write polished bullet points, a professional summary, and tailor everything to your target role.
        </div>
        <BtnPrimary onClick={onGenerate} disabled={generating}>
          {generating ? '⏳ Generating…' : '✦ Generate resume'}
        </BtnPrimary>
        {genError && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, fontSize: 13, color: '#DC2626', lineHeight: 1.5 }}>
            ⚠ {genError}
          </div>
        )}
        <button onClick={() => goTo(4)} style={{ display: 'block', margin: '20px auto 0', fontSize: 13, color: '#AFB2B2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back to step 4
        </button>
      </div>
    </>
  )
}

// ─── Generated result ─────────────────────────────────────────────────────────

function A4Frame({ children }) {
  const outerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const DESIGN_W = 680

  useEffect(() => {
    if (!outerRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / DESIGN_W)
    })
    ro.observe(outerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={outerRef} style={{
      width: '100%', aspectRatio: '210 / 297',
      position: 'relative', overflow: 'hidden',
      background: '#fff',
      borderRadius: 4,
      boxShadow: '0 6px 32px rgba(0,0,0,.14)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: DESIGN_W,
        minHeight: Math.round(DESIGN_W * 297 / 210),
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
      }}>
        {children}
      </div>
    </div>
  )
}

const FS_PLANS = [
  {
    id: 'one_time',
    planId: 50965,
    label: 'Resume PDF',
    price: '$2.90',
    period: null,
    badge: null,
    cta: 'Download Resume — $2.90',
    features: ['Download your resume', 'ATS-friendly format', 'All templates included'],
  },
  {
    id: 'monthly',
    planId: 50967,
    label: 'Unlimited Access',
    price: '$4.90',
    period: '/mo',
    badge: 'Best value',
    cta: 'Start Unlimited Access — $4.90/mo',
    features: ['Unlimited downloads', 'Unlimited updates', 'All templates included'],
  },
]

function ResumeResult({ resume, template, onReset, downloadRef }) {
  const isMobile = useIsMobile()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [fsReady, setFsReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.FS?.Checkout) { setFsReady(true); return }
    const existing = document.querySelector('script[src="https://checkout.freemius.com/js/v1/"]')
    if (existing) { existing.addEventListener('load', () => setFsReady(true), { once: true }); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.freemius.com/js/v1/'
    script.async = true
    script.onload = () => setFsReady(true)
    document.head.appendChild(script)
  }, [])

  function handleCheckout() {
    if (!fsReady || !window.FS?.Checkout) return
    const plan = FS_PLANS.find(p => p.id === selectedPlan)
    const checkout = new window.FS.Checkout({
      product_id: 31066,
      plan_id: plan.planId,
      public_key: 'pk_0c8f1a770c6e4345670337792dd5b',
    })
    checkout.open({
      success: () => { if (downloadRef.current) downloadRef.current.click() },
      cancel: () => {},
    })
  }

  const ctaLabel = fsReady
    ? (FS_PLANS.find(p => p.id === selectedPlan)?.cta ?? 'Continue to payment →')
    : 'Loading…'

  const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.5 6L5 8.5L9.5 4" stroke="#9DD162" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const PlanCards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {FS_PLANS.map(plan => {
        const sel = selectedPlan === plan.id
        return (
          <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
            borderRadius: 12,
            border: `2px solid ${sel ? '#05070A' : 'rgba(175,178,178,0.35)'}`,
            background: sel ? '#F7F8FA' : '#fff',
            cursor: 'pointer', textAlign: 'left', width: '100%',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}>
            {/* Radio */}
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
              border: sel ? '5px solid #05070A' : '2px solid rgba(175,178,178,0.5)',
              background: '#fff', boxSizing: 'border-box',
            }} />
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#05070A' }}>{plan.label}</span>
                {plan.badge && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: '#9DD162', color: '#05070A', padding: '2px 8px', borderRadius: 20 }}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {plan.features.map(f => (
                  <span key={f} style={{ fontSize: 14, color: '#4A4A4D', display: 'flex', gap: 7, alignItems: 'center' }}>
                    <CheckIcon /> {f}
                  </span>
                ))}
              </div>
            </div>
            {/* Price */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#05070A' }}>{plan.price}</span>
              {plan.period && <span style={{ fontSize: 12, color: '#AFB2B2', display: 'block' }}>{plan.period}</span>}
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
      <AppHeader>
        <LogoMark />
        <div />
        <LogoMark style={{ opacity: 0, pointerEvents: 'none' }} />
      </AppHeader>

      <div style={{
        flex: 1,
        padding: isMobile ? '1.25rem 1rem 200px' : '16px 1.5rem 3rem',
        display: 'flex', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
          display: isMobile ? 'block' : 'flex',
          gap: '2rem', alignItems: 'flex-start',
        }}>
          {/* Preview */}
          <div style={{ flex: '0 0 64%', maxWidth: isMobile ? '100%' : '64%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 32px rgba(0,0,0,.14)' }}>
            <A4Frame>
              <ResumePreview data={resume} template={template} bare />
            </A4Frame>
          </div>

          {/* Controls column — desktop */}
          {!isMobile && (
            <div style={{
              flex: 1, position: 'sticky', top: '2rem',
              background: '#fff', borderRadius: 32,
              padding: '40px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Your resume is ready</h2>
                <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0, lineHeight: 1.6 }}>
                  Choose how you'd like to access it.
                </p>
              </div>
              <div style={{ height: 1, background: 'rgba(175,178,178,0.3)' }} />
              <PlanCards />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <BtnPrimary onClick={handleCheckout} disabled={!fsReady} style={{ width: '100%' }}>
                  {ctaLabel}
                </BtnPrimary>
                <BtnSecondary onClick={onReset}>← Start over</BtnSecondary>
              </div>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#AFB2B2' }}>
                Secure payment · Card, PayPal
              </p>
            </div>
          )}

          {/* Plans — mobile (in scroll area) */}
          {isMobile && (
            <div style={{ marginTop: '1.5rem' }}>
              <PlanCards />
            </div>
          )}
        </div>
      </div>

      {/* Mobile footer */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: '#fff', padding: '12px 16px 28px',
          borderTop: '1px solid rgba(175,178,178,0.3)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <BtnPrimary onClick={handleCheckout} disabled={!fsReady} style={{ width: '100%' }}>
            {ctaLabel}
          </BtnPrimary>
          <BtnSecondary onClick={onReset}>← Start over</BtnSecondary>
        </div>
      )}

      <div style={{ display: 'none' }}>
        <ResumeDownloadButton ref={downloadRef} data={resume} template={template} filename="resume.pdf" />
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const [screen, setScreen] = useState(-1)
  const [form, setForm] = useState(loadSavedForm)
  const [resume, setResume] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const downloadRef = useRef(null)

  const patch = useCallback(p => setForm(f => ({ ...f, ...p })), [])
  const goTo = s => { setScreen(s); window.scrollTo(0, 0) }

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(form)) } catch {}
  }, [form])

  async function generate() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')
      const raw = data.resume.ru ?? data.resume
      const langs = form.languages
        .filter(l => l.name)
        .map(l => `${l.name} (${LANG_LEVELS[l.level]})`)
      // Parse "Degree — Institution" text into structured education
      const formEdu = form.education
        .filter(e => e.text)
        .map(e => {
          const parts = e.text.split(/\s*[—–-]\s*/)
          return parts.length >= 2
            ? { degree: parts[0].trim(), institution: parts[1].trim(), year: '' }
            : { degree: e.text, institution: '', year: '' }
        })
      setResume({
        ...raw,
        title:     raw.title || form.targetRole || undefined,
        email:     form.email    || undefined,
        phone:     form.phone    || undefined,
        location:  form.location || undefined,
        linkedin:  form.linkedin || undefined,
        github:    form.portfolio || undefined,
        languages: langs.length ? langs : undefined,
        education: raw.education?.length ? raw.education : formEdu,
      })
    } catch (e) {
      setGenError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (resume) {
    return (
      <ResumeResult
        resume={resume}
        template={PDF_TEMPLATE_MAP[form.template] ?? 'minimal'}
        onReset={() => { setResume(null); setForm(INITIAL_FORM); setScreen(-1); try { localStorage.removeItem(LS_KEY) } catch {} }}
        downloadRef={downloadRef}
      />
    )
  }

  if (screen === -1) {
    return <TemplatePicker form={form} patch={patch} onNext={() => goTo(1)} />
  }

  const content = (() => {
    if (screen === 1) return <StepBasic         form={form} patch={patch} onBack={() => goTo(-1)} onNext={() => goTo(2)} />
    if (screen === 2) return <StepExperience    form={form} patch={patch} onBack={() => goTo(1)}  onNext={() => goTo(3)} />
    if (screen === 3) return <StepSkillsLangEdu form={form} patch={patch} onBack={() => goTo(2)}  onNext={() => goTo(4)} />
    if (screen === 4) return <StepLinks         form={form} patch={patch} onBack={() => goTo(3)}  onNext={() => goTo(0)} />
    if (screen === 0) return <Summary form={form} goTo={goTo} onGenerate={generate} generating={generating} genError={genError} />
  })()

  return (
    <PageShell step={screen} form={form}>
      {content}
    </PageShell>
  )
}