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
}) {
  const [open, setOpen] = useState(false)
  const itemRefs = useRef([])
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
                  onClick={() => selectTrack(index, true)}
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
          <p className="music-hint">Your playlist is controlled here. Add or replace local MP3 files in <code>public/music/</code>.</p>
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

        <div className={`music-visualizer ${isPlaying ? 'is-active' : ''}`} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

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