import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useJarvisSession } from '@/context/JarvisSessionContext'
import { cn } from '@/lib/utils'

export function ChatLog({ className }: { className?: string }) {
  const { messages } = useJarvisSession()

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-cyan-500/35 bg-black/40 shadow-[inset_0_0_40px_rgba(34,211,238,0.06)] backdrop-blur-md',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-cyan-500/20 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400/90">
          Secure channel // comms_log
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          {messages.length} evt
        </span>
      </div>
      <Separator className="bg-cyan-500/15" />
      <ScrollArea className="min-h-0 flex-1 px-3 py-3">
        <ul className="flex flex-col gap-3 pr-2">
          {messages.map((m) => {
            const isUser = m.role === 'user'
            return (
              <li
                key={m.id}
                className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[min(520px,85%)] rounded-lg border px-3 py-2 font-mono text-xs leading-relaxed',
                    isUser
                      ? 'border-cyan-500/40 bg-cyan-500/5 text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.2)]'
                      : 'border-slate-700/80 bg-slate-950/70 text-slate-200 shadow-[0_0_12px_rgba(15,23,42,0.8)]',
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.25em] text-slate-500">
                    <span>{isUser ? 'User' : 'J.A.R.V.I.S'}</span>
                    <span className="font-mono normal-case tracking-normal text-slate-600">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-[13px]">{m.content}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </div>
  )
}
