/**
 * Returns the browser SpeechRecognition constructor when available
 * (Chrome/Edge: `webkitSpeechRecognition`; some builds expose `SpeechRecognition`).
 */
export function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function isBrowserSpeechToTextSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}
