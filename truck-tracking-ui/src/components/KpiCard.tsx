import type { ComponentType, ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface KpiCardProps {
  label: string
  value: ReactNode
  icon?: ComponentType<{ className?: string }>
  hint?: string
  /** Accent colour classes for the icon chip, e.g. "bg-brand-50 text-brand-600". */
  accent?: string
}

/** Compact KPI tile for the control-tower dashboard. */
export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = 'bg-brand-50 text-brand-600',
}: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accent)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  )
}
