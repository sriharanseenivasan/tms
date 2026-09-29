import { ArrowLeft, Check, Minus, X } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCard } from '@/components/QRCard'
import { PriorityBadge } from '@/components/PriorityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { Timeline } from '@/components/Timeline'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTES } from '@/app/routes'
import { useDataStore } from '@/store/useDataStore'
import { TruckStatus, type DocumentStatus, type TruckDocument } from '@/types'
import { DOCUMENT_LABELS } from '@/utils/constants'
import { formatDateTime, formatDuration } from '@/utils/formatters'
import { totalTatMin } from '@/utils/tat'
import { truckLocation } from '@/utils/truck'

const DOC_ICON: Record<DocumentStatus, { icon: typeof Check; className: string }> = {
  VERIFIED: { icon: Check, className: 'text-emerald-600' },
  REJECTED: { icon: X, className: 'text-rose-600' },
  PENDING: { icon: Minus, className: 'text-slate-400' },
}

function DocRow({ doc }: { doc: TruckDocument }) {
  const { icon: Icon, className } = DOC_ICON[doc.status]
  return (
    <li className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-600">{DOCUMENT_LABELS[doc.kind]}</span>
      <Icon className={`h-4 w-4 ${className}`} />
    </li>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}

export function TruckDetailPage() {
  const { id } = useParams()
  const trucks = useDataStore((s) => s.trucks)
  const allEvents = useDataStore((s) => s.events)
  const loaded = useDataStore((s) => s.loaded)

  const truck = useMemo(() => trucks.find((t) => t.id === id), [trucks, id])
  const events = useMemo(
    () => allEvents.filter((e) => e.truckId === id),
    [allEvents, id],
  )
  const gatedOut = truck?.status === TruckStatus.GATE_OUT
  const tat = useMemo(() => (gatedOut ? totalTatMin(events) : undefined), [gatedOut, events])

  if (!loaded) return <Skeleton className="h-96" />

  if (!truck) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            title="Truck not found"
            description="This truck may have been reset."
            action={
              <Link to={ROUTES.trucks} className="text-sm font-medium text-brand-600">
                Back to trucks
              </Link>
            }
          />
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.trucks}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          All trucks
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold text-ink">{truck.regNo}</h1>
          <StatusBadge status={truck.status} />
          <PriorityBadge priority={truck.priority} />
        </div>
        <p className="text-sm text-muted">
          {truck.transporter} · {truck.type} · {truck.material}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Journey timeline" description="Each stage with time and duration." />
          <CardBody>
            <Timeline events={events} />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="QR pass" />
            <CardBody className="flex justify-center">
              <QRCard value={truck.qrId} caption={truck.qrId} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Details" />
            <CardBody className="divide-y divide-line">
              <div className="pb-2">
                <DetailRow label="Driver" value={truck.driver.name} />
                <DetailRow label="Phone" value={truck.driver.phone} />
                <DetailRow label="License" value={truck.driver.license} />
              </div>
              <div className="py-2">
                <DetailRow label="Location" value={truckLocation(truck)} />
                <DetailRow label="Gate-in" value={formatDateTime(truck.createdAt)} />
                <DetailRow
                  label="Total TAT"
                  value={tat != null ? formatDuration(tat) : 'In progress'}
                />
              </div>
              <ul className="pt-2">
                {truck.documents.map((doc) => (
                  <DocRow key={doc.kind} doc={doc} />
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
