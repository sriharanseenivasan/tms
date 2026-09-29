import { ChevronUp } from 'lucide-react'
import { useMemo } from 'react'
import { DataTable, type Column } from '@/components/DataTable'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Button } from '@/components/ui/Button'
import type { Token, Truck } from '@/types'
import { formatDuration, minutesBetween } from '@/utils/formatters'

interface QueueRow {
  truck: Truck
  token?: Token
  position: number
  waitingMin: number
}

interface YardQueueTableProps {
  trucks: Truck[]
  tokens: Token[]
  canManage: boolean
  onBump: (truck: Truck) => void
}

/** FIFO queue: HIGH-priority trucks jump ahead, then by token order. */
export function YardQueueTable({ trucks, tokens, canManage, onBump }: YardQueueTableProps) {
  const rows = useMemo<QueueRow[]>(() => {
    const tokenByTruck = new Map(tokens.map((t) => [t.truckId, t]))
    return [...trucks]
      .map((truck) => ({ truck, token: tokenByTruck.get(truck.id) }))
      .sort((a, b) => {
        if (a.truck.priority !== b.truck.priority) {
          return a.truck.priority === 'HIGH' ? -1 : 1
        }
        return (a.token?.fifoPosition ?? 0) - (b.token?.fifoPosition ?? 0)
      })
      .map(({ truck, token }, i) => ({
        truck,
        token,
        position: i + 1,
        waitingMin: minutesBetween(token?.issuedAt ?? truck.updatedAt),
      }))
  }, [trucks, tokens])

  const columns = useMemo<Array<Column<QueueRow>>>(
    () => [
      {
        key: 'position',
        header: '#',
        className: 'w-10',
        render: (r) => <span className="font-semibold text-ink">{r.position}</span>,
      },
      {
        key: 'token',
        header: 'Token',
        render: (r) => (
          <span className="font-mono text-sm text-brand-700">{r.token?.number ?? '—'}</span>
        ),
      },
      {
        key: 'truck',
        header: 'Truck',
        render: (r) => (
          <div>
            <p className="font-mono font-semibold text-ink">{r.truck.regNo}</p>
            <p className="text-xs text-muted">{r.truck.transporter}</p>
          </div>
        ),
      },
      {
        key: 'waiting',
        header: 'Waiting',
        render: (r) => <span className="text-slate-600">{formatDuration(r.waitingMin)}</span>,
      },
      {
        key: 'priority',
        header: 'Priority',
        render: (r) => <PriorityBadge priority={r.truck.priority} />,
      },
      {
        key: 'action',
        header: '',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (r) =>
          canManage && r.truck.priority === 'NORMAL' ? (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<ChevronUp className="h-3.5 w-3.5" />}
              onClick={() => onBump(r.truck)}
            >
              Bump
            </Button>
          ) : null,
      },
    ],
    [canManage, onBump],
  )

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.truck.id}
      emptyTitle="Queue is empty"
      emptyDescription="Trucks checking in at the kiosk will appear here."
    />
  )
}
