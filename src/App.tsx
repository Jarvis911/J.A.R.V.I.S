import { useState } from 'react'

import { ArcReactor } from '@/components/jarvis/core/ArcReactor'
import { ChatLog } from '@/components/jarvis/chat/ChatLog'
import { AgentStatus } from '@/components/jarvis/dashboard/AgentStatus'
import { SystemStats } from '@/components/jarvis/dashboard/SystemStats'
import { VoiceOutputToggle } from '@/components/jarvis/dashboard/VoiceOutputToggle'
import { JarvisSessionProvider } from '@/context/JarvisSessionContext'
import { useJarvisTts } from '@/hooks/useJarvisTts'
import { useVoiceCommand } from '@/hooks/useVoiceCommand'

function JarvisDashboard() {
  const [voiceOutEnabled, setVoiceOutEnabled] = useState(true)
  const { isSpeaking, isSupported, cancelSpeech } = useJarvisTts(voiceOutEnabled)
  const {
    wakeArmed,
    isWakeScanning,
    isListening,
    isSuspendedForTts,
    toggleWakeArm,
    sttSupported,
    sttError,
  } = useVoiceCommand({
    suspendWhile: voiceOutEnabled && isSpeaking,
  })

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-cyan-500/20 bg-black/40 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.55em] text-cyan-500/80">
              Stark Industries // R&D
            </p>
            <h1 className="mt-1 text-2xl font-semibold uppercase tracking-[0.35em] text-cyan-100 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
              J.A.R.V.I.S
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <VoiceOutputToggle
              enabled={voiceOutEnabled}
              onEnabledChange={(on) => {
                setVoiceOutEnabled(on)
                if (!on) cancelSpeech()
              }}
              isSupported={isSupported}
              isSpeaking={isSpeaking}
            />
            <div className="hidden text-right font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 sm:block">
              Secure shell v4
              <br />
              <span className="text-cyan-500/70">Encryption: AES-256-GCM</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-[minmax(240px,280px)_1fr_minmax(260px,300px)] lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-4 lg:p-6">
        <SystemStats className="min-h-[280px] lg:row-span-2 lg:min-h-0" />

        <ChatLog className="min-h-[320px] lg:min-h-0 lg:h-full" />

        <div className="flex flex-col items-center justify-center gap-2 lg:col-start-2 lg:row-start-2">
          <ArcReactor
            wakeArmed={wakeArmed}
            isWakeScanning={isWakeScanning}
            isListening={isListening}
            isSuspendedForTts={isSuspendedForTts}
            onToggleWake={toggleWakeArm}
            browserStt={sttSupported}
            sttError={sttError}
          />
        </div>

        <AgentStatus className="min-h-[280px] lg:row-span-2 lg:col-start-3 lg:min-h-0" />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <JarvisSessionProvider>
      <JarvisDashboard />
    </JarvisSessionProvider>
  )
}
