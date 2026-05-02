import { Brain, Gauge, Server } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function AgentStatus({ className }: { className?: string }) {
  const [tokPerSec, setTokPerSec] = useState(112)
  const [ctxUsed, setCtxUsed] = useState(18_400)
  const [queueDepth, setQueueDepth] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTokPerSec((v) => Math.max(48, Math.round(v + (Math.random() - 0.5) * 22)))
      setCtxUsed((v) =>
        Math.min(32_768, Math.max(8_000, Math.round(v + (Math.random() - 0.5) * 900))),
      )
      setQueueDepth((v) => Math.max(0, Math.min(4, Math.round(v + (Math.random() - 0.5) * 2))))
    }, 2600)
    return () => window.clearInterval(id)
  }, [])

  const ctxPct = Math.round((ctxUsed / 32_768) * 100)

  return (
    <Card className={cn('flex h-full min-h-0 flex-col', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Neural core</CardTitle>
            <CardDescription>LLM runtime</CardDescription>
          </div>
          <Badge variant="default" className="shrink-0">
            Online
          </Badge>
        </div>
      </CardHeader>
      <Separator className="mb-2" />
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-cyan-500/20 bg-slate-950/60 px-3 py-3">
          <Brain className="h-8 w-8 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/90">
              Qwen 2.5 · local
            </p>
            <p className="truncate text-xs text-slate-400">
              Quantized weights · CUDA graph capture enabled
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Gauge className="h-4 w-4 text-cyan-400/80" />
              <span className="font-mono text-[11px] uppercase tracking-wide">
                Decode throughput
              </span>
            </div>
            <span className="font-mono text-sm text-cyan-200 tabular-nums">
              {tokPerSec} tok/s
            </span>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Server className="h-4 w-4 text-cyan-400/80" />
                <span className="font-mono text-[11px] uppercase tracking-wide">
                  Context window
                </span>
              </div>
              <span className="font-mono text-xs text-slate-300 tabular-nums">
                {ctxUsed.toLocaleString()} / 32,768
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-900 ring-1 ring-cyan-500/20">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_12px_rgba(34,211,238,0.55)] transition-[width] duration-500',
                  ctxPct > 85 && 'from-amber-400 to-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.55)]',
                )}
                style={{ width: `${ctxPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-800/80 bg-black/30 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Scheduler queue
            </span>
            {queueDepth > 0 ? (
              <Badge variant="warning">{queueDepth} pending</Badge>
            ) : (
              <Badge variant="secondary">Idle</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
