import { CheckCircle2, Clock, LogOut, PlayCircle, ScanLine, Send, Wrench } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNow } from '@/hooks/useNow'
import type { Bay, Truck } from '@/types'
import { TruckStatus } from '@/types'
import { formatClock } from '@/utils/formatters'

interface OperatorBayPanelProps {
  bay: Bay
  truck?: Truck
  submitting: boolean
  onStart: () => void
  onComplete: () => void
  onDispatch: () => void
}

/** Action panel for the selected bay — drives the start → complete → dispatch flow. */
export function OperatorBayPanel({
  bay,
  truck,
  submitting,
  onStart,
  onComplete,
  onDispatch,
}: OperatorBayPanelProps) {
  const now = useNow()

  if (bay.status === 'MAINTENANCE') {
    return <EmptyState icon={Wrench} title={`Bay ${bay.id} under maintenance`} />
  }

  if (!truck) {
    return (
      <EmptyState
        icon={ScanLine}
        title={`Bay ${bay.id} is free`}
        description="No truck is assigned. Call one from the Bay Control Board."
      />
    )
  }

  const action = truck.type === 'INBOUND' ? 'unloading' : 'loading'
  const isActive = truck.status === TruckStatus.LOADING || truck.status === TruckStatus.UNLOADING
  const isCompleted = truck.status === TruckStatus.COMPLETED
  const elapsed = bay.startTime ? formatClock(now - Date.parse(bay.startTime)) : '0:00'

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-panel p-4 text-center">
        <p className="font-mono text-2xl font-bold text-ink">{truck.regNo}</p>
        <p className="text-sm text-muted">{truck.material}</p>
        <div className="mt-2 flex justify-center">
          <StatusBadge status={truck.status} />
        </div>
      </div>

      {truck.status === TruckStatus.CALLED_TO_BAY && (
        <Button
          size="lg"
          className="w-full"
          leftIcon={<PlayCircle className="h-5 w-5" />}
          onClick={onStart}
          disabled={submitting}
        >
          Scan QR to start {action}
        </Button>
      )}

      {isActive && (
        <>
          <div className="rounded-xl bg-slate-900 py-6 text-center text-white">
            <p className="flex items-center justify-center gap-2 font-mono text-4xl font-bold tabular-nums">
              <Clock className="h-6 w-6 text-cyan-400" />
              {elapsed}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">
              {action} in progress
            </p>
          </div>
          <Button
            size="lg"
            variant="success"
            className="w-full"
            leftIcon={<CheckCircle2 className="h-5 w-5" />}
            onClick={onComplete}
            disabled={submitting}
          >
            Scan QR to complete
          </Button>
        </>
      )}

      {isCompleted && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{action} completed</span>
          </div>
          <Button
            size="lg"
            className="w-full"
            leftIcon={<Send className="h-5 w-5" />}
            onClick={onDispatch}
            disabled={submitting}
          >
            Send to next station
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            leftIcon={<LogOut className="h-5 w-5" />}
            onClick={onDispatch}
            disabled={submitting}
          >
            Send to exit
          </Button>
        </div>
      )}
    </div>
  )
}
