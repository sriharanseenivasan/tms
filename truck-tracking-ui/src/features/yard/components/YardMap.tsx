import { useMemo } from 'react'
import type { Truck, YardSlot } from '@/types'
import { YARD_SLOT_META } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface YardMapProps {
  slots: YardSlot[]
  trucks: Truck[]
  /** Kiosk mode: free slots become selectable buttons. */
  selectable?: boolean
  selectedSlotId?: string
  onSelectSlot?: (slot: YardSlot) => void
}

/** Visual yard map — slots grouped by zone and coloured by state. */
export function YardMap({
  slots,
  trucks,
  selectable = false,
  selectedSlotId,
  onSelectSlot,
}: YardMapProps) {
  const regBySlot = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of trucks) if (t.yardSlotId) map.set(t.yardSlotId, t.regNo)
    return map
  }, [trucks])

  const zones = useMemo(() => {
    const grouped = new Map<string, YardSlot[]>()
    for (const slot of slots) {
      const list = grouped.get(slot.zone) ?? []
      list.push(slot)
      grouped.set(slot.zone, list)
    }
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [slots])

  return (
    <div className="space-y-5">
      {zones.map(([zone, zoneSlots]) => {
        const free = zoneSlots.filter((s) => s.status === 'FREE').length
        return (
          <div key={zone}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Zone {zone}</p>
              <p className="text-xs text-muted">{free} free</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {zoneSlots.map((slot) => {
                const meta = YARD_SLOT_META[slot.status]
                const reg = slot.truckId ? regBySlot.get(slot.id) : undefined
                const isFree = slot.status === 'FREE'
                const selected = slot.id === selectedSlotId
                const clickable = selectable && isFree

                const content = (
                  <>
                    <span className="text-sm font-semibold">{slot.label}</span>
                    <span className="mt-0.5 block truncate text-[10px] font-normal opacity-80">
                      {reg ?? meta.label}
                    </span>
                  </>
                )

                const baseTile = cn(
                  'flex flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition-colors',
                  meta.tile,
                  selected && 'ring-2 ring-brand-500 ring-offset-1',
                )

                if (clickable) {
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSelectSlot?.(slot)}
                      aria-pressed={selected}
                      className={cn(baseTile, 'cursor-pointer hover:border-brand-400')}
                    >
                      {content}
                    </button>
                  )
                }

                return (
                  <div
                    key={slot.id}
                    className={cn(baseTile, selectable && 'opacity-60')}
                    aria-disabled={selectable}
                  >
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
