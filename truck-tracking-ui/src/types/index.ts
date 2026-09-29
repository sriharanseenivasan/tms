/**
 * Domain types & status lifecycle — single source of truth for the app.
 * Kept free of runtime `enum` so the file is fully type-erasable.
 */

/** Full truck status lifecycle (Section 4 of the spec). */
export const TruckStatus = {
  EXPECTED: 'EXPECTED',
  GATE_IN: 'GATE_IN',
  SECURITY_CHECK: 'SECURITY_CHECK',
  DOC_CLEARED: 'DOC_CLEARED',
  IN_YARD_QUEUE: 'IN_YARD_QUEUE',
  CALLED_TO_BAY: 'CALLED_TO_BAY',
  AT_BAY: 'AT_BAY',
  LOADING: 'LOADING',
  UNLOADING: 'UNLOADING',
  COMPLETED: 'COMPLETED',
  EXIT_CLEARANCE: 'EXIT_CLEARANCE',
  GATE_OUT: 'GATE_OUT',
  ON_HOLD: 'ON_HOLD',
} as const

export type TruckStatus = (typeof TruckStatus)[keyof typeof TruckStatus]

/** Ordered stages a truck passes through (excludes ON_HOLD which is transient). */
export const STATUS_ORDER: TruckStatus[] = [
  TruckStatus.EXPECTED,
  TruckStatus.GATE_IN,
  TruckStatus.SECURITY_CHECK,
  TruckStatus.DOC_CLEARED,
  TruckStatus.IN_YARD_QUEUE,
  TruckStatus.CALLED_TO_BAY,
  TruckStatus.AT_BAY,
  TruckStatus.LOADING,
  TruckStatus.COMPLETED,
  TruckStatus.EXIT_CLEARANCE,
  TruckStatus.GATE_OUT,
]

export type TruckType = 'INBOUND' | 'OUTBOUND'
export type Priority = 'NORMAL' | 'HIGH'

export interface Driver {
  name: string
  phone: string
  license: string
}

export type DocumentKind = 'LR' | 'INVOICE' | 'DRIVER_LICENSE' | 'PUC' | 'INSURANCE'
export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface TruckDocument {
  kind: DocumentKind
  status: DocumentStatus
}

export interface Truck {
  id: string
  regNo: string
  transporter: string
  driver: Driver
  type: TruckType
  material: string
  priority: Priority
  qrId: string
  status: TruckStatus
  holdReason?: string
  documents: TruckDocument[]
  tokenId?: string
  yardSlotId?: string
  bayId?: number
  createdAt: string
  updatedAt: string
}

export interface Token {
  id: string
  number: string
  truckId: string
  fifoPosition: number
  issuedAt: string
}

export type YardZone = 'A' | 'B' | 'C'
export type YardSlotStatus = 'FREE' | 'OCCUPIED' | 'RESERVED'

export interface YardSlot {
  id: string
  zone: YardZone
  label: string
  status: YardSlotStatus
  truckId?: string
}

export type BayStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'

export interface Bay {
  id: number
  status: BayStatus
  currentTruckId?: string
  startTime?: string
  progress: number
}

/** A single event on a truck's journey — powers TAT & waiting-time calculations. */
export interface TruckEvent {
  id: string
  truckId: string
  stage: TruckStatus
  timestamp: string
  actor: string
  note?: string
}

export type InsightSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type InsightKind = 'BOTTLENECK' | 'ANOMALY' | 'PREDICTION' | 'RECOMMENDATION'

export interface Insight {
  id: string
  kind: InsightKind
  severity: InsightSeverity
  title: string
  detail: string
  recommendation?: string
}

/** Historical completed trip — used for 7-day trends & reports. */
export interface TripRecord {
  id: string
  truckId: string
  regNo: string
  transporter: string
  material: string
  type: TruckType
  bayId: number
  date: string
  gateInAt: string
  gateOutAt: string
  yardWaitMin: number
  bayTimeMin: number
  totalTatMin: number
}

/** Roles for the demo role switcher (Section 5). */
export const Role = {
  SECURITY: 'SECURITY',
  YARD_KIOSK: 'YARD_KIOSK',
  BAY_OPERATOR: 'BAY_OPERATOR',
  MANAGER: 'MANAGER',
} as const

export type Role = (typeof Role)[keyof typeof Role]
