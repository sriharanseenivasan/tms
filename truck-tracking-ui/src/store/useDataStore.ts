import { create } from 'zustand'
import { api } from '@/services'
import type { Snapshot } from '@/services/api'
import { createSimulator, type Simulator } from '@/services/mock/simulator'
import type {
  Bay,
  Insight,
  Token,
  TripRecord,
  Truck,
  TruckEvent,
  YardSlot,
} from '@/types'

interface DataState {
  trucks: Truck[]
  tokens: Token[]
  yardSlots: YardSlot[]
  bays: Bay[]
  events: TruckEvent[]
  trips: TripRecord[]
  insights: Insight[]
  loading: boolean
  loaded: boolean
  error?: string
  /** Whether the live simulator is currently advancing the demo. */
  simRunning: boolean

  /** Load the full snapshot from the service layer. */
  load: () => Promise<void>
  /** Silently re-fetch the snapshot after a mutation (no loading flash). */
  refresh: () => Promise<void>
  /** Restore the initial seeded dataset. */
  reset: () => Promise<void>
  /** Start/stop the live simulator that advances trucks over time. */
  toggleSim: () => void
}

function applySnapshot(snapshot: Snapshot) {
  return {
    trucks: snapshot.trucks,
    tokens: snapshot.tokens,
    yardSlots: snapshot.yardSlots,
    bays: snapshot.bays,
    events: snapshot.events,
    trips: snapshot.trips,
    insights: snapshot.insights,
  }
}

/**
 * Global demo state. All data enters through the service layer (`@/services`),
 * never by importing mock data directly into components.
 */
export const useDataStore = create<DataState>((set, get) => {
  // A single simulator instance; each tick advances the demo one step.
  let simulator: Simulator | null = null

  const runTick = async () => {
    try {
      const snapshot = await api.simulateTick()
      set({ ...applySnapshot(snapshot), loaded: true })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  }

  return {
    trucks: [],
    tokens: [],
    yardSlots: [],
    bays: [],
    events: [],
    trips: [],
    insights: [],
    loading: false,
    loaded: false,
    simRunning: false,

    load: async () => {
      set({ loading: true, error: undefined })
      try {
        const snapshot = await api.getSnapshot()
        set({ ...applySnapshot(snapshot), loading: false, loaded: true })
      } catch (err) {
        set({ loading: false, error: (err as Error).message })
      }
    },

    reset: async () => {
      set({ loading: true, error: undefined })
      try {
        const snapshot = await api.resetDemoData()
        set({ ...applySnapshot(snapshot), loading: false, loaded: true })
      } catch (err) {
        set({ loading: false, error: (err as Error).message })
      }
    },

    refresh: async () => {
      try {
        const snapshot = await api.getSnapshot()
        set({ ...applySnapshot(snapshot), loaded: true })
      } catch (err) {
        set({ error: (err as Error).message })
      }
    },

    toggleSim: () => {
      if (!simulator) simulator = createSimulator(() => void runTick(), 3500)
      if (get().simRunning) {
        simulator.stop()
        set({ simRunning: false })
      } else {
        simulator.start()
        set({ simRunning: true })
      }
    },
  }
})
