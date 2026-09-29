import { Check, X } from 'lucide-react'
import type { DocumentStatus, TruckDocument } from '@/types'
import { DOCUMENT_LABELS } from '@/utils/constants'
import { cn } from '@/utils/cn'

interface DocumentChecklistProps {
  documents: TruckDocument[]
  onChange: (documents: TruckDocument[]) => void
}

/** Per-document Verified / Rejected toggle (Section 5A). */
export function DocumentChecklist({ documents, onChange }: DocumentChecklistProps) {
  const setStatus = (index: number, status: DocumentStatus) => {
    onChange(
      documents.map((doc, i) =>
        i === index ? { ...doc, status: doc.status === status ? 'PENDING' : status } : doc,
      ),
    )
  }

  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      {documents.map((doc, index) => (
        <li key={doc.kind} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <span className="text-sm text-ink">{DOCUMENT_LABELS[doc.kind]}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatus(index, 'VERIFIED')}
              aria-pressed={doc.status === 'VERIFIED'}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
                doc.status === 'VERIFIED'
                  ? 'bg-emerald-500 text-white ring-emerald-500'
                  : 'bg-panel text-slate-500 ring-line hover:bg-emerald-50',
              )}
            >
              <Check className="h-3.5 w-3.5" />
              Verified
            </button>
            <button
              type="button"
              onClick={() => setStatus(index, 'REJECTED')}
              aria-pressed={doc.status === 'REJECTED'}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors',
                doc.status === 'REJECTED'
                  ? 'bg-rose-500 text-white ring-rose-500'
                  : 'bg-panel text-slate-500 ring-line hover:bg-rose-50',
              )}
            >
              <X className="h-3.5 w-3.5" />
              Rejected
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
