import './navbar.css'

const links = [
  { id: 'birthday', label: 'Birthday' },
  { id: 'chapter', label: 'Chapter' },
  { id: 'me', label: 'Me' },
  { id: 'people', label: 'My People' },
]

export default function Navbar({ activeSection }) {
  const scrollTo = (id) => {
    const element = document.getElementById(id)
    if (!element) return

    const navHeight = document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 68
    const top = element.getBoundingClientRect().top + window.scrollY - navHeight - 18

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
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
