import type { Bay } from '@/types'
import { BAY_STATUS_META } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface BayPickerProps {
  bays: Bay[]
  selectedId?: number
  onSelect: (bayId: number) => void
}

/** Horizontal chip selector for choosing a bay on the operator phone. */
export function BayPicker({ bays, selectedId, onSelect }: BayPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[...bays]
        .sort((a, b) => a.id - b.id)
        .map((bay) => {
          const meta = BAY_STATUS_META[bay.status]
          const selected = bay.id === selectedId
          return (
            <button
              key={bay.id}
              type="button"
              onClick={() => onSelect(bay.id)}
              className={cn(
                'flex flex-col items-center rounded-lg border py-2 text-sm font-semibold transition-colors',
                selected
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                  : 'border-line bg-panel text-ink hover:border-brand-300',
              )}
            >
              {bay.id}
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: meta.hex }}
                aria-hidden
              />
            </button>
          )
        })}
    </div>
  )
}
