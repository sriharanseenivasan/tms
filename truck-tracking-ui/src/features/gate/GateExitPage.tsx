import { CheckCircle2, LogOut, ScanLine } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ScanModal } from '@/components/ScanModal'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { DataTable, type Column } from '@/components/DataTable'
import { ExitChecklist } from '@/features/gate/components/ExitChecklist'
import { EXIT_CHECK_ITEMS } from '@/features/gate/components/exitChecks'
import { api } from '@/services'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/store/useToastStore'
import { TruckStatus, type Truck } from '@/types'
import { formatDuration, timeAgo } from '@/utils/formatters'
import { totalTatMin } from '@/utils/tat'

const EXIT_STATUSES: TruckStatus[] = [TruckStatus.COMPLETED, TruckStatus.EXIT_CLEARANCE]

interface ExitResult {
  truck: Truck
  tatMin: number
}

export function GateExitPage() {
  const trucks = useDataStore((s) => s.trucks)
  const events = useDataStore((s) => s.events)
  const loaded = useDataStore((s) => s.loaded)
  const refresh = useDataStore((s) => s.refresh)

  const [scanOpen, setScanOpen] = useState(false)
  const [active, setActive] = useState<Truck | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ExitResult | null>(null)

  const eligible = useMemo(
    () => trucks.filter((t) => EXIT_STATUSES.includes(t.status)),
    [trucks],
  )

  const recentlyOut = useMemo(
    () =>
      [...trucks]
        .filter((t) => t.status === TruckStatus.GATE_OUT)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 8),
    [trucks],
  )

  const allChecked = EXIT_CHECK_ITEMS.every((item) => checks[item.key])

  const startScan = (truck: Truck) => {
    setActive(truck)
    setChecks({})
    setResult(null)
    setScanOpen(false)
  }

  const handleGateOut = async () => {
    if (!active) return
    setSubmitting(true)
    try {
      const truck = await api.gateOut(active.id)
      await refresh()
      const truckEvents = useDataStore.getState().events.filter((e) => e.truckId === truck.id)
      setResult({ truck, tatMin: totalTatMin(truckEvents) ?? 0 })
      setActive(null)
      setChecks({})
      toast.success('Gate-out confirmed', `${truck.regNo} has left the plant`)
    } catch (err) {
      toast.error('Gate-out failed', (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo<Array<Column<Truck>>>(
    () => [
      {
        key: 'truck',
        header: 'Truck',
        render: (t) => (
          <div>
            <p className="font-mono font-semibold text-ink">{t.regNo}</p>
            <p className="text-xs text-muted">{t.transporter}</p>
          </div>
        ),
      },
      {
        key: 'tat',
        header: 'Total TAT',
        render: (t) => {
          const tat = totalTatMin(events.filter((e) => e.truckId === t.id))
          return <span className="text-slate-600">{tat != null ? formatDuration(tat) : '—'}</span>
        },
      },
      {
        key: 'out',
        header: 'Gated out',
        render: (t) => <span className="text-xs text-muted">{timeAgo(t.updatedAt)}</span>,
      },
    ],
    [events],
  )

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
        <h1 className="text-xl font-semibold text-ink">Gate Exit</h1>
        <p className="text-sm text-muted">
          Scan a completed truck, run the exit-clearance checklist and confirm gate-out.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<LogOut className="h-5 w-5" />}
            title="Exit processing"
            description="One truck at a time."
          />
          <CardBody>
            {result ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <p className="text-sm text-muted">Gate-out confirmed</p>
                <p className="font-mono text-2xl font-bold text-ink">{result.truck.regNo}</p>
                <div className="rounded-xl border border-line px-6 py-4">
                  <p className="text-3xl font-bold text-ink">{formatDuration(result.tatMin)}</p>
                  <p className="mt-1 text-xs text-muted">Total turnaround time</p>
                </div>
                <Button variant="secondary" onClick={() => setResult(null)}>
                  Process next truck
                </Button>
              </div>
            ) : active ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-line p-4">
                  <div>
                    <p className="font-mono text-lg font-semibold text-ink">{active.regNo}</p>
                    <p className="text-sm text-muted">{active.transporter}</p>
                  </div>
                  <StatusBadge status={active.status} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-600">Exit clearance</p>
                  <ExitChecklist
                    values={checks}
                    onToggle={(key) => setChecks((c) => ({ ...c, [key]: !c[key] }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    leftIcon={<LogOut className="h-4 w-4" />}
                    disabled={!allChecked || submitting}
                    onClick={handleGateOut}
                  >
                    Confirm gate-out
                  </Button>
                  <Button variant="secondary" onClick={() => setActive(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <EmptyState
                  icon={ScanLine}
                  title="Scan a truck to begin"
                  description={`${eligible.length} truck${eligible.length === 1 ? '' : 's'} ready for exit clearance.`}
                />
                <Button
                  leftIcon={<ScanLine className="h-4 w-4" />}
                  onClick={() => setScanOpen(true)}
                  disabled={eligible.length === 0}
                >
                  Scan QR
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recently gated out" description="Latest departures with total TAT." />
          <CardBody className="p-0">
            <DataTable
              columns={columns}
              rows={recentlyOut}
              rowKey={(t) => t.id}
              emptyTitle="No departures yet"
              emptyDescription="Confirmed gate-outs will appear here."
            />
          </CardBody>
        </Card>
      </div>

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        trucks={eligible}
        onScan={startScan}
        title="Scan for exit"
        description="Pick the completed truck leaving the plant."
      />
    </div>
  )
}
