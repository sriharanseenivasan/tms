import { Badge } from '@/components/Badge'
import type { Priority } from '@/types'
import { PRIORITY_META } from '@/utils/constants'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}
