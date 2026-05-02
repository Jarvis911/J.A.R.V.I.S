import { Volume2, VolumeX } from 'lucide-react'

import { cn } from '@/lib/utils'

type VoiceOutputToggleProps = {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  isSupported: boolean
  isSpeaking: boolean
  className?: string
}

export function VoiceOutputToggle({
  enabled,
  onEnabledChange,
  isSupported,
  isSpeaking,
  className,
}: VoiceOutputToggleProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:inline">
        Voice out
      </span>
      <button
        type="button"
        disabled={!isSupported}
        title={
          !isSupported
            ? 'Text-to-speech is not supported in this browser'
            : enabled
              ? 'Mute J.A.R.V.I.S voice'
              : 'Enable J.A.R.V.I.S voice'
        }
        aria-pressed={enabled}
        onClick={() => onEnabledChange(!enabled)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-md border px-3 font-mono text-[10px] uppercase tracking-wider transition-colors',
          !isSupported &&
            'cursor-not-allowed border-slate-800 text-slate-600 opacity-60',
          isSupported &&
            enabled &&
            'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.25)]',
          isSupported &&
            !enabled &&
            'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200',
        )}
      >
        {enabled ? (
          <Volume2
            className={cn(
              'h-4 w-4',
              isSpeaking && 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
            )}
            aria-hidden
          />
        ) : (
          <VolumeX className="h-4 w-4" aria-hidden />
        )}
        <span className="max-w-[7rem] truncate sm:max-w-none">
          {!isSupported ? 'TTS off' : enabled ? (isSpeaking ? 'Speaking' : 'On') : 'Muted'}
        </span>
      </button>
    </div>
  )
}
