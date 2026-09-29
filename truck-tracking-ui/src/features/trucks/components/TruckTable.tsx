import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/DataTable'
import { PriorityBadge } from '@/components/PriorityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { Input, Select } from '@/components/ui/Field'
import { ROUTES } from '@/app/routes'
import { TruckStatus, type Truck, type TruckType } from '@/types'
import { STATUS_META } from '@/utils/constants'
import { timeAgo } from '@/utils/formatters'
import { truckLocation } from '@/utils/truck'

interface TruckTableProps {
  trucks: Truck[]
  /** Statuses offered in the status filter (defaults to all present). */
  statusOptions?: TruckStatus[]
}

type StatusFilter = TruckStatus | 'ALL'
type TypeFilter = TruckType | 'ALL'

/** Filterable, clickable truck table shared by the dashboard and trucks list. */
export function TruckTable({ trucks, statusOptions }: TruckTableProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [type, setType] = useState<TypeFilter>('ALL')

  const statuses = useMemo(
    () => statusOptions ?? [...new Set(trucks.map((t) => t.status))],
    [statusOptions, trucks],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return trucks.filter((t) => {
      if (status !== 'ALL' && t.status !== status) return false
      if (type !== 'ALL' && t.type !== type) return false
      if (!q) return true
      return (
        t.regNo.toLowerCase().includes(q) ||
        t.transporter.toLowerCase().includes(q) ||
        t.material.toLowerCase().includes(q)
      )
    })
  }, [trucks, query, status, type])

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
        key: 'type',
        header: 'Type',
        render: (t) => <span className="text-xs text-slate-600">{t.type}</span>,
      },
      {
        key: 'material',
        header: 'Material',
        render: (t) => <span className="text-slate-600">{t.material}</span>,
      },
      {
        key: 'location',
        header: 'Location',
        render: (t) => <span className="text-slate-600">{truckLocation(t)}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (t) => <StatusBadge status={t.status} />,
      },
      {
        key: 'priority',
        header: 'Priority',
        render: (t) => <PriorityBadge priority={t.priority} />,
      },
      {
        key: 'updated',
        header: 'Updated',
        render: (t) => <span className="text-xs text-muted">{timeAgo(t.updatedAt)}</span>,
      },
    ],
    [],
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reg, transporter or material"
            className="pl-9"
          />
        </div>
        <Select
          className="w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          options={[
            { value: 'ALL', label: 'All statuses' },
            ...statuses.map((s) => ({ value: s, label: STATUS_META[s].label })),
          ]}
        />
        <Select
          className="w-36"
          value={type}
          onChange={(e) => setType(e.target.value as TypeFilter)}
          options={[
            { value: 'ALL', label: 'All types' },
            { value: 'INBOUND', label: 'Inbound' },
            { value: 'OUTBOUND', label: 'Outbound' },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(t) => t.id}
        onRowClick={(t) => navigate(ROUTES.truckDetail(t.id))}
        emptyTitle="No trucks match"
        emptyDescription="Adjust the filters to see more."
      />
    </div>
  )
}
