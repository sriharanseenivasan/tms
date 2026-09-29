import { Badge } from '@/components/Badge'
import type { TruckStatus } from '@/types'
import { STATUS_META } from '@/utils/constants'

interface StatusBadgeProps {
  status: TruckStatus
  withDot?: boolean
}

/** Consistent status pill used everywhere a truck status is shown. */
export function StatusBadge({ status, withDot = true }: StatusBadgeProps) {
  const meta = STATUS_META[status]
  return (
    <Badge className={meta.badge} dot={withDot} dotColor={meta.hex}>
      {meta.label}
    </Badge>
  )
}
