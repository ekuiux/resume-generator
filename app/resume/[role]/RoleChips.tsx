'use client'
import { useRouter } from 'next/navigation'
import type { Role } from '../roles'

export function RoleChips({ roles, showAll = true }: { roles: Role[]; showAll?: boolean }) {
  const router = useRouter()

  function go(e: React.MouseEvent, href: string) {
    e.preventDefault()
    document.documentElement.scrollTop = 0
    router.push(href, { scroll: false })
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {roles.map(r => (
        <a
          key={r.slug}
          href={`/resume/${r.slug}`}
          className="role-chip"
          onClick={(e) => go(e, `/resume/${r.slug}`)}
          style={{ fontSize: 14, color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-pill)', padding: '8px 16px', textDecoration: 'none', cursor: 'pointer' }}
        >
          {r.title} resume
        </a>
      ))}
      {showAll && (
        <a
          href="/resume"
          className="see-all-chip"
          onClick={(e) => go(e, '/resume')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'var(--ink)', background: 'var(--bg-page)', border: 'none', borderRadius: 'var(--radius-pill)', padding: '9px 17px', textDecoration: 'none', cursor: 'pointer' }}
        >
          See all resumes
          <svg className="chip-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M10.9998 6L8.6665 8.99998" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10.9998 5.99998L8.6665 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M1 6L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </a>
      )}
      <style>{`
        .chip-arrow { transition: transform .15s ease; }
        .see-all-chip:hover .chip-arrow { transform: translateX(3px); }
      `}</style>
    </div>
  )
}
