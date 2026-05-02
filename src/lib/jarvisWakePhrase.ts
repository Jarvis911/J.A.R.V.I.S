/** Matches "Hey JARVIS" / "Hey, JARVIS" (case-insensitive). */
export function textAfterLastWake(full: string): { heard: boolean; after: string } {
  const normalized = full.replace(/\s+/g, ' ').trim()
  if (!normalized) return { heard: false, after: '' }

  const re = /\bhey[, ]?\s*jarvis\b/gi
  const matches = [...normalized.matchAll(re)]
  if (!matches.length) return { heard: false, after: '' }

  const last = matches[matches.length - 1]!
  const end = (last.index ?? 0) + last[0].length
  const after = normalized.slice(end).trim()
  return { heard: true, after }
}
