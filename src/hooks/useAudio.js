import { useCallback, useEffect, useRef, useState } from 'react'
import { PLAYLIST } from '../data/playlist'

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

const INTERACTION_EVENTS = ['pointerdown', 'touchend', 'keydown']

export default function useAudio() {
  const audioRef = useRef(null)
  const currentTrackRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [error, setError] = useState('')
  const [volume, setVolumeState] = useState(readSavedVolume)
  const [muted, setMuted] = useState(false)

  const volumeRef = useRef(volume)
  const mutedRef = useRef(false)
  const unlockRef = useRef(null)
  const graphRetryRef = useRef(null)
  const ctxRef = useRef(null)
  const graphRef = useRef(null)
  const graphFailedRef = useRef(false)
  const analyserRef = useRef(null)

  // Volume: through the Web Audio gain node when it is available (this is the only
  // way volume works on iPhone), otherwise through the normal audio element volume.
  const applyVolume = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const graph = graphRef.current
    if (graph) {
      graph.gain.gain.value = mutedRef.current ? 0 : volumeRef.current
      audio.volume = 1
      audio.muted = false
    } else {
      audio.volume = volumeRef.current
      audio.muted = mutedRef.current
    }
  }, [])

  const disarmUnlock = useCallback(() => {
    if (unlockRef.current) {
      unlockRef.current()
      unlockRef.current = null
    }
  }, [])

  const disarmGraphRetry = useCallback(() => {
    if (graphRetryRef.current) {
      graphRetryRef.current()
      graphRetryRef.current = null
    }
  }, [])

  // Connects the audio to an analyser so the player's bars can follow the real music.
  // The audio is only re-routed once the audio engine is confirmed running,
  // so a blocked engine can never silence the music.
  const setupGraph = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || graphRef.current || graphFailedRef.current) return

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback'
    } catch {
      // Not supported on this browser.
    }

    let ctx = ctxRef.current
    if (!ctx) {
      try {
        ctx = new AudioContextClass()
      } catch {
        graphFailedRef.current = true
        return
      }
      ctxRef.current = ctx
      ctx.onstatechange = () => {
        const current = audioRef.current
        if (ctx.state !== 'running' && current && !current.paused) {
          ctx.resume().catch(() => {})
        }
      }
    }

    try {
      await ctx.resume()
    } catch {
      // Handled by the state check below.
    }

    if (audioRef.current !== audio || graphRef.current) return

    if (ctx.state !== 'running') {
      // Not allowed yet: try again on the visitor's next tap, click or key press.
      if (!graphRetryRef.current) {
        const retry = () => {
          disarmGraphRetry()
          setupGraph()
        }
        INTERACTION_EVENTS.forEach((name) => window.addEventListener(name, retry, true))
        graphRetryRef.current = () => INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, retry, true))
      }
      return
    }

    try {
      const source = ctx.createMediaElementSource(audio)
      const gain = ctx.createGain()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.55
      analyser.minDecibels = -110
      analyser.maxDecibels = -10
      source.connect(gain)
      gain.connect(analyser)
      analyser.connect(ctx.destination)
      graphRef.current = { source, gain, analyser }
      analyserRef.current = analyser
      applyVolume()
    } catch {
      graphFailedRef.current = true
    }
  }, [applyVolume, disarmGraphRetry])

  // Browsers block sound until the visitor interacts with the page.
  // If the automatic start is blocked, start on the first tap, click or key press instead.
  const armUnlock = useCallback(() => {
    if (unlockRef.current) return

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

    INTERACTION_EVENTS.forEach((name) => window.addEventListener(name, handler, true))
    unlockRef.current = () => INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, handler, true))
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
      }).catch((reason) => {
        if (audioRef.current !== audio || reason?.name === 'AbortError') return
        setIsPlaying(false)
        setError('Tap or click anywhere to start the music.')
        armUnlock()
      })
    }
  }, [armUnlock])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio
    graphRef.current = null
    analyserRef.current = null
    applyVolume()

    const onEnded = () => {
      const next = (currentTrackRef.current + 1) % PLAYLIST.length
      loadTrack(next, true)
    }

    const onPlay = () => {
      setIsPlaying(true)
      disarmUnlock()
    }
    const onPlaying = () => setupGraph()
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      setIsPlaying(false)
      setError('This track is not available yet.')
    }

    const onVisible = () => {
      const ctx = ctxRef.current
      if (!document.hidden && ctx && ctx.state !== 'running' && !audio.paused) {
        ctx.resume().catch(() => {})
      }
    }

    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisible)

    // Start the first song right away; if the browser blocks it,
    // the first tap, click or key press starts it instead.
    loadTrack(0, true)

    return () => {
      disarmUnlock()
      disarmGraphRetry()
      document.removeEventListener('visibilitychange', onVisible)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.src = ''
      if (graphRef.current) {
        try {
          graphRef.current.source.disconnect()
          graphRef.current.gain.disconnect()
          graphRef.current.analyser.disconnect()
        } catch {
          // Already disconnected.
        }
      }
      graphRef.current = null
      analyserRef.current = null
      audioRef.current = null
    }
  }, [loadTrack, disarmUnlock, disarmGraphRetry, setupGraph, applyVolume])

  useEffect(() => {
    volumeRef.current = volume
    mutedRef.current = muted
    applyVolume()
  }, [volume, muted, applyVolume])

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
        setError('This track could not be played. Try another one.')
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
    analyserRef,
  }
}