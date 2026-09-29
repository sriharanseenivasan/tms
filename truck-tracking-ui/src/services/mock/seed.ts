import { faker } from '@faker-js/faker'
import {
  Role,
  STATUS_ORDER,
  TruckStatus,
  type Bay,
  type Insight,
  type Priority,
  type Token,
  type TripRecord,
  type Truck,
  type TruckDocument,
  type TruckEvent,
  type TruckType,
  type YardSlot,
  type YardZone,
} from '@/types'
import {
  BAY_COUNT,
  DOCUMENT_KINDS,
  HISTORY_DAYS,
  MATERIALS,
  RTO_CODES,
  ROLE_LABELS,
  SEED_TRUCK_COUNT,
  TRANSPORTERS,
  YARD_ZONES,
} from '@/utils/constants'

/** The full in-memory dataset the mock API operates on. */
export interface DemoData {
  trucks: Truck[]
  tokens: Token[]
  yardSlots: YardSlot[]
  bays: Bay[]
  events: TruckEvent[]
  trips: TripRecord[]
  insights: Insight[]
}

const ACTOR_BY_STAGE: Partial<Record<TruckStatus, string>> = {
  [TruckStatus.GATE_IN]: ROLE_LABELS[Role.SECURITY],
  [TruckStatus.SECURITY_CHECK]: ROLE_LABELS[Role.SECURITY],
  [TruckStatus.DOC_CLEARED]: ROLE_LABELS[Role.SECURITY],
  [TruckStatus.IN_YARD_QUEUE]: ROLE_LABELS[Role.YARD_KIOSK],
  [TruckStatus.CALLED_TO_BAY]: ROLE_LABELS[Role.MANAGER],
  [TruckStatus.AT_BAY]: ROLE_LABELS[Role.BAY_OPERATOR],
  [TruckStatus.LOADING]: ROLE_LABELS[Role.BAY_OPERATOR],
  [TruckStatus.COMPLETED]: ROLE_LABELS[Role.BAY_OPERATOR],
  [TruckStatus.EXIT_CLEARANCE]: ROLE_LABELS[Role.SECURITY],
  [TruckStatus.GATE_OUT]: ROLE_LABELS[Role.SECURITY],
}

/** Distribution of "today" trucks across the lifecycle for a realistic board. */
const STATUS_DISTRIBUTION: Array<{ status: TruckStatus; weight: number }> = [
  { status: TruckStatus.EXPECTED, weight: 6 },
  { status: TruckStatus.GATE_IN, weight: 3 },
  { status: TruckStatus.SECURITY_CHECK, weight: 3 },
  { status: TruckStatus.DOC_CLEARED, weight: 2 },
  { status: TruckStatus.IN_YARD_QUEUE, weight: 9 },
  { status: TruckStatus.CALLED_TO_BAY, weight: 2 },
  { status: TruckStatus.AT_BAY, weight: 2 },
  { status: TruckStatus.LOADING, weight: 6 },
  { status: TruckStatus.COMPLETED, weight: 3 },
  { status: TruckStatus.EXIT_CLEARANCE, weight: 2 },
  { status: TruckStatus.GATE_OUT, weight: 4 },
  { status: TruckStatus.ON_HOLD, weight: 3 },
]

function buildStatusPlan(count: number): TruckStatus[] {
  const plan: TruckStatus[] = []
  for (const { status, weight } of STATUS_DISTRIBUTION) {
    for (let i = 0; i < weight; i += 1) plan.push(status)
  }
  // Repeat/trim to exactly `count`.
  const result: TruckStatus[] = []
  for (let i = 0; i < count; i += 1) result.push(plan[i % plan.length])
  return faker.helpers.shuffle(result)
}

function indianRegNo(): string {
  const rto = faker.helpers.arrayElement(RTO_CODES)
  const series = faker.string.alpha({ length: 2, casing: 'upper' })
  const number = faker.string.numeric(4)
  return `${rto} ${series} ${number}`
}

function driverName(): string {
  return faker.person.fullName()
}

function makeDocuments(status: TruckStatus, onHold: boolean): TruckDocument[] {
  return DOCUMENT_KINDS.map((kind) => {
    if (status === TruckStatus.EXPECTED || status === TruckStatus.GATE_IN) {
      return { kind, status: 'PENDING' as const }
    }
    if (onHold && kind === 'INVOICE') {
      return { kind, status: 'REJECTED' as const }
    }
    return { kind, status: 'VERIFIED' as const }
  })
}

/** Build the ordered event log for a truck that has reached `status`. */
function makeEvents(
  truckId: string,
  status: TruckStatus,
  gateInAt: Date,
): TruckEvent[] {
  if (status === TruckStatus.EXPECTED) return []

  const reachedIndex = STATUS_ORDER.indexOf(
    status === TruckStatus.ON_HOLD ? TruckStatus.SECURITY_CHECK : status,
  )
  const events: TruckEvent[] = []
  let cursor = new Date(gateInAt)

  for (let i = 1; i <= reachedIndex; i += 1) {
    const stage = STATUS_ORDER[i]
    events.push({
      id: faker.string.uuid(),
      truckId,
      stage,
      timestamp: cursor.toISOString(),
      actor: ACTOR_BY_STAGE[stage] ?? 'System',
    })
    cursor = new Date(cursor.getTime() + faker.number.int({ min: 6, max: 28 }) * 60_000)
  }

  if (status === TruckStatus.ON_HOLD) {
    events.push({
      id: faker.string.uuid(),
      truckId,
      stage: TruckStatus.ON_HOLD,
      timestamp: cursor.toISOString(),
      actor: ACTOR_BY_STAGE[TruckStatus.SECURITY_CHECK] ?? 'Security',
      note: 'Document mismatch — invoice rejected',
    })
  }

  return events
}

function makeYardSlots(): YardSlot[] {
  const slots: YardSlot[] = []
  for (const { zone, slots: count } of YARD_ZONES) {
    for (let i = 1; i <= count; i += 1) {
      slots.push({
        id: `slot-${zone}${i}`,
        zone: zone as YardZone,
        label: `${zone}${i}`,
        status: 'FREE',
      })
    }
  }
  return slots
}

function makeBays(): Bay[] {
  return Array.from({ length: BAY_COUNT }, (_, i) => ({
    id: i + 1,
    status: 'FREE' as const,
    progress: 0,
  }))
}

function makeInsights(): Insight[] {
  return [
    {
      id: faker.string.uuid(),
      kind: 'BOTTLENECK',
      severity: 'WARNING',
      title: 'Bay 7 running 32% slower',
      detail: 'Bay 7 has 32% higher average loading time than the other bays this week.',
      recommendation: 'Inspect Bay 7 equipment and rebalance heavy loads to Bays 3 and 9.',
    },
    {
      id: faker.string.uuid(),
      kind: 'RECOMMENDATION',
      severity: 'INFO',
      title: 'Yard wait peaks 10–12 AM',
      detail: 'Yard waiting time peaks between 10 AM and 12 PM due to clustered arrivals.',
      recommendation: 'Stagger transporter arrival windows to smooth the morning peak.',
    },
    {
      id: faker.string.uuid(),
      kind: 'ANOMALY',
      severity: 'CRITICAL',
      title: 'High doc-rejection transporter',
      detail: 'Transporter "Gati Cargo" has a 3× higher document-rejection rate than average.',
      recommendation: 'Share a pre-arrival document checklist with the transporter.',
    },
    {
      id: faker.string.uuid(),
      kind: 'PREDICTION',
      severity: 'INFO',
      title: 'Predicted TAT: 84 min',
      detail: 'Predicted turnaround time for the next inbound truck is ~84 minutes.',
    },
    {
      id: faker.string.uuid(),
      kind: 'BOTTLENECK',
      severity: 'WARNING',
      title: 'Security verification bottleneck',
      detail: 'Security document verification averages 14 min — the slowest stage today.',
      recommendation: 'Add a second verification counter during the morning peak.',
    },
  ]
}

function makeTrips(trucks: Truck[]): TripRecord[] {
  const trips: TripRecord[] = []
  const perDay = 42
  for (let d = 1; d <= HISTORY_DAYS; d += 1) {
    for (let i = 0; i < perDay; i += 1) {
      const date = new Date()
      date.setDate(date.getDate() - d)
      date.setHours(faker.number.int({ min: 6, max: 20 }), faker.number.int({ min: 0, max: 59 }), 0, 0)
      const gateInAt = new Date(date)
      const yardWaitMin = faker.number.int({ min: 8, max: 55 })
      const bayTimeMin = faker.number.int({ min: 25, max: 95 })
      const totalTatMin = yardWaitMin + bayTimeMin + faker.number.int({ min: 20, max: 45 })
      const gateOutAt = new Date(gateInAt.getTime() + totalTatMin * 60_000)
      const type: TruckType = faker.helpers.arrayElement(['INBOUND', 'OUTBOUND'])
      trips.push({
        id: faker.string.uuid(),
        truckId: faker.helpers.arrayElement(trucks).id,
        regNo: indianRegNo(),
        transporter: faker.helpers.arrayElement(TRANSPORTERS),
        material: faker.helpers.arrayElement(MATERIALS),
        type,
        bayId: faker.number.int({ min: 1, max: BAY_COUNT }),
        date: gateInAt.toISOString(),
        gateInAt: gateInAt.toISOString(),
        gateOutAt: gateOutAt.toISOString(),
        yardWaitMin,
        bayTimeMin,
        totalTatMin,
      })
    }
  }
  return trips
}

/**
 * Generate the full demo dataset. A fixed seed keeps the demo reproducible
 * while "Reset demo data" reruns this to restore the initial state.
 */
export function generateDemoData(seed = 20260928): DemoData {
  faker.seed(seed)

  const yardSlots = makeYardSlots()
  const bays = makeBays()
  const statusPlan = buildStatusPlan(SEED_TRUCK_COUNT)

  const trucks: Truck[] = []
  const tokens: Token[] = []
  const events: TruckEvent[] = []

  let fifoCounter = 0
  const freeSlots = faker.helpers.shuffle(yardSlots)
  let slotCursor = 0
  const freeBays = faker.helpers.shuffle([...bays])
  let bayCursor = 0

  statusPlan.forEach((status, index) => {
    const id = `truck-${String(index + 1).padStart(3, '0')}`
    const onHold = status === TruckStatus.ON_HOLD
    const type: TruckType = faker.helpers.arrayElement(['INBOUND', 'OUTBOUND'])
    const priority: Priority = faker.helpers.weightedArrayElement([
      { value: 'NORMAL', weight: 8 },
      { value: 'HIGH', weight: 2 },
    ])
    const gateInAt = new Date()
    gateInAt.setHours(
      faker.number.int({ min: 6, max: 15 }),
      faker.number.int({ min: 0, max: 59 }),
      0,
      0,
    )

    const truck: Truck = {
      id,
      regNo: indianRegNo(),
      transporter: faker.helpers.arrayElement(TRANSPORTERS),
      driver: {
        name: driverName(),
        phone: `+91 ${faker.string.numeric({ length: 5 })} ${faker.string.numeric({ length: 5 })}`,
        license: `${faker.string.alpha({ length: 2, casing: 'upper' })}${faker.string.numeric({ length: 13 })}`,
      },
      type,
      material: faker.helpers.arrayElement(MATERIALS),
      priority,
      qrId: `QR-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`,
      status,
      holdReason: onHold ? 'Document mismatch — invoice rejected' : undefined,
      documents: makeDocuments(status, onHold),
      createdAt: gateInAt.toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Token for anyone who has reached (or passed) the yard queue.
    const inYardOrBay: TruckStatus[] = [
      TruckStatus.IN_YARD_QUEUE,
      TruckStatus.CALLED_TO_BAY,
      TruckStatus.AT_BAY,
      TruckStatus.LOADING,
      TruckStatus.UNLOADING,
    ]
    if (inYardOrBay.includes(status)) {
      fifoCounter += 1
      // Earlier tokens (lower position) have waited longer, keeping the yard
      // board's waiting times realistic (a few minutes up to ~70 min).
      const waitMin = Math.min(72, Math.max(4, 72 - fifoCounter * 6))
      const token: Token = {
        id: `token-${id}`,
        number: `T${String(fifoCounter).padStart(3, '0')}`,
        truckId: id,
        fifoPosition: fifoCounter,
        issuedAt: new Date(Date.now() - waitMin * 60_000).toISOString(),
      }
      tokens.push(token)
      truck.tokenId = token.id
    }

    // Occupy a yard slot while queueing.
    if (status === TruckStatus.IN_YARD_QUEUE && slotCursor < freeSlots.length) {
      const slot = freeSlots[slotCursor]
      slotCursor += 1
      slot.status = 'OCCUPIED'
      slot.truckId = id
      truck.yardSlotId = slot.id
    }

    // Occupy a bay for active loading / at-bay trucks.
    const atBayStatuses: TruckStatus[] = [
      TruckStatus.AT_BAY,
      TruckStatus.LOADING,
      TruckStatus.UNLOADING,
    ]
    if (atBayStatuses.includes(status) && bayCursor < freeBays.length) {
      const bay = freeBays[bayCursor]
      bayCursor += 1
      bay.status = 'OCCUPIED'
      bay.currentTruckId = id
      bay.startTime = new Date(Date.now() - faker.number.int({ min: 5, max: 70 }) * 60_000).toISOString()
      bay.progress = faker.number.int({ min: 10, max: 90 })
      truck.bayId = bay.id
    } else if (status === TruckStatus.CALLED_TO_BAY && bayCursor < freeBays.length) {
      const bay = freeBays[bayCursor]
      bayCursor += 1
      bay.status = 'RESERVED'
      bay.currentTruckId = id
      truck.bayId = bay.id
    }

    events.push(...makeEvents(id, status, gateInAt))
    trucks.push(truck)
  })

  // Mark one bay as under maintenance for realism.
  const maintenanceBay = bays.find((b) => b.status === 'FREE')
  if (maintenanceBay) maintenanceBay.status = 'MAINTENANCE'

  const trips = makeTrips(trucks)
  const insights = makeInsights()

  return { trucks, tokens, yardSlots, bays, events, trips, insights }
}
