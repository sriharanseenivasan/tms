import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ComponentType } from 'react'
import { useToastStore, type ToastVariant } from '@/store/useToastStore'
import { cn } from '@/utils/cn'

const VARIANT_META: Record<
  ToastVariant,
  { icon: ComponentType<{ className?: string }>; accent: string; iconColor: string }
> = {
  success: { icon: CheckCircle2, accent: 'border-l-emerald-500', iconColor: 'text-emerald-500' },
  error: { icon: AlertCircle, accent: 'border-l-rose-500', iconColor: 'text-rose-500' },
  info: { icon: Info, accent: 'border-l-sky-500', iconColor: 'text-sky-500' },
}

/** Global toast viewport — rendered once at the app root. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 print:hidden">
      {toasts.map((t) => {
        const { icon: Icon, accent, iconColor } = VARIANT_META[t.variant]
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 border-line bg-panel p-3 shadow-lg',
              accent,
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="text-slate-400 transition-colors hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
