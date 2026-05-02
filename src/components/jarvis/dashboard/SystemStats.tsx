import { Activity, Cpu, HardDrive, ThermometerSun } from 'lucide-react'
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

function jitter(base: number, spread: number) {
  return Math.min(100, Math.max(0, base + (Math.random() - 0.5) * spread))
}

export function SystemStats({ className }: { className?: string }) {
  const [cpu, setCpu] = useState(18)
  const [ram, setRam] = useState(42)
  const [disk, setDisk] = useState(61)
  const [gpuTemp, setGpuTemp] = useState(58)

  useEffect(() => {
    const id = window.setInterval(() => {
      setCpu((v) => jitter(v, 14))
      setRam((v) => jitter(v, 8))
      setDisk((v) => jitter(v, 1.2))
      setGpuTemp((v) => jitter(v, 6))
    }, 2200)
    return () => window.clearInterval(id)
  }, [])

  const rows = [
    {
      label: 'CPU cluster',
      value: `${cpu.toFixed(0)}%`,
      icon: Cpu,
      warn: cpu > 85,
    },
    {
      label: 'RAM allocation',
      value: `${ram.toFixed(0)}%`,
      icon: HardDrive,
      warn: ram > 90,
    },
    {
      label: 'NVMe scratch',
      value: `${disk.toFixed(0)}%`,
      icon: Activity,
      warn: disk > 92,
    },
    {
      label: 'Arc GPU thermal',
      value: `${gpuTemp.toFixed(0)}°C`,
      icon: ThermometerSun,
      warn: gpuTemp > 82,
    },
  ] as const

  return (
    <Card className={cn('flex h-full min-h-0 flex-col', className)}>
      <CardHeader className="pb-2">
        <CardTitle>Hardware telemetry</CardTitle>
        <CardDescription>Local inference node</CardDescription>
      </CardHeader>
      <Separator className="mb-2" />
      <CardContent className="flex flex-1 flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-cyan-500/15 bg-slate-950/50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <row.icon className="h-4 w-4 text-cyan-400/80" strokeWidth={1.5} />
              <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">
                {row.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-mono text-sm tabular-nums text-cyan-200',
                  row.warn && 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]',
                )}
              >
                {row.value}
              </span>
              {row.warn ? (
                <Badge variant="warning">Thrm</Badge>
              ) : (
                <Badge variant="secondary">Nom</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
