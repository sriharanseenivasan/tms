import { Megaphone, X } from 'lucide-react'
import { useMemo } from 'react'
import type { Bay, Truck } from '@/types'
import { BAY_STATUS_META } from '@/utils/constants'

interface DisplayBoardProps {
  bays: Bay[]
  trucks: Truck[]
  onClose: () => void
}

/** Full-screen TV view: "Now calling: TN-XX-1234 → Bay 5". */
export function DisplayBoard({ bays, trucks, onClose }: DisplayBoardProps) {
  const truckById = useMemo(() => new Map(trucks.map((t) => [t.id, t])), [trucks])
  const calling = useMemo(
    () =>
      [...bays]
        .filter((b) => b.status === 'RESERVED' && b.currentTruckId)
        .sort((a, b) => a.id - b.id),
    [bays],
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-brand-400" />
          <h1 className="text-2xl font-bold tracking-wide">Bay Calling Board</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
        >
          <X className="h-4 w-4" />
          Exit display
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-8 px-10 pb-10">
        <div className="flex-1">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-300">
            Now calling
          </p>
          {calling.length === 0 ? (
            <p className="text-3xl font-medium text-slate-500">No trucks being called right now</p>
          ) : (
            <div className="space-y-4">
              {calling.map((bay) => {
                const truck = bay.currentTruckId ? truckById.get(bay.currentTruckId) : undefined
                return (
                  <div
                    key={bay.id}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-8 py-6 ring-1 ring-white/10"
                  >
                    <span className="font-mono text-5xl font-bold tracking-wide text-white">
                      {truck?.regNo ?? '—'}
                    </span>
                    <div className="flex items-center gap-4 text-3xl font-semibold text-brand-300">
                      <span aria-hidden>→</span>
                      <span className="rounded-xl bg-brand-600 px-6 py-2 text-white">
                        Bay {bay.id}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Bay status
          </p>
          <div className="grid grid-cols-6 gap-3 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
            {[...bays]
              .sort((a, b) => a.id - b.id)
              .map((bay) => {
                const meta = BAY_STATUS_META[bay.status]
                return (
                  <div
                    key={bay.id}
                    className="flex flex-col items-center rounded-lg py-3 ring-1 ring-white/10"
                    style={{ backgroundColor: `${meta.hex}22` }}
                  >
                    <span className="text-lg font-bold">{bay.id}</span>
                    <span
                      className="mt-1 h-2 w-2 rounded-full"
                      style={{ backgroundColor: meta.hex }}
                    />
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
