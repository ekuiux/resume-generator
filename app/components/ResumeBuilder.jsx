'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import dynamic from 'next/dynamic'
import posthog from 'posthog-js'

const ResumePreview = dynamic(
  () => import('./ResumePDF').then(m => m.ResumePreview),
  { ssr: false, loading: () => <div style={{ height: 600, background: '#f9fafb', borderRadius: 12 }} /> }
)
const ResumeDownloadButton = dynamic(
  () => import('./ResumePDF').then(m => m.ResumeDownloadButton),
  { ssr: false }
)
const PDFLivePreview = dynamic(
  () => import('./ResumePDF').then(m => m.PDFLivePreview),
  { ssr: false, loading: () => <div style={{ width: '100%', aspectRatio: '210/297', borderRadius: 12, background: '#f9fafb', boxShadow: '0 6px 32px rgba(0,0,0,.14)' }} /> }
)

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'minimal',   name: 'Minimal',   swatch: '#ffffff', accent: '#212329', badge: { text: 'Popular', bg: '#05070A', color: '#fff' }, image: '/templates/minimal.jpg' },
  { id: 'corporate', name: 'Corporate', swatch: '#B5D4F4', accent: '#1e3a5f', badge: null },
  { id: 'aurora',    name: 'Aurora',    swatch: '#fbcfe8', accent: '#000000', badge: { text: 'New', bg: '#9DD162', color: '#05070A' }, image: '/templates/aurora.jpg' },
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

const MONTHS       = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DIAL_CODES = [
  { code:'US', flag:'🇺🇸', dial:'+1',   name:'United States' },
  { code:'GB', flag:'🇬🇧', dial:'+44',  name:'United Kingdom' },
  { code:'CA', flag:'🇨🇦', dial:'+1',   name:'Canada' },
  { code:'AU', flag:'🇦🇺', dial:'+61',  name:'Australia' },
  { code:'DE', flag:'🇩🇪', dial:'+49',  name:'Germany' },
  { code:'FR', flag:'🇫🇷', dial:'+33',  name:'France' },
  { code:'IT', flag:'🇮🇹', dial:'+39',  name:'Italy' },
  { code:'ES', flag:'🇪🇸', dial:'+34',  name:'Spain' },
  { code:'NL', flag:'🇳🇱', dial:'+31',  name:'Netherlands' },
  { code:'CH', flag:'🇨🇭', dial:'+41',  name:'Switzerland' },
  { code:'AT', flag:'🇦🇹', dial:'+43',  name:'Austria' },
  { code:'BE', flag:'🇧🇪', dial:'+32',  name:'Belgium' },
  { code:'SE', flag:'🇸🇪', dial:'+46',  name:'Sweden' },
  { code:'NO', flag:'🇳🇴', dial:'+47',  name:'Norway' },
  { code:'DK', flag:'🇩🇰', dial:'+45',  name:'Denmark' },
  { code:'FI', flag:'🇫🇮', dial:'+358', name:'Finland' },
  { code:'PL', flag:'🇵🇱', dial:'+48',  name:'Poland' },
  { code:'CZ', flag:'🇨🇿', dial:'+420', name:'Czech Republic' },
  { code:'HU', flag:'🇭🇺', dial:'+36',  name:'Hungary' },
  { code:'RO', flag:'🇷🇴', dial:'+40',  name:'Romania' },
  { code:'GR', flag:'🇬🇷', dial:'+30',  name:'Greece' },
  { code:'PT', flag:'🇵🇹', dial:'+351', name:'Portugal' },
  { code:'RU', flag:'🇷🇺', dial:'+7',   name:'Russia' },
  { code:'UA', flag:'🇺🇦', dial:'+380', name:'Ukraine' },
  { code:'TR', flag:'🇹🇷', dial:'+90',  name:'Turkey' },
  { code:'IL', flag:'🇮🇱', dial:'+972', name:'Israel' },
  { code:'AE', flag:'🇦🇪', dial:'+971', name:'UAE' },
  { code:'KZ', flag:'🇰🇿', dial:'+7',   name:'Kazakhstan' },
  { code:'GE', flag:'🇬🇪', dial:'+995', name:'Georgia' },
  { code:'IN', flag:'🇮🇳', dial:'+91',  name:'India' },
  { code:'CN', flag:'🇨🇳', dial:'+86',  name:'China' },
  { code:'JP', flag:'🇯🇵', dial:'+81',  name:'Japan' },
  { code:'KR', flag:'🇰🇷', dial:'+82',  name:'South Korea' },
  { code:'BR', flag:'🇧🇷', dial:'+55',  name:'Brazil' },
  { code:'MX', flag:'🇲🇽', dial:'+52',  name:'Mexico' },
  { code:'AR', flag:'🇦🇷', dial:'+54',  name:'Argentina' },
]

const LANG_LEVELS  = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STEP_NAMES   = ['Profile', 'Experience', 'Skills', 'Contact']
const LANG_SUGG    = ['English','Spanish','French','German','Portuguese','Italian','Russian','Chinese','Japanese','Korean','Arabic','Hindi','Dutch','Swedish','Norwegian','Danish','Finnish','Polish','Turkish','Ukrainian','Hebrew','Persian','Thai','Vietnamese','Indonesian','Malay','Romanian','Hungarian','Greek','Czech']

const ROLE_SUGG = [
  // Design
  'Product Designer','Senior Product Designer','Lead Product Designer','UX Designer','UI Designer','UX/UI Designer','Graphic Designer','Brand Designer','Motion Designer','Visual Designer',
  // Engineering
  'Software Engineer','Senior Software Engineer','Frontend Engineer','Backend Engineer','Full Stack Engineer','iOS Engineer','Android Engineer','DevOps Engineer','Platform Engineer','Site Reliability Engineer','ML Engineer','Data Engineer',
  // Product
  'Product Manager','Senior Product Manager','Lead Product Manager','Group Product Manager','Head of Product',
  // Data
  'Data Scientist','Data Analyst','Business Intelligence Analyst',
  // Marketing
  'Marketing Manager','Content Manager','Growth Manager','SEO Specialist','Performance Marketing Manager','Brand Manager','Social Media Manager','Copywriter',
  // Sales & BD
  'Sales Manager','Account Executive','Business Development Manager','Account Manager','Sales Development Representative',
  // Management
  'Project Manager','Program Manager','Scrum Master','Engineering Manager','Design Manager',
  // HR
  'HR Manager','Recruiter','Talent Acquisition Specialist','People Partner',
  // Finance
  'Financial Analyst','Investment Analyst','Business Analyst','Controller','CFO',
  // CS & Ops
  'Customer Success Manager','Operations Manager','Chief of Staff','COO','CEO',
]

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
  aurora:    'aurora',
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

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcRect, true)
    window.addEventListener('resize', calcRect)
    return () => { window.removeEventListener('scroll', calcRect, true); window.removeEventListener('resize', calcRect) }
  }, [open])

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
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          maxHeight: 240,
          overflowY: 'auto',
        }}>
          {hits.map((s, i) => (
            <div key={s} onPointerDown={() => { onChange({ target: { value: s } }); setOpen(false); setIsTyping(false) }}
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

function PhoneInput({ value, onChange }) {
  function parseValue(v) {
    if (!v) return { country: DIAL_CODES[0], number: '' }
    // Sort by dial length descending to match longest code first
    const sorted = [...DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length)
    for (const c of sorted) {
      if (v.startsWith(c.dial + ' ')) return { country: c, number: v.slice(c.dial.length + 1) }
    }
    return { country: DIAL_CODES[0], number: v }
  }

  const parsed = parseValue(value)
  const [country, setCountry]   = useState(parsed.country)
  const [open, setOpen]         = useState(false)
  const [dropRect, setDropRect] = useState(null)
  const [search, setSearch]     = useState('')
  const [focused, setFocused]   = useState(false)
  const [hovItem, setHovItem]   = useState(null)
  const wrapRef  = useRef(null)
  const inputRef = useRef(null)

  const numberPart = parseValue(value).number

  function openDrop() {
    if (wrapRef.current) setDropRect(wrapRef.current.getBoundingClientRect())
    setSearch('')
    setOpen(true)
  }

  function selectCountry(c) {
    setCountry(c)
    onChange(c.dial + ' ' + numberPart)
    setOpen(false)
    setSearch('')
    inputRef.current?.focus()
  }

  function formatPhone(raw) {
    const d = raw.replace(/\D/g, '').slice(0, 7)
    if (d.length <= 3) return d
    return `${d.slice(0,3)}-${d.slice(3)}`
  }

  function handleNumber(e) {
    onChange(country.dial + ' ' + formatPhone(e.target.value))
  }

  const filtered = DIAL_CODES.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  )

  const borderColor = focused ? '#05070A' : 'rgba(175,178,178,0.5)'
  const shadow      = focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none'

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', height: 47,
        border: `1px solid ${borderColor}`,
        borderRadius: 12, overflow: 'hidden', background: '#fff',
        boxShadow: shadow, transition: 'border-color .15s, box-shadow .15s',
      }}>
        {/* Country selector */}
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); open ? setOpen(false) : openDrop() }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 10px 0 14px', flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            borderRight: '1px solid rgba(175,178,178,0.3)',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{country.flag}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#05070A' }}>{country.dial}</span>
          <ChevronDown color="#AFB2B2" />
        </button>

        {/* Number input */}
        <input
          ref={inputRef}
          value={numberPart}
          onChange={handleNumber}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150) }}
          placeholder="555-1223"
          style={{
            flex: 1, height: '100%', padding: '0 16px',
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 14, color: '#05070A',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Dropdown */}
      {open && dropRect && (
        <div
          onMouseDown={e => e.preventDefault()}
          style={{
            position: 'fixed',
            top: dropRect.bottom + 4,
            left: dropRect.left,
            width: Math.max(dropRect.width, 260),
            zIndex: 9999,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Search */}
          <div style={{ padding: '10px 10px 6px' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                width: '100%', boxSizing: 'border-box',
                height: 36, padding: '0 12px',
                border: '1px solid rgba(175,178,178,0.4)',
                borderRadius: 8, outline: 'none',
                fontFamily: 'inherit', fontSize: 13, color: '#05070A',
                background: '#F7F8FA',
              }}
            />
          </div>
          {/* List */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.map(c => (
              <div
                key={c.code}
                onMouseDown={() => selectCountry(c)}
                onMouseEnter={() => setHovItem(c.code)}
                onMouseLeave={() => setHovItem(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', cursor: 'pointer',
                  background: hovItem === c.code ? '#F7F8FA' : '#fff',
                  transition: 'background .1s',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
                <span style={{ fontSize: 13, color: '#05070A', flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: '#AFB2B2', flexShrink: 0 }}>{c.dial}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '12px 14px', fontSize: 13, color: '#AFB2B2' }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
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
          border: `1px solid ${focused ? '#05070A' : 'rgba(175,178,178,0.5)'}`,
          borderRadius: 12, background: '#fff', cursor: 'pointer',
          boxShadow: focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
          fontSize: 14, color: value ? '#05070A' : '#AFB2B2',
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
            background: '#fff',
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
              <ArrowLeft color={hovPrev && viewYear > effMinYear ? '#05070A' : '#AFB2B2'} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#05070A' }}>{viewYear}</span>
            <button onClick={() => setViewYear(y => y + 1)}
              disabled={viewYear >= effMaxYear}
              onMouseEnter={() => setHovNext(true)} onMouseLeave={() => setHovNext(false)}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 8,
                cursor: viewYear >= effMaxYear ? 'default' : 'pointer',
                opacity: viewYear >= effMaxYear ? 0.25 : 1,
              }}>
              <ArrowRight color={hovNext && viewYear < effMaxYear ? '#05070A' : '#AFB2B2'} />
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
                    background: sel ? '#05070A' : (!disabled && hov === i) ? '#F7F8FA' : 'none',
                    color: sel ? '#fff' : '#05070A',
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
                  background: value === 'Present' ? '#05070A' : hovPresent ? '#F7F8FA' : 'none',
                  color: value === 'Present' ? '#fff' : '#05070A',
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
      letterSpacing: '.04em', textTransform: 'uppercase', color: '#AFB2B2',
    }}>{children}</label>
  )
}

function Field({ label, hint, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <Lbl>{label}</Lbl>}
      {children}
      {hint && <p style={{ fontSize: 12, color: '#AFB2B2', margin: 0, lineHeight: 1.5 }}>{hint}</p>}
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

function SecLbl({ children }) {
  return (
    <span style={{
      display: 'block', fontSize: T.f11, fontWeight: 600,
      letterSpacing: '.07em', textTransform: 'uppercase', color: T.text3, marginBottom: '.75rem',
    }}>{children}</span>
  )
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
        background: disabled ? '#AFB2B2' : hov ? '#1f2024' : '#05070A',
        color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
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
        background: hov ? '#F7F8FA' : '#fff', color: '#4A4A4D',
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
      .drag-handle:hover svg path { stroke: #05070A; transition: stroke 0.15s; }
      .card-toggle:hover .chevron path { stroke: #05070A; transition: stroke 0.15s; }
      .chevron path { transition: stroke 0.15s; }
      .close-btn svg path { transition: stroke 0.15s; }
      .close-btn:hover svg path { stroke: #EF4444; }
      @media (max-width: 768px) { input, textarea, select { font-size: 16px !important; } }
    `}</style>
  )
}

function ChevronDown({ color = '#AFB2B2' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="chevron" style={{ flexShrink: 0 }}>
      <path d="M8 9.76936L3.74952 6.22852" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M7.99952 9.76936L12.25 6.22852" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ChevronUp({ color = '#AFB2B2' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="chevron" style={{ flexShrink: 0 }}>
      <path d="M8 6.22987L12.2491 9.76953" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8.00004 6.22987L3.75098 9.76953" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function CloseIcon({ color = '#AFB2B2' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M11.749 4.25L4.25007 11.749" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M4.25 4.25L11.749 11.749" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function DragIcon({ color = '#AFB2B2' }) {
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

function CalendarIcon({ color = '#AFB2B2' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="3.5" width="12" height="10.5" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M2 7H14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.5 2V5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function PlusIcon({ color = '#05070A' }) {
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
      <CloseIcon color={hov ? '#EF4444' : '#AFB2B2'} />
    </button>
  )
}

function StartOverIcon({ color = '#4A4A4D' }) {
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

function ArrowLeft({ color = '#4A4A4D' }) {
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
        background: hov ? 'rgba(175,178,178,0.12)' : 'none',
        border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 600, color: '#05070A',
        fontFamily: 'inherit', padding: '8px 16px',
        textAlign: 'left', borderRadius: 20,
        display: 'inline-flex', alignItems: 'center', gap: 6,
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
  const isMobile = useIsMobile()
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
        padding: isMobile ? '0 16px' : '0',
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
        background: '#fff', padding: '12px 16px 12px',
        borderTop: '1px solid rgba(175,178,178,0.3)',
        display: 'flex', gap: 10,
      }}>
        <BtnSecondary onClick={onBack}><ArrowLeft /> Back</BtnSecondary>
        <BtnPrimary onClick={onNext} style={{ flex: 1 }}>{nextLabel || 'Continue'} <ArrowRight /></BtnPrimary>
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
        <BtnSecondary onClick={onBack}><ArrowLeft /> Back</BtnSecondary>
        <BtnPrimary onClick={onNext}>{nextLabel || 'Continue'} <ArrowRight /></BtnPrimary>
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
        padding: isMobile ? '12px 0 0' : '16px 80px 40px',
        display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
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
                width: 311, height: 440,
                background: '#fff',
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
        <AppHeader>
          <LogoMark />
        </AppHeader>
        <div style={{ padding: '16px 16px 3rem' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: '#000', textAlign: 'center' }}>Choose a template</h1>
          <p style={{ fontSize: 14, color: '#4A4A4D', marginBottom: 24, lineHeight: 1.6, textAlign: 'center' }}>
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
                        border: 'none', background: '#05070A',
                        fontSize: 14, fontWeight: 600, color: '#fff',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}>
                        Use this template <ArrowRight color="#fff" />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#05070A' }}>{tpl.name}</span>
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
        <footer style={{ borderTop: '1px solid rgba(175,178,178,0.25)', padding: '20px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', fontSize: 12, color: '#AFB2B2' }}>
          <a href="mailto:support@resumetion.com" style={{ color: '#AFB2B2', textDecoration: 'none' }}>support@resumetion.com</a>
          <span>·</span>
          <a href="/pricing" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Pricing</a>
          <span>·</span>
          <a href="/terms" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Terms</a>
          <span>·</span>
          <a href="/privacy" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Privacy</a>
        </footer>
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
                  onClick={() => { patch({ template: tpl.id }); posthog.capture('template_selected', { template: tpl.id }); onNext() }}
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
                        background: '#fff', color: '#05070A',
                        height: 55, display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit', gap: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                      }} className="tpl-hover-btn">
                        Use this template <ArrowRight color="#05070A" />
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

      {/* Desktop footer */}
      <footer style={{ borderTop: '1px solid rgba(175,178,178,0.25)', padding: '24px 0', display: 'flex', gap: 20, justifyContent: 'center', fontSize: 13, color: '#AFB2B2' }}>
        <span>© {new Date().getFullYear()} Resumetion</span>
        <span>·</span>
        <a href="mailto:support@resumetion.com" style={{ color: '#AFB2B2', textDecoration: 'none' }}>support@resumetion.com</a>
        <span>·</span>
        <a href="/pricing" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Pricing</a>
        <span>·</span>
        <a href="/terms" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Terms</a>
        <span>·</span>
        <a href="/privacy" style={{ color: '#AFB2B2', textDecoration: 'none' }}>Privacy</a>
      </footer>
    </div>
  )
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────

const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function StepBasic({ form, patch, onBack, onNext }) {
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
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Basic information</h2>
          <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>Let&apos;s start with the essentials.</p>
        </div>

        <Field label="Target role *">
          <Input value={form.targetRole} onChange={e => { patch({ targetRole: e.target.value }); setShowErr(false) }}
            placeholder="Senior Product Designer" error={showErr && !form.targetRole?.trim()} />
          {showErr && !form.targetRole?.trim() && <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>Target role is required</p>}
        </Field>

        <Grid2 style={{ gap: 24 }}>
          <Field label="Full name *">
            <Input value={form.name} onChange={e => { patch({ name: e.target.value }); setShowErr(false) }}
              placeholder="Taylor Parker" error={showErr && !form.name?.trim()} />
            {showErr && !form.name?.trim() && <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>Full name is required</p>}
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={e => { patch({ email: e.target.value }); setShowErr(false) }}
              placeholder="taylor@email.com" error={showErr && (emailEmpty || emailInvalid)} />
            {showErr && emailEmpty   && <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>Email is required</p>}
            {showErr && emailInvalid && <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>Enter a valid email address</p>}
          </Field>
        </Grid2>

        <Field label="Job description (recommended)">
          <Textarea value={form.jobDescription} onChange={e => patch({ jobDescription: e.target.value.slice(0, 3000) })}
            placeholder="Paste here…" style={{ minHeight: 120 }} />
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 4 }}>
            <p style={{ fontSize: 12, color: '#AFB2B2', margin: 0, lineHeight: 1.5 }}>Paste a job description to generate a more relevant resume.</p>
            {form.jobDescription?.length > 0 && (
              <p style={{ fontSize: 12, color: form.jobDescription.length >= 3000 ? '#EF4444' : '#AFB2B2', margin: 0, flexShrink: 0 }}>
                {form.jobDescription.length} / 3000
              </p>
            )}
          </div>
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
  const isMobile = useIsMobile()
  const headName = [exp.role, exp.company].filter(Boolean).join(' · ') || 'New position'
  const headMeta = [exp.start, exp.end].filter(Boolean).join(' – ')

  const CardInner = (
    <div className="exp-card-inner" style={{
      background: '#fff',
      border: '1px solid rgba(175,178,178,0.5)',
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
          <div style={{ fontSize: 14, fontWeight: 500, color: '#05070A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headName}</div>
          {headMeta && <div style={{ fontSize: 14, color: '#AFB2B2', marginTop: 2 }}>{headMeta}</div>}
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
            <Field label="What you did & achieved" hint="Use bullet points or simple notes.">
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
          cursor: 'grab', color: '#AFB2B2',
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

function StepExperience({ form, patch, onBack, onNext }) {
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
          <ChevronDown />
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
          border: `1px solid ${focused ? '#05070A' : 'rgba(175,178,178,0.5)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(175,178,178,0.35)' : 'none',
          borderRadius: 12, minHeight: 47, alignItems: 'center',
          cursor: 'text', transition: 'border-color .15s, box-shadow .15s', background: '#fff',
        }}
      >
        {skills.map(s => (
          <span
            key={s}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#F7F8FA', border: '1px solid rgba(175,178,178,0.4)',
              borderRadius: 6, padding: '3px 8px', fontSize: 13, color: '#05070A',
              userSelect: 'none',
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
          style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: '#05070A', background: 'transparent', minWidth: 100, flex: 1 }}
        />
      </div>
      <p style={{ fontSize: 12, color: '#AFB2B2', margin: '6px 0 0 0' }}>Press Enter or , to add a skill</p>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {suggestions.slice(0, 8).map(s => (
            <button key={s} onClick={() => addSkill(s)} style={{
              fontSize: 12, padding: '4px 12px', borderRadius: 20,
              border: '1px solid rgba(175,178,178,0.5)', background: '#fff',
              color: '#4A4A4D', cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}><PlusIcon color="#4A4A4D" /> {s}</button>
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
          cursor: 'grab', color: '#AFB2B2',
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
              placeholder="e.g. English" suggestions={LANG_SUGG.filter(s => !usedNames.includes(s) || s === item.name)} showOnFocus />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
              border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12,
              height: 47, padding: 4, overflow: 'hidden', boxSizing: 'border-box' }}>
              {LANG_LEVELS.map((lvl, i) => (
                <button key={lvl} type="button" onClick={() => onLevelChange(i)}
                  style={{ position: 'relative', zIndex: 1, border: 'none', background: 'none',
                    fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#4A4A4D' }}>
                  <span style={{ pointerEvents: 'none' }}>{lvl}</span>
                </button>
              ))}
              <div style={{ position: 'absolute', top: 4, bottom: 4, zIndex: 2,
                left: `calc(4px + ${item.level} * ((100% - 8px) / 6))`,
                width: 'calc((100% - 8px) / 6)',
                background: '#05070A', borderRadius: 8, transition: 'left 0.2s ease',
                pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, alignItems: 'center',
                  width: '600%', left: `calc(${-item.level} * 100%)`, transition: 'left 0.2s ease' }}>
                  {LANG_LEVELS.map(lvl => (
                    <div key={lvl} style={{ flex: '0 0 calc(100% / 6)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>{lvl}</div>
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
            placeholder="e.g. English" suggestions={LANG_SUGG} showOnFocus />
        </div>
        <div style={{ flex: 1,
          position: 'relative',
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12,
          height: 47, padding: 4, overflow: 'hidden', boxSizing: 'border-box',
        }}>
          {LANG_LEVELS.map((lvl, i) => (
            <button key={lvl} type="button" onClick={() => onLevelChange(i)}
              onMouseEnter={() => setHovLvl(i)} onMouseLeave={() => setHovLvl(null)}
              style={{
                position: 'relative', zIndex: 1,
                border: 'none', background: hovLvl === i && item.level !== i ? '#F7F8FA' : 'none',
                fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4A4A4D',
              }}>
              <span style={{ pointerEvents: 'none' }}>{lvl}</span>
            </button>
          ))}
          <div style={{
            position: 'absolute', top: 4, bottom: 4, zIndex: 2,
            left: `calc(4px + ${item.level} * ((100% - 8px) / 6))`,
            width: 'calc((100% - 8px) / 6)',
            background: '#05070A', borderRadius: 8,
            transition: 'left 0.2s ease',
            pointerEvents: 'none', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, alignItems: 'center',
              width: '600%', left: `calc(${-item.level} * 100%)`, transition: 'left 0.2s ease' }}>
              {LANG_LEVELS.map(lvl => (
                <div key={lvl} style={{ flex: '0 0 calc(100% / 6)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>{lvl}</div>
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
          cursor: 'grab', color: '#AFB2B2',
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
            <Input value={text} onChange={e => onChange(e.target.value)}
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

function StepSkillsLangEdu({ form, patch, onBack, onNext }) {
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
                onNameChange={v => {
                  const dupe = usedLangNames.some(n => n !== l.name && n.toLowerCase() === v.toLowerCase())
                  if (!dupe) updLang(l.id, { name: v })
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
            <div style={{ height: 47, background: '#fff', border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: '#05070A', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              {langDragItem.name || 'Language'}
            </div>
            <div style={{ height: 47, background: '#fff', border: '1px solid rgba(175,178,178,0.5)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
          </div>
        ) : (
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
        )
      )}
      {eduDrag && eduDragItem && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          top: eduDrag.top + (isMobile ? 1 : 0),
          left: isMobile ? eduDrag.left + 20 : eduDrag.left,
          width: isMobile ? eduDrag.width - 40 : eduDrag.width,
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
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Contact details</h2>
          <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>All optional. Add what&apos;s relevant for your role.</p>
        </div>

        <Grid2 style={{ gap: 24 }}>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={e => patch({ phone: e.target.value.replace(/[^\d+\s\-(). ]/g, '') })}
              placeholder="+1 (415) 555-1234"
              error={showErr && phoneErr}
            />
            {showErr && phoneTooShort && <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>Phone number is too short</p>}
            {showErr && phoneTooLong  && <p style={{ fontSize: 12, color: '#EF4444', margin: 0 }}>Phone number is too long</p>}
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

      <Footer step={4} onBack={onBack} onNext={handleNext} nextLabel="Review" />
    </>
  )
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SumCard({ icon, title, statusOk, statusText, onEdit, children }) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(175,178,178,0.5)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} className="card-toggle" style={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 24px', gap: 10,
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
            onMouseEnter={e => { e.currentTarget.style.background = '#F7F8FA' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>Edit</button>
          {open ? <ChevronUp color={T.text3} /> : <ChevronDown color={T.text3} />}
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
      <span style={{ fontSize: 14, color: T.text3, width: 104, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: empty ? T.border1 : T.text1, fontStyle: empty ? 'italic' : 'normal', lineHeight: 1.5 }}>{empty ? '—' : value}</span>
    </div>
  )
}


function Summary({ form, goTo, onGenerate, generating, genError }) {
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

        <SumCard icon="👤" title="Profile" statusOk={!!(form.name && form.email)} statusText={form.name ? 'Filled' : 'Empty'} onEdit={() => goTo(1)}>
          <SumRow label="Target role" value={form.targetRole} />
          <SumRow label="Full name" value={form.name} />
          <SumRow label="Email" value={form.email} />
          <SumRow label="Job description" value={form.jobDescription ? `${form.jobDescription.slice(0, 60)}…` : null} />
        </SumCard>

        <SumCard icon="💼" title="Experience"
          statusOk={form.experience.some(e => e.role || e.company)}
          statusText={`${form.experience.length} position${form.experience.length !== 1 ? 's' : ''}`}
          onEdit={() => goTo(2)}>
          {form.experience.length === 0
            ? <div style={{ fontSize: 14, color: T.text3 }}>No experience added</div>
            : form.experience.map((e, i) => (
              <div key={e.id} style={{
                paddingTop: i > 0 ? 8 : 0, marginTop: i > 0 ? 8 : 0,
                borderTop: i > 0 ? '1px solid rgba(175,178,178,0.15)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ fontSize: 14, fontWeight: (e.role || e.company) ? 500 : 400, color: (e.role || e.company) ? '#05070A' : T.text3 }}>
                  {e.role || e.company
                    ? <>{e.role}{e.role && e.company && <span style={{ fontWeight: 400, color: T.text3 }}> · {e.company}</span>}{!e.role && e.company}</>
                    : 'New position'
                  }
                </div>
                {(e.start || e.end) && (
                  <div style={{ fontSize: 13, color: T.text3 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div>
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

        <SumCard icon="🔗" title="Contact details" statusOk={!!(form.phone || form.linkedin)} statusText={form.phone || form.linkedin ? 'Filled' : 'Optional'} onEdit={() => goTo(4)}>
          <SumRow label="Phone" value={form.phone} />
          <SumRow label="Location" value={form.location} />
          <SumRow label="LinkedIn" value={form.linkedin} />
          <SumRow label="Portfolio" value={form.portfolio} />
        </SumCard>
      </div>

      {!isMobile && (
        <div style={{ background: '#F7F8FA', borderRadius: 16, padding: '32px 64px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#05070A', marginBottom: 8 }}>Ready to generate</div>
          <div style={{ fontSize: 16, color: '#4A4A4D', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            AI will write polished bullet points, a professional summary, and tailor everything to your target role.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <GenerateBtn />
            <BtnSecondary onClick={() => goTo(4)} style={{ background: 'none', border: 'none' }}><ArrowLeft /> Back</BtnSecondary>
          </div>
          {genError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, fontSize: 13, color: '#DC2626', lineHeight: 1.5 }}>
              ⚠ {genError}
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: '#fff', padding: '12px 16px 28px',
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
            position: 'relative', background: '#fff',
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
                background: '#fff', zIndex: 1, pointerEvents: 'none',
              }} />
            )}

            {/* ─ Bottom white margin (all but last page) ─
                Covers the thin "bleed" strip that continues onto the next page.
                That bleed content is still fully visible at the top of the next card. */}
            {!isLast && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: Math.round(PAGE_PAD_B * scale),
                background: '#fff', zIndex: 1, pointerEvents: 'none',
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
      <path d="M2.5 6L5 8.5L9.5 4" stroke="#9DD162" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const VerifyForm = () => (
    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 14, color: '#4A4A4D', lineHeight: 1.5 }}>
        Enter the email you used to purchase Pro.
      </p>
      <input
        type="email"
        value={verifyEmail}
        onChange={e => setVerifyEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          height: 44, borderRadius: 10, border: '1.5px solid rgba(175,178,178,0.5)',
          padding: '0 14px', fontSize: 14, fontFamily: 'inherit',
          outline: 'none', background: '#fff', color: '#05070A',
          boxSizing: 'border-box', width: '100%',
        }}
      />
      {verifyError && (
        <p style={{ margin: 0, fontSize: 13, color: '#dc2626' }}>{verifyError}</p>
      )}
      <BtnPrimary disabled={verifying} style={{ width: '100%' }}>
        {verifying ? 'Checking…' : 'Verify subscription'}
      </BtnPrimary>
      <button
        type="button"
        onClick={() => { setVerifyMode(false); setVerifyError(null) }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#AFB2B2', fontFamily: 'inherit' }}
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
            border: `2px solid ${sel ? '#05070A' : 'rgba(175,178,178,0.35)'}`,
            background: sel ? '#F7F8FA' : '#fff',
            cursor: 'pointer', textAlign: 'left', width: '100%',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}>
            {/* Top row: radio + name + badge + price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                border: sel ? '5px solid #05070A' : '2px solid rgba(175,178,178,0.5)',
                background: '#fff', boxSizing: 'border-box',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 16, color: '#05070A' }}>{plan.label}</span>
                {plan.badge && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: '#9DD162', color: '#05070A', padding: '2px 8px', borderRadius: 20 }}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#05070A', flexShrink: 0 }}>
                {plan.price}{plan.period && <span style={{ fontSize: 12, fontWeight: 400, color: '#AFB2B2' }}>{plan.period}</span>}
              </span>
            </div>
            {/* Sub info */}
            <div style={{ paddingLeft: 28, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#AFB2B2' }}>{plan.forWho}</span>
              <span style={{ fontSize: 12, color: '#AFB2B2', textAlign: 'right', flexShrink: 0 }}>{plan.priceNote}</span>
            </div>
            {/* Features */}
            <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {plan.features.map(f => (
                <span key={f} style={{ fontSize: 13, color: '#4A4A4D', display: 'flex', gap: 7, alignItems: 'center' }}>
                  <CheckIcon /> {f}
                </span>
              ))}
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
        padding: isMobile ? '12px 16px 120px' : '16px 1.5rem 3rem',
        display: 'flex', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
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
              background: '#fff', borderRadius: 32,
              padding: '40px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              {proUnlocked ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Your resume is ready</h2>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#9DD162', color: '#05070A', padding: '2px 8px', borderRadius: 20 }}>Pro</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0, lineHeight: 1.6 }}>Unlimited downloads included.</p>
                  </div>
                  <div style={{ height: 1, background: 'rgba(175,178,178,0.3)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <BtnPrimary onClick={() => { posthog.capture('download_clicked'); downloadRef.current?.click() }} style={{ width: '100%' }}>
                      Download PDF <DownloadIcon />
                    </BtnPrimary>
                    <BtnSecondary onClick={onReset} style={{ width: '100%' }}><StartOverIcon /> Start over</BtnSecondary>
                  </div>
                  <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#AFB2B2' }}>
                    <a href="mailto:support@resumetion.com" style={{ color: '#AFB2B2' }}>Manage subscription</a>
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#05070A', margin: 0 }}>Your resume is ready</h2>
                    <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0, lineHeight: 1.6 }}>
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
                          <p style={{ margin: 0, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>{checkoutError}</p>
                        )}
                        <BtnSecondary onClick={onReset} style={{ width: '100%' }}><StartOverIcon /> Start over</BtnSecondary>
                      </div>
                      <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#AFB2B2' }}>
                        Secure payment · Card, PayPal, Apple Pay
                      </p>
                      <p style={{ margin: '-12px 0 0', textAlign: 'center', fontSize: 12, color: '#AFB2B2' }}>
                        <button onClick={() => setVerifyMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#AFB2B2', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
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
          background: '#fff', padding: '12px 16px 28px',
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
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            padding: '12px 16px 40px',
            display: 'flex', flexDirection: 'column', gap: 16,
            transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          }}>
            {/* Drag pill */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(175,178,178,0.5)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#05070A', margin: '0 0 4px' }}>Your resume is ready</h2>
              <p style={{ fontSize: 14, color: '#4A4A4D', margin: 0 }}>Choose how you'd like to access it.</p>
            </div>
            {verifyMode ? <VerifyForm /> : (
              <>
                <PlanCards />
                <BtnPrimary onClick={() => { posthog.capture('download_clicked'); handleCheckout() }} disabled={checkoutLoading} style={{ width: '100%' }}>
                  {ctaLabel}
                </BtnPrimary>
                {checkoutError && (
                  <p style={{ margin: 0, fontSize: 13, color: '#dc2626', textAlign: 'center' }}>{checkoutError}</p>
                )}
                <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#AFB2B2' }}>
                  Secure payment · Card, PayPal, Apple Pay
                </p>
                <p style={{ margin: '-4px 0 0', textAlign: 'center' }}>
                  <button onClick={() => setVerifyMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#AFB2B2', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
                    Already subscribed?
                  </button>
                </p>
              </>
            )}
          </div>
        </>
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
  const [prerenderedPages, setPrerenderedPages] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const downloadRef = useRef(null)

  const patch = useCallback(p => setForm(f => ({ ...f, ...p })), [])
  const goTo = s => { setScreen(s); window.scrollTo(0, 0) }

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
      // Languages: new schema returns string[], old schema built from form
      const langs = raw.languages?.length
        ? raw.languages
        : form.languages.filter(l => l.name).map(l => `${l.name} (${LANG_LEVELS[l.level]})`)
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
    if (resume)      return <ResumeResult resume={resume} template={PDF_TEMPLATE_MAP[form.template] ?? 'minimal'} onReset={() => { setResume(null); setPrerenderedPages(null); setForm(INITIAL_FORM); setScreen(-1); try { localStorage.removeItem(LS_KEY) } catch {} }} downloadRef={downloadRef} initialPages={prerenderedPages ?? undefined} />
    if (screen === -1) return <TemplatePicker form={form} patch={patch} onNext={() => goTo(1)} />
    if (screen === 1) return <PageShell step={1} form={form}><StepBasic         form={form} patch={patch} onBack={() => goTo(-1)} onNext={() => goTo(2)} /></PageShell>
    if (screen === 2) return <PageShell step={2} form={form}><StepExperience    form={form} patch={patch} onBack={() => goTo(1)}  onNext={() => { posthog.capture('step_completed', { step: 2 }); goTo(3) }} /></PageShell>
    if (screen === 3) return <PageShell step={3} form={form}><StepSkillsLangEdu form={form} patch={patch} onBack={() => goTo(2)}  onNext={() => { posthog.capture('step_completed', { step: 3 }); goTo(4) }} /></PageShell>
    if (screen === 4) return <PageShell step={4} form={form}><StepLinks         form={form} patch={patch} onBack={() => goTo(3)}  onNext={() => { posthog.capture('step_completed', { step: 4 }); goTo(0) }} /></PageShell>
    if (screen === 0) return <PageShell step={0} form={form}><Summary form={form} goTo={goTo} onGenerate={generate} generating={generating} genError={genError} /></PageShell>
  })()

  return (
    <>
      <GlobalStyles />
      {content}
    </>
  )
}