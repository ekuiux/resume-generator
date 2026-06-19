'use client'

import { useEffect } from 'react'

export function LandingScripts() {
  useEffect(() => {
    // Badge parallax
    const onMouseMove = (e: MouseEvent) => {
      const ats = document.getElementById('badge-ats')
      const ai  = document.getElementById('badge-ai')
      if (!ats || !ai) return
      const cx = window.innerWidth  / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx
      const dy = (e.clientY - cy) / cy
      ats.style.transform = `translate(${(-dx * 10).toFixed(2)}px,${(-dy * 8).toFixed(2)}px)`
      ai.style.transform  = `translate(${( dx * 8).toFixed(2)}px,${( dy * 6).toFixed(2)}px)`
    }
    document.addEventListener('mousemove', onMouseMove)

    // FAQ smooth accordion
    const cleanups: (() => void)[] = []
    document.querySelectorAll<HTMLDetailsElement>('#faq details').forEach(det => {
      const body = det.querySelector<HTMLElement>('.faq-body')
      if (!body) return
      if (det.open) body.style.gridTemplateRows = '1fr'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        body.style.transition = 'grid-template-rows .35s cubic-bezier(.4,0,.2,1)'
      }))
      const summary = det.querySelector('summary')
      if (!summary) return
      const onClick = (e: Event) => {
        e.preventDefault()
        if (det.open) {
          body.style.gridTemplateRows = '0fr'
          const done = () => { det.open = false }
          body.addEventListener('transitionend', done, { once: true })
          setTimeout(done, 400)
        } else {
          det.open = true
          requestAnimationFrame(() => { body.style.gridTemplateRows = '1fr' })
        }
      }
      summary.addEventListener('click', onClick)
      cleanups.push(() => summary.removeEventListener('click', onClick))
    })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cleanups.forEach(fn => fn())
    }
  }, [])

  return null
}
