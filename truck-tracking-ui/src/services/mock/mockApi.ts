import type { Snapshot, CallMode, GateEntryInput, TruckTrackingApi } from '@/services/api'
import { generateDemoData, type DemoData } from '@/services/mock/seed'
import { STATUS_ORDER, TruckStatus, type Bay, type Priority, type Token, type Truck } from '@/types'
import { MOCK_LATENCY_MS } from '@/utils/constants'

/** Simulate network latency so loading states behave like a real API. */
function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * In-memory mock backend. Holds the single mutable dataset and exposes it via
 * the {@link TruckTrackingApi} contract. Components never touch this directly —
 * they go through the exported `api` in `services/index.ts`.
 */
class MockApi implements TruckTrackingApi {
  private data: DemoData = generateDemoData()

  private snapshot(): Snapshot {
    return clone({
      trucks: this.data.trucks,
      tokens: this.data.tokens,
      yardSlots: this.data.yardSlots,
      bays: this.data.bays,
      events: this.data.events,
      trips: this.data.trips,
      insights: this.data.insights,
    })
  }

  getSnapshot(): Promise<Snapshot> {
    return delay(this.snapshot())
  }

  getTrucks(): Promise<Truck[]> {
    return delay(clone(this.data.trucks))
  }

  getTruck(id: string): Promise<Truck | undefined> {
    return delay(clone(this.data.trucks.find((t) => t.id === id)))
  }

  getTruckEvents(truckId: string) {
    return delay(clone(this.data.events.filter((e) => e.truckId === truckId)))
  }

  updateTruckStatus(
    id: string,
    status: TruckStatus,
    actor: string,
    note?: string,
  ): Promise<Truck> {
    const truck = this.data.trucks.find((t) => t.id === id)
    if (!truck) return Promise.reject(new Error(`Truck ${id} not found`))

    truck.status = status
    truck.updatedAt = new Date().toISOString()
    if (status !== TruckStatus.ON_HOLD) truck.holdReason = undefined

    if (STATUS_ORDER.includes(status)) {
      this.data.events.push({
        id: crypto.randomUUID(),
        truckId: id,
        stage: status,
        timestamp: truck.updatedAt,
        actor,
        note,
      })
    }

    return delay(clone(truck))
  }

  getExpectedTrucks(): Promise<Truck[]> {
    return delay(clone(this.data.trucks.filter((t) => t.status === TruckStatus.EXPECTED)))
  }

  submitGateEntry(input: GateEntryInput): Promise<Truck> {
    const anyRejected = input.documents.some((d) => d.status === 'REJECTED')
    const now = new Date().toISOString()
    const finalStatus = anyRejected ? TruckStatus.ON_HOLD : TruckStatus.DOC_CLEARED
    const holdReason = anyRejected ? 'Document mismatch — a document was rejected' : undefined

    let truck = input.existingTruckId
      ? this.data.trucks.find((t) => t.id === input.existingTruckId)
      : undefined

    if (truck) {
      truck.regNo = input.regNo
      truck.transporter = input.transporter
      truck.driver = input.driver
      truck.type = input.type
      truck.material = input.material
      truck.priority = input.priority
      truck.documents = input.documents
      truck.status = finalStatus
      truck.holdReason = holdReason
      truck.updatedAt = now
    } else {
      const nextIndex = this.data.trucks.length + 1
      truck = {
        id: `truck-${String(nextIndex).padStart(3, '0')}`,
        regNo: input.regNo,
        transporter: input.transporter,
        driver: input.driver,
        type: input.type,
        material: input.material,
        priority: input.priority,
        qrId: `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        status: finalStatus,
        holdReason,
        documents: input.documents,
        createdAt: now,
        updatedAt: now,
      }
      this.data.trucks.push(truck)
    }

    // Append the gate-in → security → cleared/hold event chain.
    const created = truck
    const chain: TruckStatus[] = anyRejected
      ? [TruckStatus.GATE_IN, TruckStatus.SECURITY_CHECK, TruckStatus.ON_HOLD]
      : [TruckStatus.GATE_IN, TruckStatus.SECURITY_CHECK, TruckStatus.DOC_CLEARED]
    chain.forEach((stage, i) => {
      this.data.events.push({
        id: crypto.randomUUID(),
        truckId: created.id,
        stage,
        timestamp: new Date(Date.parse(now) + i * 60_000).toISOString(),
        actor: 'Security',
        note: stage === TruckStatus.ON_HOLD ? holdReason : undefined,
      })
    })

    return delay(clone(created))
  }

  checkInToYard(truckId: string, slotId?: string): Promise<{ truck: Truck; token: Token }> {
    const truck = this.data.trucks.find((t) => t.id === truckId)
    if (!truck) return Promise.reject(new Error(`Truck ${truckId} not found`))

    const now = new Date().toISOString()
    const nextPosition =
      this.data.tokens.reduce((max, t) => Math.max(max, t.fifoPosition), 0) + 1

    let token = this.data.tokens.find((t) => t.id === truck.tokenId)
    if (!token) {
      token = {
        id: `token-${truck.id}`,
        number: `T${String(nextPosition).padStart(3, '0')}`,
        truckId: truck.id,
        fifoPosition: nextPosition,
        issuedAt: now,
      }
      this.data.tokens.push(token)
      truck.tokenId = token.id
    }

    if (slotId) {
      const slot = this.data.yardSlots.find((s) => s.id === slotId)
      if (slot && slot.status === 'FREE') {
        slot.status = 'OCCUPIED'
        slot.truckId = truck.id
        truck.yardSlotId = slot.id
      }
    }

    truck.status = TruckStatus.IN_YARD_QUEUE
    truck.updatedAt = now
    this.data.events.push({
      id: crypto.randomUUID(),
      truckId: truck.id,
      stage: TruckStatus.IN_YARD_QUEUE,
      timestamp: now,
      actor: 'Yard Kiosk',
    })

    return delay({ truck: clone(truck), token: clone(token) })
  }

  setTruckPriority(truckId: string, priority: Priority): Promise<Truck> {
    const truck = this.data.trucks.find((t) => t.id === truckId)
    if (!truck) return Promise.reject(new Error(`Truck ${truckId} not found`))
    truck.priority = priority
    truck.updatedAt = new Date().toISOString()
    return delay(clone(truck))
  }

  private logEvent(truckId: string, stage: TruckStatus, actor: string, note?: string) {
    // Chain the timestamp off the truck's last event so cumulative TAT stays
    // realistic (a few minutes per stage) instead of jumping to wall-clock time.
    const last = this.data.events
      .filter((e) => e.truckId === truckId)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0]
    const base = last ? Date.parse(last.timestamp) : Date.now()
    const increment = (6 + Math.floor(Math.random() * 14)) * 60_000
    this.data.events.push({
      id: crypto.randomUUID(),
      truckId,
      stage,
      timestamp: new Date(base + increment).toISOString(),
      actor,
      note,
    })
  }

  private releaseSlot(truck: Truck) {
    if (!truck.yardSlotId) return
    const slot = this.data.yardSlots.find((s) => s.id === truck.yardSlotId)
    if (slot) {
      slot.status = 'FREE'
      slot.truckId = undefined
    }
    truck.yardSlotId = undefined
  }

  private releaseBay(truck: Truck) {
    if (truck.bayId == null) return
    const bay = this.data.bays.find((b) => b.id === truck.bayId)
    if (bay) {
      bay.status = 'FREE'
      bay.currentTruckId = undefined
      bay.startTime = undefined
      bay.progress = 0
    }
    truck.bayId = undefined
  }

  callNextTruck(mode: CallMode): Promise<{ truck: Truck; bay: Bay }> {
    const tokenByTruck = new Map(this.data.tokens.map((t) => [t.truckId, t]))
    const queued = this.data.trucks
      .filter((t) => t.status === TruckStatus.IN_YARD_QUEUE)
      .sort((a, b) => {
        if (mode === 'PRIORITY' && a.priority !== b.priority) {
          return a.priority === 'HIGH' ? -1 : 1
        }
        return (tokenByTruck.get(a.id)?.fifoPosition ?? 0) - (tokenByTruck.get(b.id)?.fifoPosition ?? 0)
      })

    const next = queued[0]
    if (!next) return Promise.reject(new Error('No trucks waiting in the yard queue'))

    const bay = this.data.bays
      .filter((b) => b.status === 'FREE')
      .sort((a, b) => a.id - b.id)[0]
    if (!bay) return Promise.reject(new Error('No free bay available'))

    bay.status = 'RESERVED'
    bay.currentTruckId = next.id
    bay.progress = 0
    next.status = TruckStatus.CALLED_TO_BAY
    next.bayId = bay.id
    next.updatedAt = new Date().toISOString()
    this.releaseSlot(next)
    this.logEvent(next.id, TruckStatus.CALLED_TO_BAY, 'Manager', `Called to Bay ${bay.id}`)

    return delay({ truck: clone(next), bay: clone(bay) })
  }

  startLoading(truckId: string): Promise<Truck> {
    const truck = this.data.trucks.find((t) => t.id === truckId)
    if (!truck) return Promise.reject(new Error(`Truck ${truckId} not found`))
    if (truck.bayId == null) return Promise.reject(new Error('Truck is not assigned to a bay'))

    const bay = this.data.bays.find((b) => b.id === truck.bayId)
    const now = new Date().toISOString()
    const stage = truck.type === 'INBOUND' ? TruckStatus.UNLOADING : TruckStatus.LOADING

    if (bay) {
      bay.status = 'OCCUPIED'
      bay.startTime = now
      bay.progress = 5
    }
    truck.status = stage
    truck.updatedAt = now
    this.logEvent(truck.id, TruckStatus.AT_BAY, 'Bay Operator')
    this.logEvent(truck.id, stage, 'Bay Operator')

    return delay(clone(truck))
  }

  completeLoading(truckId: string): Promise<Truck> {
    const truck = this.data.trucks.find((t) => t.id === truckId)
    if (!truck) return Promise.reject(new Error(`Truck ${truckId} not found`))

    const bay = this.data.bays.find((b) => b.id === truck.bayId)
    if (bay) bay.progress = 100
    truck.status = TruckStatus.COMPLETED
    truck.updatedAt = new Date().toISOString()
    this.logEvent(truck.id, TruckStatus.COMPLETED, 'Bay Operator')

    return delay(clone(truck))
  }

  dispatchFromBay(truckId: string): Promise<Truck> {
    const truck = this.data.trucks.find((t) => t.id === truckId)
    if (!truck) return Promise.reject(new Error(`Truck ${truckId} not found`))

    truck.status = TruckStatus.EXIT_CLEARANCE
    truck.updatedAt = new Date().toISOString()
    this.releaseBay(truck)
    this.logEvent(truck.id, TruckStatus.EXIT_CLEARANCE, 'Bay Operator')

    return delay(clone(truck))
  }

  gateOut(truckId: string): Promise<Truck> {
    const truck = this.data.trucks.find((t) => t.id === truckId)
    if (!truck) return Promise.reject(new Error(`Truck ${truckId} not found`))

    truck.status = TruckStatus.GATE_OUT
    truck.updatedAt = new Date().toISOString()
    this.releaseBay(truck)
    this.releaseSlot(truck)
    this.logEvent(truck.id, TruckStatus.GATE_OUT, 'Security')

    return delay(clone(truck))
  }

  getBays() {
    return delay(clone(this.data.bays))
  }

  getYardSlots() {
    return delay(clone(this.data.yardSlots))
  }

  getTokens() {
    return delay(clone(this.data.tokens))
  }

  getTrips() {
    return delay(clone(this.data.trips))
  }

  getInsights() {
    return delay(clone(this.data.insights))
  }

  async simulateTick(): Promise<Snapshot> {
    // Nudge every active bay's progress so bars visibly move each tick.
    for (const bay of this.data.bays) {
      if (bay.status === 'OCCUPIED') {
        bay.progress = Math.min(100, bay.progress + randInt(4, 12))
      }
    }

    const { trucks, bays } = this.data
    const byStatus = (s: TruckStatus) => trucks.filter((t) => t.status === s)
    const hasFreeBay = bays.some((b) => b.status === 'FREE')
    const queued = byStatus(TruckStatus.IN_YARD_QUEUE)
    const loadingDone = trucks.filter(
      (t) =>
        (t.status === TruckStatus.LOADING || t.status === TruckStatus.UNLOADING) &&
        (this.data.bays.find((b) => b.id === t.bayId)?.progress ?? 0) >= 100,
    )

    // Collect one-step advancements that are currently possible.
    const actions: Array<() => Promise<unknown>> = []
    const gateIns = byStatus(TruckStatus.GATE_IN)
    const securityChecks = byStatus(TruckStatus.SECURITY_CHECK)
    const docCleared = byStatus(TruckStatus.DOC_CLEARED)
    const called = byStatus(TruckStatus.CALLED_TO_BAY)
    const completed = byStatus(TruckStatus.COMPLETED)
    const exiting = byStatus(TruckStatus.EXIT_CLEARANCE)

    if (gateIns.length)
      actions.push(() =>
        this.updateTruckStatus(pickRandom(gateIns).id, TruckStatus.SECURITY_CHECK, 'Security'),
      )
    if (securityChecks.length)
      actions.push(() =>
        this.updateTruckStatus(pickRandom(securityChecks).id, TruckStatus.DOC_CLEARED, 'Security'),
      )
    if (docCleared.length)
      actions.push(() => this.checkInToYard(pickRandom(docCleared).id))
    if (queued.length && hasFreeBay)
      actions.push(() => this.callNextTruck('PRIORITY'))
    if (called.length)
      actions.push(() => this.startLoading(pickRandom(called).id))
    if (loadingDone.length)
      actions.push(() => this.completeLoading(pickRandom(loadingDone).id))
    if (completed.length)
      actions.push(() => this.dispatchFromBay(pickRandom(completed).id))
    if (exiting.length) actions.push(() => this.gateOut(pickRandom(exiting).id))

    if (actions.length) await pickRandom(actions)()

    return this.snapshot()
  }

  resetDemoData(): Promise<Snapshot> {
    this.data = generateDemoData()
    return delay(this.snapshot())
  }
}

export const mockApi = new MockApi()
