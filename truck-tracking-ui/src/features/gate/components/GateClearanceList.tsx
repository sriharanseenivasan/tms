import { DataTable, type Column } from '@/components/DataTable'
import { PriorityBadge } from '@/components/PriorityBadge'
import { StatusBadge } from '@/components/StatusBadge'
import type { Truck } from '@/types'
import { timeAgo } from '@/utils/formatters'

interface GateClearanceListProps {
  trucks: Truck[]
}

const columns: Array<Column<Truck>> = [
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
    key: 'priority',
    header: 'Priority',
    render: (t) => <PriorityBadge priority={t.priority} />,
  },
  {
    key: 'docs',
    header: 'Docs',
    render: (t) => {
      const verified = t.documents.filter((d) => d.status === 'VERIFIED').length
      return (
        <span className="text-xs text-slate-600">
          {verified}/{t.documents.length} verified
        </span>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (t) => <StatusBadge status={t.status} />,
  },
  {
    key: 'updated',
    header: 'Updated',
    render: (t) => <span className="text-xs text-muted">{timeAgo(t.updatedAt)}</span>,
  },
]

/** Live gate-in / clearance status list (Section 5A). */
export function GateClearanceList({ trucks }: GateClearanceListProps) {
  return (
    <DataTable
      columns={columns}
      rows={trucks}
      rowKey={(t) => t.id}
      emptyTitle="No trucks at the gate"
      emptyDescription="Approved and on-hold trucks from gate entry appear here."
    />
  )
}
