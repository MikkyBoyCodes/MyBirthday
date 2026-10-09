import { Camera, Sparkles, Users } from 'lucide-react'
import './photo-section.css'

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
  return (
    <section id="me" className="story-section me-section section-anchor">
      <div className="me-copy">
        <p className="eyebrow"><Sparkles size={14} /> ME</p>
        <h2>From then.<br />To now.</h2>
        <p className="me-note">
          A little boy with a lot ahead of him, and the person he became. Two moments, one story.
        </p>
      </div>

      <div className="me-memories">
        <div className="me-photo-pair" data-reveal="me-pair">
          <ImageFrame src="/images/toddler.jpeg" alt="Michael as a toddler" label="TODDLER PHOTO" caption="MICHAEL · THEN" className="memory-frame--toddler" />
          <ImageFrame src="/images/me.jpeg" alt="Michael in 2026" label="CURRENT PHOTO" caption="MICHAEL · NOW" className="memory-frame--now" />
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
