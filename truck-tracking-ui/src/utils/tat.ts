import { TruckStatus, type TruckEvent } from '@/types'
import { AVG_BAY_SERVICE_MIN, BAY_COUNT } from '@/utils/constants'
import { minutesBetween } from '@/utils/formatters'

/** Duration (minutes) a truck spent in a given stage, based on its event log. */
export function stageDurationMin(
  events: TruckEvent[],
  stage: TruckStatus,
): number | undefined {
  const sorted = [...events].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  )
  const index = sorted.findIndex((e) => e.stage === stage)
  if (index === -1) return undefined
  const start = sorted[index]
  const next = sorted[index + 1]
  return minutesBetween(start.timestamp, next?.timestamp)
}

/** Total turnaround time (minutes) from gate-in to gate-out (or now). */
export function totalTatMin(events: TruckEvent[]): number | undefined {
  const sorted = [...events].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  )
  const gateIn = sorted.find((e) => e.stage === TruckStatus.GATE_IN)
  if (!gateIn) return undefined
  const gateOut = sorted.find((e) => e.stage === TruckStatus.GATE_OUT)
  return minutesBetween(gateIn.timestamp, gateOut?.timestamp)
}

/** Yard waiting time (minutes) — time spent in the FIFO queue. */
export function yardWaitMin(events: TruckEvent[]): number | undefined {
  return stageDurationMin(events, TruckStatus.IN_YARD_QUEUE)
}

/** Average of a numeric list, ignoring undefined/NaN. */
export function average(values: Array<number | undefined>): number {
  const nums = values.filter(
    (v): v is number => typeof v === 'number' && !Number.isNaN(v),
  )
  if (nums.length === 0) return 0
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

/** Estimated yard wait (minutes) given how many trucks are queued ahead. */
export function estimateYardWaitMin(
  aheadCount: number,
  bays = BAY_COUNT,
  avgBayMin = AVG_BAY_SERVICE_MIN,
): number {
  if (aheadCount <= 0) return 0
  return Math.ceil(aheadCount / bays) * avgBayMin
}
