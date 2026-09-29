import { ArrowRight, ListChecks, MapPin } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { YardLegend } from '@/features/yard/components/YardLegend'
import { YardMap } from '@/features/yard/components/YardMap'
import type { Truck, YardSlot } from '@/types'

interface KioskSlotChoiceProps {
  truck: Truck
  slots: YardSlot[]
  trucks: Truck[]
  submitting: boolean
  onConfirm: (slotId?: string) => void
}

/** Step 2 — pick a parking slot from the map, or just confirm queue entry. */
export function KioskSlotChoice({
  truck,
  slots,
  trucks,
  submitting,
  onConfirm,
}: KioskSlotChoiceProps) {
  const [selected, setSelected] = useState<YardSlot | undefined>()

  return (
    <div className="w-full max-w-3xl rounded-3xl bg-panel p-8 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Scanned truck</p>
          <p className="font-mono text-2xl font-bold text-ink">{truck.regNo}</p>
          <p className="text-sm text-muted">{truck.transporter}</p>
        </div>
        <StatusBadge status={truck.status} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <MapPin className="h-5 w-5 text-brand-600" />
          Choose a parking slot
        </h2>
        <YardLegend />
      </div>

      <div className="mt-3 max-h-[42vh] overflow-y-auto rounded-xl border border-line p-4">
        <YardMap
          slots={slots}
          trucks={trucks}
          selectable
          selectedSlotId={selected?.id}
          onSelectSlot={setSelected}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          disabled={!selected || submitting}
          rightIcon={<ArrowRight className="h-5 w-5" />}
          onClick={() => onConfirm(selected?.id)}
        >
          {selected ? `Confirm slot ${selected.label}` : 'Select a slot'}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="flex-1"
          disabled={submitting}
          leftIcon={<ListChecks className="h-5 w-5" />}
          onClick={() => onConfirm(undefined)}
        >
          I&apos;m in the queue
        </Button>
      </div>
    </div>
  )
}
