import { useCallback, useEffect, useRef, useState } from 'react'

import { useJarvisSession } from '@/context/JarvisSessionContext'

const MOCK_TRANSCRIPTS = [
  'Deploy the Mark VII suit diagnostics.',
  'Run a full perimeter scan of the tower.',
  'What is the current reactor core temperature?',
  'Open the R&D lab secure channel.',
  'Summarize overnight security logs.',
  'Initiate silent mode across all Stark Industries endpoints.',
] as const

const LISTEN_MS = 2000

export type VoicePhase = 'idle' | 'listening'

export function useVoiceCommand() {
  const { appendMessage } = useJarvisSession()
  const [phase, setPhase] = useState<VoicePhase>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => () => cancelTimer(), [cancelTimer])

  const finishListening = useCallback(() => {
    const line =
      MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)]
    appendMessage('user', line)
    appendMessage(
      'jarvis',
      'Command logged. Executing workflow in sandboxed environment.',
    )
    setPhase('idle')
  }, [appendMessage])

  const activate = useCallback(() => {
    if (phase === 'listening') return
    cancelTimer()
    setPhase('listening')
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      finishListening()
    }, LISTEN_MS)
  }, [cancelTimer, finishListening, phase])

  return {
    phase,
    isListening: phase === 'listening',
    activate,
    cancel: () => {
      cancelTimer()
      setPhase('idle')
    },
  }
}
