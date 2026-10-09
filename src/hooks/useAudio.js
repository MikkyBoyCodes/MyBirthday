import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAYLIST } from '../data/playlist'

const AUTOPLAY_DELAY = 4200
const VOLUME_KEY = 'birthday-music-volume'
const DEFAULT_VOLUME = 0.8

function readSavedVolume() {
  try {
    const saved = parseFloat(window.localStorage.getItem(VOLUME_KEY))
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

export default function useAudio() {
  const audioRef = useRef(null)
  const currentTrackRef = useRef(0)
  const autoplayTimerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [error, setError] = useState('')
  const [volume, setVolumeState] = useState(readSavedVolume)
  const [muted, setMuted] = useState(false)
  const unlockRef = useRef(null)

  const disarmUnlock = useCallback(() => {
    if (unlockRef.current) {
      unlockRef.current()
      unlockRef.current = null
    }
  }, [])

  // Browsers block sound until the visitor interacts with the page.
  // If the automatic start is blocked, start on the first tap, click or key press instead.
  const armUnlock = useCallback(() => {
    if (unlockRef.current) return
    const events = ['pointerdown', 'touchend', 'keydown']

    const handler = (event) => {
      if (event.target instanceof Element && event.target.closest('.sound-dock')) {
        disarmUnlock()
        return
      }
      const audio = audioRef.current
      if (!audio || !audio.paused) {
        disarmUnlock()
        return
      }
      audio.play().then(() => {
        setIsPlaying(true)
        setError('')
        disarmUnlock()
      }).catch(() => {})
    }

    events.forEach((name) => window.addEventListener(name, handler, true))
    unlockRef.current = () => events.forEach((name) => window.removeEventListener(name, handler, true))
  }, [disarmUnlock])

  const loadTrack = useCallback((index, autoplay = false) => {
    const audio = audioRef.current
    if (!audio || !PLAYLIST.length) return

    const safeIndex = (index + PLAYLIST.length) % PLAYLIST.length
    const track = PLAYLIST[safeIndex]
    currentTrackRef.current = safeIndex
    setCurrentTrack(safeIndex)
    setError('')
    audio.src = track.file
    audio.load()

    if (autoplay) {
      audio.play().then(() => {
        setIsPlaying(true)
        setError('')
      }).catch(() => {
        setIsPlaying(false)
        setError('Tap or click anywhere to start the music.')
        armUnlock()
      })
    }
  }, [armUnlock])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onEnded = () => {
      const next = (currentTrackRef.current + 1) % PLAYLIST.length
      loadTrack(next, true)
    }

    const onPlay = () => {
      setIsPlaying(true)
      disarmUnlock()
    }
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      setIsPlaying(false)
      setError('This track is not available yet. Add the MP3 to public/music/.')
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    loadTrack(0)

    autoplayTimerRef.current = window.setTimeout(() => {
      loadTrack(0, true)
    }, AUTOPLAY_DELAY)

    return () => {
      window.clearTimeout(autoplayTimerRef.current)
      disarmUnlock()
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [loadTrack, disarmUnlock])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
    audioRef.current.muted = muted
  }, [volume, muted])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
        setError('')
      } catch {
        setIsPlaying(false)
        setError('Add the music files to public/music/ or choose another track.')
      }
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const selectTrack = async (index, forcePlay = false) => {
    const wasPlaying = !audioRef.current?.paused
    loadTrack(index, wasPlaying || forcePlay)
  }

  const setVolume = (value) => {
    const next = Math.min(1, Math.max(0, value))
    setVolumeState(next)
    if (next > 0) setMuted(false)
    try {
      window.localStorage.setItem(VOLUME_KEY, String(next))
    } catch {
      // Saving the volume is optional.
    }
  }

  const toggleMute = () => {
    if (muted || volume === 0) {
      if (volume === 0) setVolume(0.5)
      setMuted(false)
    } else {
      setMuted(true)
    }
  }

  return {
    isPlaying,
    toggle,
    currentTrack,
    selectTrack,
    playlist: PLAYLIST,
    error,
    volume,
    muted,
    setVolume,
    toggleMute,
  }
}