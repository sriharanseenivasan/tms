import { ArrowLeft, ScanLine } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/app/routes'

/** Full-screen tablet shell for the yard kiosk (big touch targets, minimal chrome). */
export function KioskLayout() {
  return (
    <div className="flex h-screen flex-col bg-slate-900 text-white">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
            <ScanLine className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">Yard Kiosk</p>
            <p className="text-sm text-slate-400">Scan &amp; get your token</p>
          </div>
        </div>
        <Link
          to={ROUTES.dashboard}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit kiosk
        </Link>
      </header>
      <main className="flex min-h-0 flex-1 items-center justify-center p-8">
        <Outlet />
      </main>
    </div>
  )
}
