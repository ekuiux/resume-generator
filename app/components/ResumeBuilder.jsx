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
      <svg width="154" height="34" viewBox="0 0 154 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="34" height="34" rx="10" fill="#05070A"/>
        <path d="M10.1001 10.3934V8H17.8785C21.0453 8 23.6126 10.5672 23.6126 13.7341V13.8338C23.6126 16.5061 21.7845 18.7514 19.3108 19.3875L24.2608 26H21.0696L16.2546 19.5679L14.463 17.1745H17.6541H17.8785C19.7235 17.1745 21.2192 15.6788 21.2192 13.8338V13.7341C21.2192 11.8891 19.7235 10.3934 17.8785 10.3934H10.1001Z" fill="white"/>
        <path d="M43.58 24V9.86H49.16C49.88 9.86 50.56 9.93333 51.2 10.08C51.84 10.2133 52.4067 10.4533 52.9 10.8C53.3933 11.1333 53.78 11.5933 54.06 12.18C54.34 12.7667 54.48 13.4933 54.48 14.36C54.48 15.08 54.3533 15.7133 54.1 16.26C53.8467 16.8067 53.4933 17.2667 53.04 17.64C52.6 18.0133 52.0733 18.3 51.46 18.5L54.56 24H51.76L48.98 18.9H46.08V24H43.58ZM46.08 16.68H48.82C49.2733 16.68 49.6867 16.6467 50.06 16.58C50.4467 16.5 50.78 16.3733 51.06 16.2C51.3533 16.0267 51.5733 15.7933 51.72 15.5C51.88 15.1933 51.9667 14.8067 51.98 14.34C51.98 13.78 51.86 13.34 51.62 13.02C51.3933 12.7 51.06 12.4733 50.62 12.34C50.1933 12.2067 49.68 12.14 49.08 12.14H46.08V16.68ZM61.2789 24.14C60.1856 24.14 59.2522 23.9133 58.4789 23.46C57.7189 23.0067 57.1389 22.38 56.7389 21.58C56.3522 20.7667 56.1589 19.8267 56.1589 18.76C56.1589 17.6933 56.3589 16.7533 56.7589 15.94C57.1722 15.1133 57.7589 14.4667 58.5189 14C59.2922 13.5333 60.2189 13.3 61.2989 13.3C62.0989 13.3 62.7989 13.4467 63.3989 13.74C63.9989 14.02 64.4989 14.4067 64.8989 14.9C65.3122 15.3933 65.6189 15.9533 65.8189 16.58C66.0189 17.2067 66.1122 17.8667 66.0989 18.56C66.0856 18.72 66.0722 18.88 66.0589 19.04C66.0456 19.1867 66.0256 19.3467 65.9989 19.52H58.5989C58.6389 19.9867 58.7589 20.4133 58.9589 20.8C59.1722 21.1867 59.4656 21.4933 59.8389 21.72C60.2256 21.9467 60.7056 22.06 61.2789 22.06C61.6122 22.06 61.9322 22.02 62.2389 21.94C62.5456 21.8467 62.8122 21.7133 63.0389 21.54C63.2789 21.3667 63.4389 21.1467 63.5189 20.88H65.9589C65.7856 21.64 65.4656 22.26 64.9989 22.74C64.5322 23.22 63.9722 23.5733 63.3189 23.8C62.6789 24.0267 61.9989 24.14 61.2789 24.14ZM58.6389 17.7H63.7189C63.7189 17.26 63.6189 16.86 63.4189 16.5C63.2189 16.14 62.9322 15.86 62.5589 15.66C62.1989 15.4467 61.7589 15.34 61.2389 15.34C60.6789 15.34 60.2122 15.4533 59.8389 15.68C59.4656 15.9067 59.1789 16.2 58.9789 16.56C58.7789 16.92 58.6656 17.3 58.6389 17.7ZM72.0833 24.14C71.5766 24.14 71.0699 24.0867 70.5633 23.98C70.0699 23.8733 69.6033 23.7 69.1633 23.46C68.7233 23.2067 68.3566 22.8667 68.0633 22.44C67.7699 22.0133 67.5766 21.48 67.4833 20.84H69.9433C70.0499 21.1333 70.2166 21.3733 70.4433 21.56C70.6833 21.7333 70.9566 21.8667 71.2633 21.96C71.5833 22.04 71.8966 22.08 72.2033 22.08C72.3899 22.08 72.5899 22.0667 72.8033 22.04C73.0299 22.0133 73.2366 21.96 73.4233 21.88C73.6233 21.8 73.7833 21.6867 73.9033 21.54C74.0233 21.38 74.0833 21.1733 74.0833 20.92C74.0833 20.68 74.0166 20.4933 73.8833 20.36C73.7499 20.2133 73.5699 20.1 73.3433 20.02C73.1166 19.9267 72.8433 19.8533 72.5233 19.8C71.9499 19.68 71.3366 19.5533 70.6833 19.42C70.0299 19.2733 69.4633 19.0467 68.9833 18.74C68.7833 18.62 68.6099 18.48 68.4633 18.32C68.3166 18.16 68.1899 17.9867 68.0833 17.8C67.9899 17.6 67.9166 17.3867 67.8633 17.16C67.8233 16.9333 67.8033 16.6867 67.8033 16.42C67.8033 15.86 67.9166 15.3867 68.1433 15C68.3833 14.6 68.6966 14.28 69.0833 14.04C69.4833 13.7867 69.9366 13.6 70.4433 13.48C70.9499 13.36 71.4699 13.3 72.0033 13.3C72.7233 13.3 73.3766 13.4133 73.9633 13.64C74.5499 13.8667 75.0366 14.2133 75.4233 14.68C75.8233 15.1467 76.0633 15.74 76.1433 16.46H73.8233C73.7566 16.1267 73.5499 15.86 73.2033 15.66C72.8699 15.46 72.4433 15.36 71.9233 15.36C71.7366 15.36 71.5433 15.38 71.3433 15.42C71.1433 15.4467 70.9499 15.5 70.7633 15.58C70.5899 15.6467 70.4433 15.7533 70.3233 15.9C70.2166 16.0467 70.1633 16.2267 70.1633 16.44C70.1633 16.64 70.2099 16.8133 70.3033 16.96C70.4099 17.1067 70.5633 17.2333 70.7633 17.34C70.9766 17.4333 71.2233 17.5133 71.5033 17.58C71.9566 17.6733 72.4299 17.7667 72.9233 17.86C73.4166 17.9533 73.8433 18.0467 74.2033 18.14C74.6299 18.26 75.0166 18.4333 75.3633 18.66C75.7099 18.8733 75.9766 19.16 76.1633 19.52C76.3633 19.8667 76.4633 20.3133 76.4633 20.86C76.4633 21.5 76.3299 22.0333 76.0633 22.46C75.8099 22.8867 75.4699 23.22 75.0433 23.46C74.6166 23.7 74.1433 23.8733 73.6233 23.98C73.1033 24.0867 72.5899 24.14 72.0833 24.14ZM82.9181 24.14C81.3981 24.14 80.2315 23.7467 79.4181 22.96C78.6181 22.1733 78.2181 20.9733 78.2181 19.36V13.46H80.6581V19.2C80.6581 19.76 80.7315 20.2467 80.8781 20.66C81.0381 21.0733 81.2848 21.3933 81.6181 21.62C81.9648 21.8333 82.3981 21.94 82.9181 21.94C83.4781 21.94 83.9181 21.8267 84.2381 21.6C84.5715 21.36 84.8048 21.0333 84.9381 20.62C85.0715 20.2067 85.1381 19.7333 85.1381 19.2V13.46H87.5781V19.36C87.5781 21.0133 87.1648 22.2267 86.3381 23C85.5248 23.76 84.3848 24.14 82.9181 24.14ZM89.8988 24V13.46H92.1388L92.2988 14.66C92.5654 14.3 92.8521 14.0267 93.1588 13.84C93.4788 13.64 93.8054 13.5 94.1388 13.42C94.4854 13.34 94.8121 13.3 95.1188 13.3C95.7854 13.3 96.3521 13.4333 96.8188 13.7C97.2988 13.9667 97.6721 14.3667 97.9388 14.9C98.2054 14.5267 98.5054 14.2267 98.8388 14C99.1721 13.76 99.5254 13.5867 99.8988 13.48C100.272 13.36 100.665 13.3 101.079 13.3C101.892 13.3 102.545 13.4733 103.039 13.82C103.532 14.1533 103.892 14.62 104.119 15.22C104.345 15.8067 104.459 16.48 104.459 17.24V24H102.019V18.02C102.019 17.7533 102.005 17.4733 101.979 17.18C101.952 16.8867 101.879 16.6133 101.759 16.36C101.652 16.1067 101.492 15.9 101.279 15.74C101.065 15.58 100.765 15.5 100.379 15.5C99.9921 15.5 99.6721 15.5867 99.4188 15.76C99.1788 15.92 98.9788 16.14 98.8187 16.42C98.6721 16.6867 98.5654 16.9867 98.4988 17.32C98.4454 17.64 98.4188 17.96 98.4188 18.28V24H95.9788V18C95.9788 17.7467 95.9588 17.48 95.9188 17.2C95.8921 16.9067 95.8254 16.6333 95.7188 16.38C95.6254 16.1133 95.4654 15.9 95.2388 15.74C95.0254 15.58 94.7254 15.5 94.3388 15.5C93.7788 15.5 93.3521 15.6533 93.0588 15.96C92.7788 16.2667 92.5854 16.64 92.4788 17.08C92.3854 17.52 92.3388 17.94 92.3388 18.34V24H89.8988ZM111.435 24.14C110.342 24.14 109.408 23.9133 108.635 23.46C107.875 23.0067 107.295 22.38 106.895 21.58C106.508 20.7667 106.315 19.8267 106.315 18.76C106.315 17.6933 106.515 16.7533 106.915 15.94C107.328 15.1133 107.915 14.4667 108.675 14C109.448 13.5333 110.375 13.3 111.455 13.3C112.255 13.3 112.955 13.4467 113.555 13.74C114.155 14.02 114.655 14.4067 115.055 14.9C115.468 15.3933 115.775 15.9533 115.975 16.58C116.175 17.2067 116.268 17.8667 116.255 18.56C116.242 18.72 116.228 18.88 116.215 19.04C116.202 19.1867 116.182 19.3467 116.155 19.52H108.755C108.795 19.9867 108.915 20.4133 109.115 20.8C109.328 21.1867 109.622 21.4933 109.995 21.72C110.382 21.9467 110.862 22.06 111.435 22.06C111.768 22.06 112.088 22.02 112.395 21.94C112.702 21.8467 112.968 21.7133 113.195 21.54C113.435 21.3667 113.595 21.1467 113.675 20.88H116.115C115.942 21.64 115.622 22.26 115.155 22.74C114.688 23.22 114.128 23.5733 113.475 23.8C112.835 24.0267 112.155 24.14 111.435 24.14ZM108.795 17.7H113.875C113.875 17.26 113.775 16.86 113.575 16.5C113.375 16.14 113.088 15.86 112.715 15.66C112.355 15.4467 111.915 15.34 111.395 15.34C110.835 15.34 110.368 15.4533 109.995 15.68C109.622 15.9067 109.335 16.2 109.135 16.56C108.935 16.92 108.822 17.3 108.795 17.7ZM122.8 24C121.946 24 121.24 23.8867 120.68 23.66C120.133 23.4333 119.72 23.0667 119.44 22.56C119.173 22.0533 119.04 21.3733 119.04 20.52V15.62H117.42V13.46H119.04V10.52H121.48V13.46H123.94V15.62H121.48V20.2C121.48 20.7333 121.573 21.14 121.76 21.42C121.946 21.7 122.366 21.84 123.02 21.84H123.86V24H122.8ZM125.563 24V13.46H128.003V24H125.563ZM126.783 12.24C126.316 12.24 125.943 12.1 125.663 11.82C125.383 11.54 125.243 11.1733 125.243 10.72C125.243 10.28 125.389 9.92 125.683 9.64C125.976 9.34667 126.343 9.2 126.783 9.2C127.209 9.2 127.576 9.34 127.883 9.62C128.189 9.9 128.343 10.2667 128.343 10.72C128.343 11.1733 128.196 11.54 127.903 11.82C127.609 12.1 127.236 12.24 126.783 12.24ZM135.188 24.14C134.108 24.14 133.174 23.92 132.388 23.48C131.614 23.04 131.014 22.4133 130.588 21.6C130.174 20.7867 129.968 19.8333 129.968 18.74C129.968 17.6333 130.181 16.68 130.608 15.88C131.034 15.0667 131.634 14.4333 132.408 13.98C133.181 13.5267 134.108 13.3 135.188 13.3C136.254 13.3 137.174 13.5267 137.948 13.98C138.721 14.4333 139.314 15.0733 139.728 15.9C140.141 16.7133 140.348 17.6733 140.348 18.78C140.348 19.86 140.141 20.8067 139.728 21.62C139.328 22.42 138.741 23.04 137.968 23.48C137.194 23.92 136.268 24.14 135.188 24.14ZM135.168 21.92C135.834 21.92 136.368 21.7733 136.768 21.48C137.181 21.1867 137.481 20.8 137.668 20.32C137.854 19.84 137.948 19.32 137.948 18.76C137.948 18.2 137.854 17.6733 137.668 17.18C137.481 16.6867 137.181 16.2933 136.768 16C136.368 15.6933 135.834 15.54 135.168 15.54C134.501 15.54 133.961 15.6933 133.548 16C133.134 16.2933 132.834 16.6867 132.648 17.18C132.461 17.66 132.368 18.1867 132.368 18.76C132.368 19.32 132.461 19.8467 132.648 20.34C132.848 20.82 133.148 21.2067 133.548 21.5C133.961 21.78 134.501 21.92 135.168 21.92ZM142.301 24V13.46H144.581L144.721 14.8C145.001 14.4267 145.328 14.1333 145.701 13.92C146.074 13.7067 146.468 13.5533 146.881 13.46C147.294 13.3533 147.681 13.3 148.041 13.3C149.041 13.3 149.828 13.52 150.401 13.96C150.988 14.4 151.401 14.9867 151.641 15.72C151.881 16.4533 152.001 17.2733 152.001 18.18V24H149.561V18.58C149.561 18.1933 149.534 17.82 149.481 17.46C149.428 17.0867 149.321 16.7533 149.161 16.46C149.014 16.1667 148.801 15.9333 148.521 15.76C148.241 15.5867 147.868 15.5 147.401 15.5C146.828 15.5 146.341 15.6533 145.941 15.96C145.541 16.2667 145.241 16.68 145.041 17.2C144.841 17.7067 144.741 18.2867 144.741 18.94V24H142.301Z" fill="#05070A"/>
      </svg>
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
        paddingTop: 24,
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
        padding: isMobile ? '1.25rem 1rem 200px' : '2rem 1.5rem 3rem',
        display: 'flex', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
          display: isMobile ? 'block' : 'flex',
          gap: '2rem', alignItems: 'flex-start',
        }}>
          {/* Preview */}
          <div style={{ flex: '0 0 64%', maxWidth: isMobile ? '100%' : '64%', borderRadius: 24, overflow: 'hidden', boxShadow: '0 6px 32px rgba(0,0,0,.14)' }}>
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