import { Disc3, Music2, Pause, Play, SkipForward, Volume1, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './sound-control.css'

function fileNameFromPath(file) {
  const rawName = file?.split('/').pop() || ''
  let name = rawName
  try {
    name = decodeURIComponent(rawName)
  } catch {
    // Keep the raw name if it cannot be decoded.
  }
  return name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

function displayTrackName(track) {
  return track?.title?.trim() || fileNameFromPath(track?.file) || 'Untitled track'
}

// Which slice of the sound spectrum each bar listens to (bass on the left, highs on the right).
const BAR_RANGES = [[1, 2], [2, 3], [3, 5], [5, 8], [8, 13], [13, 22], [22, 40]]
// Music carries far less energy in the highs, so higher bars are lifted (in dB) to move as visibly as the bass.
const BAR_TILT_DB = [0, 3, 7, 12, 18, 24, 30]
const ANALYSER_MIN_DB = -110
const ANALYSER_RANGE_DB = 100

function MusicVisualizer({ isPlaying, analyserRef, loudness }) {
  const barsRef = useRef([])
  const liveRef = useRef(false)
  const loudnessRef = useRef(loudness)
  const [live, setLive] = useState(false)

  loudnessRef.current = loudness

  useEffect(() => {
    const bars = barsRef.current
    const levels = new Array(BAR_RANGES.length).fill(0)
    const peaks = new Array(BAR_RANGES.length).fill(0.3)

    const paint = () => {
      bars.forEach((bar, index) => {
        if (bar) bar.style.transform = `scaleY(${(0.12 + levels[index] * 0.88).toFixed(3)})`
      })
    }

    if (!isPlaying) {
      paint()
      if (liveRef.current) {
        liveRef.current = false
        setLive(false)
      }
      return undefined
    }

    let frame = 0
    let data = null

    const tick = () => {
      const analyser = analyserRef.current
      const hasAnalyser = Boolean(analyser)

      if (hasAnalyser !== liveRef.current) {
        liveRef.current = hasAnalyser
        setLive(hasAnalyser)
      }

      if (analyser) {
        if (!data || data.length !== analyser.frequencyBinCount) {
          data = new Uint8Array(analyser.frequencyBinCount)
        }
        analyser.getByteFrequencyData(data)

        BAR_RANGES.forEach(([from, to], index) => {
          let total = 0
          const end = Math.min(to, data.length)
          for (let bin = from; bin < end; bin += 1) total += data[bin]
          const average = end > from ? total / (end - from) / 255 : 0
          const decibels = ANALYSER_MIN_DB + average * ANALYSER_RANGE_DB
          const level = Math.min(1, Math.max(0, (decibels + BAR_TILT_DB[index] + 78) / 48))
          const raw = level < 0.06 ? 0 : level

          // Each bar slowly adapts to how loud its own part of the song is,
          // then the player volume scales it, so a quieter volume still shows smaller bars.
          peaks[index] = Math.max(raw, peaks[index] * 0.9985)
          const gain = Math.min(4, Math.max(1, 0.85 / Math.max(peaks[index], 0.05)))
          const volumeScale = 0.3 + 0.7 * loudnessRef.current
          const target = Math.min(1, Math.pow(raw * gain, 1.2) * volumeScale)
          const previous = levels[index]
          levels[index] = target > previous
            ? previous + (target - previous) * 0.65
            : previous + (target - previous) * 0.2
        })
        paint()
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [isPlaying, analyserRef])

  return (
    <div className={`music-visualizer ${isPlaying ? 'is-active' : ''} ${live ? 'is-live' : ''}`} aria-hidden="true">
      {BAR_RANGES.map((range, index) => (
        <span key={range[0]} ref={(element) => { barsRef.current[index] = element }} />
      ))}
    </div>
  )
}

export default function SoundControl({
  isPlaying,
  toggle,
  currentTrack,
  selectTrack,
  playlist,
  error,
  volume,
  muted,
  setVolume,
  toggleMute,
  analyserRef,
}) {
  const [open, setOpen] = useState(false)
  const itemRefs = useRef([])
  const selectTimerRef = useRef(null)
  const track = playlist[currentTrack]
  const trackName = displayTrackName(track)
  const volumePercent = muted ? 0 : Math.round(volume * 100)
  const VolumeIcon = volumePercent === 0 ? VolumeX : volumePercent < 50 ? Volume1 : Volume2

  useEffect(() => {
    if (!open) return
    const current = itemRefs.current[currentTrack]
    current?.focus({ preventScroll: true })
    current?.scrollIntoView({ block: 'nearest' })
    // Only when the playlist opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => () => window.clearTimeout(selectTimerRef.current), [])

  const handleSelect = (index) => {
    window.clearTimeout(selectTimerRef.current)
    if (index === currentTrack) {
      if (!isPlaying) toggle()
      return
    }
    selectTrack(index, true)
  }

  const handlePanelKeys = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    if (event.target instanceof Element && event.target.closest('.volume-row')) return

    event.preventDefault()
    const focused = itemRefs.current.findIndex((item) => item === document.activeElement)
    const base = focused === -1 ? currentTrack : focused
    const step = event.key === 'ArrowDown' ? 1 : -1
    const next = Math.min(playlist.length - 1, Math.max(0, base + step))
    itemRefs.current[next]?.focus()

    // Moving to another song with the arrow keys plays it after a short pause,
    // so quickly scrolling past songs doesn't start each one.
    window.clearTimeout(selectTimerRef.current)
    if (next !== currentTrack) {
      selectTimerRef.current = window.setTimeout(() => selectTrack(next, true), 280)
    }
  }

  return (
    <div className={`sound-dock ${open ? 'is-open' : ''}`}>
      {open && (
        <div className="music-panel" onKeyDown={handlePanelKeys}>
          <div className="music-panel-head">
            <div>
              <span>PLAYLIST</span>
              <strong>{trackName}</strong>
            </div>
            <div className="music-panel-actions">
              <Music2 size={14} strokeWidth={1.5} />
              <button className="playlist-close" type="button" onClick={() => setOpen(false)} aria-label="Close playlist">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="track-list">
            {playlist.map((item, index) => {
              const itemName = displayTrackName(item)

              return (
                <button
                  key={item.file}
                  className={`track-item ${index === currentTrack ? 'is-current' : ''}`}
                  type="button"
                  ref={(element) => { itemRefs.current[index] = element }}
                  onClick={() => handleSelect(index)}
                >
                  <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="track-copy">
                    <span className="track-title">{itemName}</span>
                  </span>
                  {index === currentTrack && <span className="track-state">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>}
                </button>
              )
            })}
          </div>

          <div className="volume-row">
            <button
              className="volume-toggle"
              type="button"
              onClick={toggleMute}
              aria-label={volumePercent === 0 ? 'Unmute music' : 'Mute music'}
            >
              <VolumeIcon size={15} strokeWidth={1.5} />
            </button>
            <input
              className="volume-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercent}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
              style={{ '--vol': `${volumePercent}%` }}
              aria-label="Music volume"
            />
            <span className="volume-value">{volumePercent}</span>
          </div>

          {error && <p className="music-error">{error}</p>}
        </div>
      )}

      <div className="sound-control">
        <div className={`music-disc ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true">
          <Disc3 size={28} strokeWidth={1.15} />
          <span className="disc-hole" />
        </div>

        <button className="track-toggle" type="button" onClick={toggle} aria-label={isPlaying ? 'Pause music' : 'Play music'}>
          {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </button>

        <button className="track-info" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span className="track-label">{trackName}</span>
          <span className="track-meta">{isPlaying ? 'NOW PLAYING' : 'MUSIC'}</span>
        </button>

        <MusicVisualizer isPlaying={isPlaying} analyserRef={analyserRef} loudness={muted ? 0 : volume} />

        <button className="next-track" type="button" onClick={() => selectTrack((currentTrack + 1) % playlist.length)} aria-label="Next track">
          <SkipForward size={15} />
        </button>

        <button className="sound-panel-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Hide music playlist' : 'Show music playlist'}>
          <Music2 size={15} />
        </button>
      </div>
    </div>
  )
}