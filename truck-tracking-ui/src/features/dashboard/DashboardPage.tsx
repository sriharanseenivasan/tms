import {
  Building2,
  CheckCircle2,
  Clock,
  Gauge,
  PauseCircle,
  ParkingSquare,
  Timer,
  Warehouse,
} from 'lucide-react'
import { useMemo } from 'react'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  BayUtilizationChart,
  InflowChart,
  InOutSplitChart,
  TatByStageChart,
  TatTrendChart,
} from '@/features/dashboard/components/DashboardCharts'
import {
  bayUtilization,
  computeKpis,
  hourlyInflow,
  inOutSplit,
  tatByStage,
  tatTrend,
} from '@/features/dashboard/metrics'
import { TruckTable } from '@/features/trucks/components/TruckTable'
import { useDataStore } from '@/store/useDataStore'
import { INSIDE_PLANT_STATUSES } from '@/utils/constants'
import { formatDuration } from '@/utils/formatters'

export function DashboardPage() {
  const trucks = useDataStore((s) => s.trucks)
  const bays = useDataStore((s) => s.bays)
  const tokens = useDataStore((s) => s.tokens)
  const events = useDataStore((s) => s.events)
  const trips = useDataStore((s) => s.trips)
  const loaded = useDataStore((s) => s.loaded)

  const kpis = useMemo(
    () => computeKpis({ trucks, bays, tokens, events, trips }),
    [trucks, bays, tokens, events, trips],
  )
  const inflow = useMemo(() => hourlyInflow(events), [events])
  const stageData = useMemo(() => tatByStage(events), [events])
  const bayUtil = useMemo(() => bayUtilization(trips), [trips])
  const trend = useMemo(() => tatTrend(trips), [trips])
  const split = useMemo(() => inOutSplit(trucks), [trucks])

  const insidePlant = useMemo(
    () => trucks.filter((t) => INSIDE_PLANT_STATUSES.includes(t.status)),
    [trucks],
  )

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Control Tower</h1>
        <p className="text-sm text-muted">Live plant overview, KPIs and trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Trucks inside plant" value={kpis.insidePlant} icon={Building2} />
        <KpiCard
          label="In yard"
          value={kpis.inYard}
          icon={ParkingSquare}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="At bays"
          value={kpis.atBays}
          icon={Warehouse}
          accent="bg-cyan-50 text-cyan-600"
        />
        <KpiCard
          label="Completed today"
          value={kpis.completedToday}
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Avg TAT"
          value={formatDuration(kpis.avgTatMin)}
          icon={Timer}
          accent="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          label="Avg yard wait"
          value={formatDuration(kpis.avgYardWaitMin)}
          icon={Clock}
          accent="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Bay utilization"
          value={`${kpis.bayUtilization}%`}
          icon={Gauge}
          accent="bg-teal-50 text-teal-600"
        />
        <KpiCard
          label="On hold"
          value={kpis.onHold}
          icon={PauseCircle}
          accent="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Hourly truck inflow" description="Gate-ins by hour today." />
          <CardBody>
            <InflowChart data={inflow} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Avg TAT by stage" description="Where time is spent per truck." />
          <CardBody>
            <TatByStageChart data={stageData} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Bay utilization" description="Per-bay load over 7 days." />
          <CardBody>
            <BayUtilizationChart data={bayUtil} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="TAT trend" description="Average turnaround, last 7 days." />
          <CardBody>
            <TatTrendChart data={trend} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Inbound vs outbound" description="Today's movement split." />
          <CardBody>
            <div className="mx-auto max-w-md">
              <InOutSplitChart data={split} />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Trucks in plant"
          description={`${insidePlant.length} trucks currently inside the plant.`}
        />
        <CardBody className="p-0">
          <TruckTable trucks={insidePlant} />
        </CardBody>
      </Card>
    </div>
  )
}
