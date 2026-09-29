import { mockApi } from '@/services/mock/mockApi'
import type { TruckTrackingApi } from '@/services/api'

/**
 * Active data implementation. Today it's the in-memory mock; when a real backend
 * exists, swap this for an HTTP client (gated by `VITE_USE_MOCK`) — no UI changes.
 */
const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const api: TruckTrackingApi = useMock ? mockApi : mockApi

export type { TruckTrackingApi, Snapshot } from '@/services/api'
