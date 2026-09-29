import { useMemo, useState } from 'react'
import { ScanModal } from '@/components/ScanModal'
import { BayPicker } from '@/features/operator/components/BayPicker'
import { OperatorBayPanel } from '@/features/operator/components/OperatorBayPanel'
import { api } from '@/services'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/store/useToastStore'
import { type Truck } from '@/types'

type ScanIntent = 'START' | 'COMPLETE' | null

export function OperatorPage() {
  const trucks = useDataStore((s) => s.trucks)
  const bays = useDataStore((s) => s.bays)
  const refresh = useDataStore((s) => s.refresh)

  const [pickedBayId, setPickedBayId] = useState<number | undefined>()
  const [scanIntent, setScanIntent] = useState<ScanIntent>(null)
  const [submitting, setSubmitting] = useState(false)

  const truckById = useMemo(() => new Map(trucks.map((t) => [t.id, t])), [trucks])

  // Default to the first bay with a truck to act on, until the user picks one.
  const defaultBayId = useMemo(() => {
    const active = [...bays]
      .filter((b) => b.status === 'RESERVED' || b.status === 'OCCUPIED')
      .sort((a, b) => a.id - b.id)[0]
    return active?.id ?? bays[0]?.id
  }, [bays])

  const selectedBayId = pickedBayId ?? defaultBayId
  const selectedBay = useMemo(
    () => bays.find((b) => b.id === selectedBayId),
    [bays, selectedBayId],
  )
  const selectedTruck = selectedBay?.currentTruckId
    ? truckById.get(selectedBay.currentTruckId)
    : undefined

  const runAction = async (fn: () => Promise<Truck>, message: string) => {
    setSubmitting(true)
    try {
      await fn()
      await refresh()
      toast.success(message)
    } catch (err) {
      toast.error('Action failed', (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleScan = async (truck: Truck) => {
    const intent = scanIntent
    setScanIntent(null)
    if (intent === 'START') {
      await runAction(() => api.startLoading(truck.id), `Started · ${truck.regNo}`)
    } else if (intent === 'COMPLETE') {
      await runAction(() => api.completeLoading(truck.id), `Completed · ${truck.regNo}`)
    }
  }

  const handleDispatch = () => {
    if (!selectedTruck) return
    void runAction(
      () => api.dispatchFromBay(selectedTruck.id),
      `${selectedTruck.regNo} sent to exit clearance`,
    )
  }

  const scanTrucks = selectedTruck ? [selectedTruck] : []

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Select a bay</p>
        <div className="mt-2">
          <BayPicker bays={bays} selectedId={selectedBayId} onSelect={setPickedBayId} />
        </div>
      </div>

      {selectedBay && (
        <OperatorBayPanel
          bay={selectedBay}
          truck={selectedTruck}
          submitting={submitting}
          onStart={() => setScanIntent('START')}
          onComplete={() => setScanIntent('COMPLETE')}
          onDispatch={handleDispatch}
        />
      )}

      <ScanModal
        open={scanIntent !== null}
        onClose={() => setScanIntent(null)}
        trucks={scanTrucks}
        onScan={handleScan}
        title={scanIntent === 'START' ? 'Scan to start' : 'Scan to complete'}
        description="Scan the truck's QR slip to confirm."
      />
    </div>
  )
}
