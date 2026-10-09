import { Wind } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './cake.css'

const candles = [0, 1, 2, 3, 4]
const windOrder = [0, 1, 2, 3, 4]

function playCakePop() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(115, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(52, context.currentTime + 0.16)

    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.2)

    window.setTimeout(() => context.close().catch(() => {}), 260)
  } catch {
    // Browser audio restrictions should never interrupt the cake experience.
  }
}

export default function BirthdayCake() {
  const experienceRef = useRef(null)
  const cooldownRef = useRef(false)
  const focusTimerRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [entranceKey, setEntranceKey] = useState(0)
  const [litCount, setLitCount] = useState(0)
  const [extinguished, setExtinguished] = useState([])
  const [isBlowing, setIsBlowing] = useState(false)
  const [blowWave, setBlowWave] = useState(0)

  const allOut = extinguished.length === candles.length
  const hasStarted = isFocused || allOut

  useEffect(() => {
    const element = experienceRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(focusTimerRef.current)

        if (entry.isIntersecting && !allOut) {
          focusTimerRef.current = window.setTimeout(() => {
            setIsFocused(true)
            setEntranceKey((value) => value + 1)
          }, 500)
        } else {
          setIsFocused(false)
        }
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    observer.observe(element)

    return () => {
      window.clearTimeout(focusTimerRef.current)
      observer.disconnect()
    }
  }, [allOut])

  useEffect(() => {
    if (!isFocused || allOut) return undefined

    setLitCount(0)
    setExtinguished([])
    setIsBlowing(false)

    const timers = candles.map((_, index) =>
      window.setTimeout(() => {
        setLitCount((current) => Math.max(current, index + 1))
      }, 720 + index * 420),
    )

    const popTimer = window.setTimeout(playCakePop, 140)

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.clearTimeout(popTimer)
    }
  }, [entranceKey, isFocused, allOut])

  const extinguishBurst = () => {
    if (cooldownRef.current || !isFocused || allOut || litCount < candles.length) return

    cooldownRef.current = true
    setIsBlowing(true)
    setBlowWave((value) => value + 1)

    window.setTimeout(() => {
      setExtinguished((current) => {
        const remaining = windOrder.filter((index) => !current.includes(index))
        const count = remaining.length > 2 ? 2 : remaining.length
        const next = remaining.slice(0, count)
        return [...current, ...next]
      })
      setIsBlowing(false)

      window.setTimeout(() => {
        cooldownRef.current = false
      }, 420)
    }, 420)
  }

  return (
    <div
      ref={experienceRef}
      className={`cake-experience ${hasStarted ? 'has-started' : ''} ${isFocused ? 'is-focused' : ''} ${allOut ? 'is-complete' : ''} ${isBlowing ? 'is-blowing' : ''}`}
    >
      <div className="cake-stage">
        <div className="cake-glow" aria-hidden="true" />
        <div className="cake-impact" aria-hidden="true" />
        <div className="air-ripple" aria-hidden="true"><Wind size={22} strokeWidth={1.2} /></div>

        <div className="smoke-layer" aria-hidden="true">
          {candles.map((candle) => (
            <span
              key={`smoke-${candle}-${blowWave}`}
              className={`smoke smoke--${candle} ${extinguished.includes(candle) ? 'is-visible' : ''}`}
            />
          ))}
        </div>

        <div className="cake-assembly" aria-label="Birthday cake with five candles">
          <div className="cake-candle-row">
            {candles.map((candle) => {
              const isLit = candle < litCount && !extinguished.includes(candle)
              const isOut = extinguished.includes(candle)

              return (
                <div
                  className={`candle candle--${candle} ${isOut ? 'is-extinguished' : ''} ${isLit ? 'is-lit' : 'is-unlit'}`}
                  key={candle}
                >
                  <span className="candle-wick" />
                  <span className={`flame ${isOut ? 'is-out' : ''}`} />
                  <span className="candle-body" />
                </div>
              )
            })}
          </div>

          <div className="cake-tier cake-tier--top">
            <span className="icing-drip drip-one" />
            <span className="icing-drip drip-two" />
            <span className="icing-drip drip-three" />
          </div>
          <div className="cake-tier cake-tier--bottom" />
          <div className="cake-plinth" />
        </div>
      </div>

      <div className="cake-controls">
        {!hasStarted && !allOut ? (
          <div className="cake-awaiting">Stay with the wish.</div>
        ) : !allOut ? (
          <>
            <div className={`make-wish-prompt ${litCount === candles.length ? 'is-ready' : ''}`}>
              <span>{litCount === candles.length ? 'MAKE A WISH.' : 'LIGHTING THE CANDLES.'}</span>
            </div>
            {litCount === candles.length && (
              <button className="blow-button" type="button" onClick={extinguishBurst} aria-label="Blow the candles">
                <Wind size={17} strokeWidth={1.5} />
                <span>Blow the Candles</span>
              </button>
            )}
          </>
        ) : (
          <div className="wish-made">
            <span>WISH MADE.</span>
            <small>More to come.</small>
          </div>
        )}
      </div>
    </div>
  )
}
