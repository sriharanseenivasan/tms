import { Clock, ParkingSquare, Users } from 'lucide-react'
import { useMemo } from 'react'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { YardLegend } from '@/features/yard/components/YardLegend'
import { YardMap } from '@/features/yard/components/YardMap'
import { YardQueueTable } from '@/features/yard/components/YardQueueTable'
import { api } from '@/services'
import { useAuthStore } from '@/store/useAuthStore'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/store/useToastStore'
import { Role, TruckStatus, type Truck } from '@/types'
import { formatDuration, minutesBetween } from '@/utils/formatters'
import { average } from '@/utils/tat'

export function YardBoardPage() {
  const trucks = useDataStore((s) => s.trucks)
  const tokens = useDataStore((s) => s.tokens)
  const yardSlots = useDataStore((s) => s.yardSlots)
  const loaded = useDataStore((s) => s.loaded)
  const refresh = useDataStore((s) => s.refresh)
  const role = useAuthStore((s) => s.role)
  const canManage = role === Role.MANAGER

  const queue = useMemo(
    () => trucks.filter((t) => t.status === TruckStatus.IN_YARD_QUEUE),
    [trucks],
  )

  const stats = useMemo(() => {
    const tokenByTruck = new Map(tokens.map((t) => [t.truckId, t]))
    const waits = queue.map((t) =>
      minutesBetween(tokenByTruck.get(t.id)?.issuedAt ?? t.updatedAt),
    )
    const occupied = yardSlots.filter((s) => s.status === 'OCCUPIED').length
    return {
      queued: queue.length,
      avgWait: average(waits),
      occupancy: yardSlots.length ? Math.round((occupied / yardSlots.length) * 100) : 0,
    }
  }, [queue, tokens, yardSlots])

  const handleBump = async (truck: Truck) => {
    try {
      await api.setTruckPriority(truck.id, 'HIGH')
      await refresh()
      toast.success('Priority bumped', `${truck.regNo} moved to high priority`)
    } catch (err) {
      toast.error('Could not bump priority', (err as Error).message)
    }
  }

  if (!loaded) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Yard Board</h1>
        <p className="text-sm text-muted">
          Live parking map and the FIFO token queue with waiting times.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Trucks in queue" value={stats.queued} icon={Users} />
        <KpiCard
          label="Avg yard wait"
          value={formatDuration(stats.avgWait)}
          icon={Clock}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Yard occupancy"
          value={`${stats.occupancy}%`}
          icon={ParkingSquare}
          accent="bg-cyan-50 text-cyan-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            icon={<ParkingSquare className="h-5 w-5" />}
            title="Yard map"
            description="Parking slots across zones A, B and C."
            action={<YardLegend />}
          />
          <CardBody>
            <YardMap slots={yardSlots} trucks={trucks} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            icon={<Users className="h-5 w-5" />}
            title="FIFO queue"
            description={
              canManage ? 'Bump a truck to high priority.' : 'Switch to Manager to bump priority.'
            }
          />
          <CardBody className="p-0">
            <YardQueueTable
              trucks={queue}
              tokens={tokens}
              canManage={canManage}
              onBump={handleBump}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
