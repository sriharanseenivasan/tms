import type {
  Bay,
  Driver,
  Insight,
  Priority,
  Token,
  TripRecord,
  Truck,
  TruckDocument,
  TruckEvent,
  TruckStatus,
  TruckType,
  YardSlot,
} from '@/types'

/** Snapshot of the whole demo state, returned by {@link TruckTrackingApi.getSnapshot}. */
export interface Snapshot {
  trucks: Truck[]
  tokens: Token[]
  yardSlots: YardSlot[]
  bays: Bay[]
  events: TruckEvent[]
  trips: TripRecord[]
  insights: Insight[]
}

/** Payload captured at the gate for a new or pre-registered truck. */
export interface GateEntryInput {
  /** Set when the entry originates from a pre-registered (EXPECTED) truck. */
  existingTruckId?: string
  regNo: string
  transporter: string
  driver: Driver
  type: TruckType
  material: string
  priority: Priority
  documents: TruckDocument[]
}

/** How the next truck is chosen when calling to a bay. */
export type CallMode = 'FIFO' | 'PRIORITY'

/**
 * The application's data contract. The mock implementation is used now; a real
 * HTTP/PostgreSQL implementation can be dropped in later without touching the UI.
 */
export interface TruckTrackingApi {
  getSnapshot(): Promise<Snapshot>

  getTrucks(): Promise<Truck[]>
  getTruck(id: string): Promise<Truck | undefined>
  getTruckEvents(truckId: string): Promise<TruckEvent[]>
  updateTruckStatus(
    id: string,
    status: TruckStatus,
    actor: string,
    note?: string,
  ): Promise<Truck>

  /** Pre-registered trucks awaiting gate-in (status EXPECTED). */
  getExpectedTrucks(): Promise<Truck[]>
  /** Process a gate entry: create/advance the truck, verify docs, issue its QR. */
  submitGateEntry(input: GateEntryInput): Promise<Truck>

  /**
   * Yard kiosk check-in: move a doc-cleared truck into the FIFO queue, issue a
   * token and optionally park it in a chosen slot.
   */
  checkInToYard(truckId: string, slotId?: string): Promise<{ truck: Truck; token: Token }>
  /** Manager priority bump for a queued truck. */
  setTruckPriority(truckId: string, priority: Priority): Promise<Truck>

  /**
   * Call the next queued truck to a free bay. `mode` decides FIFO vs priority
   * ordering. Rejects if there is no queued truck or no free bay.
   */
  callNextTruck(mode: CallMode): Promise<{ truck: Truck; bay: Bay }>
  /** Operator scans to start (un)loading at the truck's bay. */
  startLoading(truckId: string): Promise<Truck>
  /** Operator scans to complete (un)loading. */
  completeLoading(truckId: string): Promise<Truck>
  /** Send a completed truck onward to exit clearance and free its bay. */
  dispatchFromBay(truckId: string): Promise<Truck>
  /** Final gate-out: mark the truck out and release any held bay/slot. */
  gateOut(truckId: string): Promise<Truck>

  getBays(): Promise<Bay[]>
  getYardSlots(): Promise<YardSlot[]>
  getTokens(): Promise<Token[]>
  getTrips(): Promise<TripRecord[]>
  getInsights(): Promise<Insight[]>

  /** Advance the demo one step (used by the live simulator). */
  simulateTick(): Promise<Snapshot>

  /** Restore the initial seeded dataset (backs the "Reset demo data" button). */
  resetDemoData(): Promise<Snapshot>
}
