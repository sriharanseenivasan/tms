import { PhoneCall } from 'lucide-react'
import { useMemo } from 'react'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CallMode } from '@/services/api'
import type { Token, Truck } from '@/types'
import { cn } from '@/utils/cn'
import { formatDuration, minutesBetween } from '@/utils/formatters'

interface CallNextPanelProps {
  queue: Truck[]
  tokens: Token[]
  mode: CallMode
  onModeChange: (mode: CallMode) => void
  onCallNext: () => void
  calling: boolean
  freeBays: number
}

const MODES: Array<{ value: CallMode; label: string }> = [
  { value: 'FIFO', label: 'FIFO' },
  { value: 'PRIORITY', label: 'Priority' },
]

/** Side panel: queue ordering toggle, next-up list and the call-next action. */
export function CallNextPanel({
  queue,
  tokens,
  mode,
  onModeChange,
  onCallNext,
  calling,
  freeBays,
}: CallNextPanelProps) {
  const ordered = useMemo(() => {
    const tokenByTruck = new Map(tokens.map((t) => [t.truckId, t]))
    return [...queue]
      .sort((a, b) => {
        if (mode === 'PRIORITY' && a.priority !== b.priority) {
          return a.priority === 'HIGH' ? -1 : 1
        }
        return (
          (tokenByTruck.get(a.id)?.fifoPosition ?? 0) -
          (tokenByTruck.get(b.id)?.fifoPosition ?? 0)
        )
      })
      .map((truck) => ({ truck, token: tokenByTruck.get(truck.id) }))
  }, [queue, tokens, mode])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onModeChange(m.value)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              mode === m.value ? 'bg-panel text-ink shadow-sm' : 'text-slate-500',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {ordered.length === 0 ? (
          <EmptyState title="Queue is empty" description="No trucks waiting to be called." />
        ) : (
          ordered.map(({ truck, token }, i) => (
            <div
              key={truck.id}
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg border px-3 py-2',
                i === 0 ? 'border-brand-300 bg-brand-50' : 'border-line',
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-brand-700">{token?.number ?? '—'}</span>
                  <span className="font-mono text-sm font-semibold text-ink">{truck.regNo}</span>
                </div>
                <p className="text-xs text-muted">
                  waiting {formatDuration(minutesBetween(token?.issuedAt ?? truck.updatedAt))}
                </p>
              </div>
              {truck.priority === 'HIGH' ? (
                <PriorityBadge priority={truck.priority} />
              ) : (
                i === 0 && <span className="text-xs font-medium text-brand-600">Next</span>
              )}
            </div>
          ))
        )}
      </div>

      <Button
        className="mt-3 w-full"
        leftIcon={<PhoneCall className="h-4 w-4" />}
        onClick={onCallNext}
        disabled={calling || ordered.length === 0 || freeBays === 0}
      >
        {freeBays === 0 ? 'No free bay' : 'Call next truck'}
      </Button>
    </div>
  )
}
