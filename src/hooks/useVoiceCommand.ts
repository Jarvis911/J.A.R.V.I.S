import { useCallback, useEffect, useRef, useState } from 'react'

import { useJarvisSession } from '@/context/JarvisSessionContext'
import { getSpeechRecognitionCtor } from '@/lib/getSpeechRecognition'
import { textAfterLastWake } from '@/lib/jarvisWakePhrase'

/** Placeholder until you wire `fetch('/api/chat')` or a local model. */
function placeholderJarvisReply(_userText: string): string {
  return 'Command received. Hook your LLM here (e.g. POST /api/chat with this transcript) to generate a live reply.'
}

export type JarvisWakeUiPhase = 'inactive' | 'wake_scan' | 'command'

type Mode = 'wake_scan' | 'command'

type UseVoiceCommandOptions = {
  /** Pause mic while assistant TTS is playing to avoid feedback loops. */
  suspendWhile?: boolean
}

function buildCombinedLine(event: SpeechRecognitionEvent): string {
  const parts: string[] = []
  for (let i = 0; i < event.results.length; i += 1) {
    const t = event.results[i]?.[0]?.transcript ?? ''
    if (t) parts.push(t)
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function useVoiceCommand(options?: UseVoiceCommandOptions) {
  const suspendWhile = options?.suspendWhile ?? false
  const { appendMessage } = useJarvisSession()
  const appendRef = useRef(appendMessage)
  appendRef.current = appendMessage

  const [wakeArmed, setWakeArmed] = useState(false)
  const [wakeUiPhase, setWakeUiPhase] = useState<JarvisWakeUiPhase>('inactive')
  const [sttError, setSttError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const recognitionAbortedRef = useRef(false)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const commandBufRef = useRef('')

  const wakeArmedRef = useRef(false)
  const suspendRef = useRef(false)
  const modeRef = useRef<Mode>('wake_scan')

  wakeArmedRef.current = wakeArmed
  suspendRef.current = suspendWhile

  const bindRecognitionRef = useRef<(() => void) | null>(null)

  const sttSupported = getSpeechRecognitionCtor() !== null

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const stopRecognitionHard = useCallback(() => {
    clearRestartTimer()
    const r = recognitionRef.current
    if (!r) return
    recognitionRef.current = null
    recognitionAbortedRef.current = true
    try {
      r.onresult = null
      r.onerror = null
      r.onend = null
      r.abort()
    } catch {
      /* ignore */
    }
  }, [clearRestartTimer])

  const scheduleRestart = useCallback(
    (delayMs: number) => {
      clearRestartTimer()
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null
        if (!wakeArmedRef.current || suspendRef.current) return
        if (recognitionRef.current) return
        bindRecognitionRef.current?.()
      }, delayMs)
    },
    [clearRestartTimer],
  )

  const bindRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    const rec = new Ctor()
    recognitionRef.current = rec
    recognitionAbortedRef.current = false

    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = true
    rec.maxAlternatives = 1

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const line = buildCombinedLine(event)
      const { heard, after } = textAfterLastWake(line)

      if (heard) {
        if (modeRef.current === 'wake_scan') {
          modeRef.current = 'command'
          setWakeUiPhase('command')
        }
        commandBufRef.current = after
      }
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      setSttError(event.error ?? 'recognition-error')
      if (event.error === 'not-allowed') {
        setWakeArmed(false)
        setWakeUiPhase('inactive')
      }
    }

    rec.onend = () => {
      recognitionRef.current = null

      const wasAborted = recognitionAbortedRef.current
      recognitionAbortedRef.current = false
      if (wasAborted) return

      if (modeRef.current === 'command') {
        const cmd = commandBufRef.current.trim()
        if (cmd) {
          appendRef.current('user', cmd)
          appendRef.current('jarvis', placeholderJarvisReply(cmd))
        }
        modeRef.current = 'wake_scan'
        commandBufRef.current = ''
        if (wakeArmedRef.current && !suspendRef.current) {
          setWakeUiPhase('wake_scan')
        }
      }

      if (wakeArmedRef.current && !suspendRef.current) {
        scheduleRestart(120)
      }
    }

    try {
      rec.start()
    } catch {
      setSttError('start-failed')
      setWakeArmed(false)
      setWakeUiPhase('inactive')
    }
  }, [scheduleRestart])

  bindRecognitionRef.current = bindRecognition

  useEffect(
    () => () => {
      clearRestartTimer()
      stopRecognitionHard()
    },
    [clearRestartTimer, stopRecognitionHard],
  )

  useEffect(() => {
    if (!wakeArmed || !sttSupported || suspendWhile) {
      stopRecognitionHard()
      if (!wakeArmed) {
        modeRef.current = 'wake_scan'
        commandBufRef.current = ''
        setWakeUiPhase('inactive')
      }
      return
    }

    setWakeUiPhase((p) => (p === 'inactive' ? 'wake_scan' : p))
    modeRef.current = 'wake_scan'
    commandBufRef.current = ''

    bindRecognitionRef.current?.()

    return () => {
      stopRecognitionHard()
    }
  }, [wakeArmed, sttSupported, suspendWhile, stopRecognitionHard])

  const toggleWakeArm = useCallback(() => {
    if (!sttSupported) {
      setSttError('no-stt')
      return
    }
    setSttError(null)
    setWakeArmed((prev) => {
      const next = !prev
      if (!next) {
        stopRecognitionHard()
        modeRef.current = 'wake_scan'
        commandBufRef.current = ''
        setWakeUiPhase('inactive')
      }
      return next
    })
  }, [sttSupported, stopRecognitionHard])

  const isSuspendedForTts = wakeArmed && suspendWhile
  const isCommandCapture = wakeUiPhase === 'command'
  const isWakeScanning =
    wakeArmed && sttSupported && wakeUiPhase === 'wake_scan' && !suspendWhile

  return {
    wakeArmed,
    wakeUiPhase,
    isSuspendedForTts,
    /** True while capturing the command after "Hey, JARVIS". */
    isListening: isCommandCapture,
    /** True while mic is on and scanning for the wake phrase. */
    isWakeScanning,
    sttSupported,
    sttError,
    toggleWakeArm,
    activate: toggleWakeArm,
    cancel: () => {
      stopRecognitionHard()
      setWakeArmed(false)
      setWakeUiPhase('inactive')
    },
  }
}
