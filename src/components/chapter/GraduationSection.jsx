import { ArrowUpRight, Camera, Code2, GraduationCap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './graduation.css'

const codeLines = [
  ['chapter.status', '=', '"completed"'],
  ['graduation.year', '=', '2026'],
  ['nextChapter', '=', '"loading..."'],
]

export default function GraduationSection() {
  const sectionRef = useRef(null)
  const stackRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [run, setRun] = useState(0)

  useEffect(() => {
    // Watch the status block itself (not the whole tall section),
    // so the animation reliably starts when the block is actually on screen.
    const stack = stackRef.current
    if (!stack) return

    let focusTimer
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(focusTimer)

        if (entry.isIntersecting) {
          focusTimer = window.setTimeout(() => {
            setRun((value) => value + 1)
            setIsFocused(true)
          }, 300)
        } else {
          setIsFocused(false)
        }
      },
      {
        threshold: 0.75,
        rootMargin: '-14% 0px -16% 0px',
      },
    )

    observer.observe(stack)

    return () => {
      window.clearTimeout(focusTimer)
      observer.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} id="chapter" className="story-section chapter-section section-anchor">
      <div className="section-intro">
        <p className="eyebrow"><Code2 size={14} /> CHAPTER</p>
        <h2 className="chapter-title">A chapter<br />completed.</h2>
        <p className="chapter-note">Software Engineering graduate, 2026. One chapter closed — and another chapter begins.</p>
      </div>

      <div className="chapter-card" data-reveal="card">
        <div className="chapter-icon"><GraduationCap size={28} strokeWidth={1.4} /></div>
        <div className="chapter-copy">
          <p className="chapter-kicker">SOFTWARE ENGINEERING · 2026</p>
          <p className="chapter-statement">One door closed. A lot more to open.</p>
          <div className="graduation-photo">
            <img
              src="/images/graduation.jpeg"
              alt="Michael at his graduation"
              onError={(event) => {
                event.currentTarget.parentElement.classList.add('is-empty')
              }}
            />
            <div className="graduation-placeholder" aria-hidden="true">
              <Camera size={19} strokeWidth={1.35} />
              <span>ADD GRADUATION PHOTO</span>
              <small>public/images/graduation.jpeg</small>
            </div>
          </div>

          <div ref={stackRef} className={`chapter-code-stack ${isFocused ? 'is-active' : ''}`} aria-label="Chapter status">
            {codeLines.map(([name, operator, value], lineIndex) => (
              <div className={`chapter-code chapter-code--${lineIndex + 1}`} key={`${run}-${name}`}>
                <span>{name}</span>
                <strong>{operator}</strong>
                <em>{value}</em>
              </div>
            ))}
          </div>
        </div>
        <span className="chapter-arrow" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.4} /></span>
      </div>
    </section>
  )
}