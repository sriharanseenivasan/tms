import { Printer, Truck as TruckIcon } from 'lucide-react'
import { QRCard } from '@/components/QRCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import type { Truck } from '@/types'
import { formatDateTime } from '@/utils/formatters'

interface QrSlipProps {
  truck: Truck
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}

/** Printable gate-pass slip shown after a successful gate entry. */
export function QrSlip({ truck }: QrSlipProps) {
  return (
    <div>
      <div className="print-slip rounded-xl border border-dashed border-slate-300 bg-white p-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <TruckIcon className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Gate Pass Slip</p>
              <p className="text-[11px] text-muted">Smart Truck Tracking</p>
            </div>
          </div>
          <StatusBadge status={truck.status} />
        </div>

        <div className="flex flex-col items-center gap-3 py-4">
          <QRCard value={truck.qrId} caption={truck.qrId} size={132} />
        </div>

        <div className="divide-y divide-line border-t border-line">
          <Row label="Pass / QR ID" value={truck.qrId} />
          <Row label="Truck No." value={truck.regNo} />
          <Row label="Transporter" value={truck.transporter} />
          <Row label="Driver" value={truck.driver.name} />
          <Row label="Material" value={truck.material} />
          <Row label="Type" value={truck.type} />
          <Row label="Date / Time" value={formatDateTime(truck.updatedAt)} />
        </div>

        <p className="mt-3 text-center text-[11px] text-muted">
          Keep this slip visible. Scan the QR at the yard kiosk to get your token.
        </p>
      </div>

      <Button
        className="mt-4 w-full print:hidden"
        leftIcon={<Printer className="h-4 w-4" />}
        onClick={() => window.print()}
      >
        Print slip
      </Button>
    </div>
  )
}
