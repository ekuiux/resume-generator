'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const ResumePreview = dynamic(
  () => import('./ResumePDF').then(m => m.ResumePreview),
  { ssr: false, loading: () => <div style={{ height: 700, background: '#f9fafb', borderRadius: 12 }} /> }
)

const ResumeDownloadButton = dynamic(
  () => import('./ResumePDF').then(m => m.ResumeDownloadButton),
  { ssr: false }
)

interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
}

interface FormData {
  name: string
  targetRole: string
  email: string
  phone: string
  location: string
  linkedin: string
  industry: string
  level: string
  experience: Experience[]
  education: string
  technicalSkills: string
  languages: string[]
  template: 'minimal' | 'business' | 'creative'
}

const INDUSTRIES = ['IT / Разработка', 'Маркетинг', 'Финансы', 'Продажи', 'Дизайн', 'HR', 'Другое']
const LEVELS = ['Junior', 'Middle', 'Senior', 'Lead / Manager']
const LANGUAGES = ['Украинский (родной)', 'Русский (родной)', 'Английский B2', 'Польский', 'Немецкий']
const TEMPLATES = [
  { id: 'minimal', label: 'Минимализм', color: '#f5f5f5' },
  { id: 'business', label: 'Бизнес',    color: '#dbeafe' },
  { id: 'creative', label: 'Креатив',   color: '#d1fae5' },
] as const

const INITIAL_FORM: FormData = {
  name: '', targetRole: '', email: '', phone: '',
  location: '', linkedin: '', industry: 'IT / Разработка', level: 'Middle',
  experience: [], education: '',
  technicalSkills: '', languages: ['Украинский (родной)', 'Английский B2'],
  template: 'minimal',
}

function newExp(): Experience {
  return { id: crypto.randomUUID(), company: '', role: '', startDate: '', endDate: '', description: '' }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '10px 12px',
        fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8,
        outline: 'none', background: '#fff', color: '#111',
        transition: 'border-color 0.15s', ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = '#6366f1' }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={4}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '10px 12px',
        fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8,
        outline: 'none', resize: 'vertical', background: '#fff', color: '#111',
        fontFamily: 'inherit', lineHeight: 1.6, transition: 'border-color 0.15s', ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = '#6366f1' }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
    />
  )
}

function TagGroup({ options, selected, multi = true, onChange }: {
  options: string[]
  selected: string | string[]
  multi?: boolean
  onChange: (val: string | string[]) => void
}) {
  const isActive = (opt: string) =>
    multi ? (selected as string[]).includes(opt) : selected === opt

  const toggle = (opt: string) => {
    if (multi) {
      const arr = selected as string[]
      onChange(arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt])
    } else {
      onChange(opt)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)} style={{
          fontSize: 13, padding: '5px 14px', borderRadius: 20, border: '1px solid',
          cursor: 'pointer', transition: 'all 0.15s',
          borderColor: isActive(opt) ? '#6366f1' : '#e5e7eb',
          background: isActive(opt) ? '#eef2ff' : '#fff',
          color: isActive(opt) ? '#4f46e5' : '#6b7280',
          fontWeight: isActive(opt) ? 500 : 400,
        }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function Step1({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Имя и фамилия">
          <Input value={data.name} onChange={e => onChange({ name: e.target.value })} placeholder="Алексей Иванов" />
        </Field>
        <Field label="Желаемая должность">
          <Input value={data.targetRole} onChange={e => onChange({ targetRole: e.target.value })} placeholder="Frontend Developer" />
        </Field>
        <Field label="Email">
          <Input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })} placeholder="alex@email.com" />
        </Field>
        <Field label="Телефон">
          <Input value={data.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="+38 (099) 000-00-00" />
        </Field>
        <Field label="Город / Remote">
          <Input value={data.location} onChange={e => onChange({ location: e.target.value })} placeholder="Киев / Remote" />
        </Field>
        <Field label="LinkedIn / GitHub">
          <Input value={data.linkedin} onChange={e => onChange({ linkedin: e.target.value })} placeholder="linkedin.com/in/..." />
        </Field>
      </div>
      <Field label="Индустрия">
        <TagGroup options={INDUSTRIES} selected={data.industry} multi={false} onChange={v => onChange({ industry: v as string })} />
      </Field>
      <Field label="Уровень">
        <TagGroup options={LEVELS} selected={data.level} multi={false} onChange={v => onChange({ level: v as string })} />
      </Field>
    </>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  const updateExp = (id: string, patch: Partial<Experience>) =>
    onChange({ experience: data.experience.map(e => e.id === id ? { ...e, ...patch } : e) })
  const removeExp = (id: string) =>
    onChange({ experience: data.experience.filter(e => e.id !== id) })
  const addExp = () =>
    onChange({ experience: [...data.experience, newExp()] })

  return (
    <>
      {data.experience.map((exp, i) => (
        <div key={exp.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Место работы {i + 1}</span>
            <button type="button" onClick={() => removeExp(exp.id)}
              style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              удалить
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Компания">
              <Input value={exp.company} onChange={e => updateExp(exp.id, { company: e.target.value })} placeholder="Google" />
            </Field>
            <Field label="Должность">
              <Input value={exp.role} onChange={e => updateExp(exp.id, { role: e.target.value })} placeholder="Senior Developer" />
            </Field>
            <Field label="Начало">
              <Input value={exp.startDate} onChange={e => updateExp(exp.id, { startDate: e.target.value })} placeholder="01.2021" />
            </Field>
            <Field label="Конец">
              <Input value={exp.endDate} onChange={e => updateExp(exp.id, { endDate: e.target.value })} placeholder="по настоящее время" />
            </Field>
          </div>
          <Field label="Чем занимался / что достиг">
            <Textarea value={exp.description} onChange={e => updateExp(exp.id, { description: e.target.value })}
              placeholder={'Разрабатывал..., увеличил..., руководил командой из...\n\nНе переживай о формулировках — AI всё улучшит'} />
          </Field>
        </div>
      ))}
      <button type="button" onClick={addExp} style={{
        fontSize: 13, padding: '8px 16px', borderRadius: 8,
        border: '1px dashed #d1d5db', background: '#fafafa',
        color: '#6b7280', cursor: 'pointer', width: '100%', marginBottom: 20,
      }}>
        + Добавить место работы
      </button>
      <Field label="Образование">
        <Input value={data.education} onChange={e => onChange({ education: e.target.value })} placeholder="КПИ, Компьютерные науки, 2018" />
      </Field>
    </>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (patch: Partial<FormData>) => void }) {
  return (
    <>
      <Field label="Технические навыки">
        <Input value={data.technicalSkills} onChange={e => onChange({ technicalSkills: e.target.value })}
          placeholder="React, TypeScript, Node.js, PostgreSQL..." />
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Через запятую — AI сам разобьёт на категории</p>
      </Field>
      <Field label="Языки">
        <TagGroup options={LANGUAGES} selected={data.languages} multi onChange={v => onChange({ languages: v as string[] })} />
      </Field>
      <Field label="Шаблон резюме">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 4 }}>
          {TEMPLATES.map(tpl => (
            <button key={tpl.id} type="button" onClick={() => onChange({ template: tpl.id })} style={{
              border: data.template === tpl.id ? '2px solid #6366f1' : '1px solid #e5e7eb',
              borderRadius: 12, padding: 12, cursor: 'pointer', background: '#fff', textAlign: 'center',
            }}>
              <div style={{ height: 56, background: tpl.color, borderRadius: 6, marginBottom: 8 }} />
              <span style={{ fontSize: 13, fontWeight: data.template === tpl.id ? 500 : 400, color: data.template === tpl.id ? '#4f46e5' : '#374151' }}>
                {tpl.label}
              </span>
            </button>
          ))}
        </div>
      </Field>
    </>
  )
}

function Stepper({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500,
                background: done ? '#d1fae5' : active ? '#eef2ff' : '#f3f4f6',
                color: done ? '#059669' : active ? '#4f46e5' : '#9ca3af', flexShrink: 0,
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? '#111827' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: '#e5e7eb', margin: '0 12px' }} />}
          </div>
        )
      })}
    </div>
  )
}

const STEPS = ['Личные данные', 'Опыт работы', 'Навыки']

export default function ResumeForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [resume, setResume] = useState<object | null>(null)
  const [error, setError] = useState<string | null>(null)

  const patch = (p: Partial<FormData>) => setForm(f => ({ ...f, ...p }))

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')
      setResume(data.resume.ru)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (resume) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Резюме готово!</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Посмотри превью — если всё нравится, скачивай PDF за $5</p>
        </div>

        <ResumePreview data={resume as any} template={form.template} />

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <ResumeDownloadButton data={resume as any} template={form.template} filename="resume.pdf" />
          <button onClick={() => { setResume(null); setStep(1) }} style={{
            display: 'block', margin: '16px auto 0', fontSize: 13,
            color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer',
          }}>
            ← Начать заново
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>Создать резюме</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Заполни форму — AI сгенерирует резюме на русском и английском
      </p>

      <Stepper current={step} steps={STEPS} />

      {step === 1 && <Step1 data={form} onChange={patch} />}
      {step === 2 && <Step2 data={form} onChange={patch} />}
      {step === 3 && <Step3 data={form} onChange={patch} />}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginTop: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
        <button type="button" onClick={() => setStep(s => s - 1)} style={{
          fontSize: 13, padding: '8px 18px', borderRadius: 8,
          border: '1px solid #e5e7eb', background: '#fff', color: '#374151',
          cursor: 'pointer', visibility: step > 1 ? 'visible' : 'hidden',
        }}>
          ← Назад
        </button>

        <span style={{ fontSize: 12, color: '#9ca3af' }}>Шаг {step} из {STEPS.length}</span>

        {step < STEPS.length ? (
          <button type="button" onClick={() => setStep(s => s + 1)} style={{
            fontSize: 13, padding: '8px 18px', borderRadius: 8, border: 'none',
            background: '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: 500,
          }}>
            Далее →
          </button>
        ) : (
          <button type="button" onClick={generate} disabled={loading} style={{
            fontSize: 13, padding: '8px 24px', borderRadius: 8, border: 'none',
            background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500,
          }}>
            {loading ? 'Генерирую...' : 'Сгенерировать резюме ✦'}
          </button>
        )}
      </div>
    </div>
  )
}
