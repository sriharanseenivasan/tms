import {
  Role,
  TruckStatus,
  type BayStatus,
  type DocumentKind,
  type InsightSeverity,
  type Priority,
  type YardSlotStatus,
} from '@/types'

/** Number of loading/unloading bays (Section 1). */
export const BAY_COUNT = 13

/** Yard zones and how many slots each holds (~25 total, Section 6). */
export const YARD_ZONES = [
  { zone: 'A' as const, slots: 9 },
  { zone: 'B' as const, slots: 8 },
  { zone: 'C' as const, slots: 8 },
]

/** Target number of "today" trucks to seed. */
export const SEED_TRUCK_COUNT = 50

/** Days of historical completed trips to seed for trends. */
export const HISTORY_DAYS = 7

/** Artificial latency (ms) applied to mock service calls. */
export const MOCK_LATENCY_MS = 250

/** Rough average minutes a truck occupies a bay — used for wait estimates. */
export const AVG_BAY_SERVICE_MIN = 45

/** Working minutes per day used to normalise bay-utilization charts. */
export const WORKING_MINUTES_PER_DAY = 600

/** Statuses that mean a truck is currently inside the plant (gated in, not out). */
export const INSIDE_PLANT_STATUSES: TruckStatus[] = [
  TruckStatus.GATE_IN,
  TruckStatus.SECURITY_CHECK,
  TruckStatus.DOC_CLEARED,
  TruckStatus.IN_YARD_QUEUE,
  TruckStatus.CALLED_TO_BAY,
  TruckStatus.AT_BAY,
  TruckStatus.LOADING,
  TruckStatus.UNLOADING,
  TruckStatus.COMPLETED,
  TruckStatus.EXIT_CLEARANCE,
  TruckStatus.ON_HOLD,
]

/** Statuses that mean a truck is actively at a bay. */
export const AT_BAY_STATUSES: TruckStatus[] = [
  TruckStatus.AT_BAY,
  TruckStatus.LOADING,
  TruckStatus.UNLOADING,
]

/** Visual metadata for every truck status — the ONE place colours are defined. */
export interface StatusMeta {
  label: string
  /** Tailwind classes for a badge (bg + text + ring). */
  badge: string
  /** Solid hex used by charts / map fills. */
  hex: string
}

export const STATUS_META: Record<TruckStatus, StatusMeta> = {
  [TruckStatus.EXPECTED]: {
    label: 'Expected',
    badge: 'bg-slate-100 text-slate-700 ring-slate-200',
    hex: '#94a3b8',
  },
  [TruckStatus.GATE_IN]: {
    label: 'Gate In',
    badge: 'bg-sky-100 text-sky-700 ring-sky-200',
    hex: '#0ea5e9',
  },
  [TruckStatus.SECURITY_CHECK]: {
    label: 'Security Check',
    badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    hex: '#6366f1',
  },
  [TruckStatus.DOC_CLEARED]: {
    label: 'Docs Cleared',
    badge: 'bg-violet-100 text-violet-700 ring-violet-200',
    hex: '#8b5cf6',
  },
  [TruckStatus.IN_YARD_QUEUE]: {
    label: 'In Yard Queue',
    badge: 'bg-amber-100 text-amber-700 ring-amber-200',
    hex: '#f59e0b',
  },
  [TruckStatus.CALLED_TO_BAY]: {
    label: 'Called to Bay',
    badge: 'bg-orange-100 text-orange-700 ring-orange-200',
    hex: '#f97316',
  },
  [TruckStatus.AT_BAY]: {
    label: 'At Bay',
    badge: 'bg-teal-100 text-teal-700 ring-teal-200',
    hex: '#14b8a6',
  },
  [TruckStatus.LOADING]: {
    label: 'Loading',
    badge: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
    hex: '#06b6d4',
  },
  [TruckStatus.UNLOADING]: {
    label: 'Unloading',
    badge: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
    hex: '#0891b2',
  },
  [TruckStatus.COMPLETED]: {
    label: 'Completed',
    badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    hex: '#10b981',
  },
  [TruckStatus.EXIT_CLEARANCE]: {
    label: 'Exit Clearance',
    badge: 'bg-lime-100 text-lime-700 ring-lime-200',
    hex: '#84cc16',
  },
  [TruckStatus.GATE_OUT]: {
    label: 'Gate Out',
    badge: 'bg-green-100 text-green-800 ring-green-200',
    hex: '#22c55e',
  },
  [TruckStatus.ON_HOLD]: {
    label: 'On Hold',
    badge: 'bg-rose-100 text-rose-700 ring-rose-200',
    hex: '#f43f5e',
  },
}

export const BAY_STATUS_META: Record<BayStatus, { label: string; badge: string; hex: string }> = {
  FREE: { label: 'Free', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200', hex: '#10b981' },
  OCCUPIED: { label: 'Occupied', badge: 'bg-cyan-100 text-cyan-700 ring-cyan-200', hex: '#06b6d4' },
  RESERVED: { label: 'Reserved', badge: 'bg-amber-100 text-amber-700 ring-amber-200', hex: '#f59e0b' },
  MAINTENANCE: {
    label: 'Maintenance',
    badge: 'bg-slate-200 text-slate-600 ring-slate-300',
    hex: '#64748b',
  },
}

export const YARD_SLOT_META: Record<
  YardSlotStatus,
  { label: string; hex: string; tile: string }
> = {
  FREE: {
    label: 'Free',
    hex: '#10b981',
    tile: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  },
  OCCUPIED: {
    label: 'Occupied',
    hex: '#06b6d4',
    tile: 'border-cyan-300 bg-cyan-50 text-cyan-700',
  },
  RESERVED: {
    label: 'Reserved',
    hex: '#f59e0b',
    tile: 'border-amber-300 bg-amber-50 text-amber-700',
  },
}

export const PRIORITY_META: Record<Priority, { label: string; badge: string }> = {
  NORMAL: { label: 'Normal', badge: 'bg-slate-100 text-slate-600 ring-slate-200' },
  HIGH: { label: 'High', badge: 'bg-rose-100 text-rose-700 ring-rose-200' },
}

export const SEVERITY_META: Record<InsightSeverity, { label: string; badge: string; hex: string }> = {
  INFO: { label: 'Info', badge: 'bg-sky-100 text-sky-700 ring-sky-200', hex: '#0ea5e9' },
  WARNING: { label: 'Warning', badge: 'bg-amber-100 text-amber-700 ring-amber-200', hex: '#f59e0b' },
  CRITICAL: { label: 'Critical', badge: 'bg-rose-100 text-rose-700 ring-rose-200', hex: '#f43f5e' },
}

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  LR: 'Lorry Receipt (LR)',
  INVOICE: 'Invoice',
  DRIVER_LICENSE: 'Driver License',
  PUC: 'PUC Certificate',
  INSURANCE: 'Insurance',
}

export const DOCUMENT_KINDS: DocumentKind[] = [
  'LR',
  'INVOICE',
  'DRIVER_LICENSE',
  'PUC',
  'INSURANCE',
]

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SECURITY]: 'Security',
  [Role.YARD_KIOSK]: 'Yard Kiosk',
  [Role.BAY_OPERATOR]: 'Bay Operator',
  [Role.MANAGER]: 'Manager',
}

/** Sample transporters, materials, Indian RTO codes for mock data. */
export const TRANSPORTERS = [
  'Sri Balaji Logistics',
  'VRL Roadlines',
  'TCI Freight',
  'Gati Cargo',
  'Safexpress',
  'Rivigo Movers',
  'Delhivery Trucking',
  'Blue Dart Surface',
]

export const MATERIALS = [
  'Steel Coils',
  'Cement Bags',
  'Cotton Bales',
  'Auto Parts',
  'FMCG Goods',
  'Chemical Drums',
  'Textiles',
  'Packaged Food',
  'Machinery',
  'Plastic Granules',
]

export const RTO_CODES = [
  'TN 09',
  'TN 22',
  'KA 05',
  'MH 12',
  'AP 16',
  'GJ 01',
  'DL 08',
  'RJ 14',
  'TS 07',
  'KL 11',
]
