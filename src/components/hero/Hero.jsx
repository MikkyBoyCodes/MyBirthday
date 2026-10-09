import { ArrowDown, Sparkles } from 'lucide-react'
import './hero.css'

const birthdayWords = [
  { text: 'HAPPY', className: 'hero-word hero-word--happy' },
  { text: 'BIRTHDAY', className: 'hero-word hero-word--birthday' },
  { text: 'TO ME.', className: 'hero-word hero-word--to-me' },
]

function KineticWord({ text, className, wordIndex }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((character, index) => (
        <span
          className={`kinetic-letter kinetic-letter--${(index + wordIndex) % 4}`}
          key={`${text}-${index}`}
          aria-hidden="true"
        >
          {character === ' ' ? '\u00a0' : character}
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  return (
    <section id="birthday" className="hero-section section-anchor">
      <div className="hero-atmosphere" aria-hidden="true" />
      <div className="hero-orb hero-orb--one" aria-hidden="true" />
      <div className="hero-orb hero-orb--two" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-date">
          <Sparkles size={14} strokeWidth={1.5} />
          <span>OCTOBER 06 / 2026</span>
        </div>

        <div className="birthday-intro" aria-label="Happy birthday to me">
          {birthdayWords.map((word, index) => (
            <KineticWord key={word.text} text={word.text} className={word.className} wordIndex={index} />
          ))}
        </div>

        <div className="hero-identity">
          <h1 className="hero-name" aria-label="Michael">
            {'MICHAEL'.split('').map((character, index) => (
              <span className={`name-letter name-letter--${index % 5}`} key={`${character}-${index}`} aria-hidden="true">
                {character}
              </span>
            ))}
          </h1>
          <p className="hero-subtitle">SMART BOY</p>
        </div>

        <div className="hero-line-wrap">
          <span className="hero-rule" />
          <p>One more year, more to come.</p>
        </div>
      </div>

      <button
        className="hero-scroll"
        type="button"
        onClick={() => document.getElementById('chapter')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Continue to the next chapter"
      >
        <span>SCROLL TO CONTINUE</span>
        <ArrowDown size={15} strokeWidth={1.5} />
      </button>
    </section>
  )
}
