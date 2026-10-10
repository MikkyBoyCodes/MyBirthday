import './navbar.css'

const links = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'chapter', label: 'Chapter' },
  { id: 'me', label: 'Me' },
  { id: 'people', label: 'My People' },
]

// Sections that must be fully visible once the page lands on them.
const MUST_SEE = { chapter: '.chapter-code-stack' }

export default function Navbar({ activeSection }) {
  const scrollTo = (id) => {
    const element = document.getElementById(id)
    if (!element) return

    const navHeight = document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 68

    // Measured fresh every time, because images and reveal animations change the layout while scrolling.
    const getTarget = () => {
      let top = element.getBoundingClientRect().top + window.scrollY - navHeight - 18
      const mustSee = MUST_SEE[id] && element.querySelector(MUST_SEE[id])
      if (mustSee) {
        const bottom = mustSee.getBoundingClientRect().bottom + window.scrollY
        // If the important part would be low on the screen (near the music bar), scroll a little further.
        top = Math.max(top, bottom - (window.innerHeight * 0.82 - 8))
      }
      const maxTop = document.documentElement.scrollHeight - window.innerHeight
      return Math.max(0, Math.min(top, maxTop))
    }

    window.scrollTo({ top: getTarget(), behavior: 'smooth' })

    // After the smooth scroll settles, check the landing spot again and correct it if the layout moved.
    let lastY = window.scrollY
    let stableFrames = 0
    let frames = 0
    let corrections = 0

    const settle = () => {
      frames += 1
      const y = window.scrollY
      stableFrames = Math.abs(y - lastY) < 0.5 ? stableFrames + 1 : 0
      lastY = y

      if (stableFrames >= 6) {
        const target = getTarget()
        if (Math.abs(target - y) > 3 && corrections < 3) {
          corrections += 1
          stableFrames = 0
          window.scrollTo({ top: target, behavior: 'smooth' })
        } else {
          return
        }
      }

      if (frames < 240) window.requestAnimationFrame(settle)
    }

    window.requestAnimationFrame(settle)
  }

  return (
    <header className="site-nav">
      <button className="nav-mark" type="button" onClick={() => scrollTo('birthday')} aria-label="Return to birthday">
        <span>06 OCT</span>
      </button>

      <nav className="nav-links" aria-label="Birthday sections">
        {links.map((link) => {
          const isActive = activeSection === link.id || (link.id === 'people' && activeSection === 'me')

          return (
            <button
              key={link.id}
              className={`nav-link ${isActive ? 'is-active' : ''}`}
              type="button"
              onClick={() => scrollTo(link.id)}
              aria-label={`Go to ${link.label}`}
            >
              <span>{link.label}</span>
            </button>
          )
        })}
      </nav>

      <button className="nav-wish" type="button" onClick={() => scrollTo('wish')}>
        Make a wish <span aria-hidden="true">↗</span>
      </button>
    </header>
  )
}