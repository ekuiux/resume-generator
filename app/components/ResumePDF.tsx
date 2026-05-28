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
import { useState, forwardRef } from 'react'

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

export type TemplateId = 'minimal' | 'business' | 'creative' | 'corporate' | 'elegant' | 'academic' | 'startup'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
            {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
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
  page:        { fontFamily: 'Roboto', backgroundColor: '#ffffff', padding: 0 },
  header:      { backgroundColor: CORP_BLUE, padding: '36 48 28 48' },
  headerName:  { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 4, letterSpacing: 0.3 },
  headerTitle: { fontSize: 10, color: '#93c5fd', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 14 },
  headerContacts: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  headerContact:  { fontSize: 9, color: '#bfdbfe' },
  body:        { padding: '32 48 40 48' },
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
            {data.linkedin && <Text style={corpStyles.headerContact}>{data.linkedin}</Text>}
            {data.github   && <Text style={corpStyles.headerContact}>{data.github}</Text>}
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
              <View key={i} style={corpStyles.expBlock}>
                <View style={corpStyles.expHead}>
                  <Text style={corpStyles.expCompany}>{exp.company}</Text>
                  <Text style={corpStyles.expPeriod}>{exp.period}</Text>
                </View>
                <Text style={corpStyles.expRole}>{exp.role}</Text>
                {exp.achievements.map((ach, j) => (
                  <View key={j} style={corpStyles.bullet}>
                    <Text style={corpStyles.bulletDot}>▸</Text>
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
            {data.linkedin && <Text style={eleStyles.contact}>{data.linkedin}</Text>}
            {data.github   && <Text style={eleStyles.contact}>{data.github}</Text>}
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
            <View key={i} style={eleStyles.expBlock}>
              <View style={eleStyles.expHead}>
                <Text style={eleStyles.expCompany}>{exp.company}</Text>
                <Text style={eleStyles.expPeriod}>{exp.period}</Text>
              </View>
              <Text style={eleStyles.expRole}>{exp.role}</Text>
              {exp.achievements.map((ach, j) => (
                <View key={j} style={eleStyles.bullet}>
                  <Text style={eleStyles.bulletDot}>✦</Text>
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
            {data.linkedin && <Text style={acaStyles.sbItem}>{data.linkedin}</Text>}
            {data.github   && <Text style={acaStyles.sbItem}>{data.github}</Text>}

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
              <View key={i} style={acaStyles.expBlock}>
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
          {data.linkedin && <Text style={stpStyles.contact}>{data.linkedin}</Text>}
          {data.github   && <Text style={stpStyles.contact}>{data.github}</Text>}
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
            <View key={i} style={stpStyles.expBlock}>
              <View style={stpStyles.expHead}>
                <Text style={stpStyles.expCompany}>{exp.company}</Text>
                <Text style={stpStyles.expPeriod}>{exp.period}</Text>
              </View>
              <Text style={stpStyles.expRole}>{exp.role}</Text>
              {exp.achievements.map((ach, j) => (
                <View key={j} style={stpStyles.bullet}>
                  <Text style={stpStyles.bulletDot}>▸</Text>
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

// ─── Router ───────────────────────────────────────────────────────────────────

function ResumeDocument({ data, template }: { data: ResumeData; template: TemplateId }) {
  if (template === 'business')   return <BusinessResume  data={data} />
  if (template === 'creative')   return <CreativeResume  data={data} />
  if (template === 'corporate')  return <CorporateResume data={data} />
  if (template === 'elegant')    return <ElegantResume   data={data} />
  if (template === 'academic')   return <AcademicResume  data={data} />
  if (template === 'startup')    return <StartupResume   data={data} />
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
  const sec = { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#111', marginBottom: 10 }
  const hr  = (thick?: boolean) => <div style={{ height: thick ? 1 : 0.5, background: thick ? '#111' : '#e5e7eb', margin: '18px 0' }} />
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111', padding: '40px 48px' }}>
      <p style={{ fontSize: 26, fontWeight: 700, marginBottom: 3, letterSpacing: 0.3 }}>{data.name}</p>
      <p style={{ fontSize: 11, color: '#666', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>{data.title}</p>
      <PreviewContacts data={data} style={{ fontSize: 11, color: '#888', gap: '3px 16px' }} />
      {hr(true)}
      {data.summary && <><p style={sec}>Summary</p><p style={{ fontSize: 13, color: '#444', lineHeight: 1.7, marginBottom: 4 }}>{data.summary}</p>{hr()}</>}
      <p style={sec}>Experience</p>
      {data.experience?.map((exp, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{exp.company}</span>
            <span style={{ fontSize: 11, color: '#888' }}>{exp.period}</span>
          </div>
          <p style={{ fontSize: 12, color: '#555', fontStyle: 'italic', margin: '2px 0 6px' }}>{exp.role}</p>
          <PreviewExp exp={exp} bulletColor="#111" dotChar="—" />
        </div>
      ))}
      {hr()}
      <p style={sec}>Skills</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
          <span key={i} style={{ fontSize: 11, padding: '3px 9px', border: '0.5px solid #ccc', color: '#333' }}>{s}</span>
        ))}
      </div>
      {data.education?.length > 0 && <>{hr()}<p style={sec}>Education</p>{data.education.map((ed, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div><p style={{ fontSize: 13, fontWeight: 600 }}>{ed.institution}</p><p style={{ fontSize: 12, color: '#666' }}>{ed.degree}</p></div>
          <span style={{ fontSize: 11, color: '#888' }}>{ed.year}</span>
        </div>
      ))}</>}
      {data.languages?.length ? <>{hr()}<p style={sec}>Languages</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{data.languages.map((l, i) => <span key={i} style={{ fontSize: 11, padding: '3px 9px', border: '0.5px solid #ccc', color: '#333' }}>{l}</span>)}</div></> : null}
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
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: accentBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0, marginLeft: 20 }}>
          {data.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
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
        {/* Photo */}
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: dark, marginBottom: 12 }}>
          {data.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
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

// ─── Public exports ───────────────────────────────────────────────────────────

const TEMPLATE_BG: Partial<Record<TemplateId, string>> = {
  startup: '#0f0f1a',
  elegant: '#fdfaf5',
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

