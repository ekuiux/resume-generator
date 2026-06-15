'use client'

/**
 * ResumePDF.tsx
 * 3 шаблона резюме через @react-pdf/renderer
 *
 * Установка:
 *   npm install @react-pdf/renderer
 *
 * Использование:
 *   import { ResumePreview, ResumeDownloadButton } from '@/components/ResumePDF'
 *
 *   <ResumePreview data={resume} template="minimal" />
 *   <ResumeDownloadButton data={resume} template="business" filename="resume.pdf" />
 */

import {
  Document, Page, Text, View, StyleSheet, Font,
  Link, pdf, Svg, Path, Rect, Image, G, Defs, LinearGradient, Stop,
} from '@react-pdf/renderer'
import { useState, useEffect, useRef, forwardRef } from 'react'

Font.register({
  family: 'Onest',
  fonts: [
    { src: '/fonts/Onest-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Onest-Bold.ttf',    fontWeight: 700 },
  ]
})

// Aurora template fonts
Font.register({
  family: 'Aclonica',
  fonts: [
    { src: '/fonts/Aclonica-Regular.ttf', fontWeight: 400 },
  ]
})

Font.register({
  family: 'Archivo',
  fonts: [
    { src: '/fonts/Archivo-Regular.ttf',  fontWeight: 400 },
    { src: '/fonts/Archivo-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Archivo-Bold.ttf',     fontWeight: 700 },
  ]
})

// Volt template font
Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.ttf',  fontWeight: 400 },
    { src: '/fonts/Poppins-Italic.ttf',   fontWeight: 400, fontStyle: 'italic' },
    { src: '/fonts/Poppins-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Poppins-Bold.ttf',     fontWeight: 700 },
  ]
})

// Atelier template fonts
Font.register({
  family: 'Collingar',
  fonts: [
    { src: '/fonts/Collingar-Regular.ttf', fontWeight: 400 },
  ]
})

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: '/fonts/Montserrat-Regular.ttf',  fontWeight: 400 },
    { src: '/fonts/Montserrat-Medium.ttf',   fontWeight: 500 },
    { src: '/fonts/Montserrat-SemiBold.ttf', fontWeight: 600 },
  ]
})

Font.register({
  family: 'Georgia',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJfbwhT.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/crimsontext/v19/wlpZgwHKFkZgtmSR3NB0oRJXsCx2C9lR1LU.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/crimsontext/v19/wlppgwHKFkZgtmSR3NB0oRJfajhRK_Y.ttf', fontWeight: 400, fontStyle: 'italic' },
  ]
})

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400, fontStyle: 'italic' },
  ]
})

// Prime template font (Figtree — OFL; static weights instanced from the variable TTF)
Font.register({
  family: 'Figtree',
  fonts: [
    { src: '/fonts/Figtree-Medium.ttf',       fontWeight: 500 },
    { src: '/fonts/Figtree-MediumItalic.ttf', fontWeight: 500, fontStyle: 'italic' },
    { src: '/fonts/Figtree-Bold.ttf',         fontWeight: 700 },
  ]
})

// Nordic template font (Gabarito — OFL; SemiBold instanced from the variable TTF)
Font.register({
  family: 'Gabarito',
  fonts: [
    { src: '/fonts/Gabarito-Regular.ttf',  fontWeight: 400 },
    { src: '/fonts/Gabarito-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Gabarito-Bold.ttf',     fontWeight: 700 },
  ]
})

// Nordic template font (Gabarito — OFL; static weights instanced from the variable TTF)
Font.register({
  family: 'Gabarito',
  fonts: [
    { src: '/fonts/Gabarito-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Gabarito-Bold.ttf',    fontWeight: 700 },
  ]
})

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResumeData {
  name: string
  title: string
  summary: string
  experience: {
    company: string
    role: string
    period: string
    achievements: string[]
  }[]
  skills: {
    technical: string[]
    soft: string[]
  }
  education: {
    institution: string
    degree: string
    year: string
  }[]
  // optional contact fields passed from form
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  languages?: string[]
}

export type TemplateId = 'minimal' | 'business' | 'creative' | 'corporate' | 'elegant' | 'academic' | 'startup' | 'aurora' | 'volt' | 'atelier' | 'prime' | 'nordic' | 'nordic'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toUrl(val: string): string {
  if (!val) return ''
  if (val.startsWith('http://') || val.startsWith('https://')) return val
  if (val.startsWith('mailto:')) return val
  return `https://${val}`
}

const SKILL_LEVEL_PCT: Record<string, number> = {
  Beginner: 20, Familiar: 40, Proficient: 60, Advanced: 80, Expert: 100,
}
function skillLevelPct(skill: string): number {
  const match = skill.match(/\((\w+)\)$/)
  return match ? (SKILL_LEVEL_PCT[match[1]] ?? 70) : 70
}
function skillName(skill: string): string {
  return skill.replace(/\s*\(\w+\)$/, '').trim()
}
// "English (C2)" → { name: 'English', level: 'C2' }
function langParts(l: string): { name: string; level: string } {
  const m = l.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  return m ? { name: m[1].trim(), level: m[2].trim() } : { name: l.trim(), level: '' }
}

// ─── Шаблон 1: MINIMAL ───────────────────────────────────────────────────────
// Два столбца: слева Summary/Experience/Education, справа контакты/Skills/Languages.

// Figma Frame 170: name top=32 h=26 (110%), gap=6, role h=19 (120%), cols top=115 → gap=32 ✓
const minimalStyles = StyleSheet.create({
  page:          { fontFamily: 'Onest', backgroundColor: '#ffffff', padding: '40 48 40 48' },
  name:          { fontSize: 24, fontWeight: 'bold', color: '#212329', lineHeight: 1.1, marginBottom: 6 },
  role:          { fontSize: 16, fontWeight: 400, color: '#212329', lineHeight: 1.2, marginBottom: 32 },
  cols:          { flexDirection: 'row', gap: 24 },
  left:          { width: 335, flexShrink: 0 },
  right:         { width: 140, flexShrink: 0 },
  leftContent:   { gap: 24 },
  rightContent:  { gap: 24 },
  sectionLabel:  { fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: '#7A7E88', lineHeight: 1 },
  summary:       { fontSize: 11, lineHeight: 1.5, color: '#212329' },
  summarySection: { gap: 8 },
  expRole:       { fontSize: 11, fontWeight: 'bold', color: '#212329', lineHeight: 1.5 },
  expCo:         { fontSize: 11, fontWeight: 400, color: '#212329', lineHeight: 1.5 },
  expDate:       { fontSize: 9, fontWeight: 400, color: '#7A7E88', lineHeight: 1.5 },
  bullet:        { flexDirection: 'row' },
  bulletDot:     { fontSize: 11, color: '#212329', lineHeight: 1.5, width: 10 },
  bulletText:    { fontSize: 11, fontWeight: 400, color: '#212329', lineHeight: 1.5, flex: 1 },
  eduInst:       { fontSize: 11, fontWeight: 'bold', color: '#212329', lineHeight: 1.5 },
  eduDeg:        { fontSize: 11, fontWeight: 400, color: '#212329', lineHeight: 1.5 },
  contactsGroup: { gap: 12 },
  contactItem:   { gap: 8 },
  rightLabel:    { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', color: '#212329', lineHeight: 1 },
  contactVal:    { fontSize: 11, fontWeight: 400, color: '#7A7E88', lineHeight: 1.5 },
  skillSection:  { gap: 8 },
  skillItem:     { fontSize: 11, fontWeight: 400, color: '#7A7E88', lineHeight: 1.5 },
})

function MinimalResume({ data }: { data: ResumeData }) {
  const contacts = [
    data.email    ? { label: 'Email',    val: data.email } : null,
    data.phone    ? { label: 'Phone',    val: data.phone } : null,
    data.location ? { label: 'Location', val: data.location } : null,
    data.linkedin ? { label: 'LinkedIn', val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio', val: data.github } : null,
  ].filter(Boolean) as { label: string; val: string }[]

  const renderExp = (exp: ResumeData['experience'][0], key: number) => (
    <View key={key} wrap={false} style={{ gap: 2 }}>
      <View>
        <Text style={minimalStyles.expRole}>{exp.role}</Text>
        <Text style={minimalStyles.expCo}>{exp.company}</Text>
      </View>
      <Text style={minimalStyles.expDate}>{exp.period}</Text>
      <View style={{ paddingLeft: 4 }}>
        {exp.achievements.map((a, j) => (
          <View key={j} style={minimalStyles.bullet}>
            <Text style={minimalStyles.bulletDot}>•</Text>
            <Text style={minimalStyles.bulletText}>{a}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={minimalStyles.page}>
        <Text style={minimalStyles.name}>{data.name}</Text>
        <Text style={minimalStyles.role}>{data.title}</Text>

        <View style={minimalStyles.cols}>
          <View style={minimalStyles.left}>
            <View style={minimalStyles.leftContent}>
              {data.summary ? (
                <View style={minimalStyles.summarySection}>
                  <Text style={minimalStyles.sectionLabel}>Summary</Text>
                  <Text style={minimalStyles.summary}>{data.summary}</Text>
                </View>
              ) : null}

              {data.experience.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={minimalStyles.sectionLabel}>Experience</Text>
                  <View style={{ gap: 24 }}>
                    {data.experience.map((exp, i) => renderExp(exp, i))}
                  </View>
                </View>
              )}

              {data.education.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={minimalStyles.sectionLabel}>Education</Text>
                  <View style={{ gap: 24 }}>
                    {data.education.map((ed, i) => (
                      <View key={i}>
                        <Text style={minimalStyles.eduInst}>{ed.institution}</Text>
                        <Text style={minimalStyles.eduDeg}>{ed.degree}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={minimalStyles.right}>
            <View style={minimalStyles.rightContent}>
              {contacts.length > 0 && (
                <View style={minimalStyles.contactsGroup}>
                  {contacts.map((c, i) => (
                    <View key={i} style={minimalStyles.contactItem}>
                      <Text style={minimalStyles.rightLabel}>{c.label}</Text>
                      <Text style={minimalStyles.contactVal}>{c.val}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
                <View style={minimalStyles.skillSection}>
                  <Text style={minimalStyles.rightLabel}>Skills</Text>
                  <View>
                    {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
                      <Text key={i} style={minimalStyles.skillItem}>{skillName(s)}</Text>
                    ))}
                  </View>
                </View>
              )}

              {data.languages && data.languages.length > 0 && (
                <View style={minimalStyles.skillSection}>
                  <Text style={minimalStyles.rightLabel}>Languages</Text>
                  <View>
                    {data.languages.map((l, i) => (
                      <Text key={i} style={minimalStyles.skillItem}>{l}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ─── Шаблон AURORA ───────────────────────────────────────────────────────────
// Aclonica-заголовки + Archivo-тело. Контент прижат вправо, низ — 3 колонки.
// Декоративный фон (aurora-блобы) — прозрачный PNG слоем под текстом.
// Figma 595×842, padding 32. Контент-колонка x219..491 (w272), заголовки x219.

const auroraStyles = StyleSheet.create({
  // paddingBottom gives a bottom margin on every page (incl. the page-1 break of a
  // 2-page resume). Only bottom — top/left/right stay 0 so absolute blobs aren't offset.
  page:        { fontFamily: 'Archivo', backgroundColor: '#ffffff', paddingBottom: 30 },
  // Decorative aurora blobs (under text). PNGs pre-cropped to page bounds so all
  // offsets are >= 0 (react-pdf/yoga hangs on negative absolute positions).
  b1:          { position: 'absolute', left: 0,   top: 0,   width: 241, height: 272 },
  b2:          { position: 'absolute', left: 524, top: 170, width: 71,  height: 174 },
  // b3 (full, uncropped 522×655 → 174×218 @3x) anchored inside ruleWrap:
  // bottom sits on the divider; left:-32 = root padding so the blob sits flush to the page's left edge
  b3:          { position: 'absolute', left: -32, bottom: 0, width: 174, height: 218 },
  // b4 is `fixed` so it can sit at the very bottom edge without counting toward content
  // overflow (avoids a phantom page even with paddingBottom). Shown only on 1-page resumes.
  b4:          { position: 'absolute', left: 180, top: 740, width: 241, height: 100 },
  // Frame 184: column, align flex-end, gap 20 (→16 compensates lineHeight half-leading)
  root:        { padding: '30 32 0 32', flexDirection: 'column', alignItems: 'flex-end', gap: 14 },
  // Header (name + role), right-aligned, gap 8
  header:      { alignItems: 'flex-end', gap: 8 },
  name:        { fontFamily: 'Aclonica', fontSize: 28, lineHeight: 32/28, color: '#000', textAlign: 'right' },
  role:        { fontFamily: 'Aclonica', fontSize: 20, lineHeight: 23/20, color: '#000', textAlign: 'right' },
  // Dividers
  topRule:     { width: 312, height: 1, backgroundColor: '#000' },
  fullRule:    { width: '100%', height: 1, backgroundColor: '#000' },
  ruleWrap:    { position: 'relative', width: '100%' },
  // Section heading (Aclonica 20) — left edge at inner x219
  heading:     { fontFamily: 'Aclonica', fontSize: 20, lineHeight: 23/20, color: '#000' },
  // Summary / Education: whole section indented to the content column
  sectionIndent: { width: '100%', paddingLeft: 219, paddingRight: 40, gap: 12 },
  body:        { fontSize: 11, lineHeight: 1.5, color: '#000' },
  // Experience: heading indented, rows span x49..491
  expSection:  { width: '100%', gap: 12 },
  expHeadWrap: { paddingLeft: 219 },
  expRows:     { paddingLeft: 49, paddingRight: 40, gap: 12 },
  expRow:      { flexDirection: 'row', gap: 16 },
  expLeft:     { width: 154, alignItems: 'flex-end' },
  expMeta:     { fontSize: 11, fontWeight: 700, lineHeight: 1.5, color: '#000', textAlign: 'right' },
  expRight:    { width: 272, gap: 8 },
  expCompany:  { fontSize: 11, fontWeight: 700, lineHeight: 1.5, color: '#000' },
  bulletList:  { gap: 4 },
  bullet:      { flexDirection: 'row' },
  bulletDot:   { fontSize: 11, lineHeight: 1.5, color: '#000', width: 10 },
  bulletText:  { fontSize: 11, lineHeight: 1.5, color: '#000', flex: 1 },
  // Education
  eduInst:     { fontSize: 11, fontWeight: 700, lineHeight: 1.5, color: '#000' },
  eduDeg:      { fontSize: 11, fontWeight: 400, lineHeight: 1.5, color: '#000' },
  // Footer: 3 columns, gap 24
  footer:      { width: '100%', flexDirection: 'row', gap: 24 },
  fCol:        { width: 161, gap: 12 },
  fList:       { gap: 8 },
  contactRow:  { flexDirection: 'row', alignItems: 'center', gap: 9 },
  contactText: { fontSize: 11, fontWeight: 600, lineHeight: 12/11, color: '#000', flex: 1 },
  langRow:     { flexDirection: 'row' },
  langName:    { width: 62, fontSize: 11, fontWeight: 700, lineHeight: 12/11, color: '#000' },
  langLevel:   { fontSize: 11, fontWeight: 600, lineHeight: 12/11, color: '#000' },
  skillsWrap:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skill:       { fontSize: 11, fontWeight: 600, lineHeight: 12/11, color: '#000' },
})

function AuroraIcon({ type }: { type: 'pin' | 'phone' | 'mail' | 'link' }) {
  const c = '#000000'
  if (type === 'pin') return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path d="M6 0.6 C3.4 0.6 1.4 2.6 1.4 5.2 C1.4 8.6 6 11.4 6 11.4 C6 11.4 10.6 8.6 10.6 5.2 C10.6 2.6 8.6 0.6 6 0.6 Z M6 6.9 C5.06 6.9 4.3 6.14 4.3 5.2 C4.3 4.26 5.06 3.5 6 3.5 C6.94 3.5 7.7 4.26 7.7 5.2 C7.7 6.14 6.94 6.9 6 6.9 Z" fill={c} fillRule="evenodd" />
    </Svg>
  )
  if (type === 'phone') return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path d="M2.4 1 C1.7 1 1.1 1.55 1.02 2.25 C0.6 6.4 5.6 11.4 9.75 10.98 C10.45 10.9 11 10.3 11 9.6 L11 8.05 C11 7.55 10.68 7.15 10.2 7.03 L8.35 6.65 C7.92 6.56 7.5 6.7 7.22 7.0 L6.62 7.6 C5.3 6.92 5.08 6.7 4.4 5.38 L5.0 4.78 C5.3 4.5 5.44 4.08 5.35 3.65 L4.97 1.8 C4.85 1.32 4.45 1 3.95 1 Z" fill={c} />
    </Svg>
  )
  if (type === 'mail') return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Rect x={1} y={2.5} width={10} height={7} rx={1} fill="none" stroke={c} strokeWidth={1} />
      <Path d="M1.4 3.2 L6 6.4 L10.6 3.2" fill="none" stroke={c} strokeWidth={1} />
    </Svg>
  )
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path d="M4.7 7.3 L7.3 4.7" fill="none" stroke={c} strokeWidth={1.1} strokeLinecap="round" />
      <Path d="M5.2 3.5 L6.2 2.5 C7.2 1.5 8.7 1.5 9.5 2.5 C10.4 3.4 10.4 4.8 9.5 5.7 L8.5 6.7" fill="none" stroke={c} strokeWidth={1.1} strokeLinecap="round" />
      <Path d="M6.8 8.5 L5.8 9.5 C4.8 10.5 3.3 10.5 2.5 9.5 C1.6 8.6 1.6 7.2 2.5 6.3 L3.5 5.3" fill="none" stroke={c} strokeWidth={1.1} strokeLinecap="round" />
    </Svg>
  )
}

function AuroraResume({ data }: { data: ResumeData }) {
  const contacts = [
    data.location ? { icon: 'pin'   as const, val: data.location } : null,
    data.phone    ? { icon: 'phone' as const, val: data.phone }    : null,
    data.email    ? { icon: 'mail'  as const, val: data.email }    : null,
    data.linkedin ? { icon: 'link'  as const, val: data.linkedin } : null,
    data.github   ? { icon: 'link'  as const, val: data.github }   : null,
  ].filter(Boolean) as { icon: 'pin' | 'phone' | 'mail' | 'link'; val: string }[]

  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  const renderExp = (exp: ResumeData['experience'][0], key: number) => (
    <View key={key} style={auroraStyles.expRow} wrap={false}>
      <View style={auroraStyles.expLeft}>
        <Text style={auroraStyles.expMeta}>{exp.role}</Text>
        <Text style={auroraStyles.expMeta}>{exp.period}</Text>
      </View>
      <View style={auroraStyles.expRight}>
        <Text style={auroraStyles.expCompany}>{exp.company}</Text>
        <View style={auroraStyles.bulletList}>
          {exp.achievements.map((a, j) => (
            <View key={j} style={auroraStyles.bullet}>
              <Text style={auroraStyles.bulletDot}>•</Text>
              <Text style={auroraStyles.bulletText}>{a}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={auroraStyles.page}>
        {/* Декоративные aurora-блобы — слой под текстом (PNG обрезаны под границы) */}
        <Image src="/templates/aurora-b1.png" style={auroraStyles.b1} />
        <Image src="/templates/aurora-b2.png" style={auroraStyles.b2} />
        {/* b3 — якорится к дивайдеру перед футером (см. ниже), не сюда */}
        {/* b4 — низ страницы: прячем, если резюме на 2+ страниц */}
        <View
          fixed
          style={auroraStyles.b4}
          render={(p: any) =>
            p.totalPages === 1
              ? <Image src="/templates/aurora-b4.png" style={{ width: '100%', height: '100%' }} />
              : null
          }
        />

        <View style={auroraStyles.root}>
          {/* Top spacer for continuation pages (react-pdf doesn't re-apply padding on wrap) */}
          <View fixed render={({ pageNumber }) => (pageNumber > 1 ? <View style={{ height: 30 }} /> : null)} />
          {/* Header */}
          <View style={auroraStyles.header}>
            <Text style={auroraStyles.name}>{data.name}</Text>
            <Text style={auroraStyles.role}>{data.title}</Text>
          </View>
          <View style={auroraStyles.topRule} />

          {/* Summary */}
          {data.summary ? (
            <View style={auroraStyles.sectionIndent}>
              <Text style={auroraStyles.heading}>Summary</Text>
              <Text style={auroraStyles.body}>{data.summary}</Text>
            </View>
          ) : null}

          {/* Experience */}
          {data.experience.length > 0 && (
            <View style={auroraStyles.expSection}>
              <View style={auroraStyles.expHeadWrap}>
                <Text style={auroraStyles.heading}>Experience</Text>
              </View>
              <View style={auroraStyles.expRows}>
                {data.experience.map((exp, i) => renderExp(exp, i))}
              </View>
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View style={auroraStyles.sectionIndent}>
              <Text style={auroraStyles.heading}>Education</Text>
              {data.education.map((ed, i) => (
                <View key={i} style={{ gap: 8 }}>
                  <Text style={auroraStyles.eduInst}>{ed.institution}</Text>
                  <Text style={auroraStyles.eduDeg}>{ed.degree}</Text>
                </View>
              ))}
            </View>
          )}

          {/* b3 (green) anchored so its bottom sits exactly on the divider, whatever the content height */}
          <View style={auroraStyles.ruleWrap}>
            <Image src="/templates/aurora-b3.png" style={auroraStyles.b3} />
            <View style={auroraStyles.fullRule} />
          </View>

          {/* Footer: Contact / Languages / Skills */}
          <View style={auroraStyles.footer}>
            <View style={auroraStyles.fCol}>
              <Text style={auroraStyles.heading}>Contact</Text>
              <View style={auroraStyles.fList}>
                {contacts.map((c, i) => (
                  <View key={i} style={auroraStyles.contactRow}>
                    <AuroraIcon type={c.icon} />
                    <Text style={auroraStyles.contactText}>{c.val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {data.languages && data.languages.length > 0 && (
              <View style={auroraStyles.fCol}>
                <Text style={auroraStyles.heading}>Languages</Text>
                <View style={auroraStyles.fList}>
                  {data.languages.map((l, i) => {
                    const { name, level } = langParts(l)
                    return (
                      <View key={i} style={auroraStyles.langRow}>
                        <Text style={auroraStyles.langName}>{name}</Text>
                        {level ? <Text style={auroraStyles.langLevel}>{level}</Text> : null}
                      </View>
                    )
                  })}
                </View>
              </View>
            )}

            {skills.length > 0 && (
              <View style={auroraStyles.fCol}>
                <Text style={auroraStyles.heading}>Skills</Text>
                <View style={auroraStyles.skillsWrap}>
                  {skills.map((s, i) => (
                    <Text key={i} style={auroraStyles.skill}>{s}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ─── Шаблон VOLT ─────────────────────────────────────────────────────────────
// Volt-жёлтый фон (#E6FF00) + чёрные декоративные фигуры, белые карточки с
// зазорами 2px. Шрифт Poppins. Figma 595×842, контент left:46 top:56 w:501.
// Декорации — прозрачный PNG слоем под карточками (добавляется отдельно).

const VOLT_BG = '#E6FF00'
const VOLT_INK = '#111111'

const voltStyles = StyleSheet.create({
  // padding on Page = same content box (501×730) with 56/46 margins on EVERY page
  page:        { fontFamily: 'Poppins', backgroundColor: VOLT_BG, padding: '56 48 56 46' },
  deco:        { position: 'absolute', top: 0, left: 0 },
  // Frame 207: fills the page content box (730 per page via Page padding); cards stretch to bottom
  root:        { flexDirection: 'column', gap: 2, flexGrow: 1 },
  // Cards
  headerCard:  { backgroundColor: '#fff', padding: 20 },
  card:        { backgroundColor: '#fff', padding: 20, gap: 6 },
  sidebar:     { backgroundColor: '#fff', width: 172, padding: 20 },
  bodyRow:     { flexDirection: 'row', gap: 2, alignItems: 'stretch', flexGrow: 1 },
  // right column is one white surface (fills to content height); 2px yellow dividers between cards
  rightCol:    { width: 327, flexDirection: 'column', backgroundColor: '#fff' },
  cardPlain:   { padding: 20, gap: 6 },
  vDiv:        { height: 2, backgroundColor: VOLT_BG },
  sideInner:   { gap: 16, flex: 1 },
  // Type
  name:        { fontFamily: 'Poppins', fontSize: 32, fontWeight: 700, lineHeight: 1.5, color: VOLT_INK },
  role:        { fontFamily: 'Poppins', fontSize: 26, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.5, color: VOLT_INK },
  h:           { fontFamily: 'Poppins', fontSize: 16, fontWeight: 700, lineHeight: 1.5, color: VOLT_INK },
  label:       { fontSize: 10, fontWeight: 600, lineHeight: 1.5, color: VOLT_INK },
  val:         { fontSize: 10, fontWeight: 400, lineHeight: 1.5, color: VOLT_INK },
  body:        { fontSize: 10, fontWeight: 400, lineHeight: 1.5, color: VOLT_INK },
  skill:       { fontSize: 10, fontWeight: 600, lineHeight: 1.5, color: VOLT_INK },
  expTitle:    { fontSize: 10, fontWeight: 600, lineHeight: 1.5, color: VOLT_INK },
  // Sections / groups
  section:     { gap: 6 },
  contactList: { gap: 12 },
  contactItem: { gap: 1 },
  skillsWrap:  { flexDirection: 'row', flexWrap: 'wrap', rowGap: 3, columnGap: 10 },
  langList:    { gap: 3 },
  expList:     { gap: 16 },
  expItem:     { gap: 6 },
  expHead:     { gap: 1 },
  bulletList:  { gap: 3 },
  bullet:      { flexDirection: 'row', gap: 5 },
  bulletDot:   { fontSize: 10, lineHeight: 1.5, color: VOLT_INK },
  bulletText:  { fontSize: 10, fontWeight: 400, lineHeight: 1.5, color: VOLT_INK, flex: 1 },
  eduList:     { gap: 16 },
})

// Exact decoration layer from Figma (bg.svg) + asterisk (star.svg), fixed on every page
function VoltDeco() {
  const c = VOLT_INK
  return (
    <Svg width={595} height={841} viewBox="0 0 595 842" style={voltStyles.deco} fixed>
      {/* right waves */}
      <Path d="M643.828 322.425V337.242C640.021 337.242 638.541 338.199 635.858 339.925C632.553 342.056 628.035 344.966 619.857 344.966C611.679 344.966 607.161 342.046 603.856 339.925C601.173 338.199 599.693 337.242 595.886 337.242C592.078 337.242 590.598 338.199 587.915 339.925C584.61 342.056 580.092 344.966 571.914 344.966C563.736 344.966 559.218 342.046 555.913 339.925C553.23 338.199 551.751 337.242 547.943 337.242C544.135 337.242 542.655 338.199 539.972 339.925C536.667 342.056 532.149 344.966 523.971 344.966C515.793 344.966 511.275 342.046 507.971 339.925C505.288 338.199 503.808 337.242 500 337.242V322.425C508.178 322.425 512.696 325.345 516.001 327.466C518.684 329.192 520.164 330.149 523.971 330.149C527.779 330.149 529.259 329.192 531.942 327.466C535.247 325.335 539.765 322.425 547.943 322.425C556.121 322.425 560.639 325.345 563.943 327.466C566.627 329.192 568.106 330.149 571.914 330.149C575.722 330.149 577.202 329.192 579.885 327.466C583.19 325.335 587.708 322.425 595.886 322.425C604.063 322.425 608.581 325.345 611.886 327.466C614.569 329.192 616.049 330.149 619.857 330.149C623.665 330.149 625.144 329.192 627.828 327.466C631.132 325.335 635.65 322.425 643.828 322.425Z" fill={c} />
      <Path d="M643.828 291.212V306.029C640.021 306.029 638.541 306.986 635.858 308.712C632.553 310.843 628.035 313.753 619.857 313.753C611.679 313.753 607.161 310.833 603.856 308.712C601.173 306.986 599.693 306.029 595.886 306.029C592.078 306.029 590.598 306.986 587.915 308.712C584.61 310.843 580.092 313.753 571.914 313.753C563.736 313.753 559.218 310.833 555.913 308.712C553.23 306.986 551.751 306.029 547.943 306.029C544.135 306.029 542.655 306.986 539.972 308.712C536.667 310.843 532.149 313.753 523.971 313.753C515.793 313.753 511.275 310.833 507.971 308.712C505.288 306.986 503.808 306.029 500 306.029V291.212C508.178 291.212 512.696 294.132 516.001 296.253C518.684 297.979 520.164 298.936 523.971 298.936C527.779 298.936 529.259 297.979 531.942 296.253C535.247 294.122 539.765 291.212 547.943 291.212C556.121 291.212 560.639 294.132 563.943 296.253C566.627 297.979 568.106 298.936 571.914 298.936C575.722 298.936 577.202 297.979 579.885 296.253C583.19 294.122 587.708 291.212 595.886 291.212C604.063 291.212 608.581 294.132 611.886 296.253C614.569 297.979 616.049 298.936 619.857 298.936C623.665 298.936 625.144 297.979 627.828 296.253C631.132 294.122 635.65 291.212 643.828 291.212Z" fill={c} />
      <Path d="M643.828 260V274.817C640.021 274.817 638.541 275.774 635.858 277.5C632.553 279.631 628.035 282.541 619.857 282.541C611.679 282.541 607.161 279.621 603.856 277.5C601.173 275.774 599.693 274.817 595.886 274.817C592.078 274.817 590.598 275.774 587.915 277.5C584.61 279.631 580.092 282.541 571.914 282.541C563.736 282.541 559.218 279.621 555.913 277.5C553.23 275.774 551.751 274.817 547.943 274.817C544.135 274.817 542.655 275.774 539.972 277.5C536.667 279.631 532.149 282.541 523.971 282.541C515.793 282.541 511.275 279.621 507.971 277.5C505.288 275.774 503.808 274.817 500 274.817V260C508.178 260 512.696 262.92 516.001 265.041C518.684 266.767 520.164 267.724 523.971 267.724C527.779 267.724 529.259 266.767 531.942 265.041C535.247 262.91 539.765 260 547.943 260C556.121 260 560.639 262.92 563.943 265.041C566.627 266.767 568.106 267.724 571.914 267.724C575.722 267.724 577.202 266.767 579.885 265.041C583.19 262.91 587.708 260 595.886 260C604.063 260 608.581 262.92 611.886 265.041C614.569 266.767 616.049 267.724 619.857 267.724C623.665 267.724 625.144 266.767 627.828 265.041C631.132 262.91 635.65 260 643.828 260Z" fill={c} />
      {/* left waves */}
      <Path d="M66.8283 586.424V601.241C63.0205 601.241 61.5408 602.198 58.8576 603.924C55.5529 606.055 51.0348 608.965 42.8569 608.965C34.679 608.965 30.161 606.045 26.8563 603.924C24.1731 602.198 22.6933 601.241 18.8855 601.241C15.0777 601.241 13.598 602.198 10.9148 603.924C7.61012 606.055 3.09206 608.965 -5.08584 608.965C-13.2637 608.965 -17.7818 606.045 -21.0865 603.924C-23.7697 602.198 -25.2494 601.241 -29.0572 601.241C-32.865 601.241 -34.3447 602.198 -37.028 603.924C-40.3327 606.055 -44.8507 608.965 -53.0286 608.965C-61.2065 608.965 -65.7246 606.045 -69.0293 603.924C-71.7125 602.198 -73.1922 601.241 -77 601.241V586.424C-68.8221 586.424 -64.304 589.344 -60.9993 591.465C-58.3161 593.191 -56.8364 594.148 -53.0286 594.148C-49.2208 594.148 -47.7411 593.191 -45.0579 591.465C-41.7532 589.334 -37.2351 586.424 -29.0572 586.424C-20.8793 586.424 -16.3613 589.344 -13.0566 591.465C-10.3734 593.191 -8.89364 594.148 -5.08584 594.148C-1.27804 594.148 0.201681 593.191 2.8849 591.465C6.1896 589.334 10.7077 586.424 18.8855 586.424C27.0634 586.424 31.5815 589.344 34.8862 591.465C37.5694 593.191 39.0491 594.148 42.8569 594.148C46.6647 594.148 48.1445 593.191 50.8277 591.465C54.1324 589.334 58.6504 586.424 66.8283 586.424Z" fill={c} />
      <Path d="M66.8283 555.212V570.029C63.0205 570.029 61.5408 570.986 58.8576 572.712C55.5529 574.843 51.0348 577.753 42.8569 577.753C34.679 577.753 30.161 574.833 26.8563 572.712C24.1731 570.986 22.6933 570.029 18.8855 570.029C15.0777 570.029 13.598 570.986 10.9148 572.712C7.61012 574.843 3.09206 577.753 -5.08584 577.753C-13.2637 577.753 -17.7818 574.833 -21.0865 572.712C-23.7697 570.986 -25.2494 570.029 -29.0572 570.029C-32.865 570.029 -34.3447 570.986 -37.028 572.712C-40.3327 574.843 -44.8507 577.753 -53.0286 577.753C-61.2065 577.753 -65.7246 574.833 -69.0293 572.712C-71.7125 570.986 -73.1922 570.029 -77 570.029V555.212C-68.8221 555.212 -64.304 558.132 -60.9993 560.253C-58.3161 561.979 -56.8364 562.936 -53.0286 562.936C-49.2208 562.936 -47.7411 561.979 -45.0579 560.253C-41.7532 558.122 -37.2351 555.212 -29.0572 555.212C-20.8793 555.212 -16.3613 558.132 -13.0566 560.253C-10.3734 561.979 -8.89364 562.936 -5.08584 562.936C-1.27804 562.936 0.201681 561.979 2.8849 560.253C6.1896 558.122 10.7077 555.212 18.8855 555.212C27.0634 555.212 31.5815 558.132 34.8862 560.253C37.5694 561.979 39.0491 562.936 42.8569 562.936C46.6647 562.936 48.1445 561.979 50.8277 560.253C54.1324 558.122 58.6504 555.212 66.8283 555.212Z" fill={c} />
      <Path d="M66.8283 524V538.817C63.0205 538.817 61.5408 539.774 58.8576 541.5C55.5529 543.631 51.0348 546.541 42.8569 546.541C34.679 546.541 30.161 543.621 26.8563 541.5C24.1731 539.774 22.6933 538.817 18.8855 538.817C15.0777 538.817 13.598 539.774 10.9148 541.5C7.61012 543.631 3.09206 546.541 -5.08584 546.541C-13.2637 546.541 -17.7818 543.621 -21.0865 541.5C-23.7697 539.774 -25.2494 538.817 -29.0572 538.817C-32.865 538.817 -34.3447 539.774 -37.028 541.5C-40.3327 543.631 -44.8507 546.541 -53.0286 546.541C-61.2065 546.541 -65.7246 543.621 -69.0293 541.5C-71.7125 539.774 -73.1922 538.817 -77 538.817V524C-68.8221 524 -64.304 526.92 -60.9993 529.041C-58.3161 530.767 -56.8364 531.724 -53.0286 531.724C-49.2208 531.724 -47.7411 530.767 -45.0579 529.041C-41.7532 526.91 -37.2351 524 -29.0572 524C-20.8793 524 -16.3613 526.92 -13.0566 529.041C-10.3734 530.767 -8.89364 531.724 -5.08584 531.724C-1.27804 531.724 0.201681 530.767 2.8849 529.041C6.1896 526.91 10.7077 524 18.8855 524C27.0634 524 31.5815 526.92 34.8862 529.041C37.5694 530.767 39.0491 531.724 42.8569 531.724C46.6647 531.724 48.1445 530.767 50.8277 529.041C54.1324 526.91 58.6504 524 66.8283 524Z" fill={c} />
      {/* bottom-right diagonal stripes */}
      <Path d="M439.187 842.566V684.187H597.566V665H420V842.566H439.187Z" fill={c} />
      <Path d="M469.738 842.565V714.738H597.566V695.551H450.551V842.565H469.738Z" fill={c} />
      <Path d="M500.289 842.566V745.29H597.566V726.093H481.102V842.566H500.289Z" fill={c} />
      {/* top-left vertical bars */}
      <Path d="M132.369 0V158.369H-26V177.566H151.566V0H132.369Z" fill={c} />
      <Path d="M101.828 0V127.828H-26V147.015H121.015V0H101.828Z" fill={c} />
      <Path d="M71.2765 0V97.2765H-26V116.463H90.4635V0H71.2765Z" fill={c} />
      {/* bottom-left plus signs */}
      <Path d="M83.5986 799.118H64.4807V780H58.1179V799.118H39V805.481H58.1179V824.599H64.4807V805.481H83.5986V799.118Z" fill={c} />
      <Path d="M143.882 799.118H124.764V780H118.402V799.118H99.2837V805.481H118.402V824.599H124.764V805.481H143.882V799.118Z" fill={c} />
      <Path d="M204.166 799.118H185.048V780H178.685V799.118H159.567V805.481H178.685V824.599H185.048V805.481H204.166V799.118Z" fill={c} />
    </Svg>
  )
}

// Asterisk (star.svg) — rendered ON TOP of the content, top-right (512,24)
function VoltStar() {
  return (
    <Svg width={595} height={841} viewBox="0 0 595 842" style={voltStyles.deco} fixed>
      <G transform="translate(512, 24)">
        <Path d="M66 28.2957H44.36L59.66 12.998L53 6.33904L37.7 21.6367V0H28.29V21.6367L12.99 6.33904L6.32996 12.998L21.6299 28.2957H0V37.7043H21.6299L6.32996 53.002L12.99 59.661L28.29 44.3633V66H37.7V44.3633L53 59.661L59.66 53.002L44.36 37.7043H66V28.2957Z" fill={VOLT_INK} />
      </G>
    </Svg>
  )
}

function VoltResume({ data }: { data: ResumeData }) {
  const contacts = [
    data.email    ? { label: 'Email',     val: data.email }    : null,
    data.location ? { label: 'Address',   val: data.location } : null,
    data.phone    ? { label: 'Phone',     val: data.phone }    : null,
    data.linkedin ? { label: 'Linkedin',  val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio', val: data.github }   : null,
  ].filter(Boolean) as { label: string; val: string }[]

  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  return (
    <Document>
      <Page size="A4" style={voltStyles.page}>
        {/* Декоративные чёрные фигуры (SVG, точно из Figma) — fixed, на каждой странице */}
        <VoltDeco />

        <View style={voltStyles.root}>
          {/* Header card */}
          <View style={voltStyles.headerCard}>
            <Text style={voltStyles.name}>{data.name}</Text>
            <Text style={voltStyles.role}>{data.title}</Text>
          </View>

          {/* Body: sidebar + right column */}
          <View style={voltStyles.bodyRow}>
            {/* Sidebar */}
            <View style={voltStyles.sidebar}>
              <View style={voltStyles.sideInner}>
                {contacts.length > 0 && (
                  <View style={voltStyles.section}>
                    <Text style={voltStyles.h}>Personal info</Text>
                    <View style={voltStyles.contactList}>
                      {contacts.map((c, i) => (
                        <View key={i} style={voltStyles.contactItem}>
                          <Text style={voltStyles.label}>{c.label}</Text>
                          <Text style={voltStyles.val}>{c.val}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {skills.length > 0 && (
                  <View style={voltStyles.section}>
                    <Text style={voltStyles.h}>Skills</Text>
                    <View style={voltStyles.skillsWrap}>
                      {skills.map((s, i) => <Text key={i} style={voltStyles.skill}>{s}</Text>)}
                    </View>
                  </View>
                )}

                {data.languages && data.languages.length > 0 && (
                  <View style={voltStyles.section}>
                    <Text style={voltStyles.h}>Languages</Text>
                    <View style={voltStyles.langList}>
                      {data.languages.map((l, i) => <Text key={i} style={voltStyles.skill}>{l}</Text>)}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Right column */}
            <View style={voltStyles.rightCol}>
              {/* re-apply top padding on continuation pages (white block spans pages) */}
              <View fixed render={({ pageNumber }) => (pageNumber > 1 ? <View style={{ height: 20 }} /> : null)} />
              {data.summary ? (
                <View style={voltStyles.cardPlain}>
                  <Text style={voltStyles.h}>Summary</Text>
                  <Text style={voltStyles.body}>{data.summary}</Text>
                </View>
              ) : null}

              {data.summary && data.experience.length > 0 ? <View style={voltStyles.vDiv} /> : null}

              {data.experience.length > 0 && (
                <View style={voltStyles.cardPlain}>
                  <Text style={voltStyles.h}>Work Experience</Text>
                  <View style={voltStyles.expList}>
                    {data.experience.map((exp, i) => (
                      <View key={i} style={voltStyles.expItem} wrap={false}>
                        <View style={voltStyles.expHead}>
                          <Text style={voltStyles.expTitle}>{exp.role} · {exp.company}</Text>
                          <Text style={voltStyles.expTitle}>{exp.period}</Text>
                        </View>
                        <View style={voltStyles.bulletList}>
                          {exp.achievements.map((a, j) => (
                            <View key={j} style={voltStyles.bullet}>
                              <Text style={voltStyles.bulletDot}>•</Text>
                              <Text style={voltStyles.bulletText}>{a}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {data.experience.length > 0 && data.education.length > 0 ? <View style={voltStyles.vDiv} /> : null}

              {data.education.length > 0 && (
                <View style={voltStyles.cardPlain}>
                  <Text style={voltStyles.h}>Education</Text>
                  <View style={voltStyles.eduList}>
                    {data.education.map((ed, i) => (
                      <View key={i} style={{ gap: 3 }}>
                        <Text style={voltStyles.expTitle}>{ed.degree}</Text>
                        <Text style={voltStyles.expTitle}>{ed.institution}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Звезда — поверх контента */}
        <VoltStar />
      </Page>
    </Document>
  )
}

// ─── Шаблон ATELIER ──────────────────────────────────────────────────────────
// Диагональный сине-фиолетовый градиент (#fff→#d7deff→#fff), единые чернила
// #505889. Слева — колонка в рамке (Имя/Summary/Experience/Education), справа —
// Contact/Languages/Skills. Шрифты: Collingar (заголовки/имя) + Montserrat (body).
// Figma 595×842, внешний отступ 28, левая колонка 345 (padding 24), правая 170.

const ATE_INK   = '#505889'
const ATE_LINE  = '#9aa1c4'   // единый цвет рамки и разделителей (≈ ink на градиенте)
const ATE_LW    = 1           // единая толщина рамки и разделителей

// геометрия бокса на странице (fixed-координаты, не зависят от Page padding)
const ATE_PAD = 28            // Page padding / внешний отступ
const ATE_BOXW = 345          // ширина левой колонки
const ATE_X1 = ATE_PAD                // левый край бокса
const ATE_X2 = ATE_PAD + ATE_BOXW     // правый край бокса (373)
const ATE_PAGEH = 841.89      // высота A4 в pt
const ATE_YTOP = ATE_PAD              // верх бокса (28)
const ATE_YBOT = ATE_PAGEH - ATE_PAD  // низ бокса (813.89)

// 4-лучевая «искра» (✦) — перед заголовками секций и элементами Contact/Languages.
// dy — вертикальный сдвиг для оптического центрирования с текстом.
function AtelierSpark({ w = 16, h = 18, dy = 0 }: { w?: number; h?: number; dy?: number }) {
  return (
    <Svg width={w} height={h} viewBox="0 0 16 18" style={{ marginTop: dy }}>
      <Path
        d="M8 0 Q8.7 8.4 16 9 Q8.7 9.6 8 18 Q7.3 9.6 0 9 Q7.3 8.4 8 0 Z"
        fill={ATE_INK}
      />
    </Svg>
  )
}

// Диагональный градиентный фон на всю страницу (fixed → повторяется на каждой)
function AtelierBg() {
  return (
    <Svg width={595} height={841} viewBox="0 0 595 842" style={atelierStyles.bg} fixed>
      <Defs>
        <LinearGradient id="ateGrad" x1="0" y1="842" x2="595" y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0"    stopColor="#ffffff" />
          <Stop offset="0.46" stopColor="#d7deff" />
          <Stop offset="1"    stopColor="#ffffff" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="595" height="842" fill="url(#ateGrad)" />
    </Svg>
  )
}

// Рамка левой колонки как fixed-слой. На разрыве страницы вертикальные линии уходят
// в край страницы (нет горизонтальной крышки): верх рисуется только на 1-й странице,
// низ — только на последней; на одностраничном — полный короб (totalPages надёжнее, чем
// pageNumber===1 для fixed-слоя, gotcha #3).
function AtelierFrame() {
  const lw = ATE_LW
  // Линии — абсолютно спозиционированные View внутри fixed-слоя (Svg в render обрезался
  // по высоте контента, а View — нет). На разрыве вертикали уходят в край страницы (нет
  // горизонтальной крышки): верх рисуется только на 1-й странице, низ — только на последней.
  return (
    <View
      fixed
      style={{ position: 'absolute', top: 0, left: 0, width: 595, height: 841 }}
      render={({ pageNumber, totalPages }: any) => {
        const isFirst = totalPages === 1 || pageNumber === 1
        const isLast  = totalPages === 1 || pageNumber === totalPages
        const yTop = isFirst ? ATE_YTOP : 0
        const yBot = isLast ? ATE_YBOT : 841   // на разрыве — до края страницы
        const h = yBot - yTop
        const line = { position: 'absolute' as const, backgroundColor: ATE_LINE }
        return (
          <>
            <View style={{ ...line, left: ATE_X1,      top: yTop, width: lw, height: h }} />
            <View style={{ ...line, left: ATE_X2 - lw, top: yTop, width: lw, height: h }} />
            {isFirst && <View style={{ ...line, left: ATE_X1, top: ATE_YTOP,      width: ATE_BOXW, height: lw }} />}
            {isLast  && <View style={{ ...line, left: ATE_X1, top: ATE_YBOT - lw, width: ATE_BOXW, height: lw }} />}
          </>
        )
      }}
    />
  )
}

const atelierStyles = StyleSheet.create({
  // Page padding 28 = внешний отступ макета; повторяется на каждой странице (gotcha #4)
  page:        { fontFamily: 'Montserrat', padding: ATE_PAD, color: ATE_INK },
  bg:          { position: 'absolute', top: 0, left: 0 },
  root:        { flexDirection: 'row', gap: 24 },

  // ЛЕВАЯ колонка (рамка рисуется отдельным fixed-слоем AtelierFrame)
  leftCol:     { width: ATE_BOXW, padding: 24, flexDirection: 'column' },
  leftInner:   { flexDirection: 'column', gap: 24 },
  // ПРАВАЯ колонка
  rightCol:    { width: 170, paddingVertical: 24, flexDirection: 'column' },
  rightInner:  { flexDirection: 'column', gap: 40 },

  // Хедер (имя/роль)
  header:      { gap: 8 },
  name:        { fontFamily: 'Collingar', fontSize: 48, lineHeight: 0.9, color: ATE_INK },
  role:        { fontFamily: 'Montserrat', fontSize: 14, fontWeight: 600, color: ATE_INK },

  // Разделители (тот же цвет/толщина, что у рамки)
  divLeft:     { height: ATE_LW, backgroundColor: ATE_LINE, marginHorizontal: -24 }, // во всю ширину бокса
  divRight:    { height: ATE_LW, backgroundColor: ATE_LINE },

  // Ячейка под искру (16pt) — центрирует маленькую искру под центром большой
  iconCell:    { width: 16, alignItems: 'center', justifyContent: 'center' },
  // Заголовок секции (искра + Collingar 24)
  secHead:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading:     { fontFamily: 'Collingar', fontSize: 24, lineHeight: 1, color: ATE_INK },
  section:     { gap: 12 },

  body:        { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 500, lineHeight: 1.5, color: ATE_INK },

  // Experience
  expList:     { gap: 12 },
  expItem:     { gap: 4 },
  expTitle:    { fontFamily: 'Montserrat', fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: ATE_INK },
  expPeriod:   { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 600, lineHeight: 1.5, color: ATE_INK },
  bullet:      { flexDirection: 'row', gap: 6 },
  bulletDot:   { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 500, lineHeight: 1.5, color: ATE_INK },
  bulletText:  { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 500, lineHeight: 1.5, color: ATE_INK, flex: 1 },

  // Education
  eduItem:     { gap: 5 },
  eduInst:     { fontFamily: 'Montserrat', fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: ATE_INK },
  eduDeg:      { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 500, lineHeight: 1.5, color: ATE_INK },

  // Contact / Languages
  itemList:    { gap: 8 },
  item:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemText:    { fontFamily: 'Montserrat', fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: ATE_INK, flex: 1 },

  // Skills
  skillsList:  { gap: 4 },
  skill:       { fontFamily: 'Montserrat', fontSize: 11, fontWeight: 500, lineHeight: 1.3, color: ATE_INK },
})

function AtelierResume({ data }: { data: ResumeData }) {
  const contacts = [
    data.phone    ? data.phone    : null,
    data.email    ? data.email    : null,
    data.location ? data.location : null,
    data.linkedin ? data.linkedin : null,
    data.github   ? data.github   : null,
  ].filter(Boolean) as string[]

  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  const SecHead = ({ children }: { children: React.ReactNode }) => (
    <View style={atelierStyles.secHead}>
      <View style={atelierStyles.iconCell}><AtelierSpark dy={-4.5} /></View>
      <Text style={atelierStyles.heading}>{children}</Text>
    </View>
  )

  const ItemRow = ({ children }: { children: React.ReactNode }) => (
    <View style={atelierStyles.item}>
      <View style={atelierStyles.iconCell}><AtelierSpark w={9} h={10} dy={0.5} /></View>
      <Text style={atelierStyles.itemText}>{children}</Text>
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={atelierStyles.page}>
        <AtelierBg />
        <AtelierFrame />

        <View style={atelierStyles.root}>
          {/* ЛЕВАЯ колонка */}
          <View style={atelierStyles.leftCol}>
            {/* re-pad верх рамки на страницах продолжения (gotcha #4) */}
            <View fixed render={({ pageNumber }) => (pageNumber > 1 ? <View style={{ height: 24 }} /> : null)} />

            <View style={atelierStyles.leftInner}>
            {/* Хедер */}
            <View style={atelierStyles.header}>
              <Text style={atelierStyles.name}>{data.name}</Text>
              {data.title ? <Text style={atelierStyles.role}>{data.title}</Text> : null}
            </View>

            {data.summary ? (
              <>
                <View style={atelierStyles.divLeft} />
                <View style={atelierStyles.section}>
                  <SecHead>Summary</SecHead>
                  <Text style={atelierStyles.body}>{data.summary}</Text>
                </View>
              </>
            ) : null}

            {data.experience.length > 0 ? (
              <>
                <View style={atelierStyles.divLeft} />
                <View style={atelierStyles.section}>
                  <SecHead>Experience</SecHead>
                  <View style={atelierStyles.expList}>
                    {data.experience.map((exp, i) => (
                      <View key={i} style={atelierStyles.expItem} wrap={false}>
                        <Text style={atelierStyles.expTitle}>{exp.role}{exp.company ? ` · ${exp.company}` : ''}</Text>
                        {exp.period ? <Text style={atelierStyles.expPeriod}>{exp.period}</Text> : null}
                        {exp.achievements.map((a, j) => (
                          <View key={j} style={atelierStyles.bullet}>
                            <Text style={atelierStyles.bulletDot}>•</Text>
                            <Text style={atelierStyles.bulletText}>{a}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}

            {data.education.length > 0 ? (
              <>
                <View style={atelierStyles.divLeft} />
                <View style={atelierStyles.section}>
                  <SecHead>Education</SecHead>
                  <View style={{ gap: 12 }}>
                    {data.education.map((ed, i) => (
                      <View key={i} style={atelierStyles.eduItem}>
                        <Text style={atelierStyles.eduInst}>{ed.institution}</Text>
                        {ed.degree ? <Text style={atelierStyles.eduDeg}>{ed.degree}</Text> : null}
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : null}
            </View>
          </View>

          {/* ПРАВАЯ колонка */}
          <View style={atelierStyles.rightCol}>
            <View fixed render={({ pageNumber }) => (pageNumber > 1 ? <View style={{ height: 24 }} /> : null)} />

            <View style={atelierStyles.rightInner}>
            {contacts.length > 0 && (
              <View style={atelierStyles.section}>
                <SecHead>Contact</SecHead>
                <View style={atelierStyles.itemList}>
                  {contacts.map((c, i) => <ItemRow key={i}>{c}</ItemRow>)}
                </View>
              </View>
            )}

            {data.languages && data.languages.length > 0 && (
              <>
                <View style={atelierStyles.divRight} />
                <View style={atelierStyles.section}>
                  <SecHead>Languages</SecHead>
                  <View style={atelierStyles.itemList}>
                    {data.languages.map((l, i) => <ItemRow key={i}>{l}</ItemRow>)}
                  </View>
                </View>
              </>
            )}

            {skills.length > 0 && (
              <>
                <View style={atelierStyles.divRight} />
                <View style={atelierStyles.section}>
                  <SecHead>Skills</SecHead>
                  <View style={atelierStyles.skillsList}>
                    {skills.map((s, i) => <Text key={i} style={atelierStyles.skill}>{s}</Text>)}
                  </View>
                </View>
              </>
            )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ─── Шаблон 2: BUSINESS ──────────────────────────────────────────────────────
// Тёмная боковая колонка, акцентный цвет #1e40af (тёмно-синий).
// Классика для корпоративного рынка и финансов.

const BIZ_BLUE = '#1e3a5f'
const BIZ_ACCENT = '#2563eb'

const bizStyles = StyleSheet.create({
  page:        { fontFamily: 'Roboto', backgroundColor: '#ffffff', flexDirection: 'row' },
  sidebar:     { width: 185, backgroundColor: BIZ_BLUE, padding: '44 20 44 20', flexDirection: 'column' },
  main:        { flex: 1, padding: '44 36 44 32' },
  // Sidebar
  sbName:      { fontSize: 14, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 4 },
  sbTitle:     { fontSize: 9, color: '#93c5fd', textAlign: 'center', marginBottom: 24, letterSpacing: 0.5 },
  sbSection:   { marginBottom: 20 },
  sbSectionT:  { fontSize: 8, fontWeight: 'bold', color: BIZ_ACCENT, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, borderBottom: `0.5 solid ${BIZ_ACCENT}`, paddingBottom: 4 },
  sbItem:      { fontSize: 9, color: '#cbd5e1', marginBottom: 5, lineHeight: 1.5 },
  sbSkill:     { fontSize: 9, color: '#e2e8f0', marginBottom: 6 },
  sbBar:       { height: 3, backgroundColor: '#1e4080', borderRadius: 2, marginBottom: 10 },
  sbBarFill:   { height: 3, backgroundColor: BIZ_ACCENT, borderRadius: 2 },
  // Main
  mainName:    { fontSize: 22, fontWeight: 'bold', color: BIZ_BLUE, marginBottom: 2 },
  mainTitle:   { fontSize: 10.5, color: BIZ_ACCENT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 18 },
  mSection:    { marginBottom: 20 },
  mSectionT:   { fontSize: 9, fontWeight: 'bold', color: BIZ_BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, borderBottom: `1 solid ${BIZ_BLUE}`, paddingBottom: 5 },
  summary:     { fontSize: 10, color: '#374151', lineHeight: 1.7 },
  expHead:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  expCompany:  { fontSize: 11, fontWeight: 'bold', color: BIZ_BLUE },
  expPeriod:   { fontSize: 9, color: '#94a3b8', backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2 },
  expRole:     { fontSize: 9.5, color: BIZ_ACCENT, marginBottom: 6 },
  bullet:      { flexDirection: 'row', marginBottom: 4 },
  bulletDot:   { width: 12, fontSize: 9.5, color: BIZ_ACCENT, marginTop: 1 },
  bulletText:  { fontSize: 9.5, color: '#374151', lineHeight: 1.6, flex: 1 },
  expBlock:    { marginBottom: 16, paddingBottom: 14, borderBottom: '0.5 solid #e2e8f0' },
})

function BusinessResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={bizStyles.page}>

        {/* Sidebar */}
        <View style={bizStyles.sidebar}>
          <Text style={bizStyles.sbName}>{data.name}</Text>
          <Text style={bizStyles.sbTitle}>{data.title}</Text>

          <View style={bizStyles.sbSection}>
            <Text style={bizStyles.sbSectionT}>Contacts</Text>
            {data.email    && <Text style={bizStyles.sbItem}>✉  {data.email}</Text>}
            {data.phone    && <Text style={bizStyles.sbItem}>✆  {data.phone}</Text>}
            {data.location && <Text style={bizStyles.sbItem}>⌖  {data.location}</Text>}
            {data.linkedin && <Link src={toUrl(data.linkedin)} style={bizStyles.sbItem}>in  {data.linkedin}</Link>}
            {data.github   && <Link src={toUrl(data.github)}   style={bizStyles.sbItem}>⌨  {data.github}</Link>}
          </View>

          <View style={bizStyles.sbSection}>
            <Text style={bizStyles.sbSectionT}>Skills</Text>
            {data.skills.technical.slice(0, 8).map((s, i) => (
              <View key={i}>
                <Text style={bizStyles.sbSkill}>{skillName(s)}</Text>
                <View style={bizStyles.sbBar}>
                  <View style={{ ...bizStyles.sbBarFill, width: `${skillLevelPct(s)}%` }} />
                </View>
              </View>
            ))}
          </View>

          <View style={bizStyles.sbSection}>
            <Text style={bizStyles.sbSectionT}>Education</Text>
            {data.education.map((ed, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ ...bizStyles.sbItem, color: '#e2e8f0', fontWeight: 'bold' }}>{ed.institution}</Text>
                <Text style={bizStyles.sbItem}>{ed.degree}</Text>
                <Text style={{ ...bizStyles.sbItem, color: '#64748b' }}>{ed.year}</Text>
              </View>
            ))}
          </View>

          {data.languages && data.languages.length > 0 && (
            <View style={bizStyles.sbSection}>
              <Text style={bizStyles.sbSectionT}>Languages</Text>
              {data.languages.map((l, i) => (
                <Text key={i} style={bizStyles.sbItem}>{l}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Main */}
        <View style={bizStyles.main}>
          <Text style={bizStyles.mainName}>{data.name}</Text>
          <Text style={bizStyles.mainTitle}>{data.title}</Text>

          <View style={bizStyles.mSection}>
            <Text style={bizStyles.mSectionT}>Profile</Text>
            <Text style={bizStyles.summary}>{data.summary}</Text>
          </View>

          <View style={bizStyles.mSection}>
            <Text style={bizStyles.mSectionT}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={bizStyles.expBlock}>
                <View style={bizStyles.expHead}>
                  <Text style={bizStyles.expCompany}>{exp.company}</Text>
                  <Text style={bizStyles.expPeriod}>{exp.period}</Text>
                </View>
                <Text style={bizStyles.expRole}>{exp.role}</Text>
                {exp.achievements.map((ach, j) => (
                  <View key={j} style={bizStyles.bullet}>
                    <Text style={bizStyles.bulletDot}>•</Text>
                    <Text style={bizStyles.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

      </Page>
    </Document>
  )
}

// ─── Шаблон 3: CREATIVE ──────────────────────────────────────────────────────
// Зелёный акцент #059669, крупная типографика, нестандартная вёрстка.
// Для дизайнеров, маркетологов, продуктовых менеджеров.

const CRE_GREEN = '#059669'
const CRE_DARK  = '#064e3b'
const CRE_LIGHT = '#ecfdf5'

const creStyles = StyleSheet.create({
  page:       { fontFamily: 'Roboto', backgroundColor: '#ffffff', paddingTop: 36, paddingLeft: 48, paddingRight: 48 },
  topBand:    { backgroundColor: CRE_DARK, padding: '36 48 32 48', marginTop: -36, marginLeft: -48, marginRight: -48 },
  nameLine:   { flexDirection: 'row', alignItems: 'flex-end', gap: 0, marginBottom: 6 },
  nameFirst:  { fontSize: 34, fontWeight: 'bold', color: '#ffffff', letterSpacing: -0.5 },
  nameLast:   { fontSize: 34, fontWeight: 'bold', color: CRE_GREEN, letterSpacing: -0.5 },
  topTitle:   { fontSize: 12, color: '#6ee7b7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 },
  topContacts:{ flexDirection: 'row', gap: 24 },
  topContact: { fontSize: 9, color: '#a7f3d0' },
  body:       { paddingTop: 32, paddingBottom: 40 },
  twoCol:     { flexDirection: 'row', gap: 32 },
  colLeft:    { flex: 1.6 },
  colRight:   { flex: 1 },
  section:    { marginBottom: 24 },
  sectionLabel:{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionDot: { width: 8, height: 8, backgroundColor: CRE_GREEN, borderRadius: 4 },
  sectionT:   { fontSize: 10, fontWeight: 'bold', color: CRE_DARK, letterSpacing: 1.2, textTransform: 'uppercase' },
  summary:    { fontSize: 10, color: '#374151', lineHeight: 1.75 },
  expBlock:   { marginBottom: 16 },
  expTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  expCo:      { fontSize: 11, fontWeight: 'bold', color: CRE_DARK },
  expBadge:   { fontSize: 8, color: CRE_GREEN, backgroundColor: CRE_LIGHT, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  expRole:    { fontSize: 9.5, color: CRE_GREEN, marginBottom: 6 },
  bullet:     { flexDirection: 'row', marginBottom: 3.5 },
  bulletDot:  { fontSize: 9, color: CRE_GREEN, width: 12, marginTop: 1 },
  bulletText: { fontSize: 9.5, color: '#4b5563', lineHeight: 1.6, flex: 1 },
  skillChip:  { fontSize: 9, color: CRE_DARK, backgroundColor: CRE_LIGHT, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 5, marginRight: 5 },
  softSkill:  { fontSize: 9.5, color: '#374151', marginBottom: 5, paddingLeft: 10, borderLeft: `2 solid ${CRE_GREEN}`, paddingVertical: 1 },
  eduBlock:   { marginBottom: 12, paddingLeft: 10, borderLeft: `2 solid #d1fae5` },
  eduInst:    { fontSize: 10, fontWeight: 'bold', color: CRE_DARK, marginBottom: 1 },
  eduDeg:     { fontSize: 9, color: '#6b7280', marginBottom: 1 },
  eduYear:    { fontSize: 9, color: CRE_GREEN },
})

function CreativeResume({ data }: { data: ResumeData }) {
  const nameParts = data.name.trim().split(' ')
  const firstName = nameParts.slice(0, -1).join(' ') || data.name
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''

  return (
    <Document>
      <Page size="A4" style={creStyles.page}>

        {/* Top band */}
        <View style={creStyles.topBand}>
          <View style={creStyles.nameLine}>
            <Text style={creStyles.nameFirst}>{firstName} </Text>
            <Text style={creStyles.nameLast}>{lastName}</Text>
          </View>
          <Text style={creStyles.topTitle}>{data.title}</Text>
          <View style={creStyles.topContacts}>
            {data.email    && <Text style={creStyles.topContact}>{data.email}</Text>}
            {data.phone    && <Text style={creStyles.topContact}>{data.phone}</Text>}
            {data.location && <Text style={creStyles.topContact}>{data.location}</Text>}
            {data.linkedin && <Link src={toUrl(data.linkedin)} style={creStyles.topContact}>{data.linkedin}</Link>}
            {data.github   && <Link src={toUrl(data.github)}   style={creStyles.topContact}>{data.github}</Link>}
          </View>
        </View>

        {/* Body */}
        <View style={creStyles.body}>
          {/* Summary — full width */}
          <View style={{ marginBottom: 24 }}>
            <View style={creStyles.sectionLabel}>
              <View style={creStyles.sectionDot} />
              <Text style={creStyles.sectionT}>Summary</Text>
            </View>
            <Text style={creStyles.summary}>{data.summary}</Text>
          </View>

          {/* Two columns */}
          <View style={creStyles.twoCol}>

            {/* Left: Experience */}
            <View style={creStyles.colLeft}>
              <View style={creStyles.sectionLabel}>
                <View style={creStyles.sectionDot} />
                <Text style={creStyles.sectionT}>Experience</Text>
              </View>
              {data.experience.map((exp, i) => (
                <View key={i} wrap={false} style={creStyles.expBlock}>
                  <View style={creStyles.expTop}>
                    <Text style={creStyles.expCo}>{exp.company}</Text>
                    <Text style={creStyles.expBadge}>{exp.period}</Text>
                  </View>
                  <Text style={creStyles.expRole}>{exp.role}</Text>
                  {exp.achievements.map((ach, j) => (
                    <View key={j} style={creStyles.bullet}>
                      <Text style={creStyles.bulletDot}>•</Text>
                      <Text style={creStyles.bulletText}>{ach}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {/* Right: Skills + Education */}
            <View style={creStyles.colRight}>
              <View style={{ ...creStyles.section }}>
                <View style={creStyles.sectionLabel}>
                  <View style={creStyles.sectionDot} />
                  <Text style={creStyles.sectionT}>Technical Skills</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {data.skills.technical.map((s, i) => (
                    <Text key={i} style={creStyles.skillChip}>{s}</Text>
                  ))}
                </View>
              </View>

              <View style={creStyles.section}>
                <View style={creStyles.sectionLabel}>
                  <View style={creStyles.sectionDot} />
                  <Text style={creStyles.sectionT}>Soft Skills</Text>
                </View>
                {data.skills.soft.map((s, i) => (
                  <Text key={i} style={creStyles.softSkill}>{s}</Text>
                ))}
              </View>

              <View style={creStyles.section}>
                <View style={creStyles.sectionLabel}>
                  <View style={creStyles.sectionDot} />
                  <Text style={creStyles.sectionT}>Education</Text>
                </View>
                {data.education.map((ed, i) => (
                  <View key={i} style={creStyles.eduBlock}>
                    <Text style={creStyles.eduInst}>{ed.institution}</Text>
                    <Text style={creStyles.eduDeg}>{ed.degree}</Text>
                    <Text style={creStyles.eduYear}>{ed.year}</Text>
                  </View>
                ))}
              </View>

              {data.languages && data.languages.length > 0 && (
                <View style={creStyles.section}>
                  <View style={creStyles.sectionLabel}>
                    <View style={creStyles.sectionDot} />
                    <Text style={creStyles.sectionT}>Languages</Text>
                  </View>
                  {data.languages.map((l, i) => (
                    <Text key={i} style={creStyles.softSkill}>{l}</Text>
                  ))}
                </View>
              )}
            </View>

          </View>
        </View>

      </Page>
    </Document>
  )
}

// ─── Шаблон 4: CORPORATE ─────────────────────────────────────────────────────

const CORP_BLUE  = '#1e3a8a'
const CORP_LIGHT = '#eff6ff'
const CORP_GRAY  = '#64748b'

const corpStyles = StyleSheet.create({
  page:        { fontFamily: 'Roboto', backgroundColor: '#ffffff', paddingTop: 36, paddingLeft: 48, paddingRight: 48 },
  header:      { backgroundColor: CORP_BLUE, padding: '36 48 28 48', marginTop: -36, marginLeft: -48, marginRight: -48 },
  headerName:  { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 4, letterSpacing: 0.3 },
  headerTitle: { fontSize: 10, color: '#93c5fd', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14 },
  headerContacts: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  headerContact:  { fontSize: 9, color: '#bfdbfe' },
  body:        { paddingTop: 32, paddingBottom: 40 },
  section:     { marginBottom: 22 },
  sectionTitle:{ fontSize: 9, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase',
                 color: CORP_BLUE, marginBottom: 8, paddingBottom: 5,
                 borderBottom: `1.5 solid ${CORP_BLUE}` },
  summary:     { fontSize: 10.5, color: '#374151', lineHeight: 1.7 },
  expBlock:    { marginBottom: 14, paddingBottom: 12, borderBottom: `0.5 solid #e2e8f0` },
  expHead:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  expCompany:  { fontSize: 11, fontWeight: 'bold', color: CORP_BLUE },
  expPeriod:   { fontSize: 9, color: '#ffffff', backgroundColor: CORP_BLUE,
                 paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3 },
  expRole:     { fontSize: 9.5, color: CORP_GRAY, marginBottom: 5, fontStyle: 'italic' },
  bullet:      { flexDirection: 'row', marginBottom: 3.5 },
  bulletDot:   { width: 12, fontSize: 9, color: CORP_BLUE, marginTop: 1.5 },
  bulletText:  { fontSize: 9.5, color: '#374151', lineHeight: 1.6, flex: 1 },
  skillsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillTag:    { fontSize: 9, color: CORP_BLUE, backgroundColor: CORP_LIGHT,
                 paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3 },
  eduRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  eduInst:     { fontSize: 10.5, fontWeight: 'bold', color: CORP_BLUE },
  eduDeg:      { fontSize: 9.5, color: CORP_GRAY },
  eduYear:     { fontSize: 9.5, color: CORP_GRAY },
})

function CorporateResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={corpStyles.page}>
        <View style={corpStyles.header}>
          <Text style={corpStyles.headerName}>{data.name}</Text>
          <Text style={corpStyles.headerTitle}>{data.title}</Text>
          <View style={corpStyles.headerContacts}>
            {data.email    && <Text style={corpStyles.headerContact}>{data.email}</Text>}
            {data.phone    && <Text style={corpStyles.headerContact}>{data.phone}</Text>}
            {data.location && <Text style={corpStyles.headerContact}>{data.location}</Text>}
            {data.linkedin && <Link src={toUrl(data.linkedin)} style={corpStyles.headerContact}>{data.linkedin}</Link>}
            {data.github   && <Link src={toUrl(data.github)}   style={corpStyles.headerContact}>{data.github}</Link>}
          </View>
        </View>

        <View style={corpStyles.body}>
          {data.summary ? (
            <View style={corpStyles.section}>
              <Text style={corpStyles.sectionTitle}>Profile</Text>
              <Text style={corpStyles.summary}>{data.summary}</Text>
            </View>
          ) : null}

          <View style={corpStyles.section}>
            <Text style={corpStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={corpStyles.expBlock}>
                <View style={corpStyles.expHead}>
                  <Text style={corpStyles.expCompany}>{exp.company}</Text>
                  <Text style={corpStyles.expPeriod}>{exp.period}</Text>
                </View>
                <Text style={corpStyles.expRole}>{exp.role}</Text>
                {exp.achievements.map((ach, j) => (
                  <View key={j} style={corpStyles.bullet}>
                    <Text style={corpStyles.bulletDot}>•</Text>
                    <Text style={corpStyles.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={corpStyles.section}>
            <Text style={corpStyles.sectionTitle}>Skills</Text>
            <View style={corpStyles.skillsRow}>
              {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
                <Text key={i} style={corpStyles.skillTag}>{s}</Text>
              ))}
            </View>
          </View>

          {data.education.length > 0 && (
            <View style={corpStyles.section}>
              <Text style={corpStyles.sectionTitle}>Education</Text>
              {data.education.map((ed, i) => (
                <View key={i} style={corpStyles.eduRow}>
                  <View>
                    <Text style={corpStyles.eduInst}>{ed.institution}</Text>
                    <Text style={corpStyles.eduDeg}>{ed.degree}</Text>
                  </View>
                  <Text style={corpStyles.eduYear}>{ed.year}</Text>
                </View>
              ))}
            </View>
          )}

          {data.languages && data.languages.length > 0 && (
            <View style={corpStyles.section}>
              <Text style={corpStyles.sectionTitle}>Languages</Text>
              <View style={corpStyles.skillsRow}>
                {data.languages.map((l, i) => (
                  <Text key={i} style={corpStyles.skillTag}>{l}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

// ─── Шаблон 5: ELEGANT ───────────────────────────────────────────────────────

const ELE_ACCENT = '#8B6914'
const ELE_DARK   = '#1a1a1a'
const ELE_MID    = '#555555'

const eleStyles = StyleSheet.create({
  page:        { fontFamily: 'Georgia', backgroundColor: '#fdfaf5', padding: '52 56 52 56' },
  header:      { marginBottom: 24, alignItems: 'center' },
  name:        { fontSize: 30, fontWeight: 'bold', color: ELE_DARK, letterSpacing: 1, marginBottom: 6 },
  title:       { fontSize: 11, color: ELE_ACCENT, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14, fontStyle: 'italic' },
  contacts:    { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  contact:     { fontSize: 9, color: ELE_MID },
  ornament:    { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 8 },
  ornLine:     { flex: 1, height: 0.75, backgroundColor: ELE_ACCENT },
  ornDot:      { width: 5, height: 5, backgroundColor: ELE_ACCENT, borderRadius: 2.5 },
  section:     { marginBottom: 22 },
  sectionTitle:{ fontSize: 10, fontWeight: 'bold', color: ELE_ACCENT, letterSpacing: 2,
                 textTransform: 'uppercase', marginBottom: 12, fontStyle: 'italic' },
  summary:     { fontSize: 10.5, color: ELE_MID, lineHeight: 1.8, fontStyle: 'italic' },
  expBlock:    { marginBottom: 14 },
  expHead:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  expCompany:  { fontSize: 11, fontWeight: 'bold', color: ELE_DARK },
  expPeriod:   { fontSize: 9, color: ELE_ACCENT, fontStyle: 'italic' },
  expRole:     { fontSize: 10, color: ELE_MID, marginBottom: 5, fontStyle: 'italic' },
  bullet:      { flexDirection: 'row', marginBottom: 4 },
  bulletDot:   { width: 14, fontSize: 9, color: ELE_ACCENT, marginTop: 1 },
  bulletText:  { fontSize: 9.5, color: ELE_MID, lineHeight: 1.65, flex: 1 },
  thinLine:    { height: 0.5, backgroundColor: '#d4c5a9', marginBottom: 14, marginTop: 4 },
  skillsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  skillTag:    { fontSize: 9, color: ELE_DARK, paddingHorizontal: 9, paddingVertical: 3,
                 border: `0.75 solid ${ELE_ACCENT}` },
  eduRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  eduInst:     { fontSize: 10.5, fontWeight: 'bold', color: ELE_DARK },
  eduDeg:      { fontSize: 9.5, color: ELE_MID, fontStyle: 'italic' },
  eduYear:     { fontSize: 9.5, color: ELE_ACCENT },
})

function ElegantResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={eleStyles.page}>
        <View style={eleStyles.header}>
          <Text style={eleStyles.name}>{data.name}</Text>
          <Text style={eleStyles.title}>{data.title}</Text>
          <View style={eleStyles.contacts}>
            {data.email    && <Text style={eleStyles.contact}>{data.email}</Text>}
            {data.phone    && <Text style={eleStyles.contact}>{data.phone}</Text>}
            {data.location && <Text style={eleStyles.contact}>{data.location}</Text>}
            {data.linkedin && <Link src={toUrl(data.linkedin)} style={eleStyles.contact}>{data.linkedin}</Link>}
            {data.github   && <Link src={toUrl(data.github)}   style={eleStyles.contact}>{data.github}</Link>}
          </View>
        </View>

        <View style={eleStyles.ornament}>
          <View style={eleStyles.ornLine} />
          <View style={eleStyles.ornDot} />
          <View style={eleStyles.ornLine} />
        </View>

        {data.summary ? (
          <View style={eleStyles.section}>
            <Text style={eleStyles.sectionTitle}>Summary</Text>
            <Text style={eleStyles.summary}>{data.summary}</Text>
            <View style={eleStyles.thinLine} />
          </View>
        ) : null}

        <View style={eleStyles.section}>
          <Text style={eleStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, i) => (
            <View key={i} wrap={false} style={eleStyles.expBlock}>
              <View style={eleStyles.expHead}>
                <Text style={eleStyles.expCompany}>{exp.company}</Text>
                <Text style={eleStyles.expPeriod}>{exp.period}</Text>
              </View>
              <Text style={eleStyles.expRole}>{exp.role}</Text>
              {exp.achievements.map((ach, j) => (
                <View key={j} style={eleStyles.bullet}>
                  <Text style={eleStyles.bulletDot}>•</Text>
                  <Text style={eleStyles.bulletText}>{ach}</Text>
                </View>
              ))}
            </View>
          ))}
          <View style={eleStyles.thinLine} />
        </View>

        <View style={eleStyles.section}>
          <Text style={eleStyles.sectionTitle}>Skills</Text>
          <View style={eleStyles.skillsRow}>
            {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
              <Text key={i} style={eleStyles.skillTag}>{s}</Text>
            ))}
          </View>
          <View style={eleStyles.thinLine} />
        </View>

        {data.education.length > 0 && (
          <View style={eleStyles.section}>
            <Text style={eleStyles.sectionTitle}>Education</Text>
            {data.education.map((ed, i) => (
              <View key={i} style={eleStyles.eduRow}>
                <View>
                  <Text style={eleStyles.eduInst}>{ed.institution}</Text>
                  <Text style={eleStyles.eduDeg}>{ed.degree}</Text>
                </View>
                <Text style={eleStyles.eduYear}>{ed.year}</Text>
              </View>
            ))}
          </View>
        )}

        {data.languages && data.languages.length > 0 && (
          <View style={eleStyles.section}>
            <Text style={eleStyles.sectionTitle}>Languages</Text>
            <View style={eleStyles.skillsRow}>
              {data.languages.map((l, i) => (
                <Text key={i} style={eleStyles.skillTag}>{l}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

// ─── Шаблон 6: ACADEMIC ──────────────────────────────────────────────────────

const ACA_DARK  = '#1a2744'
const ACA_LINE  = '#c8d0e0'
const ACA_GRAY  = '#4a5568'

const acaStyles = StyleSheet.create({
  page:       { fontFamily: 'Roboto', backgroundColor: '#ffffff', padding: '44 0 44 0' },
  layout:     { flexDirection: 'row', paddingHorizontal: 0 },
  sidebar:    { width: 168, backgroundColor: '#f7f8fa', padding: '0 18 0 28', borderRight: `1 solid ${ACA_LINE}` },
  main:       { flex: 1, padding: '0 32 0 28' },
  secTitle:   { fontSize: 9, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase',
                color: ACA_DARK, marginBottom: 8, marginTop: 16,
                borderBottom: `1 solid ${ACA_DARK}`, paddingBottom: 4 },
  sbName:     { fontSize: 15, fontWeight: 'bold', color: ACA_DARK, marginBottom: 3, lineHeight: 1.3 },
  sbTitle:    { fontSize: 9, color: ACA_GRAY, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 },
  sbItem:     { fontSize: 9, color: ACA_GRAY, marginBottom: 5, lineHeight: 1.5 },
  sbLabel:    { fontSize: 8, fontWeight: 'bold', color: ACA_DARK, letterSpacing: 0.5 },
  skillItem:  { fontSize: 9, color: ACA_GRAY, marginBottom: 4 },
  summary:    { fontSize: 10, color: ACA_GRAY, lineHeight: 1.75, marginBottom: 4 },
  expBlock:   { marginBottom: 14 },
  expHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 },
  expCompany: { fontSize: 11, fontWeight: 'bold', color: ACA_DARK },
  expPeriod:  { fontSize: 8.5, color: ACA_GRAY, fontStyle: 'italic' },
  expRole:    { fontSize: 9.5, color: ACA_GRAY, marginBottom: 5, fontStyle: 'italic' },
  bullet:     { flexDirection: 'row', marginBottom: 3.5 },
  bulletDot:  { width: 12, fontSize: 9, color: ACA_DARK, marginTop: 1 },
  bulletText: { fontSize: 9.5, color: ACA_GRAY, lineHeight: 1.6, flex: 1 },
  eduBlock:   { marginBottom: 12 },
  eduInst:    { fontSize: 10.5, fontWeight: 'bold', color: ACA_DARK, marginBottom: 1 },
  eduDeg:     { fontSize: 9.5, color: ACA_GRAY, fontStyle: 'italic', marginBottom: 1 },
  eduYear:    { fontSize: 9, color: ACA_GRAY },
})

function AcademicResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={acaStyles.page}>
        <View style={acaStyles.layout}>

          {/* Sidebar */}
          <View style={acaStyles.sidebar}>
            <Text style={acaStyles.sbName}>{data.name}</Text>
            <Text style={acaStyles.sbTitle}>{data.title}</Text>

            <Text style={acaStyles.secTitle}>Contact</Text>
            {data.email    && <Text style={acaStyles.sbItem}>{data.email}</Text>}
            {data.phone    && <Text style={acaStyles.sbItem}>{data.phone}</Text>}
            {data.location && <Text style={acaStyles.sbItem}>{data.location}</Text>}
            {data.linkedin && <Link src={toUrl(data.linkedin)} style={acaStyles.sbItem}>{data.linkedin}</Link>}
            {data.github   && <Link src={toUrl(data.github)}   style={acaStyles.sbItem}>{data.github}</Link>}

            {data.skills.technical.length > 0 && (
              <>
                <Text style={acaStyles.secTitle}>Skills</Text>
                {data.skills.technical.map((s, i) => (
                  <Text key={i} style={acaStyles.skillItem}>· {s}</Text>
                ))}
              </>
            )}

            {data.skills.soft.length > 0 && (
              <>
                <Text style={{ ...acaStyles.secTitle, marginTop: 12 }}>Competencies</Text>
                {data.skills.soft.map((s, i) => (
                  <Text key={i} style={acaStyles.skillItem}>· {s}</Text>
                ))}
              </>
            )}

            {data.languages && data.languages.length > 0 && (
              <>
                <Text style={acaStyles.secTitle}>Languages</Text>
                {data.languages.map((l, i) => (
                  <Text key={i} style={acaStyles.skillItem}>{l}</Text>
                ))}
              </>
            )}
          </View>

          {/* Main */}
          <View style={acaStyles.main}>
            {data.summary ? (
              <>
                <Text style={acaStyles.secTitle}>Profile</Text>
                <Text style={acaStyles.summary}>{data.summary}</Text>
              </>
            ) : null}

            <Text style={acaStyles.secTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} wrap={false} style={acaStyles.expBlock}>
                <View style={acaStyles.expHead}>
                  <Text style={acaStyles.expCompany}>{exp.company}</Text>
                  <Text style={acaStyles.expPeriod}>{exp.period}</Text>
                </View>
                <Text style={acaStyles.expRole}>{exp.role}</Text>
                {exp.achievements.map((ach, j) => (
                  <View key={j} style={acaStyles.bullet}>
                    <Text style={acaStyles.bulletDot}>–</Text>
                    <Text style={acaStyles.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}

            {data.education.length > 0 && (
              <>
                <Text style={acaStyles.secTitle}>Education</Text>
                {data.education.map((ed, i) => (
                  <View key={i} style={acaStyles.eduBlock}>
                    <Text style={acaStyles.eduInst}>{ed.institution}</Text>
                    <Text style={acaStyles.eduDeg}>{ed.degree}</Text>
                    <Text style={acaStyles.eduYear}>{ed.year}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

        </View>
      </Page>
    </Document>
  )
}

// ─── Шаблон 7: STARTUP ───────────────────────────────────────────────────────
// Тёмный фон #0f0f1a, индиго акцент #4f46e5. Для стартапов и tech-специалистов.

const STP_BG     = '#0f0f1a'
const STP_CARD   = '#1a1a2e'
const STP_ACCENT = '#6366f1'
const STP_DIM    = '#94a3b8'
const STP_TEXT   = '#e2e8f0'

const stpStyles = StyleSheet.create({
  page:        { fontFamily: 'Roboto', backgroundColor: STP_BG, padding: '44 48 44 48' },
  name:        { fontSize: 28, fontWeight: 'bold', color: STP_TEXT, letterSpacing: 0.3, marginBottom: 4 },
  title:       { fontSize: 11, color: STP_ACCENT, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  contacts:    { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 28 },
  contact:     { fontSize: 9, color: STP_DIM },
  divider:     { height: 1, backgroundColor: '#ffffff10', marginBottom: 20 },
  section:     { marginBottom: 22 },
  sectionTitle:{ fontSize: 8, fontWeight: 'bold', color: STP_ACCENT, letterSpacing: 2.5,
                 textTransform: 'uppercase', marginBottom: 12 },
  summary:     { fontSize: 10.5, color: STP_DIM, lineHeight: 1.7 },
  expBlock:    { backgroundColor: STP_CARD, borderRadius: 6, padding: '10 14 10 14', marginBottom: 10 },
  expHead:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  expCompany:  { fontSize: 11, fontWeight: 'bold', color: STP_TEXT },
  expPeriod:   { fontSize: 8.5, color: STP_ACCENT, backgroundColor: '#6366f120',
                 paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  expRole:     { fontSize: 9.5, color: STP_DIM, marginBottom: 7 },
  bullet:      { flexDirection: 'row', marginBottom: 4 },
  bulletDot:   { width: 12, fontSize: 9, color: STP_ACCENT, marginTop: 1 },
  bulletText:  { fontSize: 9.5, color: '#cbd5e1', lineHeight: 1.6, flex: 1 },
  twoCol:      { flexDirection: 'row', gap: 20 },
  col:         { flex: 1 },
  skillChip:   { fontSize: 9, color: STP_ACCENT, backgroundColor: '#6366f115',
                 paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                 marginBottom: 5, marginRight: 5 },
  skillsRow:   { flexDirection: 'row', flexWrap: 'wrap' },
  eduBlock:    { marginBottom: 10 },
  eduInst:     { fontSize: 10, fontWeight: 'bold', color: STP_TEXT, marginBottom: 1 },
  eduDeg:      { fontSize: 9, color: STP_DIM, marginBottom: 1 },
  eduYear:     { fontSize: 9, color: STP_ACCENT },
  langItem:    { fontSize: 9, color: STP_DIM, marginBottom: 4 },
})

function StartupResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={stpStyles.page}>

        {/* Header */}
        <Text style={stpStyles.name}>{data.name}</Text>
        <Text style={stpStyles.title}>{data.title}</Text>
        <View style={stpStyles.contacts}>
          {data.email    && <Text style={stpStyles.contact}>{data.email}</Text>}
          {data.phone    && <Text style={stpStyles.contact}>{data.phone}</Text>}
          {data.location && <Text style={stpStyles.contact}>{data.location}</Text>}
          {data.linkedin && <Link src={toUrl(data.linkedin)} style={stpStyles.contact}>{data.linkedin}</Link>}
          {data.github   && <Link src={toUrl(data.github)}   style={stpStyles.contact}>{data.github}</Link>}
        </View>

        {data.summary ? (
          <>
            <View style={stpStyles.section}>
              <Text style={stpStyles.sectionTitle}>About</Text>
              <Text style={stpStyles.summary}>{data.summary}</Text>
            </View>
            <View style={stpStyles.divider} />
          </>
        ) : null}

        <View style={stpStyles.section}>
          <Text style={stpStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, i) => (
            <View key={i} wrap={false} style={stpStyles.expBlock}>
              <View style={stpStyles.expHead}>
                <Text style={stpStyles.expCompany}>{exp.company}</Text>
                <Text style={stpStyles.expPeriod}>{exp.period}</Text>
              </View>
              <Text style={stpStyles.expRole}>{exp.role}</Text>
              {exp.achievements.map((ach, j) => (
                <View key={j} style={stpStyles.bullet}>
                  <Text style={stpStyles.bulletDot}>•</Text>
                  <Text style={stpStyles.bulletText}>{ach}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={stpStyles.divider} />

        {/* Bottom two columns */}
        <View style={stpStyles.twoCol}>
          <View style={stpStyles.col}>
            <Text style={stpStyles.sectionTitle}>Skills</Text>
            <View style={stpStyles.skillsRow}>
              {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
                <Text key={i} style={stpStyles.skillChip}>{skillName(s)}</Text>
              ))}
            </View>
          </View>

          <View style={stpStyles.col}>
            {data.education.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={stpStyles.sectionTitle}>Education</Text>
                {data.education.map((ed, i) => (
                  <View key={i} style={stpStyles.eduBlock}>
                    <Text style={stpStyles.eduInst}>{ed.institution}</Text>
                    <Text style={stpStyles.eduDeg}>{ed.degree}</Text>
                    <Text style={stpStyles.eduYear}>{ed.year}</Text>
                  </View>
                ))}
              </View>
            )}

            {data.languages && data.languages.length > 0 && (
              <View>
                <Text style={stpStyles.sectionTitle}>Languages</Text>
                {data.languages.map((l, i) => (
                  <Text key={i} style={stpStyles.langItem}>{l}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

      </Page>
    </Document>
  )
}

// ─── Шаблон PRIME ─────────────────────────────────────────────────────────────
// Светло-серый фон (#f3f3f5), жёлтый акцент (#f8c625), чернила #3b3b3b / тело #999.
// Figtree (Medium/Bold). Хедер с именем (первое слово — жёлтое), жёлтый тэг в углу,
// разделитель, затем 2 колонки: слева Summary/Experience/Education, справа
// Contact/Languages/Skills. Figma node 47619-6140, A4 595×842, поля 48 / верх 56.

const PRM_BG    = '#ffffff'
const PRM_GOLD  = '#f8c625'
const PRM_INK   = '#3b3b3b'   // заголовки и жирный текст
const PRM_DIM   = '#999999'   // тело / второстепенный текст
const PRM_LINE  = '#999999'

const primeStyles = StyleSheet.create({
  // Page padding = поля макета (48 по бокам, 56 сверху/снизу); повторяется на каждой странице (gotcha #4)
  page:        { fontFamily: 'Figtree', backgroundColor: PRM_BG, padding: '56 48 56 48', color: PRM_INK },

  // Хедер
  header:      { gap: 4 },
  name:        { fontFamily: 'Figtree', fontSize: 36, fontWeight: 700, lineHeight: 1, letterSpacing: 1.44, textTransform: 'uppercase' },
  role:        { fontFamily: 'Figtree', fontSize: 14, fontWeight: 700, lineHeight: 1, letterSpacing: 4.2, textTransform: 'uppercase', color: PRM_INK },

  // Жёлтый тэг в правом верхнем углу. ВАЖНО: absolute-дети Page позиционируются от
  // КРАЯ страницы (не от padding-box), поэтому координаты — как в Figma (x501, y0).
  goldTab:     { position: 'absolute', top: 0, left: 501, width: 46, height: 96, backgroundColor: PRM_GOLD },
  // Разделитель под хедером — во всю ширину контента
  rule:        { height: 1, backgroundColor: PRM_LINE, marginTop: 16 },

  // Колонки
  row:         { flexDirection: 'row', gap: 40, marginTop: 32 },
  leftCol:     { flex: 1, flexDirection: 'column', gap: 40 },
  rightCol:    { width: 150, flexDirection: 'column', gap: 40 },

  // Секции
  section:     { gap: 20 },
  heading:     { fontFamily: 'Figtree', fontSize: 16, fontWeight: 700, lineHeight: 1, letterSpacing: 0.96, textTransform: 'uppercase', color: PRM_INK },

  body:        { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, lineHeight: 1.5, color: PRM_DIM },

  // Experience
  expList:     { gap: 12 },
  expItem:     { gap: 8 },
  expMeta:     { gap: 4 },
  expDateTitle:{ gap: 2 },
  expDate:     { fontFamily: 'Figtree', fontSize: 10, fontWeight: 700, lineHeight: 1.5, textTransform: 'uppercase', color: PRM_INK },
  expRole:     { fontFamily: 'Figtree', fontSize: 10, fontWeight: 700, lineHeight: 1.5, textTransform: 'uppercase', color: PRM_INK },
  expCompany:  { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.5, color: PRM_DIM },
  bulletList:  { gap: 4 },
  bullet:      { flexDirection: 'row', gap: 6 },
  bulletDot:   { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, lineHeight: 1.5, color: PRM_DIM, width: 9, textAlign: 'center' },
  bulletText:  { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, lineHeight: 1.5, color: PRM_DIM, flex: 1 },

  // Education
  eduItem:     { gap: 4 },
  eduInst:     { fontFamily: 'Figtree', fontSize: 10, fontWeight: 700, lineHeight: 1.5, textTransform: 'uppercase', color: PRM_INK },
  eduDeg:      { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.5, color: PRM_DIM },

  // Contact
  contactList: { gap: 12 },
  contactItem: { gap: 4 },
  contactLabel:{ fontFamily: 'Figtree', fontSize: 10, fontWeight: 700, lineHeight: 1.5, textTransform: 'uppercase', color: PRM_INK },
  contactVal:  { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, lineHeight: 1.3, color: PRM_DIM },

  // Languages / Skills
  itemList:    { gap: 4 },
  item:        { fontFamily: 'Figtree', fontSize: 10, fontWeight: 500, lineHeight: 1.3, color: PRM_DIM },
})

function PrimeResume({ data }: { data: ResumeData }) {
  // Имя: первое слово — жёлтое, остальное — чернила
  const nameParts = (data.name || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const restName  = nameParts.slice(1).join(' ')

  const contacts = [
    data.phone    ? { label: 'Phone',     val: data.phone }    : null,
    data.email    ? { label: 'Email',     val: data.email }    : null,
    data.location ? { label: 'Address',   val: data.location } : null,
    data.linkedin ? { label: 'LinkedIn',  val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio', val: data.github }   : null,
  ].filter(Boolean) as { label: string; val: string }[]

  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  return (
    <Document>
      <Page size="A4" style={primeStyles.page}>
        {/* Жёлтый тэг в правом верхнем углу (только 1-я страница) */}
        <View style={primeStyles.goldTab} />

        {/* Хедер */}
        <View style={primeStyles.header}>
          <Text style={primeStyles.name}>
            <Text style={{ color: PRM_GOLD }}>{firstName}</Text>
            {restName ? <Text style={{ color: PRM_INK }}>{` ${restName}`}</Text> : null}
          </Text>
          {data.title ? <Text style={primeStyles.role}>{data.title}</Text> : null}
        </View>
        <View style={primeStyles.rule} />

        {/* Контент: 2 колонки */}
        <View style={primeStyles.row}>
          {/* ЛЕВАЯ */}
          <View style={primeStyles.leftCol}>
            {data.summary ? (
              <View style={primeStyles.section}>
                <Text style={primeStyles.heading}>Summary</Text>
                <Text style={primeStyles.body}>{data.summary}</Text>
              </View>
            ) : null}

            {data.experience.length > 0 ? (
              <View style={primeStyles.section}>
                <Text style={primeStyles.heading}>Experience</Text>
                <View style={primeStyles.expList}>
                  {data.experience.map((exp, i) => (
                    <View key={i} style={primeStyles.expItem} wrap={false}>
                      <View style={primeStyles.expMeta}>
                        <View style={primeStyles.expDateTitle}>
                          {exp.period ? <Text style={primeStyles.expDate}>{exp.period}</Text> : null}
                          <Text style={primeStyles.expRole}>{exp.role}</Text>
                        </View>
                        {exp.company ? <Text style={primeStyles.expCompany}>{exp.company}</Text> : null}
                      </View>
                      {exp.achievements.length > 0 ? (
                        <View style={primeStyles.bulletList}>
                          {exp.achievements.map((a, j) => (
                            <View key={j} style={primeStyles.bullet}>
                              <Text style={primeStyles.bulletDot}>•</Text>
                              <Text style={primeStyles.bulletText}>{a}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {data.education.length > 0 ? (
              <View style={primeStyles.section}>
                <Text style={primeStyles.heading}>Education</Text>
                <View style={{ gap: 12 }}>
                  {data.education.map((ed, i) => (
                    <View key={i} style={primeStyles.eduItem} wrap={false}>
                      <Text style={primeStyles.eduInst}>{ed.institution}</Text>
                      {ed.degree ? <Text style={primeStyles.eduDeg}>{ed.degree}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {/* ПРАВАЯ */}
          <View style={primeStyles.rightCol}>
            {contacts.length > 0 ? (
              <View style={primeStyles.section}>
                <Text style={primeStyles.heading}>Contact</Text>
                <View style={primeStyles.contactList}>
                  {contacts.map((c, i) => (
                    <View key={i} style={primeStyles.contactItem}>
                      <Text style={primeStyles.contactLabel}>{c.label}</Text>
                      <Text style={primeStyles.contactVal}>{c.val}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {data.languages && data.languages.length > 0 ? (
              <View style={primeStyles.section}>
                <Text style={primeStyles.heading}>Languages</Text>
                <View style={primeStyles.itemList}>
                  {data.languages.map((l, i) => <Text key={i} style={primeStyles.item}>{l}</Text>)}
                </View>
              </View>
            ) : null}

            {skills.length > 0 ? (
              <View style={primeStyles.section}>
                <Text style={primeStyles.heading}>Skills</Text>
                <View style={primeStyles.itemList}>
                  {skills.map((s, i) => <Text key={i} style={primeStyles.item}>{s}</Text>)}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ─── Шаблон NORDIC ────────────────────────────────────────────────────────────
// Мятный диагональный градиент (#e1ffe8 → #f3ffe1), единые чернила #537872 (заголовки)
// и #1c2221 (тело). Шрифт Gabarito (Regular/SemiBold/Bold). Сетка контактов 3×2 сверху,
// крупное имя в 2 строки + орбитальная графика в углу, вертикальный лейбл "Experience"
// у обведённого блока опыта, низ — Language/Education + Skills с линиями-подчёркиваниями.
// Figma node 47620-6351, A4 595×842, поля 48 / верх 40.

const NRD_INK  = '#537872'   // заголовки, лейблы, линии, графика
const NRD_BODY = '#1c2221'   // тело

// Мятный градиентный фон на всю страницу (fixed → повторяется на каждой; gotcha #1/#2)
function NordicBg() {
  return (
    <Svg width={595} height={842} viewBox="0 0 595 842" style={{ position: 'absolute', top: 0, left: 0 }} fixed>
      <Defs>
        <LinearGradient id="nrdGrad" x1="0" y1="0" x2="595" y2="842" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#e1ffe8" />
          <Stop offset="1" stopColor="#f3ffe1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="595" height="842" fill="url(#nrdGrad)" />
    </Svg>
  )
}

// Орбитальная графика (точные векторные пути из Figma). Absolute-ребёнок Page →
// координаты от КРАЯ страницы (gotcha #9); не fixed → только на 1-й странице.
function NordicOrbit() {
  return (
    <Svg width={162.373} height={148} viewBox="0 0 162.373 148"
      style={{ position: 'absolute', top: 97, left: 365 }}>
      <Path d="M132.896 138.776C121.864 138.778 106.165 132.568 89.6002 121.236C65.9868 105.082 45.4823 84.061 31.8632 62.0466C19.3856 41.8766 14.846 24.0622 19.7221 14.3931C22.6132 8.65772 30.0897 3.21765 49.2627 9.87131L48.8345 11.1034C34.363 6.08077 24.6963 7.42256 20.8865 14.9807C11.1548 34.2819 41.2905 86.6065 90.3367 120.159C112.332 135.207 132.611 141.145 141.991 135.293C146.936 132.209 148.767 125.994 147.431 116.819L148.723 116.632C150.139 126.366 148.107 133.017 142.681 136.4C140.115 138 136.796 138.776 132.896 138.776Z" fill={NRD_INK} />
      <Path d="M148.385 30.8775L147.106 30.6227C148.759 22.3001 147.553 15.9352 143.616 12.2161C139.328 8.16563 131.789 7.27384 122.385 9.70477L122.059 8.44219C131.91 5.89337 139.886 6.89743 144.511 11.2676C148.792 15.311 150.132 22.0919 148.385 30.8775Z" fill={NRD_INK} />
      <Path d="M124.608 75.1078C120.293 81.356 120.471 81.7507 133.08 92.5748C120.168 82.1583 119.716 82.0261 114.372 87.4209C118.958 81.3445 118.776 80.9458 106.138 70.1517C119.026 80.6025 119.483 80.7366 124.608 75.1078Z" fill={NRD_INK} />
      <Path d="M77.0208 121.235L76.2818 120.16C106.211 99.4454 140.149 62.0341 147.108 30.6091L148.382 30.8906C141.35 62.6446 107.16 100.376 77.0208 121.235Z" fill={NRD_INK} />
      <Path d="M33.8572 138.712C29.4168 138.712 25.7078 137.719 22.9546 135.672C18.5997 132.436 14.534 125.034 19.8955 108.153L21.1391 108.548C17.0797 121.329 17.9767 130.347 23.732 134.625C32.8764 141.421 53.502 135.743 76.2821 120.16L77.0211 121.235C60.4442 132.575 44.8949 138.712 33.8572 138.712Z" fill={NRD_INK} />
      <Path d="M86.0633 148C75.0369 148 64.184 145.583 54.1286 140.77C35.1684 131.697 20.5718 115.14 14.0803 95.3458L15.3213 94.9394C21.7007 114.397 36.0513 130.672 54.6918 139.594C67.5988 145.771 88.2955 151.129 113.606 141.569C145.26 129.612 163.766 100.53 160.747 67.4789C157.702 34.1141 134.005 8.62185 100.378 2.53537C63.3365 -4.17102 27.656 16.4054 15.5339 51.4573L14.3006 51.0305C20.1527 34.1115 31.9905 19.7399 47.6355 10.5636C63.5162 1.2503 82.33 -2.0586 100.61 1.251C134.83 7.44576 158.947 33.3948 162.047 67.3603C165.119 101.012 146.286 130.619 114.067 142.789C104.859 146.267 95.3987 148 86.0633 148Z" fill={NRD_INK} />
      <Path d="M22.3657 72.9308C13.9786 74.4749 12.727 75.7265 11.1827 84.1138C9.63865 75.7267 8.38711 74.4749 1.50651e-05 72.9308C8.38711 71.3868 9.63865 70.1352 11.1827 61.7481C12.7268 70.1352 13.9786 71.387 22.3657 72.9308Z" fill={NRD_INK} />
      <Path d="M26.9519 84.1127C23.5122 84.7459 22.999 85.2592 22.3657 88.6989C21.7324 85.2592 21.2191 84.7459 17.7794 84.1127C21.2191 83.4794 21.7324 82.9661 22.3657 79.5264C22.9988 82.9661 23.5122 83.4794 26.9519 84.1127Z" fill={NRD_INK} />
      <Path d="M122.222 67.5401C118.782 68.1733 118.269 68.6866 117.636 72.1263C117.002 68.6866 116.489 68.1733 113.049 67.5401C116.489 66.9068 117.002 66.3935 117.636 62.9538C118.269 66.3935 118.782 66.9068 122.222 67.5401Z" fill={NRD_INK} />
    </Svg>
  )
}

// Вертикальный лейбл "EXPERIENCE" как SVG-текст. Через обычный <Text transform> react-pdf
// обрезает повёрнутый текст по ширине flex-колонки (выходит обрубок) — SVG этого лишён.
function NordicVLabel() {
  return (
    <Svg width={16} height={96} viewBox="0 0 16 96">
      <Text x={8} y={48} fill={NRD_INK} textAnchor="middle" dominantBaseline="central"
        transform="rotate(-90, 8, 48)"
        style={{ fontFamily: 'Gabarito', fontWeight: 700, fontSize: 14 } as any}>EXPERIENCE</Text>
    </Svg>
  )
}

const nordicStyles = StyleSheet.create({
  // Верт. поля = 0, чтобы рамка опыта на разрыве доходила до края (стр.1 — в низ).
  // Отступы дают спейсеры: fixed-сверху (повторяется на каждой странице → перепадит
  // и контент продолжения на стр.2) + обычный снизу (поле на последней странице).
  page:        { fontFamily: 'Gabarito', backgroundColor: '#e9ffe6', padding: '0 48 0 48', color: NRD_BODY },
  root:        { flexDirection: 'column', gap: 32 },

  // Контакты — сетка 3 кол. × 2 ряда
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16, columnGap: 12 },
  contactCell: { width: 158.33, gap: 4 },
  contactLabel:{ fontFamily: 'Gabarito', fontSize: 10, fontWeight: 700, lineHeight: 1, letterSpacing: 0.6, textTransform: 'uppercase', color: NRD_INK },
  contactVal:  { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1, color: NRD_BODY },

  // Имя + summary
  intro:       { paddingRight: 80, gap: 24 },
  nameWrap:    { gap: 8 },
  nameLines:   { flexDirection: 'column' },
  name:        { fontFamily: 'Gabarito', fontSize: 48, fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', color: NRD_INK },
  role:        { fontFamily: 'Gabarito', fontSize: 14, fontWeight: 600, lineHeight: 1, letterSpacing: 1.12, textTransform: 'uppercase', color: NRD_INK },
  summary:     { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1.4, color: NRD_BODY },

  // Опыт — вертикальный лейбл (SVG, absolute-оверлей) + обведённый блок.
  // Лейбл вынесен из потока (absolute) и боксу задан фиксированный marginLeft, чтобы при
  // переносе на 2-ю страницу левый край рамки не «прыгал» (лейбл есть только на стр.1).
  expRow:      { position: 'relative' },
  vLabelAbs:   { position: 'absolute', left: 0, top: 0 },
  expBox:      { marginLeft: 32, borderWidth: 1, borderStyle: 'solid', borderColor: NRD_INK, padding: 24 },
  expInner:    { gap: 24 },
  expItem:     { flexDirection: 'row', gap: 16 },
  expLeft:     { width: 111, gap: 8 },
  expDate:     { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase', color: NRD_INK },
  expCompany:  { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1.4, color: NRD_BODY },
  expRight:    { flex: 1, gap: 8 },
  expRole:     { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase', color: NRD_INK },
  bulletList:  { gap: 4 },
  bullet:      { flexDirection: 'row', gap: 6 },
  bulletDot:   { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1.4, color: NRD_BODY, width: 8, textAlign: 'center' },
  bulletText:  { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1.4, color: NRD_BODY, flex: 1 },

  // Низ
  bottom:      { gap: 32 },
  twoCol:      { flexDirection: 'row', gap: 24 },
  col:         { flex: 1, gap: 12 },
  secHead:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secLabel:    { fontFamily: 'Gabarito', fontSize: 14, fontWeight: 700, letterSpacing: 0.84, textTransform: 'uppercase', color: NRD_INK },
  secRule:     { flex: 1, height: 1, backgroundColor: NRD_INK },
  langList:    { gap: 8 },
  langItem:    { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1, color: NRD_BODY },
  eduItem:     { gap: 8 },
  eduInst:     { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase', color: NRD_INK },
  eduDeg:      { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1.4, color: NRD_BODY },
  skillsWrap:  { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 8 },
  skill:       { fontFamily: 'Gabarito', fontSize: 10, fontWeight: 400, lineHeight: 1, color: NRD_BODY },
})

function NordicResume({ data }: { data: ResumeData }) {
  const nameWords = (data.name || '').trim().split(/\s+/).filter(Boolean)

  const contacts = [
    data.phone    ? { label: 'Phone.',     val: data.phone }    : null,
    data.email    ? { label: 'Email.',     val: data.email }    : null,
    data.location ? { label: 'Address.',   val: data.location } : null,
    data.linkedin ? { label: 'LinkedIn.',  val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio.', val: data.github }   : null,
  ].filter(Boolean) as { label: string; val: string }[]

  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  const SecHead = ({ children }: { children: React.ReactNode }) => (
    <View style={nordicStyles.secHead}>
      <Text style={nordicStyles.secLabel}>{children}</Text>
      <View style={nordicStyles.secRule} />
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={nordicStyles.page}>
        <NordicBg />
        <NordicOrbit />

        {/* Верхнее поле стр.1 (обычный спейсер — только на 1-й странице) */}
        <View style={{ height: 40 }} />

        <View style={nordicStyles.root}>
          {/* Контакты */}
          {contacts.length > 0 && (
            <View style={nordicStyles.contactGrid}>
              {contacts.map((c, i) => (
                <View key={i} style={nordicStyles.contactCell}>
                  <Text style={nordicStyles.contactLabel}>{c.label}</Text>
                  <Text style={nordicStyles.contactVal}>{c.val}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Имя + summary */}
          <View style={nordicStyles.intro}>
            <View style={nordicStyles.nameWrap}>
              <View style={nordicStyles.nameLines}>
                {nameWords.map((w, i) => <Text key={i} style={nordicStyles.name}>{w}</Text>)}
              </View>
              {data.title ? <Text style={nordicStyles.role}>{data.title}</Text> : null}
            </View>
            {data.summary ? <Text style={nordicStyles.summary}>{data.summary}</Text> : null}
          </View>

          {/* Опыт */}
          {data.experience.length > 0 && (
            <View style={nordicStyles.expRow}>
              <View style={nordicStyles.vLabelAbs}><NordicVLabel /></View>
              <View style={nordicStyles.expBox}>
                {/* перепадинг ТОЛЬКО контента на стр. продолжения (бордюр короба при этом
                    остаётся у края страницы); на стр.1 пусто (gotcha #4) */}
                <View fixed render={({ pageNumber }: any) => (pageNumber > 1 ? <View style={{ height: 28 }} /> : null)} />
                <View style={nordicStyles.expInner}>
                {data.experience.map((exp, i) => (
                  <View key={i} style={nordicStyles.expItem} wrap={false}>
                    <View style={nordicStyles.expLeft}>
                      {exp.period ? <Text style={nordicStyles.expDate}>{exp.period}</Text> : null}
                      {exp.company ? <Text style={nordicStyles.expCompany}>{exp.company}</Text> : null}
                    </View>
                    <View style={nordicStyles.expRight}>
                      <Text style={nordicStyles.expRole}>{exp.role}</Text>
                      {exp.achievements.length > 0 && (
                        <View style={nordicStyles.bulletList}>
                          {exp.achievements.map((a, j) => (
                            <View key={j} style={nordicStyles.bullet}>
                              <Text style={nordicStyles.bulletDot}>•</Text>
                              <Text style={nordicStyles.bulletText}>{a}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
                </View>
              </View>
            </View>
          )}

          {/* Низ: Language / Education + Skills */}
          <View style={nordicStyles.bottom}>
            {(data.languages?.length || data.education.length > 0) ? (
              <View style={nordicStyles.twoCol}>
                <View style={nordicStyles.col}>
                  {data.languages && data.languages.length > 0 ? (
                    <>
                      <SecHead>Language</SecHead>
                      <View style={nordicStyles.langList}>
                        {data.languages.map((l, i) => <Text key={i} style={nordicStyles.langItem}>{l}</Text>)}
                      </View>
                    </>
                  ) : null}
                </View>
                <View style={nordicStyles.col}>
                  {data.education.length > 0 ? (
                    <>
                      <SecHead>Education</SecHead>
                      <View style={{ gap: 8 }}>
                        {data.education.map((ed, i) => (
                          <View key={i} style={nordicStyles.eduItem} wrap={false}>
                            <Text style={nordicStyles.eduInst}>{ed.institution}</Text>
                            {ed.degree ? <Text style={nordicStyles.eduDeg}>{ed.degree}</Text> : null}
                          </View>
                        ))}
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            ) : null}

            {skills.length > 0 && (
              <View style={nordicStyles.col}>
                <SecHead>Skills</SecHead>
                <View style={nordicStyles.skillsWrap}>
                  {skills.map((s, i) => <Text key={i} style={nordicStyles.skill}>{s}</Text>)}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Нижнее поле последней страницы */}
        <View style={{ height: 40 }} />
      </Page>
    </Document>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

function ResumeDocument({ data, template }: { data: ResumeData; template: TemplateId }) {
  if (template === 'business')   return <BusinessResume  data={data} />
  if (template === 'creative')   return <CreativeResume  data={data} />
  if (template === 'corporate')  return <CorporateResume data={data} />
  if (template === 'elegant')    return <ElegantResume   data={data} />
  if (template === 'academic')   return <AcademicResume  data={data} />
  if (template === 'startup')    return <StartupResume   data={data} />
  if (template === 'aurora')     return <AuroraResume    data={data} />
  if (template === 'volt')       return <VoltResume      data={data} />
  if (template === 'atelier')    return <AtelierResume   data={data} />
  if (template === 'prime')      return <PrimeResume     data={data} />
  if (template === 'nordic')     return <NordicResume    data={data} />
  return <MinimalResume data={data} />
}

// ─── HTML Preview components (one per template) ──────────────────────────────

function PreviewContacts({ data, style }: { data: ResumeData; style?: React.CSSProperties }) {
  const items = [data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean)
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', ...style }}>
      {items.map((v, i) => <span key={i}>{v}</span>)}
    </div>
  )
}

function PreviewExp({ exp, bulletColor, dotChar = '—' }: { exp: ResumeData['experience'][0]; bulletColor: string; dotChar?: string }) {
  return (
    <>
      {exp.achievements?.map((a, j) => (
        <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: bulletColor, flexShrink: 0 }}>{dotChar}</span>
          <span style={{ fontSize: 13, lineHeight: 1.55 }}>{a}</span>
        </div>
      ))}
    </>
  )
}

// ── 1. Minimal ────────────────────────────────────────────────────────────────
function PreviewMinimal({ data }: { data: ResumeData }) {
  const contacts = [
    data.email    ? { label: 'Email',    val: data.email } : null,
    data.phone    ? { label: 'Phone',    val: data.phone } : null,
    data.location ? { label: 'Location', val: data.location } : null,
    data.linkedin ? { label: 'LinkedIn', val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio', val: data.github } : null,
  ].filter(Boolean) as { label: string; val: string }[]

  // Left column: 7px regular gray letter-spaced
  const lbl: React.CSSProperties = {
    fontSize: 7, letterSpacing: 2, textTransform: 'uppercase',
    color: '#7A7E88', display: 'block', fontWeight: 400, lineHeight: '17px',
  }
  // Right column: 7px bold dark no letter-spacing
  const rLbl: React.CSSProperties = {
    fontSize: 7, fontWeight: 700, textTransform: 'uppercase',
    color: '#212329', display: 'block', lineHeight: '17px',
  }
  const body11: React.CSSProperties = { fontSize: 11, lineHeight: '17px', margin: 0 }

  const renderExpBlock = (exp: ResumeData['experience'][0]) => (
    <div>
      <div style={{ ...body11, fontWeight: 700 }}>{exp.role}</div>
      <div style={body11}>{exp.company}</div>
      <div style={{ ...body11, color: '#7A7E88' }}>{exp.period}</div>
      {exp.achievements?.map((a, j) => (
        <div key={j} style={{ display: 'flex' }}>
          <span style={{ ...body11, width: 10, flexShrink: 0 }}>•</span>
          <span style={body11}>{a}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--font-onest), system-ui, sans-serif', padding: '40px 48px 40px', color: '#212329' }}>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '28px', marginBottom: 6 }}>{data.name}</div>
      <div style={{ fontSize: 16, fontWeight: 400, lineHeight: '20px', marginBottom: 32 }}>{data.title}</div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left — gap:24 matches Figma Frame 160 */}
        <div style={{ width: 335, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {data.summary && (
            <div>
              <span style={lbl}>Summary</span>
              <div style={body11}>{data.summary}</div>
            </div>
          )}

          {data.experience.length > 0 && (
            <div>
              <span style={lbl}>Experience</span>
              {renderExpBlock(data.experience[0])}
            </div>
          )}

          {data.experience.slice(1).map((exp, i) => (
            <div key={i + 1}>{renderExpBlock(exp)}</div>
          ))}

          {data.education.length > 0 && (
            <div>
              <span style={lbl}>Education</span>
              {data.education.map((ed, i) => (
                <div key={i}>
                  <div style={{ ...body11, fontWeight: 700 }}>{ed.institution}</div>
                  <div style={body11}>{ed.degree}</div>
                  {ed.year && <div style={{ ...body11, color: '#7A7E88' }}>{ed.year}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — gap:24 matches Figma Frame 5 */}
        <div style={{ width: 140, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {contacts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {contacts.map((c, i) => (
                <div key={i}>
                  <span style={rLbl}>{c.label}</span>
                  <div style={{ ...body11, color: '#7A7E88' }}>{c.val}</div>
                </div>
              ))}
            </div>
          )}

          {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
            <div>
              <span style={rLbl}>Skills</span>
              {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
                <div key={i} style={{ ...body11, color: '#7A7E88' }}>{skillName(s)}</div>
              ))}
            </div>
          )}

          {data.languages?.length ? (
            <div>
              <span style={rLbl}>Languages</span>
              {data.languages.map((l, i) => (
                <div key={i} style={{ ...body11, color: '#7A7E88' }}>{l}</div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── 2. Corporate ─────────────────────────────────────────────────────────────
function PreviewCorporate({ data }: { data: ResumeData }) {
  const blue = '#1e3a8a', lightBlue = '#eff6ff', accentBlue = '#2563eb'
  const sec = { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const,
    color: blue, borderBottom: `1.5px solid ${blue}`, paddingBottom: 5, marginBottom: 10 }
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111' }}>
      <div style={{ background: blue, padding: '28px 40px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{data.name}</p>
          <p style={{ fontSize: 10, color: '#93c5fd', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10 }}>{data.title}</p>
          <PreviewContacts data={data} style={{ fontSize: 11, color: '#bfdbfe', gap: '3px 16px' }} />
        </div>
      </div>
      <div style={{ padding: '24px 40px 32px' }}>
        {data.summary && <div style={{ marginBottom: 18 }}><p style={sec}>Profile</p><p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{data.summary}</p></div>}
        <div style={{ marginBottom: 18 }}>
          <p style={sec}>Experience</p>
          {data.experience?.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '0.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: blue }}>{exp.company}</span>
                <span style={{ fontSize: 11, color: '#fff', background: blue, padding: '2px 7px', borderRadius: 3 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: 12, color: accentBlue, fontStyle: 'italic', marginBottom: 6 }}>{exp.role}</p>
              <PreviewExp exp={exp} bulletColor={accentBlue} dotChar="▸" />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 18 }}>
          <p style={sec}>Skills</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', background: lightBlue, color: blue, borderRadius: 3 }}>{s}</span>
            ))}
          </div>
        </div>
        {data.education?.length > 0 && <div style={{ marginBottom: 18 }}><p style={sec}>Education</p>{data.education.map((ed, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div><p style={{ fontSize: 13, fontWeight: 600, color: blue }}>{ed.institution}</p><p style={{ fontSize: 12, color: '#64748b' }}>{ed.degree}</p></div>
            <span style={{ fontSize: 11, color: '#64748b' }}>{ed.year}</span>
          </div>
        ))}</div>}
        {data.languages?.length ? <div><p style={sec}>Languages</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{data.languages.map((l, i) => <span key={i} style={{ fontSize: 11, padding: '3px 9px', background: lightBlue, color: blue, borderRadius: 3 }}>{l}</span>)}</div></div> : null}
      </div>
    </div>
  )
}

// ── 3. Startup ────────────────────────────────────────────────────────────────
function PreviewStartup({ data }: { data: ResumeData }) {
  const bg = '#0f0f1a', card = '#1a1a2e', accent = '#6366f1', dim = '#94a3b8', text = '#e2e8f0'
  const sec = { fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' as const, color: accent, marginBottom: 10 }
  const hr = () => <div style={{ height: 1, background: '#ffffff10', margin: '16px 0' }} />
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: bg, color: text, padding: '36px 40px' }}>
      <p style={{ fontSize: 26, fontWeight: 700, marginBottom: 3 }}>{data.name}</p>
      <p style={{ fontSize: 11, color: accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{data.title}</p>
      <PreviewContacts data={data} style={{ fontSize: 11, color: dim, gap: '3px 16px', marginBottom: 20 }} />
      {data.summary && <><p style={sec}>About</p><p style={{ fontSize: 13, color: dim, lineHeight: 1.7, marginBottom: 4 }}>{data.summary}</p>{hr()}</>}
      <p style={sec}>Experience</p>
      {data.experience?.map((exp, i) => (
        <div key={i} style={{ background: card, borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{exp.company}</span>
            <span style={{ fontSize: 11, color: accent, background: '#6366f115', padding: '2px 7px', borderRadius: 3 }}>{exp.period}</span>
          </div>
          <p style={{ fontSize: 12, color: dim, marginBottom: 6 }}>{exp.role}</p>
          <div style={{ color: '#cbd5e1' }}><PreviewExp exp={exp} bulletColor={accent} dotChar="▸" /></div>
        </div>
      ))}
      {hr()}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <p style={sec}>Skills</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', background: '#6366f115', color: accent, borderRadius: 10 }}>{skillName(s)}</span>
            ))}
          </div>
        </div>
        <div>
          {data.education?.length > 0 && <><p style={sec}>Education</p>{data.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{ed.institution}</p>
              <p style={{ fontSize: 11, color: dim }}>{ed.degree}</p>
              <p style={{ fontSize: 11, color: accent }}>{ed.year}</p>
            </div>
          ))}</>}
          {data.languages?.length ? <><p style={{ ...sec, marginTop: 12 }}>Languages</p>{data.languages.map((l, i) => <p key={i} style={{ fontSize: 12, color: dim, marginBottom: 3 }}>{l}</p>)}</> : null}
        </div>
      </div>
    </div>
  )
}

// ── 4. Academic ───────────────────────────────────────────────────────────────
function PreviewAcademic({ data }: { data: ResumeData }) {
  const dark = '#1a2744', gray = '#4a5568', line = '#c8d0e0'
  const sec = { fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const,
    color: dark, borderBottom: `1px solid ${dark}`, paddingBottom: 4, marginBottom: 8, marginTop: 14 }
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', minHeight: Math.round(680 * 297 / 210) }}>
      {/* Sidebar */}
      <div style={{ width: 168, background: '#f7f8fa', borderRight: `1px solid ${line}`, padding: '32px 16px 32px 24px', flexShrink: 0, alignSelf: 'stretch' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: dark, marginBottom: 2, lineHeight: 1.3 }}>{data.name}</p>
        <p style={{ fontSize: 10, color: gray, fontStyle: 'italic', marginBottom: 12 }}>{data.title}</p>
        <p style={sec}>Contact</p>
        {[data.email, data.phone, data.location, data.linkedin, data.github].filter(Boolean).map((v, i) => (
          <p key={i} style={{ fontSize: 10, color: gray, marginBottom: 4, lineHeight: 1.4 }}>{v}</p>
        ))}
        {data.skills.technical.length > 0 && <><p style={sec}>Skills</p>{data.skills.technical.map((s, i) => <p key={i} style={{ fontSize: 10, color: gray, marginBottom: 3 }}>· {s}</p>)}</>}
        {data.skills.soft.length > 0 && <><p style={{ ...sec, marginTop: 10 }}>Competencies</p>{data.skills.soft.map((s, i) => <p key={i} style={{ fontSize: 10, color: gray, marginBottom: 3 }}>· {s}</p>)}</>}
        {data.languages?.length ? <><p style={sec}>Languages</p>{data.languages.map((l, i) => <p key={i} style={{ fontSize: 10, color: gray, marginBottom: 3 }}>{l}</p>)}</> : null}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: '32px 28px 32px 24px' }}>
        {data.summary && <><p style={sec}>Profile</p><p style={{ fontSize: 13, color: gray, lineHeight: 1.75, marginBottom: 4 }}>{data.summary}</p></>}
        <p style={sec}>Experience</p>
        {data.experience?.map((exp, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: dark }}>{exp.company}</span>
              <span style={{ fontSize: 11, color: gray, fontStyle: 'italic' }}>{exp.period}</span>
            </div>
            <p style={{ fontSize: 12, color: gray, fontStyle: 'italic', marginBottom: 5 }}>{exp.role}</p>
            <div style={{ color: gray }}><PreviewExp exp={exp} bulletColor={dark} dotChar="–" /></div>
          </div>
        ))}
        {data.education?.length > 0 && <><p style={sec}>Education</p>{data.education.map((ed, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: dark }}>{ed.institution}</p>
            <p style={{ fontSize: 12, color: gray, fontStyle: 'italic' }}>{ed.degree}</p>
            <p style={{ fontSize: 11, color: gray }}>{ed.year}</p>
          </div>
        ))}</>}
      </div>
    </div>
  )
}

// ── 5. Modern (creative) ──────────────────────────────────────────────────────
function PreviewModern({ data }: { data: ResumeData }) {
  const darkGreen = '#064e3b', green = '#059669', lightGreen = '#ecfdf5'
  const secLabel = (title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
      <div style={{ width: 8, height: 8, background: green, borderRadius: 4 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: darkGreen, letterSpacing: 1.2, textTransform: 'uppercase' as const }}>{title}</span>
    </div>
  )
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: darkGreen, padding: '28px 40px 22px' }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{data.name}</p>
        <p style={{ fontSize: 11, color: '#6ee7b7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{data.title}</p>
        <PreviewContacts data={data} style={{ fontSize: 11, color: '#a7f3d0', gap: '3px 20px' }} />
      </div>
      <div style={{ padding: '24px 40px 32px' }}>
        {data.summary && <div style={{ marginBottom: 20 }}>{secLabel('Summary')}<p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75 }}>{data.summary}</p></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 28 }}>
          <div>
            {secLabel('Experience')}
            {data.experience?.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: darkGreen }}>{exp.company}</span>
                  <span style={{ fontSize: 11, color: green, background: lightGreen, padding: '2px 7px', borderRadius: 3 }}>{exp.period}</span>
                </div>
                <p style={{ fontSize: 12, color: green, marginBottom: 5 }}>{exp.role}</p>
                <div style={{ color: '#4b5563' }}><PreviewExp exp={exp} bulletColor={green} dotChar="◆" /></div>
              </div>
            ))}
          </div>
          <div>
            {secLabel('Technical Skills')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
              {data.skills.technical.map((s, i) => <span key={i} style={{ fontSize: 11, padding: '3px 9px', background: lightGreen, color: darkGreen, borderRadius: 10 }}>{s}</span>)}
            </div>
            {data.skills.soft.length > 0 && <><div style={{ marginBottom: 8 }}>{secLabel('Soft Skills')}</div>{data.skills.soft.map((s, i) => <p key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 4, paddingLeft: 8, borderLeft: `2px solid ${green}` }}>{s}</p>)}</>}
            {data.education?.length > 0 && <><div style={{ marginTop: 14, marginBottom: 8 }}>{secLabel('Education')}</div>{data.education.map((ed, i) => <div key={i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid #d1fae5` }}><p style={{ fontSize: 12, fontWeight: 700, color: darkGreen }}>{ed.institution}</p><p style={{ fontSize: 11, color: '#6b7280' }}>{ed.degree}</p><p style={{ fontSize: 11, color: green }}>{ed.year}</p></div>)}</>}
            {data.languages?.length ? <><div style={{ marginTop: 14, marginBottom: 8 }}>{secLabel('Languages')}</div>{data.languages.map((l, i) => <p key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 4, paddingLeft: 8, borderLeft: `2px solid ${green}` }}>{l}</p>)}</> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 6. Elegant ────────────────────────────────────────────────────────────────
function PreviewElegant({ data }: { data: ResumeData }) {
  const gold = '#8B6914', dark = '#1a1a1a', mid = '#555'
  const sec = { fontSize: 10, fontWeight: 700, color: gold, letterSpacing: 2, textTransform: 'uppercase' as const, fontStyle: 'italic' as const, marginBottom: 10 }
  const ornament = <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0' }}>
    <div style={{ flex: 1, height: 0.75, background: gold }} />
    <div style={{ width: 5, height: 5, background: gold, borderRadius: '50%' }} />
    <div style={{ flex: 1, height: 0.75, background: gold }} />
  </div>
  const thinHr = <div style={{ height: 0.5, background: '#d4c5a9', margin: '14px 0' }} />
  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fdfaf5', padding: '40px 48px' }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: dark, letterSpacing: 0.5, marginBottom: 4 }}>{data.name}</p>
        <p style={{ fontSize: 11, color: gold, letterSpacing: 2.5, textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 10 }}>{data.title}</p>
        <PreviewContacts data={data} style={{ fontSize: 11, color: mid, justifyContent: 'center', gap: '3px 14px' }} />
      </div>
      {ornament}
      {data.summary && <><p style={sec}>Summary</p><p style={{ fontSize: 13, color: mid, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 4 }}>{data.summary}</p>{thinHr}</>}
      <p style={sec}>Experience</p>
      {data.experience?.map((exp, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: dark }}>{exp.company}</span>
            <span style={{ fontSize: 11, color: gold, fontStyle: 'italic' }}>{exp.period}</span>
          </div>
          <p style={{ fontSize: 12, color: mid, fontStyle: 'italic', margin: '2px 0 6px' }}>{exp.role}</p>
          <div style={{ color: mid }}><PreviewExp exp={exp} bulletColor={gold} dotChar="✦" /></div>
        </div>
      ))}
      {thinHr}
      <p style={sec}>Skills</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
        {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
          <span key={i} style={{ fontSize: 11, padding: '3px 9px', border: `0.75px solid ${gold}`, color: dark }}>{s}</span>
        ))}
      </div>
      {data.education?.length > 0 && <>{thinHr}<p style={sec}>Education</p>{data.education.map((ed, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <div><p style={{ fontSize: 13, fontWeight: 700, color: dark }}>{ed.institution}</p><p style={{ fontSize: 12, color: mid, fontStyle: 'italic' }}>{ed.degree}</p></div>
          <span style={{ fontSize: 11, color: gold }}>{ed.year}</span>
        </div>
      ))}</>}
      {data.languages?.length ? <>{thinHr}<p style={sec}>Languages</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{data.languages.map((l, i) => <span key={i} style={{ fontSize: 11, padding: '3px 9px', border: `0.75px solid ${gold}`, color: dark }}>{l}</span>)}</div></> : null}
    </div>
  )
}

// ── 7. Aurora ─────────────────────────────────────────────────────────────────
function PreviewAurora({ data }: { data: ResumeData }) {
  const acl: React.CSSProperties = { fontFamily: '"Aclonica", system-ui, sans-serif', color: '#000', fontWeight: 400 }
  const heading: React.CSSProperties = { ...acl, fontSize: 20, lineHeight: '23px' }
  const body: React.CSSProperties = { fontFamily: '"Archivo", system-ui, sans-serif', fontSize: 11, lineHeight: 1.5, color: '#000' }
  const meta: React.CSSProperties = { ...body, fontWeight: 700, textAlign: 'right' }
  const foot: React.CSSProperties = { fontFamily: '"Archivo", system-ui, sans-serif', fontSize: 11, lineHeight: '12px', color: '#000' }

  const contacts = [
    data.location && { t: '📍', v: data.location },
    data.phone    && { t: '📞', v: data.phone },
    data.email    && { t: '✉️', v: data.email },
    data.linkedin && { t: '🔗', v: data.linkedin },
    data.github   && { t: '🔗', v: data.github },
  ].filter(Boolean) as { t: string; v: string }[]
  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  return (
    <div style={{ background: '#fff', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ ...acl, fontSize: 28, lineHeight: '32px', textAlign: 'right' }}>{data.name}</div>
        <div style={{ ...acl, fontSize: 20, lineHeight: '23px', textAlign: 'right' }}>{data.title}</div>
      </div>
      <div style={{ width: 312, height: 1, background: '#000' }} />

      {/* Summary */}
      {data.summary && (
        <div style={{ width: '100%', paddingLeft: 219, paddingRight: 40, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={heading}>Summary</div>
          <div style={body}>{data.summary}</div>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ paddingLeft: 219, boxSizing: 'border-box' }}><span style={heading}>Experience</span></div>
          <div style={{ paddingLeft: 49, paddingRight: 40, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 154, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={meta}>{exp.role}</div>
                  <div style={meta}>{exp.period}</div>
                </div>
                <div style={{ width: 272, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ ...body, fontWeight: 700 }}>{exp.company}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {exp.achievements?.map((a, j) => (
                      <div key={j} style={{ display: 'flex' }}>
                        <span style={{ ...body, width: 10, flexShrink: 0 }}>•</span>
                        <span style={body}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div style={{ width: '100%', paddingLeft: 219, paddingRight: 40, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={heading}>Education</div>
          {data.education.map((ed, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ ...body, fontWeight: 700 }}>{ed.institution}</div>
              <div style={body}>{ed.degree}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: '100%', height: 1, background: '#000' }} />

      {/* Footer */}
      <div style={{ width: '100%', display: 'flex', gap: 24 }}>
        <div style={{ width: 161, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={heading}>Contact</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 10, width: 12, textAlign: 'center' }}>{c.t}</span>
                <span style={{ ...foot, fontWeight: 600 }}>{c.v}</span>
              </div>
            ))}
          </div>
        </div>

        {data.languages?.length ? (
          <div style={{ width: 161, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={heading}>Languages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.languages.map((l, i) => {
                const { name, level } = langParts(l)
                return (
                  <div key={i} style={{ display: 'flex' }}>
                    <span style={{ ...foot, fontWeight: 700, width: 62 }}>{name}</span>
                    {level && <span style={{ ...foot, fontWeight: 600 }}>{level}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        {skills.length > 0 && (
          <div style={{ width: 161, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={heading}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map((s, i) => <span key={i} style={{ ...foot, fontWeight: 600 }}>{s}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 8. Volt ───────────────────────────────────────────────────────────────────
function PreviewVolt({ data }: { data: ResumeData }) {
  const ink = '#111111'
  const F = '"Poppins", system-ui, sans-serif'
  const h: React.CSSProperties = { fontFamily: F, fontSize: 16, fontWeight: 700, lineHeight: 1.5, color: ink, margin: 0 }
  const label: React.CSSProperties = { fontFamily: F, fontSize: 10, fontWeight: 600, lineHeight: 1.5, color: ink }
  const val: React.CSSProperties = { fontFamily: F, fontSize: 10, fontWeight: 400, lineHeight: 1.5, color: ink }
  const card: React.CSSProperties = { background: '#fff', padding: 20 }
  const contacts = [
    data.email && { label: 'Email', val: data.email },
    data.location && { label: 'Address', val: data.location },
    data.phone && { label: 'Phone', val: data.phone },
    data.linkedin && { label: 'Linkedin', val: data.linkedin },
    data.github && { label: 'Portfolio', val: data.github },
  ].filter(Boolean) as { label: string; val: string }[]
  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  return (
    <div style={{ background: '#E6FF00', padding: '56px 48px', fontFamily: F }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={card}>
          <div style={{ fontFamily: F, fontSize: 32, fontWeight: 700, lineHeight: 1.5, color: ink }}>{data.name}</div>
          <div style={{ fontFamily: F, fontSize: 26, fontStyle: 'italic', lineHeight: 1.5, color: ink }}>{data.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <div style={{ ...card, width: 172, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {contacts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={h}>Personal info</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {contacts.map((c, i) => <div key={i}><div style={label}>{c.label}</div><div style={val}>{c.val}</div></div>)}
                </div>
              </div>
            )}
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={h}>Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 3, columnGap: 10 }}>
                  {skills.map((s, i) => <span key={i} style={label}>{s}</span>)}
                </div>
              </div>
            )}
            {data.languages?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={h}>Languages</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {data.languages.map((l, i) => <span key={i} style={label}>{l}</span>)}
                </div>
              </div>
            ) : null}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.summary && (
              <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={h}>Summary</p><div style={val}>{data.summary}</div>
              </div>
            )}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={h}>Work Experience</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.experience?.map((exp, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><div style={label}>{exp.role} · {exp.company}</div><div style={label}>{exp.period}</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {exp.achievements?.map((a, j) => (
                        <div key={j} style={{ display: 'flex', gap: 5 }}><span style={val}>•</span><span style={{ ...val, flex: 1 }}>{a}</span></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {data.education?.length > 0 && (
              <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={h}>Education</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {data.education.map((ed, i) => <div key={i}><div style={label}>{ed.degree}</div><div style={label}>{ed.institution}</div></div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 9. Atelier ──────────────────────────────────────────────────────────────
function PreviewAtelier({ data }: { data: ResumeData }) {
  const INK = '#505889'
  const DIV = '#9aa1c4'
  const serif: React.CSSProperties = { fontFamily: '"Collingar", "Playfair Display", Georgia, serif', color: INK }
  const sans = '"Montserrat", system-ui, sans-serif'
  const heading: React.CSSProperties = { ...serif, fontSize: 24, lineHeight: 1 }
  const body: React.CSSProperties = { fontFamily: sans, fontSize: 11, fontWeight: 500, lineHeight: 1.5, color: INK }
  const itemText: React.CSSProperties = { fontFamily: sans, fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: INK }

  // искра в 16px-ячейке → маленькая центрируется под центром большой
  const Spark = ({ s = 16, dy = 0 }: { s?: number; dy?: number }) => (
    <span style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={s} height={s * 18 / 16} viewBox="0 0 16 18" style={{ marginTop: dy }}>
        <path d="M8 0 Q8.7 8.4 16 9 Q8.7 9.6 8 18 Q7.3 9.6 0 9 Q7.3 8.4 8 0 Z" fill={INK} />
      </svg>
    </span>
  )
  const SecHead = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spark dy={-1.7} /><span style={heading}>{children}</span></div>
  )
  const ItemRow = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spark s={9} dy={0.5} /><span style={itemText}>{children}</span></div>
  )

  const contacts = [data.phone, data.email, data.location, data.linkedin, data.github].filter(Boolean) as string[]
  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  return (
    <div style={{ padding: 32, display: 'flex', gap: 27, alignItems: 'stretch' }}>
      {/* Левая колонка */}
      <div style={{ width: 394, border: `0.75px solid ${DIV}`, padding: 27, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 27 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ ...serif, fontSize: 48, lineHeight: 0.9 }}>{data.name}</div>
          {data.title && <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: INK }}>{data.title}</div>}
        </div>

        {data.summary && (<>
          <div style={{ height: 1, background: DIV, margin: '0 -27px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SecHead>Summary</SecHead>
            <div style={body}>{data.summary}</div>
          </div>
        </>)}

        {data.experience.length > 0 && (<>
          <div style={{ height: 1, background: DIV, margin: '0 -27px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SecHead>Experience</SecHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: INK }}>{exp.role}{exp.company ? ` · ${exp.company}` : ''}</div>
                  {exp.period && <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, lineHeight: 1.5, color: INK }}>{exp.period}</div>}
                  {exp.achievements?.map((a, j) => (
                    <div key={j} style={{ display: 'flex', gap: 6 }}>
                      <span style={body}>•</span><span style={{ ...body, flex: 1 }}>{a}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>)}

        {data.education.length > 0 && (<>
          <div style={{ height: 1, background: DIV, margin: '0 -27px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SecHead>Education</SecHead>
            {data.education.map((ed, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: INK }}>{ed.institution}</div>
                {ed.degree && <div style={body}>{ed.degree}</div>}
              </div>
            ))}
          </div>
        </>)}
      </div>

      {/* Правая колонка */}
      <div style={{ width: 194, padding: '27px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 40 }}>
        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SecHead>Contact</SecHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map((c, i) => <ItemRow key={i}>{c}</ItemRow>)}
            </div>
          </div>
        )}

        {data.languages?.length ? (<>
          <div style={{ height: 1, background: DIV }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SecHead>Languages</SecHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.languages.map((l, i) => <ItemRow key={i}>{l}</ItemRow>)}
            </div>
          </div>
        </>) : null}

        {skills.length > 0 && (<>
          <div style={{ height: 1, background: DIV }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SecHead>Skills</SecHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {skills.map((s, i) => <span key={i} style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, lineHeight: 1.3, color: INK }}>{s}</span>)}
            </div>
          </div>
        </>)}
      </div>
    </div>
  )
}

// ── 10. Prime ────────────────────────────────────────────────────────────────
function PreviewPrime({ data }: { data: ResumeData }) {
  const GOLD = '#f8c625', INK = '#3b3b3b', DIM = '#999999', LINE = '#999999'
  const font = 'Figtree, system-ui, sans-serif'
  const nameParts = (data.name || '').trim().split(/\s+/)
  const first = nameParts[0] || '', rest = nameParts.slice(1).join(' ')

  const contacts = [
    data.phone    ? { label: 'Phone',     val: data.phone }    : null,
    data.email    ? { label: 'Email',     val: data.email }    : null,
    data.location ? { label: 'Address',   val: data.location } : null,
    data.linkedin ? { label: 'LinkedIn',  val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio', val: data.github }   : null,
  ].filter(Boolean) as { label: string; val: string }[]
  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  const heading: React.CSSProperties = { fontSize: 17, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: INK, margin: 0 }
  const body: React.CSSProperties = { fontSize: 11, fontWeight: 500, lineHeight: 1.5, color: DIM, margin: 0 }
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={heading}>{title}</p>
      {children}
    </div>
  )

  return (
    <div style={{ fontFamily: font, background: '#ffffff', color: INK, padding: '52px 48px', position: 'relative' }}>
      {/* Жёлтый тэг в углу */}
      <div style={{ position: 'absolute', top: 0, right: 48, width: 46, height: 96, background: GOLD }} />

      {/* Хедер */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontSize: 38, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
          <span style={{ color: GOLD }}>{first}</span>{rest ? <span style={{ color: INK }}>{` ${rest}`}</span> : null}
        </p>
        {data.title ? <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4.4, textTransform: 'uppercase', color: INK, margin: 0, lineHeight: 1 }}>{data.title}</p> : null}
      </div>
      <div style={{ height: 1, background: LINE, marginTop: 16 }} />

      <div style={{ display: 'flex', gap: 40, marginTop: 32 }}>
        {/* ЛЕВАЯ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 36 }}>
          {data.summary && <Section title="Summary"><p style={body}>{data.summary}</p></Section>}

          {data.experience.length > 0 && (
            <Section title="Experience">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div>
                        {exp.period && <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: INK, margin: 0, lineHeight: 1.5 }}>{exp.period}</p>}
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: INK, margin: 0, lineHeight: 1.5 }}>{exp.role}</p>
                      </div>
                      {exp.company && <p style={{ fontSize: 11, fontWeight: 500, fontStyle: 'italic', color: DIM, margin: 0, lineHeight: 1.5 }}>{exp.company}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {exp.achievements?.map((a, j) => (
                        <div key={j} style={{ display: 'flex', gap: 6 }}>
                          <span style={{ ...body, width: 9, textAlign: 'center', flexShrink: 0 }}>•</span>
                          <span style={body}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {data.education.length > 0 && (
            <Section title="Education">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.education.map((ed, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: INK, margin: 0, lineHeight: 1.5 }}>{ed.institution}</p>
                    {ed.degree && <p style={{ fontSize: 11, fontWeight: 500, fontStyle: 'italic', color: DIM, margin: 0, lineHeight: 1.5 }}>{ed.degree}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ПРАВАЯ */}
        <div style={{ width: 165, display: 'flex', flexDirection: 'column', gap: 36 }}>
          {contacts.length > 0 && (
            <Section title="Contact">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {contacts.map((c, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: INK, margin: 0, lineHeight: 1.5 }}>{c.label}</p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: DIM, margin: 0, lineHeight: 1.3 }}>{c.val}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {data.languages && data.languages.length > 0 && (
            <Section title="Languages">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.languages.map((l, i) => <p key={i} style={{ fontSize: 11, fontWeight: 500, color: DIM, margin: 0, lineHeight: 1.3 }}>{l}</p>)}
              </div>
            </Section>
          )}

          {skills.length > 0 && (
            <Section title="Skills">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {skills.map((s, i) => <p key={i} style={{ fontSize: 11, fontWeight: 500, color: DIM, margin: 0, lineHeight: 1.3 }}>{s}</p>)}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 11. Nordic ───────────────────────────────────────────────────────────────
function PreviewNordic({ data }: { data: ResumeData }) {
  const INK = '#537872', BODY = '#1c2221'
  const font = 'Gabarito, system-ui, sans-serif'
  const nameWords = (data.name || '').trim().split(/\s+/).filter(Boolean)

  const contacts = [
    data.phone    ? { label: 'Phone.',     val: data.phone }    : null,
    data.email    ? { label: 'Email.',     val: data.email }    : null,
    data.location ? { label: 'Address.',   val: data.location } : null,
    data.linkedin ? { label: 'LinkedIn.',  val: data.linkedin } : null,
    data.github   ? { label: 'Portfolio.', val: data.github }   : null,
  ].filter(Boolean) as { label: string; val: string }[]
  const skills = [...data.skills.technical, ...data.skills.soft].map(skillName)

  const SecHead = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: INK, whiteSpace: 'nowrap' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: INK }} />
    </div>
  )
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: INK, margin: 0 }
  const val: React.CSSProperties = { fontSize: 11, fontWeight: 400, color: BODY, margin: 0 }

  return (
    <div style={{ fontFamily: font, background: 'linear-gradient(145deg, #e1ffe8 0%, #f3ffe1 100%)', padding: '40px 48px 50px', position: 'relative', color: BODY }}>
      {/* орбитальная графика */}
      <svg viewBox="0 0 162.373 148" width={150} height={137} style={{ position: 'absolute', top: 97, right: 60 }}>
        <g fill={INK}>
          <path d="M132.896 138.776C121.864 138.778 106.165 132.568 89.6002 121.236C65.9868 105.082 45.4823 84.061 31.8632 62.0466C19.3856 41.8766 14.846 24.0622 19.7221 14.3931C22.6132 8.65772 30.0897 3.21765 49.2627 9.87131L48.8345 11.1034C34.363 6.08077 24.6963 7.42256 20.8865 14.9807C11.1548 34.2819 41.2905 86.6065 90.3367 120.159C112.332 135.207 132.611 141.145 141.991 135.293C146.936 132.209 148.767 125.994 147.431 116.819L148.723 116.632C150.139 126.366 148.107 133.017 142.681 136.4C140.115 138 136.796 138.776 132.896 138.776Z" />
          <path d="M148.385 30.8775L147.106 30.6227C148.759 22.3001 147.553 15.9352 143.616 12.2161C139.328 8.16563 131.789 7.27384 122.385 9.70477L122.059 8.44219C131.91 5.89337 139.886 6.89743 144.511 11.2676C148.792 15.311 150.132 22.0919 148.385 30.8775Z" />
          <path d="M124.608 75.1078C120.293 81.356 120.471 81.7507 133.08 92.5748C120.168 82.1583 119.716 82.0261 114.372 87.4209C118.958 81.3445 118.776 80.9458 106.138 70.1517C119.026 80.6025 119.483 80.7366 124.608 75.1078Z" />
          <path d="M77.0208 121.235L76.2818 120.16C106.211 99.4454 140.149 62.0341 147.108 30.6091L148.382 30.8906C141.35 62.6446 107.16 100.376 77.0208 121.235Z" />
          <path d="M33.8572 138.712C29.4168 138.712 25.7078 137.719 22.9546 135.672C18.5997 132.436 14.534 125.034 19.8955 108.153L21.1391 108.548C17.0797 121.329 17.9767 130.347 23.732 134.625C32.8764 141.421 53.502 135.743 76.2821 120.16L77.0211 121.235C60.4442 132.575 44.8949 138.712 33.8572 138.712Z" />
          <path d="M86.0633 148C75.0369 148 64.184 145.583 54.1286 140.77C35.1684 131.697 20.5718 115.14 14.0803 95.3458L15.3213 94.9394C21.7007 114.397 36.0513 130.672 54.6918 139.594C67.5988 145.771 88.2955 151.129 113.606 141.569C145.26 129.612 163.766 100.53 160.747 67.4789C157.702 34.1141 134.005 8.62185 100.378 2.53537C63.3365 -4.17102 27.656 16.4054 15.5339 51.4573L14.3006 51.0305C20.1527 34.1115 31.9905 19.7399 47.6355 10.5636C63.5162 1.2503 82.33 -2.0586 100.61 1.251C134.83 7.44576 158.947 33.3948 162.047 67.3603C165.119 101.012 146.286 130.619 114.067 142.789C104.859 146.267 95.3987 148 86.0633 148Z" />
          <path d="M22.3657 72.9308C13.9786 74.4749 12.727 75.7265 11.1827 84.1138C9.63865 75.7267 8.38711 74.4749 1.50651e-05 72.9308C8.38711 71.3868 9.63865 70.1352 11.1827 61.7481C12.7268 70.1352 13.9786 71.387 22.3657 72.9308Z" />
          <path d="M26.9519 84.1127C23.5122 84.7459 22.999 85.2592 22.3657 88.6989C21.7324 85.2592 21.2191 84.7459 17.7794 84.1127C21.2191 83.4794 21.7324 82.9661 22.3657 79.5264C22.9988 82.9661 23.5122 83.4794 26.9519 84.1127Z" />
          <path d="M122.222 67.5401C118.782 68.1733 118.269 68.6866 117.636 72.1263C117.002 68.6866 116.489 68.1733 113.049 67.5401C116.489 66.9068 117.002 66.3935 117.636 62.9538C118.269 66.3935 118.782 66.9068 122.222 67.5401Z" />
        </g>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Контакты */}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 16, columnGap: 12 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ width: 'calc((100% - 24px) / 3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={label}>{c.label}</p>
                <p style={val}>{c.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Имя + summary */}
        <div style={{ paddingRight: 80, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              {nameWords.map((w, i) => <p key={i} style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', color: INK, margin: 0 }}>{w}</p>)}
            </div>
            {data.title && <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: INK, margin: 0 }}>{data.title}</p>}
          </div>
          {data.summary && <p style={{ fontSize: 11, fontWeight: 400, lineHeight: 1.4, color: BODY, margin: 0 }}>{data.summary}</p>}
        </div>

        {/* Опыт */}
        {data.experience.length > 0 && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            <div style={{ width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: INK, whiteSpace: 'nowrap', transform: 'rotate(-90deg)' }}>Experience</span>
            </div>
            <div style={{ flex: 1, border: `1px solid ${INK}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 111, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {exp.period && <p style={{ ...label, letterSpacing: 0, fontSize: 11 }}>{exp.period}</p>}
                    {exp.company && <p style={{ fontSize: 11, color: BODY, margin: 0, lineHeight: 1.4 }}>{exp.company}</p>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ ...label, letterSpacing: 0, fontSize: 11 }}>{exp.role}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {exp.achievements?.map((a, j) => (
                        <div key={j} style={{ display: 'flex', gap: 6 }}>
                          <span style={{ width: 8, textAlign: 'center', flexShrink: 0, fontSize: 11, color: BODY }}>•</span>
                          <span style={{ fontSize: 11, color: BODY, lineHeight: 1.4 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Низ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.languages && data.languages.length > 0 && (<>
                <SecHead>Language</SecHead>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.languages.map((l, i) => <p key={i} style={{ fontSize: 11, color: BODY, margin: 0 }}>{l}</p>)}
                </div>
              </>)}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.education.length > 0 && (<>
                <SecHead>Education</SecHead>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.education.map((ed, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={label}>{ed.institution}</p>
                      {ed.degree && <p style={{ fontSize: 11, color: BODY, margin: 0, lineHeight: 1.4 }}>{ed.degree}</p>}
                    </div>
                  ))}
                </div>
              </>)}
            </div>
          </div>

          {skills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SecHead>Skills</SecHead>
              <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 8, columnGap: 8 }}>
                {skills.map((s, i) => <span key={i} style={{ fontSize: 11, color: BODY }}>{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Public exports ───────────────────────────────────────────────────────────

const TEMPLATE_BG: Partial<Record<TemplateId, string>> = {
  startup: '#0f0f1a',
  elegant: '#fdfaf5',
  volt:    '#E6FF00',
  atelier: 'linear-gradient(35deg, #ffffff 0%, #d7deff 46%, #ffffff 100%)',
  prime:   '#ffffff',
  nordic:  'linear-gradient(145deg, #e1ffe8 0%, #f3ffe1 100%)',
}
// A4 height in px at design width 680
const A4_H = Math.round(680 * 297 / 210)

export function ResumePreview({ data, template, bare }: { data: ResumeData; template: TemplateId; bare?: boolean }) {
  const bg = TEMPLATE_BG[template] ?? '#ffffff'

  const inner = (() => {
    if (template === 'corporate') return <PreviewCorporate data={data} />
    if (template === 'startup')   return <PreviewStartup   data={data} />
    if (template === 'academic')  return <PreviewAcademic  data={data} />
    if (template === 'creative')  return <PreviewModern    data={data} />
    if (template === 'elegant')   return <PreviewElegant   data={data} />
    if (template === 'aurora')    return <PreviewAurora    data={data} />
    if (template === 'volt')      return <PreviewVolt      data={data} />
    if (template === 'atelier')   return <PreviewAtelier   data={data} />
    if (template === 'prime')     return <PreviewPrime     data={data} />
    if (template === 'nordic')    return <PreviewNordic    data={data} />
    return <PreviewMinimal data={data} />
  })()

  if (bare) return (
    <div style={{ width: '100%', minHeight: A4_H, background: bg, boxSizing: 'border-box' as const }}>
      {inner}
    </div>
  )
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, maxWidth: 680, margin: '0 auto', overflow: 'hidden', background: bg, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      {inner}
    </div>
  )
}

// ─── PDF canvas rendering helpers ────────────────────────────────────────────

async function blobUrlToPageImages(url: string, scale: number): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }
  const doc = await pdfjs.getDocument({ url }).promise
  const imgs: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const vp = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width  = vp.width
    canvas.height = vp.height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvas, viewport: vp }).promise
    imgs.push(canvas.toDataURL('image/jpeg', 0.93))
  }
  return imgs
}

/** Pre-render PDF to images during the generation loading phase so the result shows instantly. */
export async function renderResumeToImages(
  data: ResumeData, template: TemplateId, scale = 3
): Promise<string[]> {
  const blob = await pdf(<ResumeDocument data={data} template={template} />).toBlob()
  const url  = URL.createObjectURL(blob)
  try {
    return await blobUrlToPageImages(url, scale)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * PDF-точное превью — рендерит настоящий PDF через pdfjs-dist в canvas.
 * initialPages: уже отрендеренные во время генерации страницы — отображаются мгновенно.
 * При смене шаблона — перерендеривает в фоне.
 */
export function PDFLivePreview({
  data, template, initialPages, pageGap = 20,
}: {
  data: ResumeData; template: TemplateId; initialPages?: string[]; pageGap?: number
}) {
  const [pageImgs, setPageImgs] = useState<string[]>(initialPages ?? [])
  const [rendering, setRendering] = useState(false)
  const mountTemplate = useRef(template) // template that was already pre-rendered

  useEffect(() => {
    // Skip re-render if this template was already pre-rendered as initialPages
    if (template === mountTemplate.current && initialPages?.length) return

    let active = true
    setRendering(true)

    renderResumeToImages(data, template, 3)
      .then(imgs  => { if (active) { setPageImgs(imgs);  setRendering(false) } })
      .catch(()   => { if (active) setRendering(false) })

    return () => { active = false }
  }, [template])

  if (pageImgs.length === 0) {
    // Only reached if no initialPages and still rendering — shows blank card
    return (
      <div style={{
        width: '100%', aspectRatio: '210 / 297', borderRadius: 12,
        boxShadow: '0 6px 32px rgba(0,0,0,.14)', background: '#f9fafb',
      }} />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: pageGap, position: 'relative' }}>
      {/* Translucent overlay while re-rendering after template switch */}
      {rendering && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(255,255,255,0.55)', borderRadius: 12,
          pointerEvents: 'none',
        }} />
      )}
      {pageImgs.map((src, i) => (
        <div key={i} style={{
          width: '100%', borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 6px 32px rgba(0,0,0,.14)', userSelect: 'none',
        }}>
          <img
            src={src}
            alt={`Page ${i + 1}`}
            draggable={false}
            onDragStart={e => e.preventDefault()}
            style={{ width: '100%', display: 'block', WebkitUserDrag: 'none' } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Кнопка скачивания
 */

export const ResumeDownloadButton = forwardRef<HTMLButtonElement, {
  data: ResumeData
  template: TemplateId
  filename?: string
}>(function ResumeDownloadButton({ data, template, filename = 'resume.pdf' }, ref) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const blob = await pdf(<ResumeDocument data={data} template={template} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button ref={ref} onClick={handleDownload} disabled={loading} style={{
      padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
      background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff',
      border: 'none', cursor: loading ? 'wait' : 'pointer', width: '100%',
    }}>
      {loading ? 'Preparing PDF...' : '⬇ Download Resume (PDF)'}
    </button>
  )
})

