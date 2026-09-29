import { YARD_SLOT_META } from '@/utils/constants'
import type { YardSlotStatus } from '@/types'

const ORDER: YardSlotStatus[] = ['FREE', 'OCCUPIED', 'RESERVED']

/** Colour legend for the yard map. */
export function YardLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {ORDER.map((status) => {
        const meta = YARD_SLOT_META[status]
        return (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: meta.hex }}
              aria-hidden
            />
            <span className="text-xs text-muted">{meta.label}</span>
          </div>
        )
      })}
    </div>
  )
}
