import { ClipboardCheck, ScrollText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { GateClearanceList } from '@/features/gate/components/GateClearanceList'
import { GateEntryForm } from '@/features/gate/components/GateEntryForm'
import { QrSlip } from '@/features/gate/components/QrSlip'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/services'
import type { GateEntryInput } from '@/services/api'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/store/useToastStore'
import { TruckStatus, type Truck } from '@/types'

const GATE_STATUSES: TruckStatus[] = [
  TruckStatus.GATE_IN,
  TruckStatus.SECURITY_CHECK,
  TruckStatus.DOC_CLEARED,
  TruckStatus.ON_HOLD,
]

export function GateEntryPage() {
  const trucks = useDataStore((s) => s.trucks)
  const loaded = useDataStore((s) => s.loaded)
  const refresh = useDataStore((s) => s.refresh)

  const [submitting, setSubmitting] = useState(false)
  const [slipTruck, setSlipTruck] = useState<Truck | null>(null)

  const expectedTrucks = useMemo(
    () => trucks.filter((t) => t.status === TruckStatus.EXPECTED),
    [trucks],
  )

  const gateList = useMemo(
    () =>
      [...trucks]
        .filter((t) => GATE_STATUSES.includes(t.status))
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 12),
    [trucks],
  )

  const handleSubmit = async (input: GateEntryInput) => {
    setSubmitting(true)
    try {
      const truck = await api.submitGateEntry(input)
      await refresh()
      setSlipTruck(truck)
      if (truck.status === TruckStatus.ON_HOLD) {
        toast.error('Truck placed on hold', `${truck.regNo} — document rejected`)
      } else {
        toast.success('Gate entry approved', `${truck.regNo} — QR slip generated`)
      }
    } catch (err) {
      toast.error('Gate entry failed', (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!loaded) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Gate Entry</h1>
        <p className="text-sm text-muted">
          Capture truck &amp; driver details, verify documents, and issue a QR gate pass.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<ClipboardCheck className="h-5 w-5" />}
            title="New gate entry"
            description="Look up a pre-registered truck or enter a walk-in."
          />
          <CardBody>
            <GateEntryForm
              expectedTrucks={expectedTrucks}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={<ScrollText className="h-5 w-5" />}
            title="Gate pass"
            description="Preview &amp; print after approval."
          />
          <CardBody>
            {slipTruck ? (
              <QrSlip truck={slipTruck} />
            ) : (
              <EmptyState
                icon={ScrollText}
                title="No slip yet"
                description="Approve a gate entry to generate a printable QR slip."
              />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Gate-in &amp; clearance status"
          description="Trucks currently at the gate, security or document stage."
        />
        <CardBody className="p-0">
          <GateClearanceList trucks={gateList} />
        </CardBody>
      </Card>
    </div>
  )
}
