import { useEffect, useRef } from 'react'

import { useJarvisSession } from '@/context/JarvisSessionContext'

import { useTextToSpeech } from './useTextToSpeech'

/**
 * Speaks the latest J.A.R.V.I.S (assistant) chat line when `enabled` is true,
 * using the browser Web Speech API (`speechSynthesis`).
 */
export function useJarvisTts(enabled: boolean) {
  const { messages } = useJarvisSession()
  const { speak, cancel, isSpeaking, isSupported } = useTextToSpeech({
    rate: 0.93,
    pitch: 0.97,
    volume: 1,
  })

  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !isSupported) return

    const last = messages[messages.length - 1]
    if (!last || last.role !== 'jarvis') return
    if (last.id === lastSpokenIdRef.current) return

    lastSpokenIdRef.current = last.id
    speak(last.content)
  }, [enabled, isSupported, messages, speak])

  useEffect(() => {
    if (!enabled) {
      cancel()
    }
  }, [enabled, cancel])

  return {
    isSpeaking,
    isSupported,
    cancelSpeech: cancel,
  }
}
