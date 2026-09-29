import { QrCode, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface KioskScanProps {
  onScan: () => void
  eligibleCount: number
}

/** Step 1 — the big "scan your QR" welcome screen. */
export function KioskScan({ onScan, eligibleCount }: KioskScanProps) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-panel p-10 text-center shadow-2xl">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <QrCode className="h-12 w-12" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-ink">Welcome to the Yard</h1>
      <p className="mt-2 text-base text-muted">
        Scan your gate-pass QR to get a parking token and join the queue.
      </p>
      <Button
        size="lg"
        className="mt-8 w-full text-lg"
        leftIcon={<ScanLine className="h-6 w-6" />}
        onClick={onScan}
      >
        Scan my QR
      </Button>
      <p className="mt-4 text-xs text-muted">
        {eligibleCount} truck{eligibleCount === 1 ? '' : 's'} cleared and awaiting yard check-in
      </p>
    </div>
  )
}
