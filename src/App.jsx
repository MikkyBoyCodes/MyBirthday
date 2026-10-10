import { useEffect, useState } from 'react'
import Navbar from './components/navigation/Navbar'
import Hero from './components/hero/Hero'
import GraduationSection from './components/chapter/GraduationSection'
import PhotoSection from './components/profile/PhotoSection'
import BirthdaySection from './components/birthday/BirthdaySection'
import Footer from './components/Footer'
import SoundControl from './components/audio/SoundControl'
import useAudio from './hooks/useAudio'
import './styles/app.css'

const sections = ['birthday', 'chapter', 'me', 'wish']

export default function App() {
  const [activeSection, setActiveSection] = useState('birthday')
  const audio = useAudio()

  useEffect(() => {
    const revealTargets = document.querySelectorAll('[data-reveal]')
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      {
        threshold: 0.48,
        rootMargin: '-10% 0px -22% 0px',
      },
    )

    const familyRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '-4% 0px -18% 0px',
      },
    )

    // The then/now photos stack into a tall block on phones, so the visibility
    // needed to reveal it is lowered just enough for it to be reachable on small screens.
    const pairObservers = []

    revealTargets.forEach((element) => {
      if (element.dataset.reveal === 'family-card') {
        familyRevealObserver.observe(element)
      } else if (element.dataset.reveal === 'me-pair') {
        const reachable = (window.innerHeight * 0.68 * 0.75) / Math.max(element.getBoundingClientRect().height, 1)
        const pairObserver = new IntersectionObserver(
          (entries) => {
            // On phones the photos stay revealed once shown, so the lower photo never fades out while it is being viewed.
            const isPhone = window.matchMedia('(max-width: 767px)').matches
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
              } else if (!isPhone) {
                entry.target.classList.remove('is-visible')
              }
            })
          },
          {
            threshold: Math.min(0.48, Math.max(0.15, reachable)),
            rootMargin: '-10% 0px -22% 0px',
          },
        )
        pairObserver.observe(element)
        pairObservers.push(pairObserver)
      } else {
        revealObserver.observe(element)
      }
    })

    const observers = sections.map((id) => {
      const element = document.getElementById(id)
      if (!element) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        {
          threshold: 0.42,
          rootMargin: '-8% 0px -24% 0px',
        },
      )
      observer.observe(element)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
      revealObserver.disconnect()
      familyRevealObserver.disconnect()
      pairObservers.forEach((observer) => observer.disconnect())
    }
  }, [])

  return (
    <div className="site-shell">
      <Navbar activeSection={activeSection} />
      <main>
        <Hero />
        <GraduationSection />
        <PhotoSection />
        <BirthdaySection />
      </main>
      <SoundControl {...audio} />
      <Footer />
    </div>
  )
}