import { RotateCcw, Truck, Radio } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { DEVICE_NAV_ITEMS, NAV_ITEMS } from '@/app/navigation'
import { RoleSwitcher } from '@/features/auth/RoleSwitcher'
import { useDataStore } from '@/store/useDataStore'
import { cn } from '@/utils/cn'

/** Desktop control-tower shell: fixed sidebar + top bar + scrollable content. */
export function DesktopLayout() {
  const reset = useDataStore((s) => s.reset)
  const loading = useDataStore((s) => s.loading)
  const simRunning = useDataStore((s) => s.simRunning)
  const toggleSim = useDataStore((s) => s.toggleSim)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-panel">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">Smart Truck</p>
            <p className="text-xs text-muted">Yard &amp; Bay Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}

          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Device screens
          </p>
          {DEVICE_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-ink',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3 text-xs text-muted">
          <p className="px-2">UI demo · mock data only</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-panel px-6 py-3">
          <h2 className="text-sm font-medium text-muted">
            Control Tower &middot; Live Demo
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSim}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium shadow-sm transition-colors',
                simRunning
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-line bg-panel text-slate-600 hover:bg-slate-50',
              )}
            >
              <Radio className={cn('h-4 w-4', simRunning && 'animate-pulse text-emerald-500')} />
              <span className="hidden sm:inline">{simRunning ? 'Live · on' : 'Go live'}</span>
            </button>
            <button
              type="button"
              onClick={() => void reset()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset demo data</span>
            </button>
            <RoleSwitcher />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
