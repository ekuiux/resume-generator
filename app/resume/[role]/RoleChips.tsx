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
          className="role-chip"
          onClick={(e) => go(e, '/resume')}
          style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', background: 'var(--bg-page)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-pill)', padding: '8px 16px', textDecoration: 'none', cursor: 'pointer' }}
        >
          See all resumes →
        </a>
      )}
    </div>
  )
}
