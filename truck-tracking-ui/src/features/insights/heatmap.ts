import { getHours, parseISO } from 'date-fns'
import { TruckStatus, type TruckEvent } from '@/types'
import { minutesBetween } from '@/utils/formatters'

/** Stage → heatmap row grouping. */
const STAGE_GROUP: Partial<Record<TruckStatus, string>> = {
  [TruckStatus.SECURITY_CHECK]: 'Security',
  [TruckStatus.DOC_CLEARED]: 'Docs',
  [TruckStatus.IN_YARD_QUEUE]: 'Yard',
  [TruckStatus.LOADING]: 'Bay',
  [TruckStatus.UNLOADING]: 'Bay',
  [TruckStatus.EXIT_CLEARANCE]: 'Exit',
}

export const HEATMAP_STAGES = ['Security', 'Docs', 'Yard', 'Bay', 'Exit']

export interface HeatmapData {
  hours: number[]
  /** cells[stageIndex][hourIndex] = average stage duration in minutes. */
  cells: number[][]
  max: number
}

/** Average completed-stage durations bucketed by stage group × hour of day. */
export function bottleneckHeatmap(events: TruckEvent[]): HeatmapData {
  const byTruck = new Map<string, TruckEvent[]>()
  for (const e of events) {
    const list = byTruck.get(e.truckId) ?? []
    list.push(e)
    byTruck.set(e.truckId, list)
  }

  const sums = new Map<string, { total: number; count: number }>()
  const hoursSeen = new Set<number>()
  const key = (stage: string, hour: number) => `${stage}@${hour}`

  for (const list of byTruck.values()) {
    const sorted = [...list].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const group = STAGE_GROUP[sorted[i].stage]
      if (!group) continue
      const hour = getHours(parseISO(sorted[i].timestamp))
      const duration = minutesBetween(sorted[i].timestamp, sorted[i + 1].timestamp)
      hoursSeen.add(hour)
      const bucket = sums.get(key(group, hour)) ?? { total: 0, count: 0 }
      bucket.total += duration
      bucket.count += 1
      sums.set(key(group, hour), bucket)
    }
  }

  const hours =
    hoursSeen.size > 0
      ? Array.from(
          { length: Math.max(...hoursSeen) - Math.min(...hoursSeen) + 1 },
          (_, i) => Math.min(...hoursSeen) + i,
        )
      : []

  let max = 0
  const cells = HEATMAP_STAGES.map((stage) =>
    hours.map((hour) => {
      const bucket = sums.get(key(stage, hour))
      const value = bucket && bucket.count > 0 ? Math.round(bucket.total / bucket.count) : 0
      if (value > max) max = value
      return value
    }),
  )

  return { hours, cells, max }
}
