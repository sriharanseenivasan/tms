import { CheckCircle2, Clock, MapPin, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Token, Truck } from '@/types'
import { formatDuration } from '@/utils/formatters'

interface KioskTokenProps {
  truck: Truck
  token: Token
  position: number
  estimatedWaitMin: number
  slotLabel?: string
  onReset: () => void
}

/** Step 3 — the big token confirmation with position and estimated wait. */
export function KioskToken({
  truck,
  token,
  position,
  estimatedWaitMin,
  slotLabel,
  onReset,
}: KioskTokenProps) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-panel p-8 text-center shadow-2xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <p className="mt-4 text-sm text-muted">You are checked in</p>
      <p className="font-mono text-lg font-semibold text-ink">{truck.regNo}</p>

      <div className="mt-6 rounded-2xl bg-brand-600 px-6 py-6 text-white">
        <p className="text-sm font-medium text-brand-100">Your token</p>
        <p className="font-mono text-5xl font-bold tracking-wide">{token.number}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line p-4">
          <p className="text-3xl font-bold text-ink">#{position}</p>
          <p className="mt-1 text-xs text-muted">Queue position</p>
        </div>
        <div className="rounded-xl border border-line p-4">
          <p className="flex items-center justify-center gap-1 text-3xl font-bold text-ink">
            <Clock className="h-5 w-5 text-amber-500" />
            {formatDuration(estimatedWaitMin)}
          </p>
          <p className="mt-1 text-xs text-muted">Est. wait</p>
        </div>
      </div>

      {slotLabel && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-ink">
          <MapPin className="h-4 w-4 text-brand-600" />
          Park at slot <span className="font-semibold">{slotLabel}</span>
        </p>
      )}

      <Button
        variant="secondary"
        className="mt-8 w-full"
        leftIcon={<RotateCcw className="h-4 w-4" />}
        onClick={onReset}
      >
        Scan next truck
      </Button>
    </div>
  )
}
