import { ArrowLeft, Smartphone } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/app/routes'

/** Narrow phone-style shell for the bay operator app, centred on wide screens. */
export function MobileLayout() {
  return (
    <div className="flex min-h-screen justify-center bg-slate-100 py-6">
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-xl">
        <header className="flex items-center justify-between gap-2 bg-brand-600 px-4 py-4 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Operator App</p>
              <p className="text-xs text-brand-100">Bay scanning</p>
            </div>
          </div>
          <Link
            to={ROUTES.dashboard}
            className="flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs font-medium hover:bg-white/25"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit
          </Link>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
