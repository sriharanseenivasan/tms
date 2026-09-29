import { useMemo } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { TruckTable } from '@/features/trucks/components/TruckTable'
import { useDataStore } from '@/store/useDataStore'
import { TruckStatus } from '@/types'

export function TruckListPage() {
  const trucks = useDataStore((s) => s.trucks)
  const loaded = useDataStore((s) => s.loaded)

  // Show every truck except pre-registered (not yet arrived).
  const visible = useMemo(
    () => trucks.filter((t) => t.status !== TruckStatus.EXPECTED),
    [trucks],
  )

  if (!loaded) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Trucks</h1>
        <p className="text-sm text-muted">Every truck in the plant today. Click a row for its journey.</p>
      </div>
      <Card>
        <CardHeader title="All trucks" description={`${visible.length} trucks tracked today.`} />
        <CardBody className="p-0">
          <TruckTable trucks={visible} />
        </CardBody>
      </Card>
    </div>
  )
}
