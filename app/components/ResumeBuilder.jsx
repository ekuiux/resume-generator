'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import dynamic from 'next/dynamic'
import PaywallModal from './PaywallModal'

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
  { id: 'minimal',   name: 'Minimal',   swatch: '#f1efe8', accent: '#1a1a1a', badge: { text: 'Popular', bg: '#EEEDFE', color: '#3C3489' } },
  { id: 'corporate', name: 'Corporate', swatch: '#B5D4F4', accent: '#1e3a5f', badge: null },
  { id: 'modern',    name: 'Modern',    swatch: '#c7d2fe', accent: '#6c63ff', badge: { text: 'New', bg: '#EAF3DE', color: '#27500A' } },
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>
      {/* Icon: black rounded square with S */}
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: '#05070A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="3" y="4" width="12" height="2" rx="1" fill="white" />
          <rect x="3" y="8" width="8" height="2" rx="1" fill="white" />
          <rect x="3" y="12" width="10" height="2" rx="1" fill="white" />
        </svg>
      </div>
      <span style={{
        fontWeight: 600, fontSize: 20, lineHeight: '110%',
        color: '#05070A', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-onest), system-ui, sans-serif',
      }}>
        ResumeBuilder
      </span>
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
        const done = num < step
        const active = num === step
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
  const accent = T.accent
  const g = 'rgba(0,0,0,'

  const L = ({ x, y, w, h = 3.5, rx = 1.5, op = 0.12 }) => (
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={`${g}${op})`} />
  )

  const bounds = {
    1: [1,   40],
    2: [41,  36],
    3: [77,  90],
    4: [167, 105],
  }[step]

  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect width={220} height={310} fill="#fff" />

      {/* Header y 0–46 */}
      <L x={10} y={10} w={112} h={6} rx={2} op={0.22} />
      <L x={10} y={20} w={82}  h={4} op={0.14} />
      <L x={10} y={28} w={48}  h={3} op={0.1} />
      <L x={64} y={28} w={42}  h={3} op={0.1} />
      <L x={112} y={28} w={50} h={3} op={0.1} />
      <rect x={180} y={7} width={30} height={30} rx={3} fill={`${g}0.07)`} />
      <circle cx={195} cy={16} r={5}   fill={`${g}0.1)`} />
      <ellipse cx={195} cy={27} rx={8} ry={5} fill={`${g}0.08)`} />
      <line x1={10} y1={42} x2={210} y2={42} stroke={`${g}0.08)`} strokeWidth={0.5} />

      {/* Profile y 46–84 */}
      <L x={10} y={48} w={34} h={3} rx={1} op={0.18} />
      <L x={10} y={55} w={158} h={3} op={0.1} />
      <L x={10} y={62} w={128} h={3} op={0.09} />
      <L x={10} y={69} w={98}  h={3} op={0.07} />
      <line x1={10} y1={78} x2={210} y2={78} stroke={`${g}0.08)`} strokeWidth={0.5} />

      {/* Experience y 84–166 */}
      <L x={10} y={84} w={50} h={3} rx={1} op={0.18} />
      <L x={10} y={93}  w={100} h={5} rx={2} op={0.2} />
      <L x={10} y={102} w={66}  h={3} op={0.1} />
      <L x={10} y={109} w={182} h={3} op={0.09} />
      <L x={10} y={115} w={165} h={3} op={0.08} />
      <L x={10} y={121} w={150} h={3} op={0.07} />
      <L x={10} y={131} w={88}  h={5} rx={2} op={0.16} />
      <L x={10} y={140} w={56}  h={3} op={0.1} />
      <L x={10} y={147} w={176} h={3} op={0.09} />
      <L x={10} y={153} w={155} h={3} op={0.07} />
      <L x={10} y={159} w={138} h={3} op={0.06} />
      <line x1={10} y1={168} x2={210} y2={168} stroke={`${g}0.08)`} strokeWidth={0.5} />

      {/* Skills y 172–262 */}
      <L x={10} y={174} w={30} h={3} rx={1} op={0.18} />
      {[0,1,2,3].map(i => (
        <g key={i}>
          <L x={10}  y={182 + i * 14} w={[70, 58, 64, 52][i]} h={3.5} op={0.1} />
          <L x={115} y={182 + i * 14} w={[60, 68, 50, 62][i]} h={3.5} op={0.09} />
        </g>
      ))}
      <line x1={10} y1={242} x2={210} y2={242} stroke={`${g}0.08)`} strokeWidth={0.5} />
      <L x={10} y={248} w={40} h={3} rx={1} op={0.16} />
      <L x={10} y={256} w={74} h={3} op={0.09} />
      <L x={10} y={263} w={58} h={3} op={0.07} />

      {/* Active section overlay */}
      {bounds && (
        <rect
          x={5} y={bounds[0] + 1}
          width={210} height={bounds[1]}
          rx={5}
          fill={accent} fillOpacity={0.12}
          stroke={accent} strokeWidth={1} strokeOpacity={0.6}
        >
          <animate attributeName="strokeOpacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
        </rect>
      )}
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
        padding: isMobile ? '0' : '24px 80px 40px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
          background: '#fff',
          borderRadius: isMobile ? 0 : 32,
          display: isMobile ? 'block' : 'flex',
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
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>
            {children}
          </div>

          {/* Preview column — hidden on mobile */}
          {!isMobile && (
            <div style={{
              flex: 1,
              background: '#F7F8FA',
              boxShadow: 'inset 0px 0px 114px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              padding: '60px 0',
              gap: '1.25rem',
              position: 'relative',
            }}>
              {/* Preview paper */}
              <div style={{
                width: 311, height: 424,
                background: isDark ? '#0f0f0f' : '#fff',
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
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

  return (
    <div style={{ minHeight: '100vh', background: T.bg2 }}>
      {/* Header */}
      <AppHeader>
        <LogoMark />
        <div />
        <div />
      </AppHeader>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '1.5rem 1rem 2rem' : '3rem 2rem 4rem' }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-.02em' }}>Pick a template</h1>
        <p style={{ fontSize: T.f15, color: T.text2, marginBottom: '2.5rem', lineHeight: 1.6 }}>
          ATS-friendly. Exports to PDF in one click.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 28 }}>
          {TEMPLATES.map(tpl => {
            const on = form.template === tpl.id
            const isHov = hovered === tpl.id
            const pdfTemplate = PDF_TEMPLATE_MAP[tpl.id] ?? 'minimal'
            return (
              <div
                key={tpl.id}
                onMouseEnter={() => setHovered(tpl.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { patch({ template: tpl.id }); onNext() }}
                style={{
                  cursor: 'pointer',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: isHov ? `0 20px 48px ${tpl.accent}38` : on ? `0 8px 24px ${tpl.accent}28` : '0 2px 8px rgba(0,0,0,.05)',
                  transform: isHov ? 'scale(1.05)' : on ? 'scale(1.01)' : 'scale(1)',
                  transition: 'transform .2s ease, box-shadow .2s ease',
                }}
              >
                {/* Preview area */}
                <div style={{ position: 'relative' }}>
                  <A4Frame>
                    <ResumePreview data={DUMMY_RESUME} template={pdfTemplate} bare />
                  </A4Frame>

                  {/* Badge */}
                  {tpl.badge && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12, zIndex: 2,
                      fontSize: 10, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 20, background: tpl.badge.bg, color: tpl.badge.color,
                    }}>{tpl.badge.text}</div>
                  )}

                  {/* Hover CTA overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 3,
                    background: 'rgba(0,0,0,.42)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isHov ? 1 : 0,
                    transition: 'opacity .18s ease',
                    pointerEvents: isHov ? 'auto' : 'none',
                  }}>
                    <div style={{
                      background: '#fff', color: T.text1,
                      fontWeight: 600, fontSize: T.f14,
                      padding: '11px 28px', borderRadius: T.r10,
                      boxShadow: '0 4px 20px rgba(0,0,0,.25)',
                      fontFamily: 'inherit',
                    }}>
                      Use this template →
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
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
    <div style={{ border: `1.5px solid ${T.border1}`, borderRadius: T.r12, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: open ? T.accentL : T.border2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background .15s' }}>{icon}</div>
          <span style={{ fontSize: T.f13, fontWeight: 500 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusOk ? T.success : T.border1 }} />
          <span style={{ fontSize: T.f11, color: T.text3 }}>{statusText}</span>
          <button onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ fontSize: T.f11, padding: '4px 12px', borderRadius: 7, border: `1.5px solid ${T.border1}`, background: T.bg1, color: T.text2, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border1; e.currentTarget.style.color = T.text2 }}>Edit</button>
          <span style={{ color: T.text3, fontSize: 13, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 14px 12px', borderTop: `0.5px solid ${T.border2}` }}>{children}</div>
      )}
    </div>
  )
}

function SumRow({ label, value }) {
  const empty = !value || !value.toString().trim()
  return (
    <div style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: `0.5px solid ${T.border2}` }}>
      <span style={{ fontSize: T.f11, color: T.text3, width: 96, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: T.f12, color: empty ? T.border1 : T.text1, fontStyle: empty ? 'italic' : 'normal' }}>{empty ? '—' : value}</span>
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

      <SumCard icon="🎨" title="Template" statusOk={!!form.template} statusText="Selected" onEdit={() => goTo(-1)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
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

      <SumCard icon="💼" title="Experience" statusOk={form.experience.length > 0} statusText={`${form.experience.length} position${form.experience.length !== 1 ? 's' : ''}`} onEdit={() => goTo(2)}>
        {form.experience.length === 0
          ? <div style={{ padding: '7px 0', fontSize: T.f12, color: T.border1, fontStyle: 'italic' }}>No experience added</div>
          : form.experience.map((e, i) => (
            <div key={e.id} style={{ padding: '7px 0', borderBottom: i < form.experience.length - 1 ? `0.5px solid ${T.border2}` : 'none' }}>
              <div style={{ fontSize: T.f13, fontWeight: 500 }}>{[e.role, e.company].filter(Boolean).join(' · ') || '—'}</div>
              <div style={{ fontSize: T.f11, color: T.text3 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div>
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

      <div style={{ background: '#F7F8FA', borderRadius: 16, padding: '1.75rem', textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#05070A', marginBottom: 6 }}>Ready to generate</div>
        <div style={{ fontSize: 14, color: '#4A4A4D', marginBottom: '1.25rem', lineHeight: 1.6 }}>
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
        <button onClick={() => goTo(4)} style={{ display: 'block', margin: '12px auto 0', fontSize: 13, color: '#AFB2B2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
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

function ResumeResult({ resume, template, onReset, onDownload, downloadRef }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ minHeight: '100vh', background: T.bg2, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppHeader>
        <LogoMark />
        <div />
        <div />
      </AppHeader>

      {/* Content */}
      <div style={{ flex: 1, padding: isMobile ? '1.25rem 1rem 120px' : '2rem 1.5rem 3rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: 1280,
          display: isMobile ? 'block' : 'flex', gap: '2rem', alignItems: 'flex-start',
        }}>

          {/* Preview: A4-proportional */}
          <div style={{ flex: '0 0 64%', maxWidth: isMobile ? '100%' : '64%' }}>
            <A4Frame>
              <ResumePreview data={resume} template={template} bare />
            </A4Frame>
          </div>

          {/* Controls: floating card (desktop) / fixed footer (mobile) */}
          {isMobile ? (
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: T.bg1, borderTop: `0.5px solid ${T.border1}`,
              padding: '12px 16px 28px',
              display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10,
            }}>
              <button onClick={onDownload} style={{ padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}>⬇ Download Resume (PDF)</button>
              <button onClick={onReset} style={{
                fontSize: T.f13, color: T.text3, textAlign: 'center',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}>← Start over</button>
            </div>
          ) : (
            <div style={{ flex: 1, position: 'sticky', top: '2rem' }}>
              <div style={{
                background: T.bg1, border: `0.5px solid ${T.border1}`,
                borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)',
                padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
              }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, letterSpacing: '-.02em' }}>Resume ready!</h2>
                  <p style={{ color: T.text2, fontSize: T.f13, lineHeight: 1.6 }}>
                    Review the preview — download your PDF when you're happy with it.
                  </p>
                </div>
                <button onClick={onDownload} style={{ padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}>⬇ Download Resume (PDF)</button>
                <button onClick={onReset} style={{
                  fontSize: T.f13, color: T.text3,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left', padding: 0,
                }}>← Start over</button>
              </div>
            </div>
          )}

        </div>
      </div>
      {/* Hidden download button — triggered programmatically after payment */}
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
  const [paywallOpen, setPaywallOpen] = useState(false)
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
      <>
        <ResumeResult
          resume={resume}
          template={PDF_TEMPLATE_MAP[form.template] ?? 'minimal'}
          onReset={() => { setResume(null); setForm(INITIAL_FORM); setScreen(-1); try { localStorage.removeItem(LS_KEY) } catch {} }}
          onDownload={() => setPaywallOpen(true)}
          downloadRef={downloadRef}
        />
        <PaywallModal
          isOpen={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          onSuccess={() => downloadRef.current?.click()}
        />
      </>
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