import type { Metadata } from 'next'
import Link from 'next/link'
import { CATEGORIES, getRole, ROLES } from './roles'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Resume Examples by Role — ATS-Ready Templates | Resumetion',
  description: `Build a resume tailored to your role. ${ROLES.length} job-specific guides with ATS keywords, before/after examples, and matching templates — paste the posting, preview free.`,
  alternates: { canonical: 'https://resumetion.com/resume' },
  openGraph: {
    title: 'Resume Examples by Role | Resumetion',
    description: 'Role-specific resume guides with ATS keywords and tailored templates. Preview free, no signup.',
    url: 'https://resumetion.com/resume',
    siteName: 'Resumetion',
    type: 'website',
  },
}

export default function ResumeHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ROLES.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${r.title} Resume`,
      url: `https://resumetion.com/resume/${r.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <style>{`
        .role-link { transition: background .15s; }
        .role-link:hover { background: var(--bg-page) !important; }
        .breadcrumb-home { transition: color .15s; }
        .breadcrumb-home:hover { color: var(--ink) !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(247,248,250,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Resumetion" height={32} />
          </Link>
          <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 44, padding: '0 22px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Build my resume
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* HERO */}
        <section style={{ paddingTop: 64, paddingBottom: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>
            <Link href="/" className="breadcrumb-home" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Home</Link>
            <span> › </span>
            <span>Resume examples</span>
          </div>
          <h1 style={{ fontSize: 46, fontWeight: 600, lineHeight: '110%', letterSpacing: '-0.02em', margin: '20px 0 0', maxWidth: 760 }}>
            Resume examples by role
          </h1>
          <p style={{ fontSize: 18, lineHeight: '165%', color: 'var(--text)', margin: '18px 0 0', maxWidth: 680 }}>
            Pick your role for a tailored guide — what recruiters and ATS look for, a generic-AI vs. tailored example, the keywords that matter, and templates that fit. Then paste the job posting and build yours in minutes.
          </p>
        </section>

        {/* CATEGORIES */}
        {CATEGORIES.map(cat => (
          <section key={cat.name} style={{ paddingTop: 40 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 16px' }}>{cat.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {cat.slugs.map(slug => {
                const r = getRole(slug)
                if (!r) return null
                return (
                  <Link
                    key={slug}
                    href={`/resume/${slug}`}
                    className="role-link"
                    style={{ display: 'block', background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-xl)', padding: '16px 18px', textDecoration: 'none' }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>Resume guide & template</div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        {/* BOTTOM CTA */}
        <section style={{ paddingTop: 48, paddingBottom: 72 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-3xl)', padding: '56px 48px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>Don’t see your exact role?</h2>
            <p style={{ fontSize: 16, lineHeight: '165%', color: 'var(--text)', margin: '14px auto 28px', maxWidth: 520 }}>
              The builder works for any job. Paste the posting and your notes — get a keyword-aligned, ATS-ready resume in minutes. Preview free.
            </p>
            <Link href="/build" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 55, padding: '0 30px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Build my resume
            </Link>
          </div>
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
