import { ScanLine, Search, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import type { Truck } from '@/types'

interface ScanModalProps {
  open: boolean
  onClose: () => void
  /** Trucks eligible to be "scanned" in the current context. */
  trucks: Truck[]
  onScan: (truck: Truck) => void
  title?: string
  description?: string
}

/** Stand-in for real QR scanning: pick (or randomly simulate) a truck to scan. */
export function ScanModal({
  open,
  onClose,
  trucks,
  onScan,
  title = 'Simulate QR Scan',
  description = 'Pick the truck whose QR slip is being scanned.',
}: ScanModalProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return trucks
    return trucks.filter(
      (t) =>
        t.regNo.toLowerCase().includes(q) ||
        t.transporter.toLowerCase().includes(q) ||
        t.qrId.toLowerCase().includes(q),
    )
  }, [trucks, query])

  const handleScan = (truck: Truck) => {
    setQuery('')
    onScan(truck)
  }

  const simulateRandom = () => {
    if (filtered.length === 0) return
    handleScan(filtered[Math.floor(Math.random() * filtered.length)])
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        <p className="text-sm text-muted">{description}</p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reg no., transporter or QR id"
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState title="No matching trucks" icon={ScanLine} />
          ) : (
            filtered.map((truck) => (
              <button
                key={truck.id}
                type="button"
                onClick={() => handleScan(truck)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-ink">{truck.regNo}</p>
                  <p className="truncate text-xs text-muted">{truck.transporter}</p>
                </div>
                <StatusBadge status={truck.status} />
              </button>
            ))
          )}
        </div>

        <Button
          variant="secondary"
          className="w-full"
          leftIcon={<Shuffle className="h-4 w-4" />}
          onClick={simulateRandom}
          disabled={filtered.length === 0}
        >
          Simulate random scan
        </Button>
      </div>
    </Modal>
  )
}
