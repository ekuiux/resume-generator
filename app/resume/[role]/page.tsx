import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ROLE_SLUGS, getRole, getRelatedRoles } from '../roles'
import { RoleChips } from './RoleChips'
import { FaqAccordion } from './FaqAccordion'
import '../../landing.css'

// Build a static page per role at build time.
export function generateStaticParams() {
  return ROLE_SLUGS.map(role => ({ role }))
}

export const dynamicParams = false

const TEMPLATE_NAMES: Record<string, string> = {
  minimal: 'Minimal', aurora: 'Aurora', atelier: 'Atelier',
  volt: 'Volt', prime: 'Prime', nordic: 'Nordic',
}

type Params = { params: Promise<{ role: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const role = getRole((await params).role)
  if (!role) return {}
  const url = `https://resumetion.com/resume/${role.slug}`
  return {
    title: role.metaTitle,
    description: role.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: role.metaTitle,
      description: role.metaDescription,
      url,
      siteName: 'Resumetion',
      type: 'article',
    },
  }
}

export default async function RolePage({ params }: Params) {
  const role = getRole((await params).role)
  if (!role) notFound()

  const buildHref = `/build?role=${encodeURIComponent(role.title)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://resumetion.com' },
          { '@type': 'ListItem', position: 2, name: `${role.title} Resume`, item: `https://resumetion.com/resume/${role.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: role.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }

  const Arrow = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="cta-arrow" style={{ flexShrink: 0 }}>
      <path d="M10.9998 6L8.6665 8.99998" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.9998 5.99998L8.6665 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 6L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(247,248,250,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Resumetion" height={32} />
          </Link>
          <Link href={buildHref} className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 22px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Build my resume
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* HERO */}
        <section style={{ paddingTop: 64, paddingBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>
            <Link href="/" className="breadcrumb-home" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Home</Link>
            <span> › </span>
            <span>{role.title} Resume</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border-soft)', padding: '7px 14px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-card)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} /> {role.title} resume
          </span>
          <h1 style={{ fontSize: 46, fontWeight: 600, lineHeight: '110%', letterSpacing: '-0.02em', margin: '20px 0 0', maxWidth: 760 }}>
            {role.title} Resume — Tailored to the Job, ATS-Ready
          </h1>
          <p style={{ fontSize: 18, lineHeight: '165%', color: 'var(--text)', margin: '18px 0 0', maxWidth: 680 }}>
            {role.intro}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginTop: 28 }}>
            <Link href={buildHref} className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 55, padding: '0 30px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Build my {role.title.toLowerCase()} resume{Arrow}
            </Link>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>No signup. See your tailored resume free.</span>
          </div>
        </section>

        {/* WHAT MATTERS */}
        <section style={{ paddingTop: 40, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>What makes a strong {role.title.toLowerCase()} resume</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
            {role.whatMatters.map((m, i) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-xl)', padding: 22, display: 'flex', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-page)', color: 'var(--ink)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                <p style={{ fontSize: 15, lineHeight: '155%', color: 'var(--text)', margin: 0 }}>{m}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BEFORE / AFTER */}
        <section style={{ paddingTop: 40, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 8px' }}>Generic AI vs. tailored to the role</h2>
          <p style={{ fontSize: 16, lineHeight: '165%', color: 'var(--text)', margin: '0 0 24px', maxWidth: 620 }}>
            Most tools pad a {role.title.toLowerCase()} resume with competence-claims. Resumetion replaces them with concrete facts from your real experience.
          </p>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-3xl)', padding: 12, boxShadow: 'var(--shadow-card)', maxWidth: 760 }}>
            <div style={{ padding: '24px 26px', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ display: 'inline-flex', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 20, background: 'var(--error-bg)', color: 'var(--danger-soft)' }}>Before · generic AI</span>
              <p style={{ fontSize: 17, lineHeight: '158%', margin: '14px 0 0', color: 'var(--dim)', textDecoration: 'line-through', textDecorationColor: 'rgba(175,178,178,0.6)' }}>{role.before}</p>
            </div>
            <div style={{ padding: '24px 26px' }}>
              <span style={{ display: 'inline-flex', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 20, background: 'var(--green)', color: 'var(--ink)' }}>After · Resumetion</span>
              <p style={{ fontSize: 17, lineHeight: '158%', margin: '14px 0 0', color: 'var(--ink)', fontWeight: 500 }}>{role.after}</p>
            </div>
          </div>
        </section>

        {/* KEYWORDS */}
        <section style={{ paddingTop: 40, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 8px' }}>Keywords ATS looks for</h2>
          <p style={{ fontSize: 16, lineHeight: '165%', color: 'var(--text)', margin: '0 0 24px', maxWidth: 620 }}>
            Applicant tracking systems rank on terminology from the posting. These come up often for {role.title.toLowerCase()} roles — include the ones that match your real experience.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {role.keywords.map(k => (
              <span key={k} style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-pill)', padding: '8px 16px' }}>{k}</span>
            ))}
          </div>
        </section>

        {/* TEMPLATES */}
        <style>{`
          .tpl-card { position: relative; aspect-ratio: 210/297; border-radius: 12px; overflow: hidden; outline: 1px solid var(--border-soft); box-shadow: var(--shadow-card); }
          .tpl-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.28); opacity: 0; transition: opacity 0.18s; border-radius: 12px; }
          .tpl-card:hover .tpl-overlay { opacity: 1; }
          .role-chip { transition: background .15s; }
          .role-chip:hover { background: var(--bg-page) !important; color: var(--ink) !important; }
          .breadcrumb-home { transition: color .15s; }
          .breadcrumb-home:hover { color: var(--ink) !important; }
        `}</style>
        <section style={{ paddingTop: 40, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 24px' }}>Templates that suit a {role.title.toLowerCase()} resume</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {role.templates.map(id => (
              <Link key={id} href={`${buildHref}&template=${id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="tpl-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/templates/${id}.jpg`} alt={`${TEMPLATE_NAMES[id]} resume template`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div className="tpl-overlay">
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 22px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Use this template
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600, color: 'var(--ink)', textAlign: 'center' }}>{TEMPLATE_NAMES[id]}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ paddingTop: 40, paddingBottom: 24 }}>
          <h2 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 16px' }}>{role.title} resume FAQ</h2>
          <FaqAccordion faqs={role.faqs} />
        </section>

        {/* BOTTOM CTA */}
        <section style={{ paddingTop: 32, paddingBottom: 72 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-3xl)', padding: '56px 48px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>Build your {role.title.toLowerCase()} resume</h2>
            <p style={{ fontSize: 16, lineHeight: '165%', color: 'var(--text)', margin: '14px auto 28px', maxWidth: 520 }}>
              Paste the job posting and your notes — get a keyword-aligned, ATS-ready resume in minutes. Preview free.
            </p>
            <Link href={buildHref} className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 55, padding: '0 30px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Build my resume{Arrow}
            </Link>
          </div>
        </section>

        {/* Related roles — internal linking for SEO */}
        <section style={{ paddingBottom: 56 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 12 }}>Other resumes</div>
          <RoleChips roles={getRelatedRoles(role.slug, 6)} />
        </section>
      </div>

      <footer>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ paddingTop: 32, paddingBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', fontSize: 14, color: 'var(--dim)' }}>
            <span>© 2026 Resumetion</span>
            <span>·</span>
            <Link href="/" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Home</Link>
            <span>·</span>
            <Link href="/terms" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Terms</Link>
            <span>·</span>
            <Link href="/privacy" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
