import { TruckStatus, type Truck } from '@/types'

/** Human-readable current location for a truck, derived from status + bay. */
export function truckLocation(truck: Truck): string {
  switch (truck.status) {
    case TruckStatus.EXPECTED:
      return 'Pre-registered'
    case TruckStatus.GATE_IN:
    case TruckStatus.SECURITY_CHECK:
    case TruckStatus.DOC_CLEARED:
      return 'Gate'
    case TruckStatus.IN_YARD_QUEUE:
      return 'Yard'
    case TruckStatus.CALLED_TO_BAY:
    case TruckStatus.AT_BAY:
    case TruckStatus.LOADING:
    case TruckStatus.UNLOADING:
    case TruckStatus.COMPLETED:
      return truck.bayId != null ? `Bay ${truck.bayId}` : 'Bay area'
    case TruckStatus.EXIT_CLEARANCE:
      return 'Exit gate'
    case TruckStatus.GATE_OUT:
      return 'Departed'
    case TruckStatus.ON_HOLD:
      return 'On hold'
    default:
      return '—'
  }
}
