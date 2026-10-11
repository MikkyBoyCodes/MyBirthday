import { useEffect, useState } from 'react'
import './Nav.css'


const links = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'chapter', label: 'Chapter' },
  { id: 'me', label: 'Me' },
  { id: 'people', label: 'My People' },
]

// Order of the places the page can land on, from top to bottom.
const LANDING_ORDER = ['birthday', 'chapter', 'me', 'people', 'wish']

// On phones and tablets every section has a lot of empty space above its heading,
// so the page lands on the small heading label instead of the top of the section.
const COMPACT_QUERY = '(max-width: 1023px)'
const COMPACT_TARGETS = {
  chapter: '#chapter .eyebrow',
  me: '#me .eyebrow',
  people: '#people',
  wish: '#wish .eyebrow',
}
const GAP_WIDE = 18
const GAP_COMPACT = 22

function isCompact() {
  return window.matchMedia(COMPACT_QUERY).matches
}

function getNavHeight() {
  return document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 68
}

function getLandingElement(id) {
  const section = document.getElementById(id)
  if (!section) return null
  if (isCompact() && COMPACT_TARGETS[id]) {
    return document.querySelector(COMPACT_TARGETS[id]) || section
  }
  return section
}

// Measured fresh every time, because images and animations can move the layout.
function getLandingTop(id) {
  const element = getLandingElement(id)
  if (!element) return null

  const gap = isCompact() ? GAP_COMPACT : GAP_WIDE
  const top = element.getBoundingClientRect().top + window.scrollY - getNavHeight() - gap
  const maxTop = document.documentElement.scrollHeight - window.innerHeight

  return Math.max(0, Math.min(top, maxTop))
}

export default function Navbar() {
  const [current, setCurrent] = useState('birthday')

  // The highlighted link always matches the part of the page being viewed.
  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const line = getNavHeight() + window.innerHeight * 0.3
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let active = 'birthday'

      LANDING_ORDER.forEach((id) => {
        const element = getLandingElement(id)
        if (element && element.getBoundingClientRect().top <= line) active = id
      })

      setCurrent(atBottom ? 'wish' : active)
    }

    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])

  const scrollTo = (id) => {
    const target = getLandingTop(id)
    if (target === null) return

    window.scrollTo({ top: target, behavior: 'smooth' })

    // When the smooth scroll has finished, correct the position once if the layout moved meanwhile.
    // If the visitor scrolls by hand, stop at once.
    const takeOver = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    let stopped = false
    let lastY = window.scrollY
    let stableFrames = 0
    let frames = 0

    const stop = () => {
      stopped = true
      takeOver.forEach((name) => window.removeEventListener(name, stop, true))
    }
    takeOver.forEach((name) => window.addEventListener(name, stop, { capture: true, passive: true }))

    const settle = () => {
      if (stopped) return
      frames += 1
      const y = window.scrollY
      stableFrames = Math.abs(y - lastY) < 0.5 ? stableFrames + 1 : 0
      lastY = y

      if (stableFrames >= 8) {
        const corrected = getLandingTop(id)
        if (corrected !== null && Math.abs(corrected - y) > 3) {
          window.scrollTo({ top: corrected, behavior: 'smooth' })
        }
        stop()
        return
      }

      if (frames < 240) {
        window.requestAnimationFrame(settle)
      } else {
        stop()
      }
    }

    window.requestAnimationFrame(settle)
  }

  return (
    <header className="site-nav">
      <button className="nav-mark" type="button" onClick={() => scrollTo('birthday')} aria-label="Return to birthday">
        <span>06 OCT</span>
      </button>

      <nav className="nav-links" aria-label="Birthday sections">
        {links.map((link) => (
          <button
            key={link.id}
            className={`nav-link ${current === link.id ? 'is-active' : ''}`}
            type="button"
            onClick={() => scrollTo(link.id)}
            aria-label={`Go to ${link.label}`}
          >
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      <button className="nav-wish" type="button" onClick={() => scrollTo('wish')}>
        Make a wish <span aria-hidden="true">↗</span>
      </button>
    </header>
  )
}