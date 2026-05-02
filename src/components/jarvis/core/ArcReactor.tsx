import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

import { cn } from '@/lib/utils'

type ArcReactorProps = {
  wakeArmed: boolean
  isWakeScanning: boolean
  isListening: boolean
  isSuspendedForTts: boolean
  onToggleWake: () => void
  browserStt?: boolean
  sttError?: string | null
  className?: string
}

export function ArcReactor({
  wakeArmed,
  isWakeScanning,
  isListening,
  isSuspendedForTts,
  onToggleWake,
  browserStt = false,
  sttError = null,
  className,
}: ArcReactorProps) {
  const activePulse = isListening || isWakeScanning

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <motion.button
        type="button"
        aria-pressed={wakeArmed}
        aria-label={
          wakeArmed
            ? 'Turn off always-on wake listening'
            : 'Turn on always-on wake listening (Hey, JARVIS)'
        }
        onClick={onToggleWake}
        className={cn(
          'relative grid h-36 w-36 place-items-center rounded-full border-2 outline-none transition-colors',
          'border-cyan-400/60 bg-slate-950/80 shadow-[0_0_30px_rgba(34,211,238,0.45)]',
          'focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          isListening && 'border-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.85)]',
          isWakeScanning &&
            !isListening &&
            'border-cyan-500/50 shadow-[0_0_28px_rgba(34,211,238,0.35)]',
          isSuspendedForTts &&
            'border-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.35)]',
          !wakeArmed && 'border-cyan-500/35 opacity-90',
        )}
        animate={
          isSuspendedForTts
            ? { scale: [1, 1.01, 1] }
            : isListening
              ? {
                  scale: [1, 1.06, 1],
                  boxShadow: [
                    '0 0 45px rgba(34,211,238,0.85)',
                    '0 0 70px rgba(56,189,248,0.95)',
                    '0 0 45px rgba(34,211,238,0.85)',
                  ],
                }
              : isWakeScanning
                ? {
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      '0 0 20px rgba(34,211,238,0.28)',
                      '0 0 32px rgba(34,211,238,0.45)',
                      '0 0 20px rgba(34,211,238,0.28)',
                    ],
                  }
                : {
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      '0 0 22px rgba(34,211,238,0.35)',
                      '0 0 34px rgba(34,211,238,0.55)',
                      '0 0 22px rgba(34,211,238,0.35)',
                    ],
                  }
        }
        transition={
          isSuspendedForTts
            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            : isListening
              ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut' }
              : isWakeScanning
                ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <span
          className="pointer-events-none absolute inset-6 rounded-full border border-cyan-500/30"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-10 rounded-full bg-gradient-to-br from-cyan-400/25 via-sky-500/10 to-transparent blur-[1px]"
          aria-hidden
        />
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 180deg, transparent, rgba(34,211,238,0.35), transparent)',
          }}
          animate={{ rotate: activePulse ? 360 : 120 }}
          transition={
            activePulse
              ? { duration: isListening ? 1.2 : 18, repeat: Infinity, ease: 'linear' }
              : { duration: 14, repeat: Infinity, ease: 'linear' }
          }
          aria-hidden
        />
        <Mic
          className={cn(
            'relative z-10 h-10 w-10 text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]',
            (isListening || isWakeScanning) && 'text-cyan-50',
            isSuspendedForTts && 'text-amber-200',
          )}
          strokeWidth={1.5}
        />
      </motion.button>
      <p className="max-w-[20rem] text-center font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-400/80">
        {sttError
          ? `STT: ${sttError}`
          : isSuspendedForTts
            ? 'Mic paused while JARVIS speaks…'
            : !browserStt
              ? 'Wake word needs Chrome / Edge STT'
              : !wakeArmed
                ? 'Tap — always-on: "Hey, JARVIS"'
                : isListening
                  ? 'Say your command…'
                  : 'Listening for "Hey, JARVIS"…'}
      </p>
    </div>
  )
}
