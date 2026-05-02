import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

import { cn } from '@/lib/utils'

type ArcReactorProps = {
  isListening: boolean
  onActivate: () => void
  className?: string
}

export function ArcReactor({
  isListening,
  onActivate,
  className,
}: ArcReactorProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <motion.button
        type="button"
        aria-pressed={isListening}
        aria-label={isListening ? 'Listening for command' : 'Activate voice'}
        onClick={onActivate}
        className={cn(
          'relative grid h-36 w-36 place-items-center rounded-full border-2 outline-none transition-colors',
          'border-cyan-400/60 bg-slate-950/80 shadow-[0_0_30px_rgba(34,211,238,0.45)]',
          'focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          isListening && 'border-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.85)]',
        )}
        animate={
          isListening
            ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  '0 0 45px rgba(34,211,238,0.85)',
                  '0 0 70px rgba(56,189,248,0.95)',
                  '0 0 45px rgba(34,211,238,0.85)',
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
          isListening
            ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut' }
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
          animate={{ rotate: isListening ? 360 : 120 }}
          transition={
            isListening
              ? { duration: 1.2, repeat: Infinity, ease: 'linear' }
              : { duration: 14, repeat: Infinity, ease: 'linear' }
          }
          aria-hidden
        />
        <Mic
          className={cn(
            'relative z-10 h-10 w-10 text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]',
            isListening && 'text-cyan-50',
          )}
          strokeWidth={1.5}
        />
      </motion.button>
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400/80">
        {isListening ? 'Acquiring voiceprint…' : 'Voice interface — standby'}
      </p>
    </div>
  )
}
