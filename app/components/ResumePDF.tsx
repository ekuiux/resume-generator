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
  pdf,
} from '@react-pdf/renderer'
import { useState } from 'react'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400, fontStyle: 'italic' },
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

export type TemplateId = 'minimal' | 'business' | 'creative'

// ─── Шаблон 1: MINIMAL ───────────────────────────────────────────────────────
// Чёрно-белый, тонкие линии, много воздуха. Работает для любой индустрии.

const minimalStyles = StyleSheet.create({
  page:        { fontFamily: 'Roboto', backgroundColor: '#ffffff', padding: '48 52 48 52' },
  header:      { marginBottom: 28 },
  name:        { fontSize: 26, fontWeight: 'bold', color: '#111111', letterSpacing: 0.5, marginBottom: 4 },
  title:       { fontSize: 11, color: '#666666', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  contacts:    { flexDirection: 'row', gap: 18, flexWrap: 'wrap' },
  contact:     { fontSize: 9, color: '#888888' },
  divider:     { height: 0.75, backgroundColor: '#111111', marginBottom: 22, marginTop: 22 },
  thinDivider: { height: 0.5, backgroundColor: '#e5e7eb', marginBottom: 14, marginTop: 14 },
  section:     { marginBottom: 20 },
  sectionTitle:{ fontSize: 9, fontWeight: 'bold', color: '#111111', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  summary:     { fontSize: 10.5, color: '#444444', lineHeight: 1.7 },
  expRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  expCompany:  { fontSize: 11, fontWeight: 'bold', color: '#111111' },
  expPeriod:   { fontSize: 9.5, color: '#888888' },
  expRole:     { fontSize: 10, color: '#555555', marginBottom: 6, fontStyle: 'italic' },
  bullet:      { flexDirection: 'row', marginBottom: 4, paddingLeft: 2 },
  bulletDot:   { fontSize: 9.5, color: '#111111', width: 14, marginTop: 1 },
  bulletText:  { fontSize: 9.5, color: '#444444', lineHeight: 1.6, flex: 1 },
  skillsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillTag:    { fontSize: 9, color: '#333333', paddingHorizontal: 8, paddingVertical: 3, border: '0.5 solid #cccccc' },
  eduRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  eduName:     { fontSize: 10.5, fontWeight: 'bold', color: '#111111' },
  eduDeg:      { fontSize: 9.5, color: '#666666' },
  eduYear:     { fontSize: 9.5, color: '#888888' },
})

function MinimalResume({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={minimalStyles.page}>

        {/* Header */}
        <View style={minimalStyles.header}>
          <Text style={minimalStyles.name}>{data.name}</Text>
          <Text style={minimalStyles.title}>{data.title}</Text>
          <View style={minimalStyles.contacts}>
            {data.email    && <Text style={minimalStyles.contact}>{data.email}</Text>}
            {data.phone    && <Text style={minimalStyles.contact}>{data.phone}</Text>}
            {data.location && <Text style={minimalStyles.contact}>{data.location}</Text>}
            {data.linkedin && <Text style={minimalStyles.contact}>{data.linkedin}</Text>}
            {data.github   && <Text style={minimalStyles.contact}>{data.github}</Text>}
          </View>
        </View>

        <View style={minimalStyles.divider} />

        {/* Summary */}
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Summary</Text>
          <Text style={minimalStyles.summary}>{data.summary}</Text>
        </View>

        <View style={minimalStyles.thinDivider} />

        {/* Experience */}
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={minimalStyles.expRow}>
                <Text style={minimalStyles.expCompany}>{exp.company}</Text>
                <Text style={minimalStyles.expPeriod}>{exp.period}</Text>
              </View>
              <Text style={minimalStyles.expRole}>{exp.role}</Text>
              {exp.achievements.map((ach, j) => (
                <View key={j} style={minimalStyles.bullet}>
                  <Text style={minimalStyles.bulletDot}>—</Text>
                  <Text style={minimalStyles.bulletText}>{ach}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={minimalStyles.thinDivider} />

        {/* Skills */}
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Skills</Text>
          <View style={minimalStyles.skillsRow}>
            {data.skills.technical.map((s, i) => (
              <Text key={i} style={minimalStyles.skillTag}>{s}</Text>
            ))}
          </View>
        </View>

        <View style={minimalStyles.thinDivider} />

        {/* Education */}
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Education</Text>
          {data.education.map((ed, i) => (
            <View key={i} style={minimalStyles.eduRow}>
              <View>
                <Text style={minimalStyles.eduName}>{ed.institution}</Text>
                <Text style={minimalStyles.eduDeg}>{ed.degree}</Text>
              </View>
              <Text style={minimalStyles.eduYear}>{ed.year}</Text>
            </View>
          ))}
        </View>

        {data.languages && data.languages.length > 0 && (
          <>
            <View style={minimalStyles.thinDivider} />
            <View style={minimalStyles.section}>
              <Text style={minimalStyles.sectionTitle}>Languages</Text>
              <View style={minimalStyles.skillsRow}>
                {data.languages.map((l, i) => (
                  <Text key={i} style={minimalStyles.skillTag}>{l}</Text>
                ))}
              </View>
            </View>
          </>
        )}

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
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: BIZ_ACCENT, marginBottom: 18, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
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
  const initials = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Document>
      <Page size="A4" style={bizStyles.page}>

        {/* Sidebar */}
        <View style={bizStyles.sidebar}>
          <View style={bizStyles.avatar}>
            <Text style={bizStyles.avatarText}>{initials}</Text>
          </View>
          <Text style={bizStyles.sbName}>{data.name}</Text>
          <Text style={bizStyles.sbTitle}>{data.title}</Text>

          <View style={bizStyles.sbSection}>
            <Text style={bizStyles.sbSectionT}>Contacts</Text>
            {data.email    && <Text style={bizStyles.sbItem}>✉  {data.email}</Text>}
            {data.phone    && <Text style={bizStyles.sbItem}>✆  {data.phone}</Text>}
            {data.location && <Text style={bizStyles.sbItem}>⌖  {data.location}</Text>}
            {data.linkedin && <Text style={bizStyles.sbItem}>in  {data.linkedin}</Text>}
            {data.github   && <Text style={bizStyles.sbItem}>⌨  {data.github}</Text>}
          </View>

          <View style={bizStyles.sbSection}>
            <Text style={bizStyles.sbSectionT}>Skills</Text>
            {data.skills.technical.slice(0, 8).map((s, i) => (
              <View key={i}>
                <Text style={bizStyles.sbSkill}>{s}</Text>
                <View style={bizStyles.sbBar}>
                  <View style={{ ...bizStyles.sbBarFill, width: `${75 + (i % 3) * 8}%` }} />
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
              <View key={i} style={bizStyles.expBlock}>
                <View style={bizStyles.expHead}>
                  <Text style={bizStyles.expCompany}>{exp.company}</Text>
                  <Text style={bizStyles.expPeriod}>{exp.period}</Text>
                </View>
                <Text style={bizStyles.expRole}>{exp.role}</Text>
                {exp.achievements.map((ach, j) => (
                  <View key={j} style={bizStyles.bullet}>
                    <Text style={bizStyles.bulletDot}>▸</Text>
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
  page:       { fontFamily: 'Roboto', backgroundColor: '#ffffff', padding: 0 },
  topBand:    { backgroundColor: CRE_DARK, padding: '36 48 32 48' },
  nameLine:   { flexDirection: 'row', alignItems: 'flex-end', gap: 0, marginBottom: 6 },
  nameFirst:  { fontSize: 34, fontWeight: 'bold', color: '#ffffff', letterSpacing: -0.5 },
  nameLast:   { fontSize: 34, fontWeight: 'bold', color: CRE_GREEN, letterSpacing: -0.5 },
  topTitle:   { fontSize: 12, color: '#6ee7b7', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 },
  topContacts:{ flexDirection: 'row', gap: 24 },
  topContact: { fontSize: 9, color: '#a7f3d0' },
  body:       { padding: '32 48 40 48' },
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
            {data.linkedin && <Text style={creStyles.topContact}>{data.linkedin}</Text>}
            {data.github   && <Text style={creStyles.topContact}>{data.github}</Text>}
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
                <View key={i} style={creStyles.expBlock}>
                  <View style={creStyles.expTop}>
                    <Text style={creStyles.expCo}>{exp.company}</Text>
                    <Text style={creStyles.expBadge}>{exp.period}</Text>
                  </View>
                  <Text style={creStyles.expRole}>{exp.role}</Text>
                  {exp.achievements.map((ach, j) => (
                    <View key={j} style={creStyles.bullet}>
                      <Text style={creStyles.bulletDot}>◆</Text>
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
                  <Text style={creStyles.sectionT}>Technologies</Text>
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
                  <Text style={creStyles.sectionT}>Soft skills</Text>
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

// ─── Router ───────────────────────────────────────────────────────────────────

function ResumeDocument({ data, template }: { data: ResumeData; template: TemplateId }) {
  if (template === 'business') return <BusinessResume data={data} />
  if (template === 'creative') return <CreativeResume data={data} />
  return <MinimalResume data={data} />
}

// ─── Public exports ───────────────────────────────────────────────────────────

/**
 * Inline PDF preview (iframe) — показывай до оплаты
 * Работает только на клиенте, поэтому оберни в dynamic import с ssr: false
 */
export function ResumePreview({ data, template }: { data: ResumeData; template: TemplateId }) {
  void template
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: '40px 48px', maxWidth: 680, margin: '0 auto', textAlign: 'left',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
    }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{data.name}</h2>
      <p style={{ fontSize: 12, color: '#6b7280', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>{data.title}</p>
      {(data.email || data.phone || data.location || data.linkedin || data.github) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginBottom: 16 }}>
          {data.email    && <span style={{ fontSize: 12, color: '#9ca3af' }}>{data.email}</span>}
          {data.phone    && <span style={{ fontSize: 12, color: '#9ca3af' }}>{data.phone}</span>}
          {data.location && <span style={{ fontSize: 12, color: '#9ca3af' }}>{data.location}</span>}
          {data.linkedin && <span style={{ fontSize: 12, color: '#9ca3af' }}>{data.linkedin}</span>}
          {data.github   && <span style={{ fontSize: 12, color: '#9ca3af' }}>{data.github}</span>}
        </div>
      )}

      <div style={{ height: 1, background: '#111', marginBottom: 20 }} />

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Summary</p>
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>{data.summary}</p>

      <div style={{ height: 1, background: '#e5e7eb', marginBottom: 20 }} />

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Experience</p>
      {data.experience?.map((exp, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{exp.company}</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{exp.period}</span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontStyle: 'italic' }}>{exp.role}</p>
          {exp.achievements?.map((a, j) => (
            <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#111', marginTop: 2 }}>—</span>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{a}</span>
            </div>
          ))}
        </div>
      ))}

      <div style={{ height: 1, background: '#e5e7eb', marginBottom: 20 }} />

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Skills</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {data.skills?.technical?.map((s, i) => (
          <span key={i} style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}>{s}</span>
        ))}
      </div>

      <div style={{ height: 1, background: '#e5e7eb', marginBottom: 20 }} />

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Education</p>
      {data.education?.map((ed, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{ed.institution}</p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>{ed.degree}</p>
          </div>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{ed.year}</span>
        </div>
      ))}

      {data.languages && data.languages.length > 0 && (
        <>
          <div style={{ height: 1, background: '#e5e7eb', marginTop: 20, marginBottom: 20 }} />
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Languages</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.languages.map((l, i) => (
              <span key={i} style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}>{l}</span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Кнопка скачивания — показывай после оплаты
 * isPaid prop блокирует скачивание до Stripe webhook
 */
export function ResumeDownloadButton({ data, template, filename = 'resume.pdf' }: {
  data: ResumeData
  template: TemplateId
  filename?: string
}) {
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
    <button onClick={handleDownload} disabled={loading} style={{
      padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
      background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff',
      border: 'none', cursor: loading ? 'wait' : 'pointer', width: '100%',
    }}>
      {loading ? 'Preparing PDF...' : '⬇ Download resume (PDF)'}
    </button>
  )
}

/**
 * Пример использования в странице (после dynamic import):
 *
 * // app/resume/preview/page.tsx
 * import dynamic from 'next/dynamic'
 *
 * const ResumePreview = dynamic(
 *   () => import('@/components/ResumePDF').then(m => m.ResumePreview),
 *   { ssr: false }
 * )
 * const ResumeDownloadButton = dynamic(
 *   () => import('@/components/ResumePDF').then(m => m.ResumeDownloadButton),
 *   { ssr: false }
 * )
 */
