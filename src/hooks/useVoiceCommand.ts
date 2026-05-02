import { useCallback, useEffect, useRef, useState } from 'react'

import { useJarvisSession } from '@/context/JarvisSessionContext'
import { getSpeechRecognitionCtor } from '@/lib/getSpeechRecognition'

const MOCK_TRANSCRIPTS = [
  'Deploy the Mark VII suit diagnostics.',
  'Run a full perimeter scan of the tower.',
  'What is the current reactor core temperature?',
  'Open the R&D lab secure channel.',
  'Summarize overnight security logs.',
  'Initiate silent mode across all Stark Industries endpoints.',
] as const

const LISTEN_MS = 2000

/** Placeholder until you wire `fetch('/api/chat')` or Ollama/OpenAI from a backend or edge function. */
function placeholderJarvisReply(_userText: string): string {
  return 'Command received. Hook your LLM here (e.g. POST /api/chat with this transcript) to generate a live reply.'
}

export type VoicePhase = 'idle' | 'listening'

export function useVoiceCommand() {
  const { appendMessage } = useJarvisSession()
  const [phase, setPhase] = useState<VoicePhase>('idle')
  const [sttError, setSttError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')
  const recognitionAbortedRef = useRef(false)

  const sttSupported = getSpeechRecognitionCtor() !== null

  const cancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopRecognition = useCallback(() => {
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
  }, [])

  const finishIdle = useCallback(() => {
    cancelTimer()
    stopRecognition()
    setPhase('idle')
  }, [cancelTimer, stopRecognition])

  const finishListeningMock = useCallback(() => {
    const line =
      MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)]
    appendMessage('user', line)
    appendMessage('jarvis', placeholderJarvisReply(line))
    setPhase('idle')
  }, [appendMessage])

  const startBrowserListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    setSttError(null)
    finalTranscriptRef.current = ''
    recognitionAbortedRef.current = false

    const rec = new Ctor()
    recognitionRef.current = rec
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1

    rec.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (!result?.isFinal) continue
        const chunk = (result[0]?.transcript ?? '').trim()
        if (!chunk) continue
        const prev = finalTranscriptRef.current.trim()
        finalTranscriptRef.current = prev ? `${prev} ${chunk}` : chunk
      }
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      setSttError(event.error ?? 'recognition-error')
    }

    rec.onend = () => {
      recognitionRef.current = null
      const wasAborted = recognitionAbortedRef.current
      recognitionAbortedRef.current = false
      if (wasAborted) {
        setPhase('idle')
        return
      }
      const said = finalTranscriptRef.current.trim()
      if (said) {
        appendMessage('user', said)
        appendMessage('jarvis', placeholderJarvisReply(said))
      }
      setPhase('idle')
    }

    try {
      rec.start()
    } catch {
      setSttError('start-failed')
      setPhase('idle')
    }
  }, [appendMessage])

  useEffect(
    () => () => {
      cancelTimer()
      stopRecognition()
    },
    [cancelTimer, stopRecognition],
  )

  const activate = useCallback(() => {
    if (phase === 'listening') {
      finishIdle()
      return
    }

    cancelTimer()
    stopRecognition()
    setPhase('listening')

    if (sttSupported) {
      startBrowserListening()
      return
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      finishListeningMock()
    }, LISTEN_MS)
  }, [
    cancelTimer,
    finishIdle,
    finishListeningMock,
    phase,
    startBrowserListening,
    sttSupported,
    stopRecognition,
  ])

  return {
    phase,
    isListening: phase === 'listening',
    sttSupported,
    sttError,
    activate,
    cancel: finishIdle,
  }
}
