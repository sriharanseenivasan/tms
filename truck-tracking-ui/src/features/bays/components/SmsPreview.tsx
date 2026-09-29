import { MessageSquare } from 'lucide-react'
import type { Bay, Token, Truck } from '@/types'

interface SmsPreviewProps {
  truck: Truck
  bay: Bay
  token?: Token
}

/** Mock WhatsApp/SMS message preview shown after calling a truck. */
export function SmsPreview({ truck, bay, token }: SmsPreviewProps) {
  const action = truck.type === 'INBOUND' ? 'unloading' : 'loading'
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <MessageSquare className="h-3.5 w-3.5" />
        WhatsApp sent to {truck.driver.phone}
      </div>
      <div className="mt-2 rounded-lg rounded-tl-none bg-white p-3 text-sm text-ink shadow-sm">
        <p>
          🚛 <span className="font-semibold">{truck.regNo}</span> — please proceed to{' '}
          <span className="font-semibold">Bay {bay.id}</span> for {action}.
        </p>
        {token && <p className="mt-1 text-xs text-muted">Token {token.number}</p>}
      </div>
    </div>
  )
}
