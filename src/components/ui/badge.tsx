import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:ring-offset-0',
  {
    variants: {
      variant: {
        default:
          'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]',
        secondary:
          'border-slate-600/60 bg-slate-900/60 text-slate-300',
        destructive:
          'border-rose-500/50 bg-rose-500/10 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
        outline: 'border-slate-600 text-slate-300',
        warning:
          'border-amber-400/60 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
