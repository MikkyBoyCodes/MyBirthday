import { Camera, Sparkles, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'
import './photo-section.css'

// On phones the "then" photo gradually turns into the "now" photo while the page is scrolled.
// This keeps one number (--morph, from 0 to 1) up to date; all the visuals are in the CSS files.
function useMorphProgress(trackRef) {
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const phone = window.matchMedia('(max-width: 767px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0

      if (!phone.matches || reducedMotion.matches) {
        track.style.removeProperty('--morph')
        return
      }

      const stage = track.firstElementChild
      const trackBox = track.getBoundingClientRect()
      const stageHeight = stage.getBoundingClientRect().height
      const stickyTop = parseFloat(window.getComputedStyle(stage).top) || 0
      const distance = trackBox.height - stageHeight
      const raw = distance > 0 ? (stickyTop - trackBox.top) / distance : 0

      // The photos rest briefly at the start and the end of the change.
      const spread = Math.min(1, Math.max(0, (raw - 0.12) / 0.76))
      const eased = spread * spread * (3 - 2 * spread)

      track.style.setProperty('--morph', eased.toFixed(3))
    }

    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    phone.addEventListener('change', request)
    reducedMotion.addEventListener('change', request)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      phone.removeEventListener('change', request)
      reducedMotion.removeEventListener('change', request)
    }
  }, [trackRef])
}

function ImageFrame({ src, alt, label, caption, className = '' }) {
  return (
    <figure className={`memory-frame ${className}`}>
      <div className="memory-image-wrap">
        <img
          src={src}
          alt={alt}
          className="memory-image"
          onError={(event) => {
            event.currentTarget.parentElement.classList.add('is-empty')
          }}
        />
        <div className="memory-placeholder" aria-hidden="true">
          <Camera size={20} strokeWidth={1.35} />
          <span>{label}</span>
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export default function PhotoSection() {
  const morphTrackRef = useRef(null)
  useMorphProgress(morphTrackRef)

  return (
    <section id="me" className="story-section me-section section-anchor">
      <div className="me-copy">
        <p className="eyebrow"><Sparkles size={14} /> ME</p>
        <h2>From then.<br />To now.</h2>
        <p className="me-note">
          A little boy with a lot ahead of him, and the person he became. Two moments, one story.
        </p>
      </div>

      <div className="me-memories" ref={morphTrackRef}>
        <div className="me-photo-pair" data-reveal="me-pair">
          <ImageFrame src="/images/toddler.jpeg" alt="Michael as a toddler" label="TODDLER PHOTO" caption="MICHAEL · THEN" className="memory-frame--toddler" />
          <ImageFrame src="/images/me.jpeg" alt="Michael in 2026" label="CURRENT PHOTO" caption="MICHAEL · NOW" className="memory-frame--now" />

          <div className="me-morph-track" aria-hidden="true">
            <span className="me-morph-label me-morph-label--then">THEN</span>
            <span className="me-morph-line"><i /></span>
            <span className="me-morph-label me-morph-label--now">NOW</span>
          </div>
        </div>
      </div>

      <div className="people-block section-anchor">
        <div id="people" className="people-heading section-anchor">
          <p className="eyebrow"><Users size={14} /> MY PEOPLE</p>
          <h3>I didn't get here alone.</h3>
          <p>Before the candles, the wishes, and another year, there were the people who made life possible and made home feel like home.</p>
        </div>

        <div className="family-grid">
          <article className="family-card family-card--parents" data-reveal="family-card">
            <ImageFrame src="/images/parents.jpeg" alt="Michael's parents" label="PARENTS PHOTO" caption="DAD + MOM" className="memory-frame--parents" />
            <div className="family-copy">
              <span className="family-role">THE FOUNDATION</span>
              <h4>Dad &amp; Mom</h4>
              <p>You are the reason I can celebrate this birthday in the first place. Thank you for giving me life and helping shape the person I am becoming.</p>
            </div>
          </article>

          <article className="family-card" data-reveal="family-card">
            <ImageFrame src="/images/derek.jpeg" alt="Michael's brother Derek" label="DEREK PHOTO" caption="DEREK" />
            <div className="family-copy">
              <span className="family-role">MY GUY</span>
              <h4>My Broda, Derek</h4>
              <p>Always got my back.</p>
            </div>
          </article>

          <article className="family-card" data-reveal="family-card">
            <ImageFrame src="/images/fabian.jpeg" alt="Michael's youngest brother Fabian" label="FABIAN PHOTO" caption="FABIAN" />
            <div className="family-copy">
              <span className="family-role">THE HOUSE COMEDIAN</span>
              <h4>Little bro, Fabian</h4>
              <p>Every house needs someone who can turn an ordinary moment into a funny one. That's Fabian.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}