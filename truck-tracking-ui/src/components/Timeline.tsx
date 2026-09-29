import type { TruckEvent } from '@/types'
import { STATUS_META } from '@/utils/constants'
import { formatDuration, formatTime, minutesBetween } from '@/utils/formatters'
import { EmptyState } from '@/components/ui/EmptyState'
import { Clock } from 'lucide-react'

interface TimelineProps {
  events: TruckEvent[]
}

/** Vertical journey timeline: each stage with timestamp, duration and actor. */
export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No journey yet"
        description="Events appear here as the truck moves through each stage."
      />
    )
  }

  const sorted = [...events].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  )

  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-[7px] top-1 bottom-1 w-px bg-line" aria-hidden />
      {sorted.map((event, i) => {
        const meta = STATUS_META[event.stage]
        const next = sorted[i + 1]
        const duration = minutesBetween(
          event.timestamp,
          next ? next.timestamp : undefined,
        )
        return (
          <li key={event.id} className="relative">
            <span
              className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-panel"
              style={{ backgroundColor: meta.hex }}
              aria-hidden
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-ink">{meta.label}</p>
              <time className="text-xs text-muted">{formatTime(event.timestamp)}</time>
            </div>
            <p className="text-xs text-muted">
              {event.actor}
              {next && <span> · took {formatDuration(duration)}</span>}
            </p>
            {event.note && <p className="mt-0.5 text-xs text-rose-600">{event.note}</p>}
          </li>
        )
      })}
    </ol>
  )
}
