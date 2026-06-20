'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import dynamic from 'next/dynamic'
import posthog from 'posthog-js'

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  ink:         '#05070A',
  inkHov:      '#1f2024',
  text:        '#4A4A4D',
  dim:         '#AFB2B2',
  bg:          '#ffffff',
  bgPage:      '#F7F8FA',
  border:      'rgba(175,178,178,0.5)',
  green:       '#9DD162',
  error:       '#EF4444',
  errorText:   '#DC2626',
  errorBg:     '#FEF2F2',
  errorBorder: '#FECACA',
  r8: 8, r10: 10, r12: 12,
  f11: 11, f12: 12, f13: 13, f14: 14, f15: 15, f20: 20,
}

const ResumePreview = dynamic(
  () => import('./ResumePDF').then(m => m.ResumePreview),
  { ssr: false, loading: () => <div style={{ height: 600, background: T.bgPage, borderRadius: 12 }} /> }
)
const ResumeDownloadButton = dynamic(
  () => import('./ResumePDF').then(m => m.ResumeDownloadButton),
  { ssr: false }
)
const PDFLivePreview = dynamic(
  () => import('./ResumePDF').then(m => m.PDFLivePreview),
  { ssr: false, loading: () => <div style={{ width: '100%', aspectRatio: '210/297', borderRadius: 12, background: T.bgPage, boxShadow: '0 6px 32px rgba(0,0,0,.14)' }} /> }
)

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'minimal',   name: 'Minimal',   swatch: T.bg, accent: '#212329', badge: { text: 'Popular', bg: T.ink, color: T.bg }, image: '/templates/minimal.jpg' },
  { id: 'atelier',   name: 'Atelier',   swatch: '#d7deff', accent: '#505889', badge: { text: 'New', bg: T.green, color: T.ink }, image: '/templates/atelier.jpg' },
  { id: 'aurora',    name: 'Aurora',    swatch: '#fbcfe8', accent: '#000000', badge: null, image: '/templates/aurora.jpg' },
  { id: 'volt',      name: 'Volt',      swatch: '#E6FF00', accent: '#111111', badge: null, image: '/templates/volt.jpg' },
  { id: 'prime',     name: 'Prime',     swatch: '#f8c625', accent: '#3b3b3b', badge: null, image: '/templates/prime.jpg' },
  { id: 'nordic',    name: 'Nordic',    swatch: '#dff5e3', accent: '#537872', badge: null, image: '/templates/nordic.jpg' },
]

const MONTHS       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const LANG_LEVELS  = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STEP_NAMES   = ['Profile', 'Experience', 'Skills', 'Contact']
const LANG_SUGG    = ['English','Spanish','French','German','Portuguese','Italian','Russian','Chinese','Japanese','Korean','Arabic','Hindi','Dutch','Swedish','Norwegian','Danish','Finnish','Polish','Turkish','Ukrainian','Hebrew','Persian','Thai','Vietnamese','Indonesian','Malay','Romanian','Hungarian','Greek','Czech']

// Keep letters/spaces/hyphens/parens/apostrophes only, collapse runs of spaces, cap length,
// and capitalize the first character. Prevents garbage like "Pussy" being padded, "DddD",
// "asdfg123!@#" from reaching the PDF.
function sanitizeLanguageName(v) {
  const cleaned = (v || '')
    .replace(/[^\p{L}\s\-()'.]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, 30)
  return cleaned.replace(/^(\p{L})/u, (_, c) => c.toUpperCase())
}

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
  atelier:   'atelier',
  prime:     'prime',
  nordic:    'nordic',
  aurora:    'aurora',
  volt:      'volt',
}

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
  languages:       [],
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
    if (raw) {
      const parsed = JSON.parse(raw)
      const allIds = [
        ...(parsed.experience || []),
        ...(parsed.languages  || []),
        ...(parsed.education  || []),
      ].map(x => x.id).filter(Number.isFinite)
      if (allIds.length) _uid = Math.max(_uid, ...allIds)
      return parsed
    }
  } catch {}
  return INITIAL_FORM
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
  const borderColor = error ? T.error : focused ? T.ink : T.border
  const shadow = focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none'
  return (
    <input
      {...props}
      style={{
        width: '100%', fontFamily: 'inherit', fontSize: 14,
        color: T.ink, background: T.bg,
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

function AutoInput({ value, onChange, placeholder, suggestions = [], selectedValues = [], style, showOnFocus = false, ...rest }) {
  const [open, setOpen]       = useState(false)
  const [dropRect, setDropRect] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const wrapRef = useRef(null)
  const dropRef = useRef(null)
  const q = (value || '').toLowerCase()

  // Set of already-chosen values (lowercased) — shown disabled with a checkmark.
  const selectedSet = new Set(selectedValues.map(s => s.toLowerCase()))

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

  useEffect(() => {
    if (!open) return
    calcRect()
    // Close when the user interacts outside the input + dropdown. Using pointerdown
    // (not input blur) keeps the list open while scrolling it on touch devices —
    // the dropdown is rendered in a portal-like fixed layer, so check both refs.
    const onDocDown = (e) => {
      if (wrapRef.current?.contains(e.target) || dropRef.current?.contains(e.target)) return
      setOpen(false)
    }
    window.addEventListener('scroll', calcRect, true)
    window.addEventListener('resize', calcRect)
    document.addEventListener('pointerdown', onDocDown)
    return () => {
      window.removeEventListener('scroll', calcRect, true)
      window.removeEventListener('resize', calcRect)
      document.removeEventListener('pointerdown', onDocDown)
    }
  }, [open])

  function handleChange(e) {
    setIsTyping(true)
    onChange(e)
  }

  function pick(s) {
    onChange({ target: { value: s } })
    setOpen(false)
    setIsTyping(false)
  }

  return (
    <div ref={wrapRef}>
      <Input value={value} onChange={handleChange} placeholder={placeholder} style={style}
        onFocus={() => { calcRect(); setOpen(true); setIsTyping(false) }}
        {...rest}
      />
      {open && hits.length > 0 && dropRect && (
        <div ref={dropRef} style={{
          position: 'fixed',
          top: dropRect.bottom + 4,
          left: dropRect.left,
          width: dropRect.width,
          zIndex: 9999,
          background: T.bg,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          maxHeight: 240,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}>
          {hits.map((s, i) => {
            const isSelected = selectedSet.has(s.toLowerCase())
            return (
              <div key={s}
                onPointerDown={isSelected ? undefined : (e) => { e.preventDefault(); pick(s) }}
                style={{
                  padding: '10px 14px', fontSize: T.f13,
                  cursor: isSelected ? 'default' : 'pointer',
                  color: isSelected ? T.dim : T.ink,
                  borderBottom: i < hits.length - 1 ? `0.5px solid ${T.bgPage}` : 'none',
                  background: T.bg, transition: 'background .1s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgPage }}
                onMouseLeave={e => e.currentTarget.style.background = T.bg}
              >
                <span>{s}</span>
                {isSelected && <span style={{ color: T.green, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>}
              </div>
            )
          })}
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
        color: T.ink, background: T.bg,
        border: `1px solid ${focused ? T.ink : T.border}`,
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

function MonthPicker({ value, onChange, placeholder, allowPresent = false, minDate, maxDate, disableFuture = false }) {
  const [open, setOpen]       = useState(false)
  const [dropRect, setDropRect] = useState(null)
  const wrapRef = useRef(null)

  function parseVal(v) {
    if (!v || v === 'Present') return null
    const [m, y] = v.split(' ')
    const mi = MONTHS.indexOf(m)
    const yi = parseInt(y)
    return (!isNaN(yi) && mi >= 0) ? { month: mi, year: yi } : null
  }

  const parsed = parseVal(value)
  const [viewYear, setViewYear] = useState(() => parsed?.year ?? new Date().getFullYear())

  const now = new Date()
  const curY = now.getFullYear()
  const curM = now.getMonth()
  const parsedMin = minDate ? parseVal(minDate) : null
  const parsedMax = maxDate ? parseVal(maxDate) : null
  const effMaxYear = disableFuture ? curY : (parsedMax?.year ?? 9999)
  const effMinYear = parsedMin?.year ?? 1900

  function isMonthDisabled(monthIdx) {
    if (disableFuture && (viewYear > curY || (viewYear === curY && monthIdx > curM))) return true
    if (parsedMax && (viewYear > parsedMax.year || (viewYear === parsedMax.year && monthIdx > parsedMax.month))) return true
    if (parsedMin && (viewYear < parsedMin.year || (viewYear === parsedMin.year && monthIdx < parsedMin.month))) return true
    return false
  }

  function open_() {
    if (!wrapRef.current) return
    setDropRect(wrapRef.current.getBoundingClientRect())
    const p = parseVal(value)
    setViewYear(p?.year ?? new Date().getFullYear())
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function update() { if (wrapRef.current) setDropRect(wrapRef.current.getBoundingClientRect()) }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update) }
  }, [open])

  function pick(monthIdx) {
    onChange(`${MONTHS[monthIdx]} ${viewYear}`)
    setOpen(false)
  }

  const [hov, setHov]               = useState(null)
  const [hovPrev, setHovPrev]       = useState(false)
  const [hovNext, setHovNext]       = useState(false)
  const [hovPresent, setHovPresent] = useState(false)
  const focused = open

  return (
    <div ref={wrapRef}>
      <div
        onClick={open_}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        tabIndex={0}
        style={{
          width: '100%', boxSizing: 'border-box',
          height: 47, padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1px solid ${focused ? T.ink : T.border}`,
          borderRadius: 12, background: T.bg, cursor: 'pointer',
          boxShadow: focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
          fontSize: 14, color: value ? T.ink : T.dim,
          userSelect: 'none',
        }}
      >
        <span>{value || placeholder}</span>
        <CalendarIcon />
      </div>

      {open && dropRect && (
        <div
          onMouseDown={e => e.preventDefault()}
          style={{
            position: 'fixed',
            top: dropRect.bottom + 4,
            left: dropRect.left,
            width: 240,
            zIndex: 9999,
            background: T.bg,
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: 12,
          }}
        >
          {/* Year nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={() => setViewYear(y => y - 1)}
              disabled={viewYear <= effMinYear}
              onMouseEnter={() => setHovPrev(true)} onMouseLeave={() => setHovPrev(false)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8,
                cursor: viewYear <= effMinYear ? 'default' : 'pointer',
                opacity: viewYear <= effMinYear ? 0.25 : 1,
              }}>
              <ArrowLeft color={hovPrev && viewYear > effMinYear ? T.ink : T.dim} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{viewYear}</span>
            <button onClick={() => setViewYear(y => y + 1)}
              disabled={viewYear >= effMaxYear}
              onMouseEnter={() => setHovNext(true)} onMouseLeave={() => setHovNext(false)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8,
                cursor: viewYear >= effMaxYear ? 'default' : 'pointer',
                opacity: viewYear >= effMaxYear ? 0.25 : 1,
              }}>
              <ArrowRight color={hovNext && viewYear < effMaxYear ? T.ink : T.dim} />
            </button>
          </div>

          {/* Month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {MONTHS.map((m, i) => {
              const sel = parsed?.month === i && parsed?.year === viewYear
              const disabled = isMonthDisabled(i)
              return (
                <button key={m} onClick={() => !disabled && pick(i)}
                  onMouseEnter={() => !disabled && setHov(i)} onMouseLeave={() => setHov(null)}
                  style={{
                    padding: '12px 4px', borderRadius: 8, border: 'none',
                    background: sel ? T.ink : (!disabled && hov === i) ? T.bgPage : 'none',
                    color: sel ? T.bg : T.ink,
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.25 : 1,
                    fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                    transition: 'background .1s',
                  }}
                >{m}</button>
              )
            })}
          </div>

          {allowPresent && (
            <>
              <button
                onClick={() => { onChange('Present'); setOpen(false) }}
                onMouseEnter={() => setHovPresent(true)}
                onMouseLeave={() => setHovPresent(false)}
                style={{
                  marginTop: 8, width: '100%', padding: '8px', borderRadius: 8,
                  border: '1px solid rgba(175,178,178,0.3)',
                  background: value === 'Present' ? T.ink : hovPresent ? T.bgPage : 'none',
                  color: value === 'Present' ? T.bg : T.ink,
                  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                  transition: 'background .1s',
                }}
              >Present</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Lbl({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: 12, fontWeight: 600,
      letterSpacing: '.04em', textTransform: 'uppercase', color: T.dim,
    }}>{children}</label>
  )
}

// Small "ⓘ" affordance next to a label. Hover (desktop) or tap (mobile) reveals a tooltip.
function InfoTip({ text }) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}
      onMouseEnter={() => { if (!isMobile) setOpen(true) }}
      onMouseLeave={() => { if (!isMobile) setOpen(false) }}
    >
      <button type="button"
        aria-label="More info"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 15, height: 15, borderRadius: '50%', padding: 0, flexShrink: 0,
          border: '1px solid #C7C9CC', background: 'none', color: T.dim,
          fontSize: 10, fontWeight: 700, lineHeight: 1, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
        }}
      >i</button>
      {open && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          width: 240, zIndex: 9999,
          background: T.ink, color: T.bg, fontSize: 12, fontWeight: 400,
          letterSpacing: 0, textTransform: 'none', lineHeight: 1.5,
          padding: '10px 12px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.18)', textAlign: 'left',
          pointerEvents: 'none',
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: `5px solid ${T.ink}`,
          }} />
        </span>
      )}
    </span>
  )
}

function Field({ label, hint, info, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        info
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Lbl>{label}</Lbl><InfoTip text={info} /></span>
          : <Lbl>{label}</Lbl>
      )}
      {children}
      {hint && <p style={{ fontSize: 12, color: T.dim, margin: 0, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

function Grid2({ children, style }) {
  const isMobile = useIsMobile()
  return <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, ...style }}>{children}</div>
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(175,178,178,0.3)' }} />
}

function BtnPrimary({ children, disabled, onClick, style }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="btn-primary"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 14, fontWeight: 600, padding: '20px 32px',
        borderRadius: 38, border: 'none',
        background: disabled ? T.dim : hov ? T.inkHov : T.ink,
        color: T.bg, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', height: 55,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background .15s', ...style,
      }}>{children}</button>
  )
}

function BtnSecondary({ children, onClick, style }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick}
      className="btn-secondary"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 14, fontWeight: 600, padding: '20px 32px',
        borderRadius: 38,
        border: '1px solid rgba(175,178,178,0.3)',
        background: hov ? T.bgPage : T.bg, color: T.text,
        cursor: 'pointer', fontFamily: 'inherit', height: 55,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background .15s, border-color .15s',
        ...style,
      }}>{children}</button>
  )
}

function GlobalStyles() {
  return (
    <style>{`
      .btn-arrow-right, .btn-arrow-left, .btn-sparkle, .btn-startover, .btn-download { transition: transform 0.15s ease; }
      .btn-primary:hover .btn-sparkle { transform: translateY(-3px); }
      .btn-primary:hover .btn-arrow-right { transform: translateX(3px); }
      .btn-secondary:hover .btn-arrow-left { transform: translateX(-3px); }
      .btn-secondary:hover .btn-startover { transform: translateX(-3px); }
      .btn-primary:hover .btn-download { transform: translateY(3px); }
      .tpl-hover-btn:hover .btn-arrow-right { transform: translateX(3px); }
      .drag-handle:hover svg path { stroke: ${T.ink}; transition: stroke 0.15s; }
      .card-toggle:hover .chevron path { stroke: ${T.ink}; transition: stroke 0.15s; }
      .chevron path { transition: stroke 0.15s; }
      .close-btn svg path { transition: stroke 0.15s; }
      .close-btn:hover svg path { stroke: ${T.error}; }
      @media (max-width: 768px) { input, textarea, select { font-size: 16px !important; } }
    `}</style>
  )
}

function ChevronDown({ color = T.dim }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="chevron" style={{ flexShrink: 0 }}>
      <path d="M8 9.76936L3.74952 6.22852" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7.99952 9.76936L12.25 6.22852" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ChevronUp({ color = T.dim }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="chevron" style={{ flexShrink: 0 }}>
      <path d="M8 6.22987L12.2491 9.76953" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8.00004 6.22987L3.75098 9.76953" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function CloseIcon({ color = T.dim }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M11.749 4.25L4.25007 11.749" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M4.25 4.25L11.749 11.749" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function DragIcon({ color = T.dim }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5.59961 3.2002L5.5964 3.2002" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M5.59961 8L5.5964 8.00001" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M5.59961 12.7998L5.5964 12.7998" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M10.4033 3.2002L10.4001 3.2002" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M10.4033 8L10.4001 8.00001" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M10.4033 12.7998L10.4001 12.7998" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  )
}

function CalendarIcon({ color = T.dim }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="3.5" width="12" height="10.5" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M2 7H14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.5 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function PlusIcon({ color = T.ink }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10 6H2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 2L6 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function BtnClose({ onClick, onPointerDown, style }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick} onPointerDown={onPointerDown}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', ...style }}
    >
      <CloseIcon color={hov ? T.error : T.dim} />
    </button>
  )
}

function StartOverIcon({ color = T.text }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="btn-startover" style={{ flexShrink: 0 }}>
      <path d="M2.33301 11.334L2.33301 4.66699" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.33301 4.66699L5.99968 8.00033L9.33301 11.3337" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8L14 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DownloadIcon({ color = 'white' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="btn-download" style={{ flexShrink: 0 }}>
      <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.66699 6.66699L8.00033 10.0003L11.3337 6.66699" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="btn-sparkle" style={{ flexShrink: 0 }}>
      <path d="M2 8C6.17835 8 8 6.24204 8 2C8 6.24204 9.80893 8 14 8C9.80893 8 8 9.80893 8 14C8 9.80893 6.17835 8 2 8Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

function AnimDots() {
  const [dots, setDots] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 500)
    return () => clearInterval(id)
  }, [])
  return <span>Generating{'.'.repeat(dots)}</span>
}

function ArrowRight({ color = 'white' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="btn-arrow-right" style={{ flexShrink: 0 }}>
      <path d="M10.9998 6L8.6665 8.99998" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M10.9998 5.99998L8.6665 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M1 6L11 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ArrowLeft({ color = T.text }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="btn-arrow-left" style={{ flexShrink: 0 }}>
      <path d="M1.00065 6L3.33398 3.00002" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M1.00065 6.00002L3.33398 9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M11 6L1 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function BtnTextAdd({ children, onClick, style }) {
  const [hov, setHov] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? T.bgPage : 'none',
        border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 600, color: T.ink,
        fontFamily: 'inherit', padding: '8px 16px',
        textAlign: 'left', borderRadius: 20,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'background .15s',
        ...style,
      }}>{children}</button>
  )
}



// ─── Shared header ────────────────────────────────────────────────────────────

function AppHeader({ children }) {
  const isMobile = useIsMobile()
  return (
    <div style={{
      background: T.bgPage,
      height: 72,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 24px',
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
      <img src="/logo.svg" alt="Resumetion" height={32} style={{ display: 'block', width: 'auto' }} />
    </div>
  )
}

// ─── Header progress bar ──────────────────────────────────────────────────────

function HeaderProgress({ step }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
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
        const dotBg   = done ? T.green : active ? T.ink : '#E5E5EA'
        const dotColor = done ? T.ink : active ? T.bg : T.ink
        const textColor = active ? T.ink : T.text
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
                  <path d="M2.5 6L5 8.5L9.5 4" stroke={T.ink} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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

function Footer({ step, onBack, onNext, nextLabel, onBackToReview }) {
  const isMobile = useIsMobile()

  // When the step was opened via "Edit" on the review screen, the only action is
  // "Back to review" (changes save live as typed); the normal Back/Continue nav
  // is hidden. Reaching a step by normal navigation shows Back/Continue as usual.
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: T.bg, padding: '12px 16px 28px',
        borderTop: '1px solid rgba(175,178,178,0.3)',
        display: 'flex', gap: 10,
      }}>
        {onBackToReview ? (
          // Full width on mobile
          <BtnSecondary onClick={onBackToReview} style={{ flex: 1 }}><ArrowLeft /> Back to review</BtnSecondary>
        ) : (
          <>
            <BtnSecondary onClick={onBack}><ArrowLeft /> Back</BtnSecondary>
            <BtnPrimary onClick={onNext} style={{ flex: 1 }}>{nextLabel || 'Continue'} <ArrowRight /></BtnPrimary>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{ height: 1, background: 'rgba(175,178,178,0.3)', margin: '0' }} />
      {onBackToReview ? (
        // Narrow on desktop — same auto width / padding as the Back button
        <div style={{ display: 'flex' }}>
          <BtnSecondary onClick={onBackToReview}><ArrowLeft /> Back to review</BtnSecondary>
        </div>
      ) : (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0',
        }}>
          <BtnSecondary onClick={onBack}><ArrowLeft /> Back</BtnSecondary>
          <BtnPrimary onClick={onNext}>{nextLabel || 'Continue'} <ArrowRight /></BtnPrimary>
        </div>
      )}
    </>
  )
}

// ─── Skeleton preview ─────────────────────────────────────────────────────────

const STEP_BADGE = { 1: 'Header', 2: 'Profile', 3: 'Experience', 4: 'Skills', 0: 'Review' }

function ResumeDocPreview({ step }) {
  const accent = T.green

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

// ─── Per-template preview with section indicator ──────────────────────────────

// Bounds expressed as % of the A4 page (top/height — vertical; optional left/right — horizontal
// inset, used when the highlighted section sits in a sidebar so the overlay shouldn't span full
// width). Defaults to 10px left/right.
// Step map: 1=Profile, 2=Experience, 3=Skills, 4=Contact.
const TEMPLATE_SECTION_BOUNDS = {
  nordic: {
    1: { top: '15%',   height: '25%' },   // Profile: name + role + summary
    2: { top: '40%',   height: '35.3%' }, // Experience box
    3: { top: '75%',   height: '21.5%' }, // Skills (bottom)
    4: { top: '2%',    height: '13%' },   // Contact grid (top)
  },
  minimal: {
    1: { top: '2%',    height: '11.5%' },                              // Name + role + summary
    2: { top: '29.5%',   height: '57.5%',  right: '33.5%' },               // Experience (left col)
    3: { top: '42.5%',   height: '38%',  left: '66%' },                // Skills (right col)
    4: { top: '13%',   height: '29.7%',  left: '66%' },                // Contact (right col)
  },
  atelier: {
    1: { top: '2%',    height: '21%',  right: '36%' },               // Name + summary (left frame)
    2: { top: '43%',   height: '40.5%',  right: '36%' },               // Experience (left frame)
    3: { top: '32%',   height: '53%',  left: '64.5%' },                // Skills (right col bottom)
    4: { top: '3%',    height: '25.5%',  left: '64.5%' },                // Contact (right col top)
  },
  aurora: {
    1: { top: '2%',    height: '11.8%',  left: '40%' },                              // Name + summary (full width)
    2: { top: '29%',   height: '36%',  left: '14%' },                              // Experience
    3: { top: '77.5%',   height: '20.5%',  left: '33.5%' },                // Skills (right of footer)
    4: { top: '77.5%',   height: '20.5%',  right: '67%' },               // Contact (left of footer)
  },
  volt: {
    1: { top: '5%',    height: '18%',  left: '5.5%',  right: '5.5%' },                              // Header card + summary
    2: { top: '39.5%',   height: '42%',  left: '35%',  right: '5.5%' },                // Work Experience (right col)
    3: { top: '54.5%',   height: '28.5%',  left: '5.5%',  right: '61%' },               // Skills (sidebar mid)
    4: { top: '23%',   height: '32%',  left: '5.5%',  right: '61%' },               // Personal info (sidebar top)
  },
  prime: {
    1: { top: '5%',    height: '10.1%' },                              // Name + summary (full width)
    2: { top: '34.5%',   height: '46%',  right: '36%' },               // Experience (left col)
    3: { top: '63%',   height: '30.5%',  left: '63%' },                // Skills (right col bottom)
    4: { top: '16.5%',   height: '46.5%',  left: '63%' },                // Contact (right col top)
  },
}

function TemplatePreviewWithIndicator({ template, step }) {
  const tpl = TEMPLATES.find(t => t.id === template)
  const accent = tpl?.accent ?? T.green
  const bounds = TEMPLATE_SECTION_BOUNDS[template]?.[step]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {tpl?.image && (
        <img src={tpl.image} alt={tpl.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {bounds && (
        <div style={{
          position: 'absolute',
          left:   bounds.left   ?? 10,
          right:  bounds.right  ?? 10,
          top: bounds.top, height: bounds.height,
          borderRadius: 6,
          background: accent + '1f',
          border: `1px solid ${accent}`,
          boxShadow: `0 0 0 4px ${accent}14`,
          pointerEvents: 'none',
          transition: 'top 0.35s ease, height 0.35s ease, left 0.35s ease, right 0.35s ease',
        }} />
      )}
    </div>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

// Card layout: gray page bg, white rounded card centered, progress in top header
function PageShell({ step, form, children, rightPanel }) {
  const isDark = false
  const badge = STEP_BADGE[step]
  const isMobile = useIsMobile()

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bgPage,
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
        flex: 1, width: '100%', maxWidth: 1280, margin: '0 auto',
        padding: isMobile ? '12px 0 0' : '16px 24px 40px',
        display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          borderRadius: isMobile ? '24px 24px 0 0' : 32,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flex: isMobile ? 1 : 'unset',
          gap: 2,
          overflow: 'hidden',
        }}>
          {/* Form column */}
          <div style={{
            flex: isMobile ? 1 : '0 0 66%',
            maxWidth: isMobile ? '100%' : '66%',
            width: isMobile ? '100%' : undefined,
            padding: isMobile ? '1.25rem 1rem 0' : '40px',
            paddingBottom: isMobile ? '120px' : '40px',
            boxSizing: 'border-box',
            background: T.bg,
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>
            {children}
          </div>

          {/* Preview column — hidden on mobile */}
          {!isMobile && (
            <div style={{
              flex: 1,
              background: T.bg,
              display: 'flex', flexDirection: 'row',
              justifyContent: 'center', alignItems: 'flex-start',
              padding: '60px 0',
              gap: 10,
            }}>
              {/* Preview paper */}
              <div style={{
                width: 311, height: 440,
                background: T.bg,
                borderRadius: 12,
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0px 30px 100px rgba(0, 0, 0, 0.06)',
              }}>
                {TEMPLATE_SECTION_BOUNDS[form?.template]
                  ? <TemplatePreviewWithIndicator template={form.template} step={step} />
                  : <ResumeDocPreview step={step} />
                }
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

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: T.bgPage }}>
        <AppHeader>
          <LogoMark />
        </AppHeader>
        <div style={{ padding: '16px 16px 3rem' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: '#000', textAlign: 'center' }}>Choose a template</h1>
          <p style={{ fontSize: 14, color: T.text, marginBottom: 24, lineHeight: 1.6, textAlign: 'center' }}>
            Create a professional resume in under 5 minutes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, padding: '0 5%' }}>
            {TEMPLATES.map(tpl => {
              const isHov = hovered === tpl.id
              const pdfTemplate = PDF_TEMPLATE_MAP[tpl.id] ?? 'minimal'
              return (
                <div key={tpl.id}
                  onMouseEnter={() => setHovered(tpl.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { patch({ template: tpl.id }); posthog.capture('template_selected', { template: tpl.id }); onNext() }}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                >
                  <div style={{
                    width: '100%', borderRadius: 12, overflow: 'hidden', position: 'relative',
                    aspectRatio: '210 / 297',
                    boxShadow: isHov ? '0 16px 48px rgba(0,0,0,0.12)' : '0 8px 32px rgba(0,0,0,0.07)',
                    transition: 'box-shadow .2s ease',
                  }}>
                    {tpl.image
                      ? <img src={tpl.image} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <A4Frame maxPages={1}><ResumePreview data={DUMMY_RESUME} template={pdfTemplate} bare /></A4Frame>
                    }
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '20px 32px', height: 55, borderRadius: 38,
                        border: 'none', background: T.ink,
                        fontSize: 14, fontWeight: 600, color: T.bg,
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}>
                        Use this template <ArrowRight color="#fff" />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: T.ink }}>{tpl.name}</span>
                    {tpl.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: tpl.badge.bg, color: tpl.badge.color,
                      }}>{tpl.badge.text}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Mobile footer */}
        <footer style={{ borderTop: '1px solid rgba(175,178,178,0.25)', padding: '20px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', fontSize: 12, color: T.dim }}>
          <a href="mailto:support@resumetion.com" style={{ color: T.dim, textDecoration: 'none' }}>support@resumetion.com</a>
          <span>·</span>
          <a href="/pricing" style={{ color: T.dim, textDecoration: 'none' }}>Pricing</a>
          <span>·</span>
          <a href="/terms" style={{ color: T.dim, textDecoration: 'none' }}>Terms</a>
          <span>·</span>
          <a href="/privacy" style={{ color: T.dim, textDecoration: 'none' }}>Privacy</a>
        </footer>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bgPage, fontFamily: 'inherit' }}>

      {/* Navbar — 1280 grid, normal flow */}
      <nav style={{
        width: '100%', height: 72,
        display: 'flex', alignItems: 'center',
        background: T.bgPage,
      }}>
        <div style={{
          width: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <LogoMark />
        </div>
      </nav>

      {/* Content wrapper */}
      <div style={{
        width: '100%', maxWidth: 1280, margin: '0 auto',
        paddingTop: 16, paddingBottom: 80,
        paddingLeft: 24, paddingRight: 24,
        boxSizing: 'border-box',
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
            Choose a template
          </h1>
          <p style={{
            width: '100%', margin: 0,
            fontWeight: 400, fontSize: 16, lineHeight: '170%',
            textAlign: 'center', color: '#000',
          }}>
            Create a professional resume in under 5 minutes.
          </p>
        </div>

        {/* Template grid — responsive 3×2, fills the content grid, A4 ratio preserved */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          columnGap: 40, rowGap: 32,
        }}>
            {TEMPLATES.map(tpl => {
              const isHov = hovered === tpl.id
              const pdfTemplate = PDF_TEMPLATE_MAP[tpl.id] ?? 'minimal'
              return (
                <div
                  key={tpl.id}
                  onMouseEnter={() => setHovered(tpl.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { patch({ template: tpl.id }); posthog.capture('template_selected', { template: tpl.id }); onNext() }}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    gap: 16, width: '100%', cursor: 'pointer',
                  }}
                >
                  {/* Card */}
                  <div style={{
                    width: '100%', aspectRatio: '210 / 297',
                    borderRadius: 16, overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isHov
                      ? '0 30px 80px rgba(0,0,0,0.13)'
                      : '0 30px 100px rgba(0,0,0,0.06)',
                    transform: isHov ? 'scale(1.13)' : 'scale(1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    background: T.bg,
                  }}>
                    {tpl.image
                      ? <img src={tpl.image} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <A4Frame maxPages={1}><ResumePreview data={DUMMY_RESUME} template={pdfTemplate} bare /></A4Frame>
                    }

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
                        background: T.bg, color: T.ink,
                        height: 55, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit', gap: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                      }} className="tpl-hover-btn">
                        Use this template <ArrowRight color={T.ink} />
                      </div>
                    </div>
                  </div>

                  {/* Label row: name + badge */}
                  <div style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 16, lineHeight: '110%', color: T.ink }}>
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
      </div>

      {/* Desktop footer */}
      <footer style={{ borderTop: '1px solid rgba(175,178,178,0.25)', padding: '24px 0', display: 'flex', gap: 20, justifyContent: 'center', fontSize: 13, color: T.dim }}>
        <span>© {new Date().getFullYear()} Resumetion</span>
        <span>·</span>
        <a href="mailto:support@resumetion.com" style={{ color: T.dim, textDecoration: 'none' }}>support@resumetion.com</a>
        <span>·</span>
        <a href="/pricing" style={{ color: T.dim, textDecoration: 'none' }}>Pricing</a>
        <span>·</span>
        <a href="/terms" style={{ color: T.dim, textDecoration: 'none' }}>Terms</a>
        <span>·</span>
        <a href="/privacy" style={{ color: T.dim, textDecoration: 'none' }}>Privacy</a>
      </footer>
    </div>
  )
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function StepBasic({ form, patch, onBack, onNext, onBackToReview }) {
  const [showErr, setShowErr] = useState(false)
  const isMobile = useIsMobile()

  const emailEmpty   = !form.email?.trim()
  const emailInvalid = !emailEmpty && !isValidEmail(form.email)

  function handleNext() {
    if (!form.name?.trim() || !form.targetRole?.trim() || emailEmpty || emailInvalid) {
      setShowErr(true); return
    }
    posthog.capture('step_completed', { step: 1 })
    onNext()
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Basic information</h2>
          <p style={{ fontSize: 14, color: T.text, margin: 0 }}>Let&apos;s start with the essentials.</p>
        </div>

        <Field label="Target role *">
          <Input value={form.targetRole} onChange={e => { patch({ targetRole: e.target.value }); setShowErr(false) }}
            placeholder="Senior Product Designer" error={showErr && !form.targetRole?.trim()} />
          {showErr && !form.targetRole?.trim() && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>Target role is required</p>}
        </Field>

        <Grid2 style={{ gap: 24 }}>
          <Field label="Full name *">
            <Input value={form.name} onChange={e => { patch({ name: e.target.value }); setShowErr(false) }}
              placeholder="Taylor Parker" error={showErr && !form.name?.trim()} />
            {showErr && !form.name?.trim() && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>Full name is required</p>}
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={e => { patch({ email: e.target.value }); setShowErr(false) }}
              placeholder="taylor@email.com" error={showErr && (emailEmpty || emailInvalid)} />
            {showErr && emailEmpty   && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>Email is required</p>}
            {showErr && emailInvalid && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>Enter a valid email address</p>}
          </Field>
        </Grid2>

        <Field label="Job description (recommended)"
          info="Paste the full job posting. The AI tailors your summary, reorders bullet points, and mirrors the role's keywords — the more detail you give, the more personalized the result.">
          <Textarea value={form.jobDescription} onChange={e => patch({ jobDescription: e.target.value.slice(0, 3000) })}
            placeholder="Paste here…" style={{ minHeight: 120 }} />
          {form.jobDescription?.length > 0 && (
            <p style={{ fontSize: 12, color: form.jobDescription.length >= 3000 ? T.error : T.dim, margin: 0, flexShrink: 0, textAlign: 'right' }}>
              {form.jobDescription.length} / 3000
            </p>
          )}
        </Field>
      </div>

      <Footer step={1} onBack={onBack} onNext={handleNext} onBackToReview={onBackToReview} />
    </>
  )
}

// ─── Step 2: Experience ───────────────────────────────────────────────────────

const EXP_CARD_H = 72

function ExpCard({ exp, isOpen, onToggle, onUpdate, onRemove, onHandleDown }) {
  const [isHov, setIsHov] = useState(false)
  const isMobile = useIsMobile()
  const headName = [exp.role, exp.company].filter(Boolean).join(' · ') || 'New position'
  const headMeta = [exp.start, exp.end].filter(Boolean).join(' – ')

  const CardInner = (
    <div className="exp-card-inner" style={{
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div
        onClick={onToggle}
        className="card-toggle"
        style={{
          height: EXP_CARD_H,
          display: 'flex', alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 24px', gap: 10,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headName}</div>
          {headMeta && <div style={{ fontSize: 14, color: T.dim, marginTop: 2 }}>{headMeta}</div>}
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </div>

      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.28s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '16px' : '24px', borderTop: '1px solid rgba(175,178,178,0.2)', display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
            <Grid2>
              <Field label="Company"><Input value={exp.company} onChange={e => onUpdate({ company: e.target.value })} placeholder="Google" /></Field>
              <Field label="Role"><Input value={exp.role} onChange={e => onUpdate({ role: e.target.value })} placeholder="Product Designer" /></Field>
              <Field label="Start date"><MonthPicker value={exp.start} onChange={v => onUpdate({ start: v })} placeholder="Jan 2022" disableFuture maxDate={exp.end && exp.end !== 'Present' ? exp.end : undefined} /></Field>
              <Field label="End date"><MonthPicker value={exp.end} onChange={v => onUpdate({ end: v })} placeholder="Present" allowPresent disableFuture minDate={exp.start || undefined} /></Field>
            </Grid2>
            <Field label="What you did & achieved" hint="Use bullet points or simple notes."
              info="Write everything you did — tasks, results, numbers, tools. The AI only polishes and structures what you provide; it never invents facts, so more detail means richer bullet points.">
              <Textarea value={exp.desc} onChange={e => onUpdate({ desc: e.target.value })}
                placeholder={'Led redesign of onboarding flow\nIncreased conversion by 15%\nBuilt design system used by 4 teams'} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div data-expid={exp.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 0, userSelect: 'none' }}>
        {/* Drag — left */}
        <div onPointerDown={onHandleDown}
          style={{ width: 20, height: EXP_CARD_H, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', cursor: 'grab', touchAction: 'none', marginTop: 1 }}>
          <DragIcon />
        </div>
        {/* Card */}
        <div style={{ flex: 1, minWidth: 0 }}>{CardInner}</div>
        {/* Close — right */}
        <div style={{ width: 20, height: EXP_CARD_H, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 1 }}>
          <BtnClose onClick={onRemove} />
        </div>
      </div>
    )
  }

  return (
    <div
      data-expid={exp.id}
      style={{ position: 'relative', userSelect: 'none' }}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
    >
      <div
        onPointerDown={onHandleDown}
        style={{
          position: 'absolute', left: -36, top: 0,
          height: EXP_CARD_H, width: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', color: T.dim,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
          userSelect: 'none', touchAction: 'none',
        }}
        className="drag-handle"
      ><DragIcon /></div>

      {CardInner}

      <BtnClose onClick={onRemove} style={{ position: 'absolute', right: -36, top: 0, height: EXP_CARD_H, width: 36, justifyContent: 'center', opacity: isHov ? 1 : 0, transition: 'opacity .15s' }} />
    </div>
  )
}

function StepExperience({ form, patch, onBack, onNext, onBackToReview }) {
  const [openId, setOpenId]       = useState(null)
  const [dragState, setDragState] = useState(null)
  const isMobile = useIsMobile()
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
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Work experience</h2>
          <p style={{ fontSize: 14, color: T.text, margin: 0 }}>Most recent first. Rough notes are fine — AI will polish everything.</p>
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
          <BtnTextAdd onClick={addExp} style={{ paddingLeft: 24 }}><PlusIcon /> Add position</BtnTextAdd>
        </div>
      </div>

      {/* Floating ghost */}
      {dragState && dragExp && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: dragState.top + (isMobile ? 1 : 0),
          left: isMobile ? dragState.left + 20 : dragState.left,
          width: isMobile ? dragState.width - 40 : dragState.width,
          height: EXP_CARD_H, display: 'flex', alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 24px',
          background: T.bg, borderRadius: 16,
          border: `1px solid ${T.border}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
          userSelect: 'none',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[dragExp.role, dragExp.company].filter(Boolean).join(' · ') || 'New position'}
            </div>
            {[dragExp.start, dragExp.end].filter(Boolean).join(' – ') &&
              <div style={{ fontSize: 14, color: T.dim, marginTop: 2 }}>{[dragExp.start, dragExp.end].filter(Boolean).join(' – ')}</div>
            }
          </div>
          <ChevronDown />
        </div>
      )}

      <Footer step={2} onBack={onBack} onNext={onNext} onBackToReview={onBackToReview} />
    </>
  )
}

// ─── Step 3: Skills, Languages & Education ───────────────────────────────────

function SkillChips({ skills, onChange, targetRole }) {
  const [input, setInput]     = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

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

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px',
          border: `1px solid ${focused ? T.ink : T.border}`,
          boxShadow: focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none',
          borderRadius: 12, minHeight: 47, alignItems: 'center',
          cursor: 'text', transition: 'border-color .15s, box-shadow .15s', background: T.bg,
        }}
      >
        {skills.map(s => (
          <span
            key={s}
            onMouseEnter={e => { e.currentTarget.style.background = '#EFF1F4'; e.currentTarget.style.borderColor = 'rgba(175,178,178,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.background = T.bgPage; e.currentTarget.style.borderColor = 'rgba(175,178,178,0.4)' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: T.bgPage, border: '1px solid rgba(175,178,178,0.4)',
              borderRadius: 6, padding: '3px 8px', fontSize: 13, color: T.ink,
              userSelect: 'none', transition: 'background .15s, border-color .15s',
            }}
          >
            {s}
            <BtnClose
              onClick={e => { e.stopPropagation(); onChange(skills.filter(x => x !== s)) }}
              onPointerDown={e => e.stopPropagation()}
            />
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
          style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: T.ink, background: 'transparent', minWidth: 100, flex: 1 }}
        />
      </div>
      <p style={{ fontSize: 12, color: T.dim, margin: '6px 0 0 0' }}>Press Enter or , to add a skill</p>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {suggestions.slice(0, 8).map(s => (
            <button key={s} onClick={() => addSkill(s)}
              onMouseEnter={e => { e.currentTarget.style.background = T.bgPage; e.currentTarget.style.borderColor = 'rgba(175,178,178,0.8)' }}
              onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.border }}
              style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${T.border}`, background: T.bg,
                color: T.text, cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                transition: 'background .15s, border-color .15s',
              }}><PlusIcon color={T.text} /> {s}</button>
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

function LangRow({ item, onNameChange, onLevelChange, onRemove, onHandleDown, isDragging, sortKey, usedNames = [] }) {
  const [isHov, setIsHov]   = useState(false)
  const [hovLvl, setHovLvl] = useState(null)
  const isMobile = useIsMobile()
  return (
    <div
      data-sk={sortKey}
      style={{ position: 'relative', opacity: isDragging ? 0 : 1, transition: 'opacity .15s' }}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
    >
      {/* Drag handle — desktop only */}
      {!isMobile && (
        <div onPointerDown={onHandleDown} className="drag-handle" style={{
          position: 'absolute', left: -36, top: 0,
          height: 47, width: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', color: T.dim,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
          userSelect: 'none', touchAction: 'none',
        }}><DragIcon /></div>
      )}

      {isMobile ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {/* Drag — left, aligned to first input */}
          <div onPointerDown={onHandleDown}
            style={{ width: 20, height: 47, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', cursor: 'grab', touchAction: 'none', marginTop: 1 }}>
            <DragIcon />
          </div>
          {/* Content: input + levels */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AutoInput value={item.name} onChange={e => onNameChange(e.target.value)}
              placeholder="e.g. English" suggestions={LANG_SUGG}
              selectedValues={usedNames.filter(n => n !== item.name)} showOnFocus />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
              border: `1px solid ${T.border}`, borderRadius: 12,
              height: 47, padding: 4, overflow: 'hidden', boxSizing: 'border-box' }}>
              {LANG_LEVELS.map((lvl, i) => (
                <button key={lvl} type="button" onClick={() => onLevelChange(i)}
                  style={{ position: 'relative', zIndex: 1, border: 'none', background: 'none',
                    fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.text }}>
                  <span style={{ pointerEvents: 'none' }}>{lvl}</span>
                </button>
              ))}
              <div style={{ position: 'absolute', top: 4, bottom: 4, zIndex: 2,
                left: `calc(4px + ${item.level} * ((100% - 8px) / 6))`,
                width: 'calc((100% - 8px) / 6)',
                background: T.ink, borderRadius: 8, transition: 'left 0.2s ease',
                pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, alignItems: 'center',
                  width: '600%', left: `calc(${-item.level} * 100%)`, transition: 'left 0.2s ease' }}>
                  {LANG_LEVELS.map(lvl => (
                    <div key={lvl} style={{ flex: '0 0 calc(100% / 6)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600, color: T.bg }}>{lvl}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Close — right, aligned to first input */}
          <div style={{ width: 20, height: 47, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 1 }}>
            <BtnClose onClick={onRemove} />
          </div>
        </div>
      ) : (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <AutoInput value={item.name} onChange={e => onNameChange(e.target.value)}
            placeholder="e.g. English" suggestions={LANG_SUGG}
            selectedValues={usedNames.filter(n => n !== item.name)} showOnFocus />
        </div>
        <div style={{ flex: 1,
          position: 'relative',
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          border: `1px solid ${T.border}`, borderRadius: 12,
          height: 47, padding: 4, overflow: 'hidden', boxSizing: 'border-box',
        }}>
          {LANG_LEVELS.map((lvl, i) => (
            <button key={lvl} type="button" onClick={() => onLevelChange(i)}
              onMouseEnter={() => setHovLvl(i)} onMouseLeave={() => setHovLvl(null)}
              style={{
                position: 'relative', zIndex: 1,
                border: 'none', background: hovLvl === i && item.level !== i ? T.bgPage : 'none',
                fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.text,
              }}>
              <span style={{ pointerEvents: 'none' }}>{lvl}</span>
            </button>
          ))}
          <div style={{
            position: 'absolute', top: 4, bottom: 4, zIndex: 2,
            left: `calc(4px + ${item.level} * ((100% - 8px) / 6))`,
            width: 'calc((100% - 8px) / 6)',
            background: T.ink, borderRadius: 8,
            transition: 'left 0.2s ease',
            pointerEvents: 'none', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, alignItems: 'center',
              width: '600%', left: `calc(${-item.level} * 100%)`, transition: 'left 0.2s ease' }}>
              {LANG_LEVELS.map(lvl => (
                <div key={lvl} style={{ flex: '0 0 calc(100% / 6)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 600, color: T.bg }}>{lvl}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {!isMobile && (
        <BtnClose onClick={onRemove} style={{ position: 'absolute', right: -36, top: 0, height: 47, width: 36, justifyContent: 'center', opacity: isHov ? 1 : 0, transition: 'opacity .15s' }} />
      )}
    </div>
  )
}

function EduRow({ text, onChange, onRemove, onHandleDown, isDragging, sortKey }) {
  const [isHov, setIsHov] = useState(false)
  const isMobile = useIsMobile()
  return (
    <div
      data-sk={sortKey}
      style={{ position: 'relative', opacity: isDragging ? 0 : 1, transition: 'opacity .15s' }}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
    >
      {/* Drag handle — desktop only */}
      {!isMobile && (
        <div onPointerDown={onHandleDown} className="drag-handle" style={{
          position: 'absolute', left: -36, top: 0,
          height: 47, width: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', color: T.dim,
          opacity: isHov ? 1 : 0, transition: 'opacity .15s',
          userSelect: 'none', touchAction: 'none',
        }}><DragIcon /></div>
      )}

      {isMobile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div onPointerDown={onHandleDown}
            style={{ width: 20, height: 47, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', cursor: 'grab', touchAction: 'none', marginTop: 1 }}>
            <DragIcon />
          </div>
          <div style={{ flex: 1 }}>
            <Input value={text} onChange={e => onChange(e.target.value.slice(0, 120))}
              maxLength={120}
              placeholder="Bachelor of Computer Science — MIT" />
          </div>
          <div style={{ width: 20, height: 47, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 1 }}>
            <BtnClose onClick={onRemove} />
          </div>
        </div>
      ) : (
        <Input value={text} onChange={e => onChange(e.target.value)}
          placeholder="Bachelor of Computer Science — MIT" />
      )}

      {!isMobile && (
        <BtnClose onClick={onRemove} style={{ position: 'absolute', right: -36, top: 0, height: 47, width: 36, justifyContent: 'center', opacity: isHov ? 1 : 0, transition: 'opacity .15s' }} />
      )}
    </div>
  )
}

function StepSkillsLangEdu({ form, patch, onBack, onNext, onBackToReview }) {
  const isMobile = useIsMobile()
  const updLang = (id, p) => patch({ languages: form.languages.map(l => l.id === id ? { ...l, ...p } : l) })

  const { dragState: langDrag, startDrag: startLangDrag } = useSortable(
    form.languages, arr => patch({ languages: arr }), 'lang'
  )
  const { dragState: eduDrag, startDrag: startEduDrag } = useSortable(
    form.education, arr => patch({ education: arr }), 'edu'
  )

  const langDragItem = langDrag ? form.languages.find(l => l.id === langDrag.id) : null
  const usedLangNames = form.languages.map(l => l.name).filter(Boolean)
  const eduDragItem  = eduDrag  ? form.education.find(e => e.id === eduDrag.id)  : null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Skills, languages & education</h2>
          <p style={{ fontSize: 14, color: T.text, margin: 0 }}>Add skills as chips. AI determines proficiency from your experience.</p>
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
                onNameChange={v => {
                  const clean = sanitizeLanguageName(v)
                  const dupe = usedLangNames.some(n => n !== l.name && n.toLowerCase() === clean.toLowerCase())
                  if (!dupe) updLang(l.id, { name: clean })
                }}
                onLevelChange={v => updLang(l.id, { level: v })}
                onRemove={() => patch({ languages: form.languages.filter(x => x.id !== l.id) })}
                usedNames={usedLangNames}
              />
            ))}
            <BtnTextAdd onClick={() => patch({ languages: [...form.languages, { id: uid(), name: '', level: 3 }] })} style={{ padding: isMobile ? '8px 24px' : '8px 16px' }}><PlusIcon /> Add language</BtnTextAdd>
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
            <BtnTextAdd onClick={() => patch({ education: [...form.education, { id: uid(), text: '' }] })} style={{ padding: isMobile ? '8px 24px' : '8px 16px' }}><PlusIcon /> Add education</BtnTextAdd>
          </div>
        </div>
      </div>

      {/* Ghosts */}
      {langDrag && langDragItem && (
        isMobile ? (
          <div style={{
            position: 'fixed', zIndex: 9999, pointerEvents: 'none',
            top: langDrag.top + 1,
            left: langDrag.left + 20,
            width: langDrag.width - 40,
            display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.9,
          }}>
            <div style={{ height: 47, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: T.ink, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              {langDragItem.name || 'Language'}
            </div>
            <div style={{ height: 47, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
          </div>
        ) : (
          <div style={{
            position: 'fixed', zIndex: 9999, pointerEvents: 'none',
            top: langDrag.top, left: langDrag.left, width: langDrag.width,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center',
            opacity: 0.9,
          }}>
            <div style={{ height: 47, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: T.ink, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              {langDragItem.name || 'Language'}
            </div>
            <div style={{ height: 47, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
          </div>
        )
      )}
      {eduDrag && eduDragItem && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: eduDrag.top + (isMobile ? 1 : 0),
          left: isMobile ? eduDrag.left + 20 : eduDrag.left,
          width: isMobile ? eduDrag.width - 40 : eduDrag.width,
          height: 47, background: T.bg,
          border: `1px solid ${T.border}`, borderRadius: 12,
          display: 'flex', alignItems: 'center', padding: '0 16px',
          fontSize: 14, color: T.ink,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          opacity: 0.9,
        }}>
          {eduDragItem.text || 'Education'}
        </div>
      )}

      <Footer step={3} onBack={onBack} onNext={onNext} onBackToReview={onBackToReview} />
    </>
  )
}

// ─── Step 4: Links & Contact ──────────────────────────────────────────────────

function StepLinks({ form, patch, onBack, onNext, onBackToReview }) {
  const [showErr, setShowErr] = useState(false)

  const phoneDigits = (form.phone || '').replace(/\D/g, '')
  const phoneSet = (form.phone || '').trim().length > 0
  const phoneTooShort = phoneSet && phoneDigits.length < 7
  const phoneTooLong  = phoneSet && phoneDigits.length > 15
  const phoneErr = phoneTooShort || phoneTooLong

  function handleNext() {
    if (phoneErr) { setShowErr(true); return }
    onNext()
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Contact details</h2>
          <p style={{ fontSize: 14, color: T.text, margin: 0 }}>All optional. Add what&apos;s relevant for your role.</p>
        </div>

        <Grid2 style={{ gap: 24 }}>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={e => patch({ phone: e.target.value.replace(/[^\d+\s\-(). ]/g, '') })}
              placeholder="+1 (415) 555-1234"
              error={showErr && phoneErr}
            />
            {showErr && phoneTooShort && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>Phone number is too short</p>}
            {showErr && phoneTooLong  && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>Phone number is too long</p>}
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={e => patch({ location: e.target.value })} placeholder="San Francisco, CA" />
          </Field>
        </Grid2>

        <Field label="LinkedIn">
          <Input value={form.linkedin} onChange={e => patch({ linkedin: e.target.value })} placeholder="linkedin.com/in/taylorparker" />
        </Field>

        <Field label="Portfolio / Website">
          <Input value={form.portfolio} onChange={e => patch({ portfolio: e.target.value })} placeholder="taylorparker.com or github.com/taylor" />
        </Field>
      </div>

      <Footer step={4} onBack={onBack} onNext={handleNext} nextLabel="Review" onBackToReview={onBackToReview} />
    </>
  )
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SumCard({ icon, title, statusOk, statusText, onEdit, children }) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  return (
    <div style={{
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} className="card-toggle" style={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 24px', gap: 10,
        cursor: 'pointer', userSelect: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto', minWidth: 0 }}>
          {/* Icon slot — 20×20, черная иконка подставится снаружи */}
          <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
          <span style={{ fontSize: 14, fontWeight: 500, color: T.ink, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: statusOk ? T.green : T.bgPage }} />
            <span style={{ fontSize: 14, color: T.dim, whiteSpace: 'nowrap' }}>{statusText}</span>
          </div>
          <button onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ fontSize: 14, padding: '4px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bgPage }}
            onMouseLeave={e => { e.currentTarget.style.background = T.bg }}>Edit</button>
          {open ? <ChevronUp color={T.dim} /> : <ChevronDown color={T.dim} />}
        </div>
      </div>
      {/* Body */}
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.28s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '12px 16px' : '12px 24px', borderTop: `1px solid rgba(175,178,178,0.2)` }}>{children}</div>
        </div>
      </div>
    </div>
  )
}

function SumRow({ label, value }) {
  const empty = !value || !value.toString().trim()
  const isMobile = useIsMobile()
  return (
    <div style={{ display: 'flex', gap: 12, padding: isMobile ? '2px 0' : '6px 0' }}>
      <span style={{ fontSize: 14, color: T.dim, width: 104, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: empty ? T.dim : T.ink, fontStyle: empty ? 'italic' : 'normal', lineHeight: 1.5 }}>{empty ? '—' : value}</span>
    </div>
  )
}


// ─── Match score (local, deterministic) ────────────────────────────────────────
// The numeric score is computed here on the client by keyword overlap — stable and
// explainable, no AI involved. The /api/match endpoint only adds qualitative analysis.
const MATCH_STOPWORDS = new Set(
  `a an the and or but if then else for to of in on at by with from as is are was were be been being this that these those we you they it our your their work working experience experienced role roles team teams strong good great help build building years year ability able will would should must have has had having looking hiring seeking join joining including include includes etc using use used new who what when where which while across into out up down over under more most least very plus nice want need needs required require requirements responsibilities qualifications about within per via also like such other than each any all some both every minimum preferred bonus position candidate company products product platform customers users people day days month months ideal someone something able`
    .split(/\s+/),
)

const MATCH_CASING = {
  javascript: 'JavaScript', typescript: 'TypeScript', react: 'React', nextjs: 'Next.js', 'next.js': 'Next.js',
  nodejs: 'Node.js', 'node.js': 'Node.js', node: 'Node.js', graphql: 'GraphQL', css: 'CSS', html: 'HTML',
  sql: 'SQL', api: 'API', apis: 'APIs', rest: 'REST', aws: 'AWS', gcp: 'GCP', ci: 'CI/CD', cicd: 'CI/CD',
  'ci/cd': 'CI/CD', ui: 'UI', ux: 'UX', php: 'PHP', sass: 'Sass', scss: 'SCSS', figma: 'Figma',
  python: 'Python', java: 'Java', kotlin: 'Kotlin', swift: 'Swift', rust: 'Rust', golang: 'Go',
  kubernetes: 'Kubernetes', docker: 'Docker', git: 'Git', postgresql: 'PostgreSQL', mongodb: 'MongoDB',
  redis: 'Redis', jest: 'Jest', playwright: 'Playwright', cypress: 'Cypress', agile: 'Agile', scrum: 'Scrum',
  accessibility: 'Accessibility', seo: 'SEO', redux: 'Redux', vue: 'Vue', angular: 'Angular', svelte: 'Svelte',
  tailwind: 'Tailwind', webpack: 'Webpack', vite: 'Vite', azure: 'Azure', terraform: 'Terraform', devops: 'DevOps',
}

const MATCH_VOCAB = new Set([
  ...Object.keys(MATCH_CASING),
  'design', 'systems', 'testing', 'frontend', 'backend', 'fullstack', 'mentoring', 'optimization',
  'performance', 'responsive', 'animation', 'express', 'django', 'flask', 'rails', 'spring', 'dotnet',
  'linux', 'bash', 'microservices', 'grpc', 'websocket', 'oauth', 'jwt', 'analytics', 'data', 'machine',
  'learning', 'etl', 'spark', 'tableau', 'excel', 'marketing', 'sales', 'copywriting', 'leadership',
  'management', 'communication', 'research', 'wireframing', 'prototyping', 'branding', 'illustrator',
  'photoshop', 'figma', 'architecture', 'scalability', 'security', 'automation', 'deployment',
])

const MATCH_PHRASES = [
  'design system', 'design systems', 'unit testing', 'integration testing', 'machine learning',
  'deep learning', 'continuous integration', 'continuous deployment', 'rest api', 'rest apis',
  'version control', 'code review', 'test driven', 'data analysis', 'data analytics',
  'project management', 'product management', 'user research', 'front end', 'back end', 'full stack',
]

function matchNormToken(t) {
  return t.replace(/^[.+#/-]+|[.+#/-]+$/g, '').replace(/\.(js|jsx|ts|tsx)$/, '')
}
function matchTokenize(text) {
  // Split on '/' too, so slash-separated lists ("Jest/Playwright", "CI/CD") become individual
  // tokens. Keep '.', '+', '#' inside tokens for "node.js", "c++", "c#".
  return (text || '').toLowerCase()
    .replace(/[^a-z0-9.+#]+/g, ' ')
    .split(/\s+/)
    .map(matchNormToken)
    .filter(t => t.length >= 2 && !MATCH_STOPWORDS.has(t) && !/^\d+$/.test(t))
}
function matchPretty(k) {
  if (MATCH_CASING[k]) return MATCH_CASING[k]
  return k.split(' ').map(w => MATCH_CASING[w] || (w[0].toUpperCase() + w.slice(1))).join(' ')
}
// Light stemmer so experience verbs match JD nouns (mentored/mentoring → mentor,
// optimization/optimize → optimiz, systems → system). Applied to BOTH sides for matching only;
// display/vocab still use the surface form.
function matchStem(w) {
  if (w.length <= 4) return w
  return w
    .replace(/(ization|isation)$/, 'ize')
    .replace(/(ing|ed)$/, '')
    .replace(/ment$/, '')
    .replace(/ies$/, 'y')
    .replace(/(es|s)$/, '')
    .replace(/e$/, '')
}

function computeMatch(form) {
  const jd = (form.jobDescription || '').trim()
  if (!jd) return null

  const resumeText = [
    form.targetRole || '',
    (form.skills || []).join(' '),
    (form.experience || []).map(e => `${e.role || ''} ${e.company || ''} ${e.desc || ''}`).join(' '),
    (form.education || []).map(e => e.text || '').join(' '),
  ].join(' ')

  const haystackStems = new Set(matchTokenize(resumeText).map(matchStem))
  const jdRaw = ' ' + jd.toLowerCase().replace(/[^a-z0-9.+#/ ]+/g, ' ').replace(/\s+/g, ' ') + ' '

  const jdTokens = [...new Set(matchTokenize(jd))]
  const phraseHits = MATCH_PHRASES.filter(p => jdRaw.includes(' ' + p + ' '))
  const phraseWords = new Set(phraseHits.flatMap(p => p.split(' ')))

  let vocabHits = jdTokens.filter(t => MATCH_VOCAB.has(t) && !phraseWords.has(t))
  let keywords = [...new Set([...vocabHits, ...phraseHits])]
  // If the JD exposes few recognisable skills (non-tech roles), broaden to all content words
  // so we still produce a meaningful denominator.
  if (keywords.length < 4) {
    keywords = [...new Set([...keywords, ...jdTokens.filter(t => !phraseWords.has(t))])]
  }
  if (!keywords.length) return null

  const isMatched = k => (k.includes(' ')
    ? k.split(' ').every(w => haystackStems.has(matchStem(w)))
    : haystackStems.has(matchStem(k)))
  const matched = keywords.filter(isMatched)
  const missing = keywords.filter(k => !isMatched(k))

  return {
    score: Math.round((100 * matched.length) / keywords.length),
    strengths: matched.map(matchPretty).slice(0, 6),
    missing: missing.map(matchPretty).slice(0, 8),
  }
}

function ScoreRing({ score }) {
  const r = 27, sw = 4, C = 2 * Math.PI * r
  const color = score >= 75 ? T.green : score >= 50 ? '#E0A93B' : '#E5746E'
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="#EEF0F2" strokeWidth={sw} />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)}
        transform="rotate(-90 32 32)" style={{ transition: 'stroke-dashoffset .6s ease' }} />
      <text x="32" y="33" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 16, fontWeight: 600, fill: T.ink, fontFamily: 'var(--font-onest), system-ui, sans-serif' }}>{score}%</text>
    </svg>
  )
}

function MatchKeyword({ label, onAdd }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onAdd} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12,
        padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
        border: `1px solid ${T.border}`,
        background: hov ? T.bgPage : T.bg, color: T.text,
      }}>
      <PlusIcon color={T.text} /> {label}
    </button>
  )
}

// Pure-local match meter: score ring + the JD keywords your resume is missing. One source of
// truth — tapping a missing chip adds it to skills and the ring goes up; at 100% there are none.
// No AI call: the actionable gaps are all local, instant and free.
function MatchScoreCard({ form, patch }) {
  const local = computeMatch(form)
  if (!form.jobDescription || !form.jobDescription.trim() || !local) return null

  const has = kw => form.skills.some(s => s.toLowerCase() === kw.toLowerCase())
  const addSkill = kw => { if (!has(kw)) patch({ skills: [...form.skills, kw] }) }

  const missing = local.missing.filter(k => !has(k))
  const strong = local.score >= 85

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: '16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ScoreRing score={local.score} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>
            {strong ? 'Strong match' : 'Resume match score'}
          </div>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>
            {missing.length > 0
              ? (strong
                ? 'Strong overall — a few optional keywords to add below.'
                : 'How well your profile fits this job description.')
              : 'Your profile lines up well with this job description.'}
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: T.f12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: T.dim, marginBottom: 8 }}>
            Missing keywords <span style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>· tap to add if you have it</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {missing.map((k, i) => <MatchKeyword key={i} label={k} onAdd={() => addSkill(k)} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function Summary({ form, patch, goTo, onEdit, onGenerate, generating, genError }) {
  const tpl = TEMPLATES.find(t => t.id === form.template)
  const isMobile = useIsMobile()

  const GenerateBtn = () => (
    <BtnPrimary onClick={onGenerate} disabled={generating} style={{ position: 'relative', ...(isMobile ? { flex: 1 } : {}) }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: generating ? 0 : 1 }}>
        <SparkleIcon /> Generate resume
      </span>
      {generating && (
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimDots />
        </span>
      )}
    </BtnPrimary>
  )
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Review & generate</h2>
        <p style={{ fontSize: 14, color: T.text, margin: 0 }}>Expand any section to check details.</p>
      </div>

      <MatchScoreCard form={form} patch={patch} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SumCard icon={<img src="/template.svg" width={20} height={20} alt="" />} title="Template" statusOk={!!form.template} statusText="Selected" onEdit={() => goTo(-1)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 38, borderRadius: 4, background: tpl?.swatch, border: `0.5px solid ${T.bgPage}`, flexShrink: 0 }} />
            <span style={{ fontSize: T.f13, fontWeight: 500 }}>{tpl?.name}</span>
          </div>
        </SumCard>

        <SumCard icon={<img src="/profile.svg" width={20} height={20} alt="" />} title="Profile" statusOk={!!(form.name && form.email)} statusText={form.name ? 'Filled' : 'Empty'} onEdit={() => onEdit(1)}>
          <SumRow label="Target role" value={form.targetRole} />
          <SumRow label="Full name" value={form.name} />
          <SumRow label="Email" value={form.email} />
          <SumRow label="Job description" value={form.jobDescription ? `${form.jobDescription.slice(0, 60)}…` : null} />
        </SumCard>

        <SumCard icon={<img src="/case.svg" width={20} height={20} alt="" />} title="Experience"
          statusOk={form.experience.some(e => e.role || e.company)}
          statusText={`${form.experience.length} position${form.experience.length !== 1 ? 's' : ''}`}
          onEdit={() => onEdit(2)}>
          {form.experience.length === 0
            ? <div style={{ fontSize: 14, color: T.dim }}>No experience added</div>
            : form.experience.map((e, i) => (
              <div key={e.id} style={{
                paddingTop: i > 0 ? 8 : 0, marginTop: i > 0 ? 8 : 0,
                borderTop: i > 0 ? '1px solid rgba(175,178,178,0.15)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ fontSize: 14, fontWeight: (e.role || e.company) ? 500 : 400, color: (e.role || e.company) ? T.ink : T.dim }}>
                  {e.role || e.company
                    ? <>{e.role}{e.role && e.company && <span style={{ fontWeight: 400, color: T.dim }}> · {e.company}</span>}{!e.role && e.company}</>
                    : 'New position'
                  }
                </div>
                {(e.start || e.end) && (
                  <div style={{ fontSize: 13, color: T.dim }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div>
                )}
              </div>
            ))
          }
        </SumCard>

        <SumCard icon={<img src="/star.svg" width={20} height={20} alt="" />} title="Skills & languages"
          statusOk={form.skills.length > 0 || form.languages.some(l => l.name)}
          statusText={`${form.skills.length} skill${form.skills.length !== 1 ? 's' : ''}`}
          onEdit={() => onEdit(3)}>
          <SumRow label="Skills" value={form.skills.join(', ')} />
          <SumRow label="Languages" value={form.languages.filter(l => l.name).map(l => `${l.name} (${LANG_LEVELS[l.level]})`).join(', ')} />
          <SumRow label="Education" value={form.education.filter(e => e.text).map(e => e.text).join('; ')} />
        </SumCard>

        <SumCard icon={<img src="/link.svg" width={20} height={20} alt="" />} title="Contact details" statusOk={!!(form.phone || form.linkedin)} statusText={form.phone || form.linkedin ? 'Filled' : 'Optional'} onEdit={() => onEdit(4)}>
          <SumRow label="Phone" value={form.phone} />
          <SumRow label="Location" value={form.location} />
          <SumRow label="LinkedIn" value={form.linkedin} />
          <SumRow label="Portfolio" value={form.portfolio} />
        </SumCard>
      </div>

      {!isMobile && (
        <div style={{ background: T.bgPage, borderRadius: 16, padding: '32px 64px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Ready to generate</div>
          <div style={{ fontSize: 16, color: T.text, marginBottom: '1.25rem', lineHeight: 1.6 }}>
            AI will write polished bullet points, a professional summary, and tailor everything to your target role.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <GenerateBtn />
            <BtnSecondary onClick={() => goTo(4)} style={{ background: 'none', border: 'none' }}><ArrowLeft /> Back</BtnSecondary>
          </div>
          {genError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: T.errorBg, border: '1px solid #FECACA', borderRadius: 12, fontSize: 13, color: T.errorText, lineHeight: 1.5 }}>
              ⚠ {genError}
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: T.bg, padding: '12px 16px 28px',
          borderTop: '1px solid rgba(175,178,178,0.3)',
          display: 'flex', gap: 10,
        }}>
          <BtnSecondary onClick={() => goTo(4)}><ArrowLeft /> Back</BtnSecondary>
          <GenerateBtn />
        </div>
      )}
    </>
  )
}

// ─── Generated result ─────────────────────────────────────────────────────────

function A4Frame({ children, maxPages = Infinity }) {
  const outerRef   = useRef(null)
  const measureRef = useRef(null)
  const [scale, setScale]     = useState(1)
  const [contentH, setContentH] = useState(0)

  const DESIGN_W   = 680
  const DESIGN_H   = Math.round(DESIGN_W * 297 / 210)   // 961
  const PAGE_PAD_T = 20   // top white margin on pages 2+  (design px)
  const PAGE_PAD_B = 40   // bottom white margin (design px)
  // Page 1 content window: 0..EFFECTIVE_H (no top margin — template provides its own)
  const EFFECTIVE_H = DESIGN_H - PAGE_PAD_B              // 921
  // Pages 2+ content stride: shorter by PAGE_PAD_T because top margin is taken
  const STRIDE      = DESIGN_H - PAGE_PAD_T - PAGE_PAD_B // 901

  useEffect(() => {
    if (!outerRef.current) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / DESIGN_W))
    ro.observe(outerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!measureRef.current) return
    const ro = new ResizeObserver(([e]) => setContentH(e.contentRect.height))
    ro.observe(measureRef.current)
    return () => ro.disconnect()
  }, [])

  const pageCount = Math.min(
    maxPages,
    contentH > EFFECTIVE_H ? 1 + Math.ceil((contentH - EFFECTIVE_H) / STRIDE) : 1
  )

  return (
    <div ref={outerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Off-screen height measurer at full DESIGN_W, no scaling */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: DESIGN_W, visibility: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <div ref={measureRef}>{children}</div>
      </div>

      {Array.from({ length: pageCount }, (_, i) => {
        const isFirst = i === 0
        const isLast  = i === pageCount - 1
        // Shift content so page i starts at the right design-y position.
        // Page 1: no shift. Pages 2+: each page shifts by i * STRIDE upward.
        const translateY = isFirst ? 0 : -i * STRIDE

        return (
          <div key={i} style={{
            width: '100%', aspectRatio: `${DESIGN_W} / ${DESIGN_H}`, overflow: 'hidden',
            position: 'relative', background: T.bg,
            userSelect: 'none', flexShrink: 0,
          }}>

            {/* Scaled content */}
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: DESIGN_W, minHeight: DESIGN_H,
              transformOrigin: 'top left',
              transform: `scale(${scale}) translateY(${translateY}px)`,
            }}>
              {children}
            </div>

            {/* ─ Top white margin (pages 2+) ─
                Covers the thin "bleed" strip from the previous page bottom.
                That bleed content is still fully visible at the bottom of the previous card. */}
            {!isFirst && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: Math.round(PAGE_PAD_T * scale),
                background: T.bg, zIndex: 1, pointerEvents: 'none',
              }} />
            )}

            {/* ─ Bottom white margin (all but last page) ─
                Covers the thin "bleed" strip that continues onto the next page.
                That bleed content is still fully visible at the top of the next card. */}
            {!isLast && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: Math.round(PAGE_PAD_B * scale),
                background: T.bg, zIndex: 1, pointerEvents: 'none',
              }} />
            )}

          </div>
        )
      })}
    </div>
  )
}

const CREEM_PLANS = [
  {
    id: 'single',
    productId: 'prod_4uHUOnjg0iut37LzFdoMfs',
    label: 'Single download',
    price: '$4.90',
    period: null,
    priceNote: 'one-time',
    badge: null,
    cta: 'Download resume',
    forWho: 'For one-time job applications',
    features: [
      '1 AI-generated resume',
      'Download as PDF',
      'Choose from 6 templates',
    ],
  },
  {
    id: 'pro',
    productId: 'prod_64GMyqt8VGNgiaQkRbPpmE',
    label: 'Pro',
    price: '$9.90',
    period: '/month',
    priceNote: 'cancel anytime',
    badge: 'Most popular',
    cta: 'Start Pro',
    forWho: 'For active job seekers',
    features: [
      'Unlimited resume downloads',
      'All 6 templates, switch anytime',
      'Tailored to any job description',
    ],
  },
]

function ResumeResult({ resume, template, onReset, downloadRef, initialPages }) {
  const isMobile = useIsMobile()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [proUnlocked, setProUnlocked] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('pro_unlocked') === '1'
  )
  const [verifyMode, setVerifyMode] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState(null)
  const [downloaded, setDownloaded] = useState(false)

  // Load Creem embed.js once
  useEffect(() => {
    if (typeof window === 'undefined' || window.Creem?.__loaded) return
    const existing = document.querySelector('script[src="https://www.creem.io/embed.js"]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://www.creem.io/embed.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  async function handleCheckout() {
    if (checkoutLoading) return
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const plan = CREEM_PLANS.find(p => p.id === selectedPlan)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: plan.productId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      if (!data.checkoutUrl) throw new Error('No checkout URL returned')

      window.Creem.openCheckout({
        checkoutUrl: data.checkoutUrl,
        onComplete: () => {
          posthog.capture('payment_success', { plan: selectedPlan })
          window.Creem.close()
          setSheetOpen(false)
          if (selectedPlan === 'pro') {
            localStorage.setItem('pro_unlocked', '1')
            setProUnlocked(true)
          }
          setTimeout(() => { if (downloadRef.current) downloadRef.current.click() }, 300)
        },
        onClose: () => {
          setCheckoutLoading(false)
        },
      })
      setCheckoutLoading(false)
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutError(err.message || 'Something went wrong. Please try again.')
      setCheckoutLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!verifyEmail.trim()) return
    setVerifying(true)
    setVerifyError(null)
    try {
      const res = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail.trim() }),
      })
      const data = await res.json()
      if (data.active) {
        localStorage.setItem('pro_unlocked', '1')
        setProUnlocked(true)
        setSheetOpen(false)
      } else {
        setVerifyError('No active Pro subscription found for this email.')
      }
    } catch {
      setVerifyError('Something went wrong. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const ctaLabel = checkoutLoading
    ? 'Redirecting…'
    : (CREEM_PLANS.find(p => p.id === selectedPlan)?.cta ?? 'Continue to payment →')

  const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.5 6L5 8.5L9.5 4" stroke={T.green} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const VerifyForm = () => (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 14, color: T.text, lineHeight: 1.5 }}>
        Enter the email you used to purchase Pro.
      </p>
      <input
        type="email"
        value={verifyEmail}
        onChange={e => setVerifyEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          height: 44, borderRadius: 10, border: `1.5px solid ${T.border}`,
          padding: '0 14px', fontSize: 14, fontFamily: 'inherit',
          outline: 'none', background: T.bg, color: T.ink,
          boxSizing: 'border-box', width: '100%',
        }}
      />
      {verifyError && (
        <p style={{ margin: 0, fontSize: 13, color: T.errorText }}>{verifyError}</p>
      )}
      <BtnPrimary disabled={verifying} style={{ width: '100%' }}>
        {verifying ? 'Checking…' : 'Verify subscription'}
      </BtnPrimary>
      <button
        type="button"
        onClick={() => { setVerifyMode(false); setVerifyError(null) }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.dim, fontFamily: 'inherit' }}
      >
        ← Back to plans
      </button>
    </form>
  )

  const PlanCards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {CREEM_PLANS.map(plan => {
        const sel = selectedPlan === plan.id
        return (
          <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
            display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px',
            borderRadius: 12,
            border: `2px solid ${sel ? T.ink : 'rgba(175,178,178,0.35)'}`,
            background: sel ? T.bgPage : T.bg,
            cursor: 'pointer', textAlign: 'left', width: '100%',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}>
            {/* Top row: radio + name + badge + price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                border: sel ? `5px solid ${T.ink}` : `2px solid ${T.border}`,
                background: T.bg, boxSizing: 'border-box',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: T.ink }}>{plan.label}</span>
                {plan.badge && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: T.green, color: T.ink, padding: '2px 8px', borderRadius: 20 }}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.ink, flexShrink: 0 }}>
                {plan.price}{plan.period && <span style={{ fontSize: 12, fontWeight: 400, color: T.dim }}>{plan.period}</span>}
              </span>
            </div>
            {/* Sub info */}
            <div style={{ paddingLeft: 28, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: T.dim }}>{plan.forWho}</span>
              <span style={{ fontSize: 12, color: T.dim, textAlign: 'right', flexShrink: 0 }}>{plan.priceNote}</span>
            </div>
            {/* Features */}
            <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {plan.features.map(f => (
                <span key={f} style={{ fontSize: 13, color: T.text, display: 'flex', gap: 7, alignItems: 'center' }}>
                  <CheckIcon /> {f}
                </span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )

  const mainView = (
    <div style={{ minHeight: '100vh', background: T.bgPage, display: 'flex', flexDirection: 'column' }}>
      <AppHeader>
        <LogoMark />
        <div />
        <LogoMark style={{ opacity: 0, pointerEvents: 'none' }} />
      </AppHeader>

      <div style={{
        flex: 1, width: '100%', maxWidth: 1280, margin: '0 auto',
        padding: isMobile ? '12px 16px 120px' : '16px 24px 3rem',
        display: 'flex', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          display: isMobile ? 'block' : 'flex',
          gap: '2rem', alignItems: 'flex-start',
        }}>
          {/* Preview — renders the actual PDF, pixel-perfect match with download */}
          <div style={{ flex: '0 0 64%', maxWidth: isMobile ? '100%' : '64%' }}>
            <PDFLivePreview data={resume} template={template} initialPages={initialPages} pageGap={isMobile ? 8 : 20} />
          </div>

          {/* Controls column — desktop only */}
          {!isMobile && (
            <div style={{
              flex: 1, position: 'sticky', top: '2rem',
              background: T.bg, borderRadius: 32,
              padding: '40px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              {proUnlocked ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Your resume is ready</h2>
                      <span style={{ fontSize: 11, fontWeight: 700, background: T.green, color: T.ink, padding: '2px 8px', borderRadius: 20 }}>Pro</span>
                    </div>
                    <p style={{ fontSize: 14, color: T.text, margin: 0, lineHeight: 1.6 }}>Unlimited downloads included.</p>
                  </div>
                  <div style={{ height: 1, background: 'rgba(175,178,178,0.3)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <BtnPrimary onClick={() => { posthog.capture('download_clicked'); downloadRef.current?.click() }} style={{ width: '100%' }}>
                      Download PDF <DownloadIcon />
                    </BtnPrimary>
                    <BtnSecondary onClick={onReset} style={{ width: '100%' }}><StartOverIcon /> Start over</BtnSecondary>
                  </div>
                  <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: T.dim }}>
                    <a href="mailto:support@resumetion.com" style={{ color: T.dim }}>Manage subscription</a>
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>Your resume is ready</h2>
                    <p style={{ fontSize: 14, color: T.text, margin: 0, lineHeight: 1.6 }}>
                      Choose how you'd like to access it.
                    </p>
                  </div>
                  <div style={{ height: 1, background: 'rgba(175,178,178,0.3)' }} />
                  {verifyMode ? <VerifyForm /> : (
                    <>
                      <PlanCards />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <BtnPrimary onClick={() => { posthog.capture('download_clicked'); handleCheckout() }} disabled={checkoutLoading} style={{ width: '100%' }}>
                          {ctaLabel}
                        </BtnPrimary>
                        {checkoutError && (
                          <p style={{ margin: 0, fontSize: 13, color: T.errorText, textAlign: 'center' }}>{checkoutError}</p>
                        )}
                        <BtnSecondary onClick={onReset} style={{ width: '100%' }}><StartOverIcon /> Start over</BtnSecondary>
                      </div>
                      <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: T.dim }}>
                        Secure payment · Card, PayPal, Apple Pay
                      </p>
                      <p style={{ margin: '-12px 0 0', textAlign: 'center', fontSize: 12, color: T.dim }}>
                        <button onClick={() => setVerifyMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: T.dim, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
                          Already subscribed?
                        </button>
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile footer — single Download button */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: T.bg, padding: '12px 16px 28px',
          borderTop: '1px solid rgba(175,178,178,0.3)',
          display: 'flex', gap: 10,
        }}>
          <BtnSecondary onClick={onReset}><StartOverIcon /> Start over</BtnSecondary>
          <BtnPrimary
            onClick={() => {
              posthog.capture('download_clicked')
              if (proUnlocked) { downloadRef.current?.click() } else { setSheetOpen(true) }
            }}
            style={{ flex: 1 }}
          >
            Download <DownloadIcon />
          </BtnPrimary>
        </div>
      )}

      {/* Bottom sheet — mobile plan selection (only when not Pro) */}
      {isMobile && !proUnlocked && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSheetOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 20,
              background: 'rgba(0,0,0,0.5)',
              opacity: sheetOpen ? 1 : 0,
              pointerEvents: sheetOpen ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 21,
            background: T.bg,
            borderRadius: '24px 24px 0 0',
            padding: '12px 16px 40px',
            display: 'flex', flexDirection: 'column', gap: 16,
            transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}>
            {/* Drag pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: T.ink, margin: '0 0 4px' }}>Your resume is ready</h2>
              <p style={{ fontSize: 14, color: T.text, margin: 0 }}>Choose how you'd like to access it.</p>
            </div>
            {verifyMode ? <VerifyForm /> : (
              <>
                <PlanCards />
                <BtnPrimary onClick={() => { posthog.capture('download_clicked'); handleCheckout() }} disabled={checkoutLoading} style={{ width: '100%' }}>
                  {ctaLabel}
                </BtnPrimary>
                {checkoutError && (
                  <p style={{ margin: 0, fontSize: 13, color: T.errorText, textAlign: 'center' }}>{checkoutError}</p>
                )}
                <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: T.dim }}>
                  Secure payment · Card, PayPal, Apple Pay
                </p>
                <p style={{ margin: '-4px 0 0', textAlign: 'center' }}>
                  <button onClick={() => setVerifyMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: T.dim, fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
                    Already subscribed?
                  </button>
                </p>
              </>
            )}
          </div>
        </>
      )}

      <div style={{ display: 'none' }}>
        <ResumeDownloadButton ref={downloadRef} data={resume} template={template} filename="resume.pdf"
          onDownloaded={() => { posthog.capture('resume_downloaded'); setDownloaded(true) }} />
      </div>
    </div>
  )

  if (downloaded) {
    return (
      <FinishScreen
        onDownloadAgain={() => downloadRef.current?.click()}
        onReset={onReset}
        downloadSlot={
          <div style={{ display: 'none' }}>
            <ResumeDownloadButton ref={downloadRef} data={resume} template={template} filename="resume.pdf"
              onDownloaded={() => {}} />
          </div>
        }
      />
    )
  }

  return mainView
}

// Post-download thank-you screen, styled to match the builder.
// Trustpilot's standard review-writing URL. Replace the domain if the Trustpilot
// business profile uses a different one.
const TRUSTPILOT_URL = 'https://www.trustpilot.com/evaluate/resumetion.com'

function FinishScreen({ onDownloadAgain, onReset, downloadSlot }) {
  const isMobile = useIsMobile()
  // null = not voted yet; 'up' | 'down' once the user reacts. We invite a public
  // Trustpilot review either way (Trustpilot forbids gating incentives on positive
  // sentiment), and keep the thumb as a private quality signal in PostHog.
  const [feedback, setFeedback] = useState(null)

  function vote(sentiment) {
    setFeedback(sentiment)
    posthog.capture('finish_feedback', { sentiment })
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bgPage, display: 'flex', flexDirection: 'column' }}>
      <AppHeader>
        <LogoMark />
        <div />
        <LogoMark style={{ opacity: 0, pointerEvents: 'none' }} />
      </AppHeader>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '24px 16px' : '16px 1.5rem 3rem', boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 520, background: T.bg,
          borderRadius: isMobile ? 24 : 32, padding: isMobile ? '40px 24px' : '56px 48px',
          textAlign: 'center', boxShadow: '0px 30px 100px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: T.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5L10 17.5L19 6.5" stroke={T.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: T.ink, margin: 0 }}>
              Your resume is downloaded
            </h1>
            <p style={{ fontSize: 15, color: T.text, margin: 0, lineHeight: 1.6 }}>
              Thanks for using Resumetion. We hope it helps you land the job of your dreams —
              good luck out there! 🚀
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: 320, borderTop: `1px solid ${T.border}`, paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {feedback === null ? (
              <>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>How was your experience?</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => vote('up')} aria-label="Good" style={{ width: 46, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4.2-7.4a1 1 0 0 1 1.7.1l.5 1a3 3 0 0 1 .2 2.2L13 9h5.5a2 2 0 0 1 2 2.4l-1.2 6a2 2 0 0 1-2 1.6H7" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button onClick={() => vote('down')} aria-label="Bad" style={{ width: 46, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Zm0 0-4.2 7.4a1 1 0 0 1-1.7-.1l-.5-1a3 3 0 0 1-.2-2.2L11 15H5.5a2 2 0 0 1-2-2.4l1.2-6a2 2 0 0 1 2-1.6H17" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 14, color: T.text, textAlign: 'center', lineHeight: 1.5 }}>
                  {feedback === 'up' ? 'Glad it helped! 🙌' : 'Thanks — we read every note.'} Mind sharing a quick public review?
                </span>
                <a
                  href={TRUSTPILOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => posthog.capture('trustpilot_click', { sentiment: feedback })}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#00B67A"><path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.5l-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z"/></svg>
                  Review us on Trustpilot
                </a>
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
            <BtnPrimary onClick={onDownloadAgain} style={{ width: '100%' }}>
              Download again <DownloadIcon />
            </BtnPrimary>
            <BtnSecondary onClick={onReset} style={{ width: '100%' }}>
              <StartOverIcon /> Create another resume
            </BtnSecondary>
          </div>
        </div>
      </div>

      {downloadSlot}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const [screen, setScreen] = useState(-1)
  const [form, setForm] = useState(loadSavedForm)
  const [resume, setResume] = useState(null)
  const [prerenderedPages, setPrerenderedPages] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  // True while the user is editing a step reached via "Edit" on the review screen —
  // surfaces a "Back to review" shortcut so they don't have to step forward again.
  const [fromReview, setFromReview] = useState(false)
  const downloadRef = useRef(null)

  const patch = useCallback(p => setForm(f => ({ ...f, ...p })), [])
  const goTo = s => { setScreen(s); window.scrollTo(0, 0) }
  // Edits launched from the review screen flag fromReview (steps 1–4 only) so the
  // edited step shows a "Back to review" shortcut.
  const goToFromReview = s => { if (s >= 1 && s <= 4) setFromReview(true); goTo(s) }
  const backToReview = () => { setFromReview(false); goTo(0) }
  // Normal sequential nav (Back/Continue) ends the edit-from-review excursion, so the
  // shortcut only appears on the single step opened via Edit.
  const navStep = s => { setFromReview(false); goTo(s) }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tpl = params.get('template')
      const role = params.get('role')
      // Role landing pages (/resume/[role]) deep-link here with the target role
      // prefilled so the funnel carries the intent through.
      if (role) patch({ targetRole: role.slice(0, 80) })
      if (tpl && TEMPLATES.some(t => t.id === tpl)) {
        patch({ template: tpl })
        setScreen(1)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(form)) } catch {}
  }, [form])

  async function generate() {
    posthog.capture('generate_clicked')
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
      const raw = data.resume.resume ?? data.resume.ru ?? data.resume
      // Skills + languages bypass the AI entirely — pass-through from the form, preserving
      // user order. Templates expect skills.{technical,soft}; we drop everything into
      // technical (templates concatenate the two anyway).
      const langs = form.languages.filter(l => l.name).map(l => `${l.name} (${LANG_LEVELS[l.level]})`)
      const skills = { technical: form.skills.filter(Boolean), soft: [] }
      // Education: new schema returns [{text}], convert to {institution,degree,year}
      const parseEdu = (list) => (list || []).map(e => {
        const str = e.text ?? e.degree ?? ''
        const parts = str.split(/\s*[—–-]\s*/)
        return parts.length >= 2
          ? { degree: parts[0].trim(), institution: parts[1].trim(), year: e.year || '' }
          : { degree: str, institution: '', year: e.year || '' }
      })
      const formEdu = form.education.filter(e => e.text).map(e => {
        const parts = e.text.split(/\s*[—–-]\s*/)
        return parts.length >= 2
          ? { degree: parts[0].trim(), institution: parts[1].trim(), year: '' }
          : { degree: e.text, institution: '', year: '' }
      })
      const edu = raw.education?.length ? parseEdu(raw.education) : formEdu
      const resumeData = {
        ...raw,
        title:     raw.title || form.targetRole || undefined,
        email:     form.email    || undefined,
        phone:     form.phone    || undefined,
        location:  form.location || undefined,
        linkedin:  form.linkedin || undefined,
        github:    form.portfolio || undefined,
        languages: langs.length ? langs : undefined,
        skills,
        education: edu,
      }
      const pdfTemplate = PDF_TEMPLATE_MAP[form.template] ?? 'minimal'
      try {
        const { renderResumeToImages } = await import('./ResumePDF')
        const pages = await renderResumeToImages(resumeData, pdfTemplate, 3)
        setPrerenderedPages(pages)
      } catch {}
      setResume(resumeData)
      posthog.capture('resume_generated')
    } catch (e) {
      setGenError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const content = (() => {
    if (resume)      return <ResumeResult resume={resume} template={PDF_TEMPLATE_MAP[form.template] ?? 'minimal'} onReset={() => { setResume(null); setPrerenderedPages(null); setForm(INITIAL_FORM); setScreen(-1); setFromReview(false); try { localStorage.removeItem(LS_KEY) } catch {} }} downloadRef={downloadRef} initialPages={prerenderedPages ?? undefined} />
    if (screen === -1) return <TemplatePicker form={form} patch={patch} onNext={() => goTo(1)} />
    if (screen === 1) return <PageShell step={1} form={form}><StepBasic         form={form} patch={patch} onBack={() => navStep(-1)} onNext={() => navStep(2)} onBackToReview={fromReview ? backToReview : null} /></PageShell>
    if (screen === 2) return <PageShell step={2} form={form}><StepExperience    form={form} patch={patch} onBack={() => navStep(1)}  onNext={() => { posthog.capture('step_completed', { step: 2 }); navStep(3) }} onBackToReview={fromReview ? backToReview : null} /></PageShell>
    if (screen === 3) return <PageShell step={3} form={form}><StepSkillsLangEdu form={form} patch={patch} onBack={() => navStep(2)}  onNext={() => { posthog.capture('step_completed', { step: 3 }); navStep(4) }} onBackToReview={fromReview ? backToReview : null} /></PageShell>
    if (screen === 4) return <PageShell step={4} form={form}><StepLinks         form={form} patch={patch} onBack={() => navStep(3)}  onNext={() => { posthog.capture('step_completed', { step: 4 }); navStep(0) }} onBackToReview={fromReview ? backToReview : null} /></PageShell>
    if (screen === 0) return <PageShell step={0} form={form}><Summary form={form} patch={patch} goTo={goTo} onEdit={goToFromReview} onGenerate={generate} generating={generating} genError={genError} /></PageShell>
  })()

  return (
    <>
      <GlobalStyles />
      {content}
    </>
  )
}