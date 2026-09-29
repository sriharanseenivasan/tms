import { Check } from 'lucide-react'
import { EXIT_CHECK_ITEMS } from '@/features/gate/components/exitChecks'
import { cn } from '@/utils/cn'

interface ExitChecklistProps {
  values: Record<string, boolean>
  onToggle: (key: string) => void
}

/** Exit-clearance checklist toggled before gate-out (Section 5F). */
export function ExitChecklist({ values, onToggle }: ExitChecklistProps) {
  return (
    <ul className="space-y-2">
      {EXIT_CHECK_ITEMS.map((item) => {
        const checked = Boolean(values[item.key])
        return (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onToggle(item.key)}
              aria-pressed={checked}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                checked
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-line bg-panel text-ink hover:bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md border',
                  checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300',
                )}
              >
                {checked && <Check className="h-3.5 w-3.5" />}
              </span>
              {item.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
