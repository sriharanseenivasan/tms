import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable, type Column } from '@/components/DataTable'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { TatTrendChart } from '@/features/dashboard/components/DashboardCharts'
import { tatTrend } from '@/features/dashboard/metrics'
import {
  TransporterTatChart,
  type TransporterTatPoint,
} from '@/features/reports/components/ReportCharts'
import { useDataStore } from '@/store/useDataStore'
import type { TripRecord } from '@/types'
import { BAY_COUNT, MATERIALS, TRANSPORTERS } from '@/utils/constants'
import { formatDate, formatDuration } from '@/utils/formatters'
import { average } from '@/utils/tat'
import { exportToCsv } from '@/utils/csv'

interface Filters {
  days: string
  bay: string
  transporter: string
  material: string
  type: string
}

const INITIAL_FILTERS: Filters = {
  days: '7',
  bay: 'ALL',
  transporter: 'ALL',
  material: 'ALL',
  type: 'ALL',
}

export function ReportsPage() {
  const trips = useDataStore((s) => s.trips)
  const loaded = useDataStore((s) => s.loaded)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }))

  // Reference "now" derived from the data (pure) — trips are the newest events.
  const refNow = useMemo(
    () => trips.reduce((max, t) => Math.max(max, Date.parse(t.date)), 0),
    [trips],
  )

  const filtered = useMemo(() => {
    const cutoff = refNow - Number(filters.days) * 24 * 60 * 60 * 1000
    return trips
      .filter((t) => Date.parse(t.date) >= cutoff)
      .filter((t) => filters.bay === 'ALL' || t.bayId === Number(filters.bay))
      .filter((t) => filters.transporter === 'ALL' || t.transporter === filters.transporter)
      .filter((t) => filters.material === 'ALL' || t.material === filters.material)
      .filter((t) => filters.type === 'ALL' || t.type === filters.type)
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  }, [trips, filters, refNow])

  const trend = useMemo(() => tatTrend(filtered), [filtered])

  const byTransporter = useMemo<TransporterTatPoint[]>(() => {
    const groups = new Map<string, number[]>()
    for (const t of filtered) {
      const list = groups.get(t.transporter) ?? []
      list.push(t.totalTatMin)
      groups.set(t.transporter, list)
    }
    return [...groups.entries()]
      .map(([name, values]) => ({ name, tat: Math.round(average(values)) }))
      .sort((a, b) => b.tat - a.tat)
      .slice(0, 8)
  }, [filtered])

  const summary = useMemo(
    () => ({
      count: filtered.length,
      avgTat: Math.round(average(filtered.map((t) => t.totalTatMin))),
      avgYard: Math.round(average(filtered.map((t) => t.yardWaitMin))),
    }),
    [filtered],
  )

  const columns = useMemo<Array<Column<TripRecord>>>(
    () => [
      { key: 'date', header: 'Date', render: (t) => formatDate(t.date) },
      {
        key: 'reg',
        header: 'Truck',
        render: (t) => <span className="font-mono font-semibold text-ink">{t.regNo}</span>,
      },
      { key: 'transporter', header: 'Transporter', render: (t) => t.transporter },
      { key: 'material', header: 'Material', render: (t) => t.material },
      { key: 'type', header: 'Type', render: (t) => t.type },
      { key: 'bay', header: 'Bay', render: (t) => t.bayId },
      { key: 'yard', header: 'Yard wait', render: (t) => formatDuration(t.yardWaitMin) },
      { key: 'baytime', header: 'Bay time', render: (t) => formatDuration(t.bayTimeMin) },
      {
        key: 'tat',
        header: 'Total TAT',
        render: (t) => <span className="font-medium">{formatDuration(t.totalTatMin)}</span>,
      },
    ],
    [],
  )

  const handleExport = () => {
    exportToCsv<TripRecord>(
      `tat-report-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'Date', value: (t) => formatDate(t.date) },
        { header: 'Truck', value: (t) => t.regNo },
        { header: 'Transporter', value: (t) => t.transporter },
        { header: 'Material', value: (t) => t.material },
        { header: 'Type', value: (t) => t.type },
        { header: 'Bay', value: (t) => t.bayId },
        { header: 'Yard wait (min)', value: (t) => t.yardWaitMin },
        { header: 'Bay time (min)', value: (t) => t.bayTimeMin },
        { header: 'Total TAT (min)', value: (t) => t.totalTatMin },
      ],
      filtered,
    )
  }

  if (!loaded) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Reports</h1>
          <p className="text-sm text-muted">Turnaround-time report over historical trips.</p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Field label="Date range">
              <Select
                value={filters.days}
                onChange={(e) => set('days', e.target.value)}
                options={[
                  { value: '1', label: 'Last 24 hours' },
                  { value: '3', label: 'Last 3 days' },
                  { value: '7', label: 'Last 7 days' },
                ]}
              />
            </Field>
            <Field label="Bay">
              <Select
                value={filters.bay}
                onChange={(e) => set('bay', e.target.value)}
                options={[
                  { value: 'ALL', label: 'All bays' },
                  ...Array.from({ length: BAY_COUNT }, (_, i) => ({
                    value: String(i + 1),
                    label: `Bay ${i + 1}`,
                  })),
                ]}
              />
            </Field>
            <Field label="Transporter">
              <Select
                value={filters.transporter}
                onChange={(e) => set('transporter', e.target.value)}
                options={[
                  { value: 'ALL', label: 'All transporters' },
                  ...TRANSPORTERS.map((t) => ({ value: t, label: t })),
                ]}
              />
            </Field>
            <Field label="Material">
              <Select
                value={filters.material}
                onChange={(e) => set('material', e.target.value)}
                options={[
                  { value: 'ALL', label: 'All materials' },
                  ...MATERIALS.map((m) => ({ value: m, label: m })),
                ]}
              />
            </Field>
            <Field label="Type">
              <Select
                value={filters.type}
                onChange={(e) => set('type', e.target.value)}
                options={[
                  { value: 'ALL', label: 'All types' },
                  { value: 'INBOUND', label: 'Inbound' },
                  { value: 'OUTBOUND', label: 'Outbound' },
                ]}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Trips</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{summary.count}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Avg total TAT</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatDuration(summary.avgTat)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Avg yard wait</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatDuration(summary.avgYard)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="TAT trend" description="Average turnaround per day." />
          <CardBody>
            <TatTrendChart data={trend} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Avg TAT by transporter" description="Top transporters by TAT." />
          <CardBody>
            <TransporterTatChart data={byTransporter} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="TAT report" description={`${filtered.length} trips.`} />
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(t) => t.id}
            emptyTitle="No trips match"
            emptyDescription="Adjust the filters above."
          />
        </CardBody>
      </Card>
    </div>
  )
}
