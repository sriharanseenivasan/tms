import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  phase: number
}

/**
 * Temporary stub for screens delivered in later phases. Establishes routing and
 * layout wiring in Phase 1; each is replaced by the real screen in its phase.
 */
export function PlaceholderPage({ title, description, phase }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Construction className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="max-w-md text-sm text-muted">{description}</p>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
        Arrives in Phase {phase}
      </span>
    </div>
  )
}
