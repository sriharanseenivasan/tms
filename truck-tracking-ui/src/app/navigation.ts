import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  ParkingSquare,
  ScanLine,
  Smartphone,
  Sparkles,
  Table2,
  Truck,
  Warehouse,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { ROUTES } from '@/app/routes'
import { Role } from '@/types'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  /** Roles this item is most relevant to (used to group/highlight, not to hide). */
  roles: Role[]
}

/** Desktop sidebar navigation (Section 5). */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Control Tower',
    to: ROUTES.dashboard,
    icon: LayoutDashboard,
    roles: [Role.MANAGER],
  },
  {
    label: 'Bay Control',
    to: ROUTES.bays,
    icon: Warehouse,
    roles: [Role.MANAGER, Role.BAY_OPERATOR],
  },
  {
    label: 'Yard Board',
    to: ROUTES.yardBoard,
    icon: ParkingSquare,
    roles: [Role.MANAGER, Role.YARD_KIOSK],
  },
  {
    label: 'Gate Entry',
    to: ROUTES.gateEntry,
    icon: ClipboardCheck,
    roles: [Role.SECURITY],
  },
  {
    label: 'Gate Exit',
    to: ROUTES.gateExit,
    icon: LogOut,
    roles: [Role.SECURITY],
  },
  {
    label: 'Trucks',
    to: ROUTES.trucks,
    icon: Truck,
    roles: [Role.MANAGER, Role.SECURITY],
  },
  {
    label: 'AI Insights',
    to: ROUTES.insights,
    icon: Sparkles,
    roles: [Role.MANAGER],
  },
  {
    label: 'Reports',
    to: ROUTES.reports,
    icon: Table2,
    roles: [Role.MANAGER],
  },
]

/** Immersive device screens (tablet kiosk, operator phone) — separate layouts. */
export const DEVICE_NAV_ITEMS: NavItem[] = [
  {
    label: 'Yard Kiosk',
    to: ROUTES.kiosk,
    icon: ScanLine,
    roles: [Role.YARD_KIOSK],
  },
  {
    label: 'Operator App',
    to: ROUTES.operator,
    icon: Smartphone,
    roles: [Role.BAY_OPERATOR],
  },
]
