'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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

const LEVELS       = ['Intern', 'Junior', 'Mid', 'Senior', 'Lead']
const LEVEL_SUBS   = ['0–1 yr', '1–3 yrs', '3–6 yrs', '6–10 yrs', '10+ yrs']
const SKILL_LEVELS = ['Beginner', 'Familiar', 'Proficient', 'Advanced', 'Expert']
const LANG_LEVELS  = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STEP_NAMES   = ['Personal', 'Profile', 'Experience', 'Skills']
const CITY_SUGG = ['New York','Los Angeles','San Francisco','Chicago','Seattle','Boston','Austin','London','Berlin','Paris','Amsterdam','Barcelona','Stockholm','Zurich','Dubai','Singapore','Tokyo','Seoul','Sydney','Toronto','Vancouver','Mumbai','Bangalore','São Paulo','Mexico City','Warsaw','Prague','Kyiv','Tel Aviv','Cape Town']
const COUNTRY_SUGG = ['United States','United Kingdom','Canada','Australia','Germany','France','Netherlands','Spain','Switzerland','Sweden','Norway','Denmark','Finland','Poland','Czech Republic','Ukraine','Israel','UAE','India','Japan','South Korea','China','Singapore','Brazil','Mexico','Argentina','South Africa','Nigeria','Kenya']
const LANG_SUGG = ['English','Spanish','French','German','Portuguese','Italian','Russian','Chinese','Japanese','Korean','Arabic','Hindi','Dutch','Swedish','Norwegian','Danish','Finnish','Polish','Turkish','Ukrainian','Hebrew','Persian','Thai','Vietnamese','Indonesian','Malay','Romanian','Hungarian','Greek','Czech']
const PHOTO_TEMPLATES = ['corporate', 'modern', 'elegant']
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
  template: null,
  photo: null, targetRole: '', name: '', email: '', phone: '', city: '', country: '',
  linkedin: '', github: '', industry: null, level: null,
  experience: [], education: [],
  skills: [{ id: uid(), name: '', level: 2 }],
  languages: [{ id: uid(), name: '', level: 3 }],
}

const LS_KEY = 'resume-form-v1'

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
  const borderColor = error ? '#EF4444' : focused ? T.accent : T.border1
  const shadow = error ? '0 0 0 3px rgba(239,68,68,.12)' : focused ? '0 0 0 3px rgba(83,74,183,.12)' : 'none'
  return (
    <input
      {...props}
      style={{
        width: '100%', fontFamily: 'inherit', fontSize: 14,
        color: T.text1, background: T.bg1,
        border: `1.5px solid ${borderColor}`,
        borderRadius: T.r10,
        height: ROW_H, padding: '0 14px', outline: 'none',
        boxSizing: 'border-box',
        boxShadow: shadow,
        transition: 'border-color .15s, box-shadow .15s', ...style,
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

function AutoInput({ value, onChange, placeholder, suggestions = [], style, ...rest }) {
  const [open, setOpen] = useState(false)
  const [dropRect, setDropRect] = useState(null)
  const wrapRef = useRef(null)
  const q = (value || '').toLowerCase()
  const hits = q.length > 0 ? suggestions.filter(s => s.toLowerCase().startsWith(q)).slice(0, 8) : []

  function calcRect() {
    if (wrapRef.current) setDropRect(wrapRef.current.getBoundingClientRect())
  }

  return (
    <div ref={wrapRef}>
      <Input value={value} onChange={onChange} placeholder={placeholder} style={style}
        onFocus={() => { calcRect(); setOpen(true) }}
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
            <div key={s} onMouseDown={() => { onChange({ target: { value: s } }); setOpen(false) }}
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
        border: `1.5px solid ${focused ? T.accent : T.border1}`,
        borderRadius: T.r10, padding: '11px 14px', outline: 'none',
        boxSizing: 'border-box', resize: 'vertical', minHeight: 88, lineHeight: 1.6,
        boxShadow: focused ? '0 0 0 3px rgba(83,74,183,.12)' : 'none',
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
      display: 'block', fontSize: T.f11, fontWeight: 600,
      letterSpacing: '.05em', textTransform: 'uppercase', color: T.text3, marginBottom: 6,
    }}>{children}</label>
  )
}

function Field({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: '1.1rem', ...style }}>
      {label && <Lbl>{label}</Lbl>}
      {children}
      {hint && <p style={{ fontSize: T.f11, color: T.text3, marginTop: 4, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

function Grid2({ children, style }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, ...style }}>{children}</div>
}

function Divider() {
  return <div style={{ height: '0.5px', background: T.border1, margin: '1.5rem 0' }} />
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
      fontSize: 15, padding: '13px 32px', borderRadius: T.r10,
      border: 'none', background: disabled ? '#AFA9EC' : T.accent,
      color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 600, fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'background .15s', ...style,
    }}>{children}</button>
  )
}

function BtnSecondary({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      fontSize: 14, padding: '12px 22px', borderRadius: T.r10,
      border: `1.5px solid ${T.border1}`, background: T.bg1,
      color: T.text2, cursor: 'pointer', fontFamily: 'inherit',
      transition: 'border-color .15s',
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


// ─── Header progress bar ──────────────────────────────────────────────────────

function HeaderProgress({ step }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>
        Step {step} of 4
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, padding: '0',
    }}>
      {STEP_NAMES.map((name, i) => {
        const num = i + 1
        const done = num < step, active = num === step
        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600,
                background: done ? '#EAF3DE' : active ? T.accentL : T.border2,
                color: done ? '#27500A' : active ? T.accentD : T.text3,
              }}>{done ? '✓' : num}</div>
              <span style={{
                fontSize: T.f12, fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap',
                color: active ? T.text1 : done ? T.text3 : T.text3,
              }}>{name}</span>
            </div>
            {i < STEP_NAMES.length - 1 && (
              <div style={{ width: 32, height: '0.5px', background: T.border1, margin: '0 10px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Footer({ step, onBack, onNext, nextLabel }) {
  const isMobile = useIsMobile()

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      ...(isMobile ? {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: T.bg1, zIndex: 10,
        padding: '12px 16px 28px',
        borderTop: `0.5px solid ${T.border1}`,
      } : {
        marginTop: '1.75rem', paddingTop: '1.25rem', paddingBottom: '2.25rem',
        borderTop: `0.5px solid ${T.border1}`,
      }),
    }}>
      {isMobile ? (
        <>
          <BtnSecondary onClick={onBack}>← Back</BtnSecondary>
          <BtnPrimary onClick={onNext} style={{ flex: 1, marginLeft: 10 }}>{nextLabel || 'Continue →'}</BtnPrimary>
        </>
      ) : (
        <>
          <BtnSecondary onClick={onBack}>← Back</BtnSecondary>
          <span style={{ fontSize: T.f11, color: T.text3 }}>Step {step} of 4</span>
          <BtnPrimary onClick={onNext}>{nextLabel || 'Continue →'}</BtnPrimary>
        </>
      )}
    </div>
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
      background: isMobile ? T.bg1 : T.bg2,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top header: logo area + progress */}
      <div style={{
        background: T.bg1,
        borderBottom: `0.5px solid ${T.border1}`,
        padding: isMobile ? '0 1rem' : '0 2rem',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Logo slot */}
        <div style={{ fontSize: T.f14, fontWeight: 700, color: T.text1, letterSpacing: '-.02em', minWidth: isMobile ? 'auto' : 120 }}>
          ResumeBuilder
        </div>

        {/* Progress centered */}
        <HeaderProgress step={step} />

        {/* Right spacer */}
        {!isMobile && <div style={{ minWidth: 120 }} />}
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        padding: isMobile ? '0' : '2rem 1.5rem 3rem',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', maxWidth: 1280,
          background: T.bg1,
          borderRadius: isMobile ? 0 : 16,
          border: isMobile ? 'none' : `0.5px solid ${T.border1}`,
          boxShadow: isMobile ? 'none' : '0 2px 24px rgba(0,0,0,.06)',
          display: isMobile ? 'block' : 'flex',
          overflow: 'hidden',
        }}>
          {/* Form column */}
          <div style={{
            flex: isMobile ? 'unset' : '0 0 64%',
            maxWidth: isMobile ? '100%' : '64%',
            width: isMobile ? '100%' : undefined,
            padding: isMobile ? '1.25rem 1rem 0' : '2.25rem 2.5rem 0',
            borderRight: isMobile ? 'none' : `0.5px solid ${T.border1}`,
            paddingBottom: isMobile ? '100px' : 0,
            boxSizing: 'border-box',
            ...(isMobile ? {} : { display: 'flex', flexDirection: 'column' }),
          }}>
            {children}
          </div>

          {/* Preview column — hidden on mobile */}
          {!isMobile && (
            <div style={{
              flex: '0 0 36%', maxWidth: '36%',
              background: T.bg2,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              padding: '3rem 1.5rem 2rem',
              gap: '1.25rem',
              position: 'relative',
            }}>
              {/* Section badge */}
              {badge && (
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  fontSize: T.f11, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 20, background: T.accentL, color: T.accentD,
                }}>{badge}</div>
              )}

              {/* Preview paper */}
              <div style={{
                width: '100%', maxWidth: 308,
                aspectRatio: '210 / 297',
                background: isDark ? '#0f0f0f' : '#fff',
                borderRadius: T.r10,
                border: `0.5px solid ${T.border1}`,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,.08)',
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
      <div style={{
        background: T.bg1, borderBottom: `0.5px solid ${T.border1}`,
        padding: '0 2rem', height: 56,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ fontSize: T.f14, fontWeight: 700, color: T.text1, letterSpacing: '-.02em' }}>
          ResumeBuilder
        </div>
      </div>

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

// ─── Step 1: Personal ─────────────────────────────────────────────────────────

function StepPersonal({ form, patch, onBack, onNext }) {
  const fileRef = useRef()
  const showPhoto = PHOTO_TEMPLATES.includes(form.template)
  const [showErr, setShowErr] = useState(false)

  function handleNext() {
    if (!form.name?.trim() || !form.targetRole?.trim()) { setShowErr(true); return }
    onNext()
  }

  function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => patch({ photo: ev.target.result })
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: '-.01em' }}>Personal information</h2>
        <p style={{ fontSize: T.f13, color: T.text2, marginBottom: '1.75rem', lineHeight: 1.6 }}>This goes in the header of your resume.</p>

        {showPhoto && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: '1.4rem' }}>
            <div onClick={() => fileRef.current.click()} style={{ flexShrink: 0, width: 80, height: 80, borderRadius: '50%', border: `2px dashed ${T.border1}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: form.photo ? 'transparent' : T.bg2, position: 'relative' }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              {form.photo
                ? <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <><span style={{ fontSize: 22 }}>📷</span><span style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>Photo</span></>
              }
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ fontSize: T.f13, fontWeight: 500, marginBottom: 4 }}>Profile photo</div>
              <div style={{ fontSize: T.f12, color: T.text3, lineHeight: 1.6 }}>Recommended for {TEMPLATES.find(t => t.id === form.template)?.name}. Headshot, neutral background.</div>
              {form.photo && <button onClick={() => patch({ photo: null })} style={{ marginTop: 6, fontSize: T.f11, color: T.text3, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Remove</button>}
            </div>
          </div>
        )}

        <Field label="Target job title" hint="Be specific — recruiters search by exact title.">
          <Input value={form.targetRole} onChange={e => { patch({ targetRole: e.target.value }); setShowErr(false) }} placeholder="e.g. Senior Product Manager" error={showErr && !form.targetRole?.trim()} />
        </Field>
        <Field label="Full name">
          <Input value={form.name} onChange={e => { patch({ name: e.target.value }); setShowErr(false) }} placeholder="Alex Johnson" error={showErr && !form.name?.trim()} />
        </Field>
        <Grid2>
          <Field label="Email"><Input type="email" value={form.email} onChange={e => patch({ email: e.target.value })} placeholder="alex@email.com" /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+1 (415) 000-0000" /></Field>
        </Grid2>
        <Grid2>
          <Field label="City"><AutoInput value={form.city} onChange={e => patch({ city: e.target.value })} placeholder="San Francisco" suggestions={CITY_SUGG} /></Field>
          <Field label="Country"><AutoInput value={form.country} onChange={e => patch({ country: e.target.value })} placeholder="United States" suggestions={COUNTRY_SUGG} /></Field>
        </Grid2>
      </div>

      <Footer step={1} onBack={onBack} onNext={handleNext} />
    </>
  )
}

// ─── Step 2: Profile ──────────────────────────────────────────────────────────

function StepProfile({ form, patch, onBack, onNext }) {
  return (
    <>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: '-.01em' }}>Professional profile</h2>
        <p style={{ fontSize: T.f13, color: T.text2, marginBottom: '1.75rem', lineHeight: 1.6 }}>Helps AI tailor tone and keywords to your field.</p>

        <Field label="LinkedIn">
          <Input value={form.linkedin} onChange={e => patch({ linkedin: e.target.value })} placeholder="linkedin.com/in/alexjohnson" />
        </Field>
        <Field label="GitHub / Portfolio" hint="Recommended for tech and design roles.">
          <Input value={form.github} onChange={e => patch({ github: e.target.value })} placeholder="github.com/alex or yoursite.com" />
        </Field>

        <Divider />
        <SecLbl>Industry</SecLbl>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1.25rem' }}>
          {INDUSTRIES.map(ind => (
            <button key={ind.id} type="button" onClick={() => patch({ industry: ind.id })} style={{
              border: `1.5px solid ${T.border1}`,
              borderRadius: T.r10, height: ROW_H, padding: '0 11px', cursor: 'pointer',
              background: form.industry === ind.id ? 'rgba(83,74,183,.28)' : T.bg1,
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'inherit', transition: 'border-color .15s, background .15s',
            }}>
              <span style={{ fontSize: 16 }}>{ind.icon}</span>
              <div>
                <div style={{ fontSize: T.f12, fontWeight: 500, color: form.industry === ind.id ? T.accentD : T.text1, lineHeight: 1.3 }}>{ind.name}</div>
              </div>
            </button>
          ))}
        </div>

        <Divider />
        <SecLbl>Seniority level</SecLbl>
        <div style={{ display: 'flex', gap: 6 }}>
          {LEVELS.map((lvl, i) => (
            <button key={lvl} type="button" onClick={() => patch({ level: i })} style={{
              flex: 1, border: `1.5px solid ${T.border1}`,
              borderRadius: T.r10, height: ROW_H, padding: '0 4px', cursor: 'pointer',
              background: form.level === i ? 'rgba(83,74,183,.28)' : T.bg1,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color .15s, background .15s',
            }}>
              <div style={{ fontSize: T.f13, fontWeight: 500, color: form.level === i ? T.accentD : T.text1 }}>{lvl}</div>
            </button>
          ))}
        </div>
      </div>

      <Footer step={2} onBack={onBack} onNext={onNext} />
    </>
  )
}

// ─── Step 3: Experience ───────────────────────────────────────────────────────

function ExpCard({ exp, index, isOpen, onToggle, onUpdate, onRemove }) {
  const headName = [exp.role, exp.company].filter(Boolean).join(' · ') || 'New position'
  const headMeta = [exp.start, exp.end].filter(Boolean).join(' – ')
  return (
    <div style={{ background: T.bg1, border: `1.5px solid ${T.border1}`, borderRadius: T.r12, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', userSelect: 'none', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: T.border2, color: T.text3, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: T.f13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headName}</div>
            {headMeta && <div style={{ fontSize: T.f11, color: T.text3 }}>{headMeta}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={e => { e.stopPropagation(); onRemove() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.border1, fontSize: 15, padding: 2, lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = T.border1}>🗑</button>
          <span style={{ color: T.text3, fontSize: 13, display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: '12px 16px 16px', borderTop: `0.5px solid ${T.border2}` }}>
          <Grid2>
            <Field label="Company"><Input value={exp.company} onChange={e => onUpdate({ company: e.target.value })} placeholder="Acme Corp" /></Field>
            <Field label="Job title"><Input value={exp.role} onChange={e => onUpdate({ role: e.target.value })} placeholder="Senior Designer" /></Field>
            <Field label="Start date"><Input value={exp.start} onChange={e => onUpdate({ start: e.target.value })} placeholder="Jan 2021" /></Field>
            <Field label="End date"><Input value={exp.end} onChange={e => onUpdate({ end: e.target.value })} placeholder="Present" /></Field>
          </Grid2>
          <Field label="What you did & achieved" hint="Use numbers where you can. AI will polish the wording.">
            <Textarea value={exp.desc} onChange={e => onUpdate({ desc: e.target.value })} placeholder="Led a redesign that reduced drop-off by 22%..." />
          </Field>
        </div>
      )}
    </div>
  )
}

function EduCard({ edu, index, isOpen, onToggle, onUpdate, onRemove }) {
  const headName = [edu.degree, edu.institution].filter(Boolean).join(' · ') || 'New education'
  const headMeta = [edu.yearFrom, edu.yearTo].filter(Boolean).join(' – ')
  return (
    <div style={{ background: T.bg1, border: `1.5px solid ${T.border1}`, borderRadius: T.r12, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', userSelect: 'none', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: T.border2, color: T.text3, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: T.f13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headName}</div>
            {headMeta && <div style={{ fontSize: T.f11, color: T.text3 }}>{headMeta}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={e => { e.stopPropagation(); onRemove() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.border1, fontSize: 15, padding: 2, lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = T.border1}>🗑</button>
          <span style={{ color: T.text3, fontSize: 13, display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: '12px 16px 16px', borderTop: `0.5px solid ${T.border2}` }}>
          <Grid2 style={{ marginBottom: 0 }}>
            <Field label="Degree"><Input value={edu.degree} onChange={e => onUpdate({ degree: e.target.value })} placeholder="B.Sc. Computer Science" /></Field>
            <Field label="School"><Input value={edu.institution} onChange={e => onUpdate({ institution: e.target.value })} placeholder="MIT" /></Field>
            <Field label="From"><Input value={edu.yearFrom} onChange={e => onUpdate({ yearFrom: e.target.value })} placeholder="2016" /></Field>
            <Field label="To"><Input value={edu.yearTo} onChange={e => onUpdate({ yearTo: e.target.value })} placeholder="2020" /></Field>
          </Grid2>
        </div>
      )}
    </div>
  )
}

function StepExperience({ form, patch, onBack, onNext }) {
  const [openId, setOpenId] = useState(null)

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
  function addEdu() {
    const id = uid()
    patch({ education: [...form.education, { id, degree: '', institution: '', yearFrom: '', yearTo: '' }] })
    setOpenId(id)
  }
  function removeEdu(id) {
    patch({ education: form.education.filter(e => e.id !== id) })
    if (openId === id) setOpenId(null)
  }
  function updateEdu(id, p) {
    patch({ education: form.education.map(e => e.id === id ? { ...e, ...p } : e) })
  }
  return (
    <>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: '-.01em' }}>Work experience & Education</h2>
        <p style={{ fontSize: T.f13, color: T.text2, marginBottom: '1.75rem', lineHeight: 1.6 }}>Most recent first. Rough notes are fine — AI will polish everything.</p>

        {form.experience.length === 0 && (
          <div style={{ border: `1.5px dashed ${T.border1}`, borderRadius: T.r12, padding: '1.75rem', textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💼</div>
            <div style={{ fontSize: T.f13, color: T.text3 }}>No positions yet — add your most recent role</div>
          </div>
        )}
        {form.experience.map((exp, i) => (
          <ExpCard key={exp.id} exp={exp} index={i}
            isOpen={openId === exp.id}
            onToggle={() => setOpenId(openId === exp.id ? null : exp.id)}
            onUpdate={p => updateExp(exp.id, p)}
            onRemove={() => removeExp(exp.id)}
          />
        ))}
        <BtnAdd onClick={addExp}>＋ Add position</BtnAdd>

        <Divider />

        {form.education.length === 0 && (
          <div style={{ border: `1.5px dashed ${T.border1}`, borderRadius: T.r12, padding: '1.75rem', textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎓</div>
            <div style={{ fontSize: T.f13, color: T.text3 }}>No education yet — add your degree or diploma</div>
          </div>
        )}
        {form.education.map((edu, i) => (
          <EduCard key={edu.id} edu={edu} index={i}
            isOpen={openId === edu.id}
            onToggle={() => setOpenId(openId === edu.id ? null : edu.id)}
            onUpdate={p => updateEdu(edu.id, p)}
            onRemove={() => removeEdu(edu.id)}
          />
        ))}
        <BtnAdd onClick={addEdu}>＋ Add education</BtnAdd>
      </div>

      <Footer step={3} onBack={onBack} onNext={onNext} />
    </>
  )
}

// ─── Step 4: Skills ───────────────────────────────────────────────────────────

function Seg({ options, selected, onChange }) {
  return (
    <div style={{
      display: 'flex', border: `1.5px solid ${T.border1}`,
      borderRadius: T.r10, overflow: 'hidden',
      height: ROW_H, width: '100%',
    }}>
      {options.map((opt, i) => (
        <button key={i} type="button" onClick={() => onChange(i)} title={opt}
          onMouseEnter={e => { if (selected !== i) e.currentTarget.style.background = 'rgba(83,74,183,.08)' }}
          onMouseLeave={e => { if (selected !== i) e.currentTarget.style.background = T.bg1 }}
          style={{
            flex: 1, border: 'none',
            borderRight: i < options.length - 1 ? `1px solid ${T.border1}` : 'none',
            background: selected === i ? 'rgba(83,74,183,.28)' : T.bg1,
            color: selected === i ? T.accentD : T.text2,
            fontFamily: 'inherit', fontSize: T.f11, fontWeight: 600,
            cursor: 'pointer', padding: '0 2px',
            transition: 'background .12s, color .12s',
            whiteSpace: 'nowrap',
          }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ProgressSeg({ options, selected, onChange }) {
  return (
    <div style={{
      display: 'flex', border: `1.5px solid ${T.border1}`,
      borderRadius: T.r10, overflow: 'hidden',
      height: ROW_H, width: '100%',
    }}>
      {options.map((opt, i) => {
        const isActive = i === selected
        const bg = isActive ? 'rgba(83,74,183,.28)' : T.bg1
        return (
          <button key={i} type="button" onClick={() => onChange(i)} title={opt}
            onMouseEnter={e => {
              e.currentTarget.style.background = isActive ? 'rgba(83,74,183,.38)' : 'rgba(83,74,183,.08)'
            }}
            onMouseLeave={e => { e.currentTarget.style.background = bg }}
            style={{
              flex: 1, border: 'none',
              borderRight: i < options.length - 1 ? `1px solid ${T.border1}` : 'none',
              background: bg,
              color: isActive ? T.accentD : T.text2,
              fontFamily: 'inherit', fontSize: T.f12, fontWeight: 700,
              cursor: 'pointer', padding: 0,
              transition: 'background .12s',
            }}>
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}

function SkillRow({ item, levels, onNameChange, onLevelChange, onRemove, placeholder, segmented, suggestions }) {
  const isMobile = useIsMobile()

  const NameField = suggestions ? AutoInput : Input
  const removeBtn = (
    <button type="button" onClick={onRemove}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.border1, fontSize: 15, padding: 0, width: 28, height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
      onMouseLeave={e => e.currentTarget.style.color = T.border1}>🗑</button>
  )
  const levelControl = segmented
    ? <Seg options={levels} selected={item.level} onChange={onLevelChange} />
    : <ProgressSeg options={levels} selected={item.level} onChange={onLevelChange} />

  if (isMobile) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <NameField value={item.name} onChange={e => onNameChange(e.target.value)} placeholder={placeholder} suggestions={suggestions} style={{ paddingRight: 40 }} />
          <button type="button" onClick={onRemove} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.text3, fontSize: 15, padding: 4, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = T.text3}
          >🗑</button>
        </div>
        <div>{levelControl}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 28px', gap: 10, marginBottom: 8, alignItems: 'center' }}>
      <NameField value={item.name} onChange={e => onNameChange(e.target.value)} placeholder={placeholder} suggestions={suggestions} />
      {levelControl}
      {removeBtn}
    </div>
  )
}

function ColHeaders({ c1, c2 }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <div style={{ marginBottom: 6 }}><Lbl>{c1}</Lbl></div>
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 28px', gap: 10, marginBottom: 6 }}>
      <Lbl>{c1}</Lbl><Lbl>{c2}</Lbl><span />
    </div>
  )
}

function StepSkills({ form, patch, onBack, onNext }) {
  const updSkill = (id, p) => patch({ skills: form.skills.map(s => s.id === id ? { ...s, ...p } : s) })
  const updLang  = (id, p) => patch({ languages: form.languages.map(l => l.id === id ? { ...l, ...p } : l) })

  return (
    <>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, letterSpacing: '-.01em' }}>Skills & languages</h2>
        <p style={{ fontSize: T.f13, color: T.text2, marginBottom: '1.75rem', lineHeight: 1.6 }}>Add what you know and how well. AI will group skills automatically.</p>

        <ColHeaders c1="Skill" c2="Level" />
        {form.skills.map(s => (
          <SkillRow key={s.id} item={s} levels={SKILL_LEVELS} placeholder="e.g. Figma, Python, Excel…"
            onNameChange={v => updSkill(s.id, { name: v })}
            onLevelChange={v => updSkill(s.id, { level: v })}
            onRemove={() => patch({ skills: form.skills.filter(x => x.id !== s.id) })}
          />
        ))}
        <BtnAdd onClick={() => patch({ skills: [...form.skills, { id: uid(), name: '', level: 2 }] })}>＋ Add skill</BtnAdd>

        <Divider />
        <ColHeaders c1="Language" c2="Proficiency" />
        {form.languages.map(l => (
          <SkillRow key={l.id} item={l} levels={LANG_LEVELS} placeholder="e.g. English, Spanish…" segmented suggestions={LANG_SUGG}
            onNameChange={v => updLang(l.id, { name: v })}
            onLevelChange={v => updLang(l.id, { level: v })}
            onRemove={() => patch({ languages: form.languages.filter(x => x.id !== l.id) })}
          />
        ))}
        <BtnAdd onClick={() => patch({ languages: [...form.languages, { id: uid(), name: '', level: 3 }] })}>＋ Add language</BtnAdd>
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
  const ind = INDUSTRIES.find(i => i.id === form.industry)
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2, letterSpacing: '-.01em' }}>Review & generate</h2>
      <p style={{ fontSize: T.f12, color: T.text2, marginBottom: '1.25rem' }}>Expand any section to check details.</p>

      <SumCard icon="🎨" title="Template" statusOk={!!form.template} statusText="Selected" onEdit={() => goTo(-1)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
          <div style={{ width: 30, height: 38, borderRadius: 4, background: tpl?.swatch, border: `0.5px solid ${T.border1}`, flexShrink: 0 }} />
          <span style={{ fontSize: T.f13, fontWeight: 500 }}>{tpl?.name}</span>
        </div>
      </SumCard>

      <SumCard icon="👤" title="Personal" statusOk={!!(form.name || form.email)} statusText={form.name ? 'Filled' : 'Empty'} onEdit={() => goTo(1)}>
        <SumRow label="Name" value={form.name} />
        <SumRow label="Target role" value={form.targetRole} />
        <SumRow label="Email" value={form.email} />
        <SumRow label="Phone" value={form.phone} />
        <SumRow label="Location" value={[form.city, form.country].filter(Boolean).join(', ')} />
      </SumCard>

      <SumCard icon="🪪" title="Profile" statusOk={!!(form.industry || form.linkedin)} statusText={form.industry ? 'Filled' : 'Empty'} onEdit={() => goTo(2)}>
        <SumRow label="LinkedIn" value={form.linkedin} />
        <SumRow label="Industry" value={ind ? `${ind.icon} ${ind.name}` : null} />
        <SumRow label="Level" value={form.level != null ? `${LEVELS[form.level]} · ${LEVEL_SUBS[form.level]}` : null} />
      </SumCard>

      <SumCard icon="💼" title="Experience" statusOk={form.experience.length > 0} statusText={`${form.experience.length} position${form.experience.length !== 1 ? 's' : ''}`} onEdit={() => goTo(3)}>
        {form.experience.length === 0
          ? <div style={{ padding: '7px 0', fontSize: T.f12, color: T.border1, fontStyle: 'italic' }}>No experience added</div>
          : form.experience.map((e, i) => (
            <div key={e.id} style={{ padding: '7px 0', borderBottom: i < form.experience.length - 1 ? `0.5px solid ${T.border2}` : 'none' }}>
              <div style={{ fontSize: T.f13, fontWeight: 500 }}>{[e.role, e.company].filter(Boolean).join(' · ') || '—'}</div>
              <div style={{ fontSize: T.f11, color: T.text3 }}>{[e.start, e.end].filter(Boolean).join(' – ')}</div>
            </div>
          ))
        }
        <SumRow label="Education" value={form.education.filter(e => e.degree || e.institution).map(e =>
          [e.degree, e.institution, [e.yearFrom, e.yearTo].filter(Boolean).join('–')].filter(Boolean).join(' · ')
        ).join('; ')} />
      </SumCard>

      <SumCard icon="⭐" title="Skills & languages"
        statusOk={form.skills.some(s => s.name) || form.languages.some(l => l.name)}
        statusText={`${form.skills.filter(s => s.name).length} skills, ${form.languages.filter(l => l.name).length} languages`}
        onEdit={() => goTo(4)}>
        <SumRow label="Skills" value={form.skills.filter(s => s.name).map(s => `${s.name} (${SKILL_LEVELS[s.level]})`).join(', ')} />
        <SumRow label="Languages" value={form.languages.filter(l => l.name).map(l => `${l.name} (${LANG_LEVELS[l.level]})`).join(', ')} />
      </SumCard>

      <div style={{
        background: T.bg2, border: `1.5px solid ${T.border1}`,
        borderRadius: T.r12, padding: '1.75rem', textAlign: 'center', marginTop: '1.5rem', marginBottom: '2.25rem',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: '-.01em' }}>Ready to generate</div>
        <div style={{ fontSize: T.f14, color: T.text2, marginBottom: '1.25rem', lineHeight: 1.6 }}>
          AI will write polished bullet points, a professional summary,<br />and group your skills — tailored to your target role.
        </div>
        <BtnPrimary onClick={onGenerate} disabled={generating}>
          {generating ? '⏳ Generating…' : '✦ Generate resume'}
        </BtnPrimary>

        {genError && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: '#FEF2F2', border: '1.5px solid #FECACA',
            borderRadius: T.r10, fontSize: T.f13, color: '#DC2626', lineHeight: 1.5,
          }}>
            ⚠ {genError}
          </div>
        )}

        <button onClick={() => goTo(4)} style={{
          display: 'block', margin: '12px auto 0', fontSize: T.f13,
          color: T.text3, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>← Back to step 4</button>
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

function ResumeResult({ resume, template, onReset, onDownload, autoDownload, downloadRef }) {
  const isMobile = useIsMobile()
  const dlRef = useRef(null)

  useEffect(() => {
    if (!autoDownload || !dlRef.current) return
    const t = setTimeout(() => {
      dlRef.current?.querySelector('button')?.click()
    }, 600)
    return () => clearTimeout(t)
  }, [autoDownload])
  return (
    <div style={{ minHeight: '100vh', background: T.bg2, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: T.bg1, borderBottom: `0.5px solid ${T.border1}`,
        padding: '0 2rem', height: 56,
        display: 'flex', alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{ fontSize: T.f14, fontWeight: 700, color: T.text1, letterSpacing: '-.02em' }}>ResumeBuilder</div>
      </div>

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
              {autoDownload
                ? <div ref={dlRef}><ResumeDownloadButton data={resume} template={template} filename="resume.pdf" /></div>
                : <button onClick={onDownload} style={{ padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}>⬇ Download Resume (PDF)</button>
              }
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
                {autoDownload
                  ? <div ref={dlRef}><ResumeDownloadButton data={resume} template={template} filename="resume.pdf" /></div>
                  : <button onClick={onDownload} style={{ padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}>⬇ Download Resume (PDF)</button>
                }
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
  const [autoDownload, setAutoDownload] = useState(false)
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
      const formEdu = form.education
        .filter(e => e.degree || e.institution)
        .map(e => ({
          institution: e.institution || '',
          degree: e.degree || '',
          year: [e.yearFrom, e.yearTo].filter(Boolean).join('–'),
        }))
      setResume({
        ...raw,
        title:     raw.title || form.targetRole || undefined,
        email:     form.email    || undefined,
        phone:     form.phone    || undefined,
        location:  [form.city, form.country].filter(Boolean).join(', ') || undefined,
        linkedin:  form.linkedin || undefined,
        github:    form.github   || undefined,
        languages: langs.length ? langs : undefined,
        education: raw.education?.length ? raw.education : formEdu,
      })
    } catch (e) {
      setGenError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handlePaymentSuccess = useCallback((resumeData, templateId) => {
    setResume(resumeData)
    setForm(f => ({ ...f, template: templateId }))
    setAutoDownload(true)
  }, [])

  if (resume) {
    return (
      <>
        <ResumeResult
          resume={resume}
          template={PDF_TEMPLATE_MAP[form.template] ?? 'minimal'}
          onReset={() => { setResume(null); setForm(INITIAL_FORM); setScreen(-1); setAutoDownload(false); try { localStorage.removeItem(LS_KEY) } catch {} }}
          onDownload={() => setPaywallOpen(true)}
          autoDownload={autoDownload}
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
    if (screen === 1) return <StepPersonal   form={form} patch={patch} onBack={() => goTo(-1)} onNext={() => goTo(2)} />
    if (screen === 2) return <StepProfile    form={form} patch={patch} onBack={() => goTo(1)}  onNext={() => goTo(3)} />
    if (screen === 3) return <StepExperience form={form} patch={patch} onBack={() => goTo(2)}  onNext={() => goTo(4)} />
    if (screen === 4) return <StepSkills     form={form} patch={patch} onBack={() => goTo(3)}  onNext={() => goTo(0)} />
    if (screen === 0) return <Summary form={form} goTo={goTo} onGenerate={generate} generating={generating} genError={genError} />
  })()

  return (
    <PageShell step={screen} form={form}>
      {content}
    </PageShell>
  )
}