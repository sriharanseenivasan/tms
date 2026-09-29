import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/utils/cn'

interface QRCardProps {
  value: string
  /** Small caption under the QR (e.g. the QR id). */
  caption?: string
  size?: number
  className?: string
}

/** Renders a QR code with an optional caption. Used on slips and truck details. */
export function QRCard({ value, caption, size = 148, className }: QRCardProps) {
  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className="rounded-lg border border-line bg-white p-3">
        <QRCodeSVG value={value} size={size} level="M" marginSize={0} />
      </div>
      {caption && <span className="font-mono text-xs text-muted">{caption}</span>}
    </div>
  )
}
