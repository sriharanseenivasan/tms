import { format, getHours, parseISO } from 'date-fns'
import {
  TruckStatus,
  type Bay,
  type Token,
  type TripRecord,
  type Truck,
  type TruckEvent,
} from '@/types'
import {
  AT_BAY_STATUSES,
  BAY_COUNT,
  HISTORY_DAYS,
  INSIDE_PLANT_STATUSES,
  WORKING_MINUTES_PER_DAY,
} from '@/utils/constants'
import { average } from '@/utils/tat'
import { minutesBetween } from '@/utils/formatters'

export interface DashboardData {
  trucks: Truck[]
  bays: Bay[]
  tokens: Token[]
  events: TruckEvent[]
  trips: TripRecord[]
}

export interface KpiSet {
  insidePlant: number
  inYard: number
  atBays: number
  completedToday: number
  avgTatMin: number
  avgYardWaitMin: number
  bayUtilization: number
  onHold: number
}

/** Duration (min) of a stage only when a later event exists (i.e. it finished). */
function completedStageMin(events: TruckEvent[], stage: TruckStatus): number | undefined {
  const sorted = [...events].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  const i = sorted.findIndex((e) => e.stage === stage)
  if (i === -1 || i === sorted.length - 1) return undefined
  return minutesBetween(sorted[i].timestamp, sorted[i + 1].timestamp)
}

function truckTat(events: TruckEvent[]): number | undefined {
  const sorted = [...events].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  const gateIn = sorted.find((e) => e.stage === TruckStatus.GATE_IN)
  const gateOut = sorted.find((e) => e.stage === TruckStatus.GATE_OUT)
  if (!gateIn || !gateOut) return undefined
  return minutesBetween(gateIn.timestamp, gateOut.timestamp)
}

export function computeKpis({ trucks, bays, tokens, events, trips }: DashboardData): KpiSet {
  const eventsByTruck = groupEvents(events)
  const tokenByTruck = new Map(tokens.map((t) => [t.truckId, t]))

  const insidePlant = trucks.filter((t) => INSIDE_PLANT_STATUSES.includes(t.status)).length
  const inYard = trucks.filter((t) => t.status === TruckStatus.IN_YARD_QUEUE).length
  const atBays = trucks.filter((t) => AT_BAY_STATUSES.includes(t.status)).length
  const onHold = trucks.filter((t) => t.status === TruckStatus.ON_HOLD).length
  const completedStatuses: TruckStatus[] = [
    TruckStatus.COMPLETED,
    TruckStatus.EXIT_CLEARANCE,
    TruckStatus.GATE_OUT,
  ]
  const completedToday = trucks.filter((t) => completedStatuses.includes(t.status)).length

  const gatedOutTats = trucks
    .filter((t) => t.status === TruckStatus.GATE_OUT)
    .map((t) => truckTat(eventsByTruck.get(t.id) ?? []))
  const avgTatMin =
    gatedOutTats.filter(Boolean).length > 0
      ? average(gatedOutTats)
      : average(trips.map((t) => t.totalTatMin))

  const yardWaits = trucks
    .filter((t) => t.status === TruckStatus.IN_YARD_QUEUE)
    .map((t) => minutesBetween(tokenByTruck.get(t.id)?.issuedAt ?? t.updatedAt))

  const usableBays = bays.filter((b) => b.status !== 'MAINTENANCE').length
  const occupied = bays.filter((b) => b.status === 'OCCUPIED').length
  const bayUtilization = usableBays ? Math.round((occupied / usableBays) * 100) : 0

  return {
    insidePlant,
    inYard,
    atBays,
    completedToday,
    avgTatMin: Math.round(avgTatMin),
    avgYardWaitMin: Math.round(average(yardWaits)),
    bayUtilization,
    onHold,
  }
}

function groupEvents(events: TruckEvent[]): Map<string, TruckEvent[]> {
  const map = new Map<string, TruckEvent[]>()
  for (const e of events) {
    const list = map.get(e.truckId) ?? []
    list.push(e)
    map.set(e.truckId, list)
  }
  return map
}

export interface HourlyPoint {
  hour: string
  trucks: number
}

/** Gate-in counts grouped by hour of day (today's inflow). */
export function hourlyInflow(events: TruckEvent[]): HourlyPoint[] {
  const counts = new Map<number, number>()
  for (const e of events) {
    if (e.stage !== TruckStatus.GATE_IN) continue
    const h = getHours(parseISO(e.timestamp))
    counts.set(h, (counts.get(h) ?? 0) + 1)
  }
  if (counts.size === 0) return []
  const min = Math.min(...counts.keys())
  const max = Math.max(...counts.keys())
  const points: HourlyPoint[] = []
  for (let h = min; h <= max; h += 1) {
    points.push({ hour: `${String(h).padStart(2, '0')}:00`, trucks: counts.get(h) ?? 0 })
  }
  return points
}

export interface StageSegment {
  name: string
  gateSecurity: number
  docs: number
  yard: number
  bay: number
  exit: number
}

/** Average minutes per stage group across trucks — one stacked bar. */
export function tatByStage(events: TruckEvent[]): StageSegment[] {
  const byTruck = groupEvents(events)
  const gateSecurity: number[] = []
  const docs: number[] = []
  const yard: number[] = []
  const bay: number[] = []
  const exit: number[] = []

  for (const list of byTruck.values()) {
    const gs =
      (completedStageMin(list, TruckStatus.GATE_IN) ?? 0) +
      (completedStageMin(list, TruckStatus.SECURITY_CHECK) ?? 0)
    const d = completedStageMin(list, TruckStatus.DOC_CLEARED)
    const y = completedStageMin(list, TruckStatus.IN_YARD_QUEUE)
    const b =
      (completedStageMin(list, TruckStatus.CALLED_TO_BAY) ?? 0) +
      (completedStageMin(list, TruckStatus.AT_BAY) ?? 0) +
      (completedStageMin(list, TruckStatus.LOADING) ?? 0) +
      (completedStageMin(list, TruckStatus.UNLOADING) ?? 0)
    const ex =
      (completedStageMin(list, TruckStatus.COMPLETED) ?? 0) +
      (completedStageMin(list, TruckStatus.EXIT_CLEARANCE) ?? 0)

    if (gs) gateSecurity.push(gs)
    if (d != null) docs.push(d)
    if (y != null) yard.push(y)
    if (b) bay.push(b)
    if (ex) exit.push(ex)
  }

  return [
    {
      name: 'Avg journey',
      gateSecurity: Math.round(average(gateSecurity)),
      docs: Math.round(average(docs)),
      yard: Math.round(average(yard)),
      bay: Math.round(average(bay)),
      exit: Math.round(average(exit)),
    },
  ]
}

export interface BayUtilPoint {
  bay: string
  utilization: number
}

/** Per-bay utilization % from historical trips over the working window. */
export function bayUtilization(trips: TripRecord[]): BayUtilPoint[] {
  const busy = new Map<number, number>()
  for (const trip of trips) busy.set(trip.bayId, (busy.get(trip.bayId) ?? 0) + trip.bayTimeMin)
  const capacity = HISTORY_DAYS * WORKING_MINUTES_PER_DAY
  const points: BayUtilPoint[] = []
  for (let id = 1; id <= BAY_COUNT; id += 1) {
    points.push({
      bay: String(id),
      utilization: Math.min(100, Math.round(((busy.get(id) ?? 0) / capacity) * 100)),
    })
  }
  return points
}

export interface TrendPoint {
  date: string
  tat: number
}

/** Average total TAT per day over the historical trips (oldest → newest). */
export function tatTrend(trips: TripRecord[]): TrendPoint[] {
  const byDay = new Map<string, number[]>()
  for (const trip of trips) {
    const key = format(parseISO(trip.date), 'yyyy-MM-dd')
    const list = byDay.get(key) ?? []
    list.push(trip.totalTatMin)
    byDay.set(key, list)
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => ({
      date: format(parseISO(key), 'dd MMM'),
      tat: Math.round(average(values)),
    }))
}

export interface SplitPoint {
  name: string
  value: number
}

/** Inbound vs outbound split of today's trucks. */
export function inOutSplit(trucks: Truck[]): SplitPoint[] {
  const inbound = trucks.filter((t) => t.type === 'INBOUND').length
  const outbound = trucks.filter((t) => t.type === 'OUTBOUND').length
  return [
    { name: 'Inbound', value: inbound },
    { name: 'Outbound', value: outbound },
  ]
}
