import { Clock, Truck as TruckIcon, Wrench } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { useNow } from '@/hooks/useNow'
import type { Bay, Truck } from '@/types'
import { BAY_STATUS_META } from '@/utils/constants'
import { cn } from '@/utils/cn'
import { formatClock } from '@/utils/formatters'

interface BayCardProps {
  bay: Bay
  truck?: Truck
  onClick?: (bay: Bay) => void
}

/** One bay tile: status, truck, live elapsed timer and progress bar. */
export function BayCard({ bay, truck, onClick }: BayCardProps) {
  const now = useNow()
  const meta = BAY_STATUS_META[bay.status]
  const elapsed = bay.startTime ? formatClock(now - Date.parse(bay.startTime)) : null
  const isActive = bay.status === 'OCCUPIED'

  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(bay) : undefined}
      disabled={!onClick}
      className={cn(
        'flex flex-col rounded-xl border bg-panel p-3 text-left shadow-sm transition-colors',
        onClick && 'hover:border-brand-300',
      )}
      style={{ borderTopColor: meta.hex, borderTopWidth: 3 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Bay {bay.id}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset', meta.badge)}>
          {meta.label}
        </span>
      </div>

      {bay.status === 'MAINTENANCE' ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <Wrench className="h-6 w-6" />
          <span className="text-xs">Under maintenance</span>
        </div>
      ) : truck ? (
        <div className="mt-2 flex flex-1 flex-col">
          <p className="font-mono text-sm font-semibold text-ink">{truck.regNo}</p>
          <p className="truncate text-xs text-muted">{truck.material}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
            {isActive ? (
              <>
                <Clock className="h-3.5 w-3.5 text-cyan-500" />
                <span className="font-mono tabular-nums">{elapsed}</span>
              </>
            ) : (
              <StatusBadge status={truck.status} />
            )}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${bay.progress}%`, backgroundColor: meta.hex }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-1 text-slate-300">
          <TruckIcon className="h-6 w-6" />
          <span className="text-xs text-slate-400">Empty</span>
        </div>
      )}
    </button>
  )
}
