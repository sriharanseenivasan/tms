import { useMemo } from 'react'
import { BayCard } from '@/features/bays/components/BayCard'
import type { Bay, Truck } from '@/types'

interface BayGridProps {
  bays: Bay[]
  trucks: Truck[]
}

/** Responsive grid of all bays. */
export function BayGrid({ bays, trucks }: BayGridProps) {
  const truckById = useMemo(() => new Map(trucks.map((t) => [t.id, t])), [trucks])
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {[...bays]
        .sort((a, b) => a.id - b.id)
        .map((bay) => (
          <BayCard
            key={bay.id}
            bay={bay}
            truck={bay.currentTruckId ? truckById.get(bay.currentTruckId) : undefined}
          />
        ))}
    </div>
  )
}
