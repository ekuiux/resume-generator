'use client'

import { useRef, useEffect } from 'react'

const TEMPLATES = [
  { id: 'minimal', name: 'Minimal', badge: { label: 'Popular', bg: 'var(--ink)', color: '#fff' } },
  { id: 'atelier', name: 'Atelier', badge: { label: 'New', bg: 'var(--green)', color: 'var(--ink)' } },
  { id: 'aurora',  name: 'Aurora',  badge: null },
  { id: 'volt',    name: 'Volt',    badge: null },
  { id: 'prime',   name: 'Prime',   badge: null },
  { id: 'nordic',  name: 'Nordic',  badge: null },
]
const ITEMS = [...TEMPLATES, ...TEMPLATES]

export function LandingCarousel() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const animRef   = useRef<number>(0)
  const offset    = useRef(0)
  const paused    = useRef(false)
  const dragging  = useRef(false)
  const dragStartX = useRef(0)
  const dragStartOffset = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let moved = 0

    const onEnter = () => { paused.current = true }
    const onLeave = () => { if (!dragging.current) paused.current = false }
    const onDown  = (e: PointerEvent) => {
      dragging.current = true
      paused.current = true
      moved = 0
      dragStartX.current = e.clientX
      dragStartOffset.current = offset.current
      track.style.cursor = 'grabbing'
      track.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const half = track.scrollWidth / 2
      const dx = dragStartX.current - e.clientX
      moved = Math.max(moved, Math.abs(dx))
      offset.current = ((dragStartOffset.current + dx) % half + half) % half
      track.style.transform = `translateX(-${offset.current}px)`
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      paused.current = false
      track.style.cursor = 'grab'
      try { track.releasePointerCapture(e.pointerId) } catch {}
    }
    // Suppress the card's navigation click when the gesture was a drag, not a tap.
    const onClick = (e: MouseEvent) => {
      if (moved > 6) { e.preventDefault(); e.stopPropagation() }
      moved = 0
    }

    track.style.touchAction = 'pan-y'
    track.addEventListener('pointerenter', onEnter)
    track.addEventListener('pointerleave', onLeave)
    track.addEventListener('pointerdown', onDown)
    track.addEventListener('pointermove', onMove)
    track.addEventListener('pointerup', onUp)
    track.addEventListener('pointercancel', onUp)
    track.addEventListener('click', onClick, true)

    const animate = () => {
      if (!paused.current && !dragging.current) {
        const half = track.scrollWidth / 2
        if (half > 0) {
          offset.current = (offset.current + 0.5) % half
          track.style.transform = `translateX(-${offset.current}px)`
        }
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      track.removeEventListener('pointerenter', onEnter)
      track.removeEventListener('pointerleave', onLeave)
      track.removeEventListener('pointerdown', onDown)
      track.removeEventListener('pointermove', onMove)
      track.removeEventListener('pointerup', onUp)
      track.removeEventListener('pointercancel', onUp)
      track.removeEventListener('click', onClick, true)
    }
  }, [])

  return (
    <div style={{ overflow: 'clip', overflowY: 'visible', width: '100%' }}>
      <div
        ref={trackRef}
        style={{ display: 'flex', gap: 32, willChange: 'transform', padding: '8px 0', cursor: 'grab', userSelect: 'none' }}
      >
        {ITEMS.map((tpl, i) => (
          <a
            key={i}
            href={`/build?template=${tpl.id}`}
            className="tpl-item"
            style={{ flexShrink: 0, width: 380, borderRadius: 14, overflow: 'visible', cursor: 'pointer', textDecoration: 'none', display: 'block' }}
          >
            <div style={{ position: 'relative', borderRadius: 14 }}>
              <img
                src={`/templates/${tpl.id}.jpg`}
                alt={tpl.name}
                style={{
                  width: '100%', aspectRatio: '210/297', objectFit: 'cover',
                  borderRadius: 14, boxShadow: 'var(--shadow-card)', display: 'block',
                  transition: 'transform .2s, box-shadow .2s', transformOrigin: 'center center',
                }}
                loading="lazy"
              />
              <div className="tpl-overlay">
                <span
                  className="tpl-overlay-btn"
                  style={{
                    background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600,
                    padding: '12px 22px', borderRadius: 100, whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(5,7,10,0.25)',
                    display: 'inline-block',
                  }}
                >
                  Use this template
                </span>
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {tpl.name}
              {tpl.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tpl.badge.bg, color: tpl.badge.color }}>
                  {tpl.badge.label}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
