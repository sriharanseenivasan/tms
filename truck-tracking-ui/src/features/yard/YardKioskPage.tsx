import { useMemo, useState } from 'react'
import { ScanModal } from '@/components/ScanModal'
import { KioskScan } from '@/features/yard/components/KioskScan'
import { KioskSlotChoice } from '@/features/yard/components/KioskSlotChoice'
import { KioskToken } from '@/features/yard/components/KioskToken'
import { api } from '@/services'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/store/useToastStore'
import { TruckStatus, type Token, type Truck } from '@/types'
import { estimateYardWaitMin } from '@/utils/tat'

type Step = 'SCAN' | 'CHOOSE' | 'DONE'

interface CheckInResult {
  truck: Truck
  token: Token
  position: number
  estimatedWaitMin: number
  slotLabel?: string
}

export function YardKioskPage() {
  const trucks = useDataStore((s) => s.trucks)
  const yardSlots = useDataStore((s) => s.yardSlots)
  const refresh = useDataStore((s) => s.refresh)

  const [step, setStep] = useState<Step>('SCAN')
  const [scanOpen, setScanOpen] = useState(false)
  const [scanned, setScanned] = useState<Truck | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)

  // Trucks cleared at the gate and awaiting yard check-in.
  const eligible = useMemo(
    () => trucks.filter((t) => t.status === TruckStatus.DOC_CLEARED),
    [trucks],
  )

  const handleScan = (truck: Truck) => {
    setScanned(truck)
    setScanOpen(false)
    setStep('CHOOSE')
  }

  const handleConfirm = async (slotId?: string) => {
    if (!scanned) return
    setSubmitting(true)
    try {
      const { truck, token } = await api.checkInToYard(scanned.id, slotId)
      await refresh()

      // Compute effective queue position from the fresh snapshot.
      const state = useDataStore.getState()
      const tokenByTruck = new Map(state.tokens.map((t) => [t.truckId, t]))
      const ordered = state.trucks
        .filter((t) => t.status === TruckStatus.IN_YARD_QUEUE)
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority === 'HIGH' ? -1 : 1
          return (
            (tokenByTruck.get(a.id)?.fifoPosition ?? 0) -
            (tokenByTruck.get(b.id)?.fifoPosition ?? 0)
          )
        })
      const index = ordered.findIndex((t) => t.id === truck.id)
      const position = index === -1 ? ordered.length : index + 1
      const slotLabel = state.yardSlots.find((s) => s.id === truck.yardSlotId)?.label

      setResult({
        truck,
        token,
        position,
        estimatedWaitMin: estimateYardWaitMin(Math.max(0, position - 1)),
        slotLabel,
      })
      setStep('DONE')
      toast.success('Token issued', `${truck.regNo} — token ${token.number}`)
    } catch (err) {
      toast.error('Check-in failed', (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setScanned(null)
    setResult(null)
    setStep('SCAN')
  }

  return (
    <>
      {step === 'SCAN' && (
        <KioskScan onScan={() => setScanOpen(true)} eligibleCount={eligible.length} />
      )}

      {step === 'CHOOSE' && scanned && (
        <KioskSlotChoice
          truck={scanned}
          slots={yardSlots}
          trucks={trucks}
          submitting={submitting}
          onConfirm={handleConfirm}
        />
      )}

      {step === 'DONE' && result && (
        <KioskToken
          truck={result.truck}
          token={result.token}
          position={result.position}
          estimatedWaitMin={result.estimatedWaitMin}
          slotLabel={result.slotLabel}
          onReset={reset}
        />
      )}

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        trucks={eligible}
        onScan={handleScan}
        title="Scan gate-pass QR"
        description="Pick the cleared truck arriving at the yard."
      />
    </>
  )
}
