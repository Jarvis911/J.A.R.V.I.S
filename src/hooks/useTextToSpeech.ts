import { useCallback, useEffect, useRef, useState } from 'react'

export type TextToSpeechOptions = {
  rate?: number
  pitch?: number
  volume?: number
}

function pickJarvisVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const pool = en.length ? en : voices

  const byName = (re: RegExp) => pool.find((v) => re.test(v.name))
  const byLang = (lang: string) =>
    pool.find((v) => v.lang.toLowerCase() === lang.toLowerCase())

  return (
    byName(/Google UK English Male/i) ??
    byName(/Microsoft George/i) ??
    byName(/Daniel/i) ??
    byLang('en-GB') ??
    byLang('en-AU') ??
    pool.find((v) => v.lang.toLowerCase().startsWith('en-gb')) ??
    pool[0] ??
    null
  )
}

export function useTextToSpeech(options?: TextToSpeechOptions) {
  const optsRef = useRef(options)
  optsRef.current = options

  const [isSpeaking, setIsSpeaking] = useState(false)

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const refreshVoices = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.getVoices()
  }, [isSupported])

  useEffect(() => {
    if (!isSupported) return
    refreshVoices()
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refreshVoices)
    }
  }, [isSupported, refreshVoices])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      const voices = window.speechSynthesis.getVoices()
      const voice = pickJarvisVoice(voices)
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      } else {
        utterance.lang = 'en-GB'
      }

      const o = optsRef.current
      utterance.rate = o?.rate ?? 0.92
      utterance.pitch = o?.pitch ?? 0.98
      utterance.volume = o?.volume ?? 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [isSupported],
  )

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  useEffect(() => () => cancel(), [cancel])

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
  }
}
