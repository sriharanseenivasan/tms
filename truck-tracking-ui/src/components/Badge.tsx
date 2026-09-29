import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: ReactNode
  /** Tailwind classes for bg + text + ring colours. */
  className?: string
  dot?: boolean
  dotColor?: string
}

/** Small pill label. Colour classes are supplied by the caller (from constants). */
export function Badge({ children, className, dot, dotColor }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        className,
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor ?? 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}
