import { useEffect } from 'react'
import Navbar from "./components/navigation/Nav";
import Hero from './components/hero/Hero'
import GraduationSection from './components/chapter/GraduationSection'
import PhotoSection from './components/profile/PhotoSection'
import BirthdaySection from './components/birthday/BirthdaySection'
import Footer from './components/Footer'
import SoundControl from './components/audio/SoundControl'
import useAudio from './hooks/useAudio'
import './styles/app.css'

export default function App() {
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

    revealTargets.forEach((element) => {
      if (element.dataset.reveal === 'family-card') {
        familyRevealObserver.observe(element)
      } else {
        revealObserver.observe(element)
      }
    })

    return () => {
      revealObserver.disconnect()
      familyRevealObserver.disconnect()
    }
  }, [])

  return (
    <div className="site-shell">
      <Navbar />
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