import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="text-lg font-semibold text-ink">Page not found</h1>
      <Link
        to={ROUTES.dashboard}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to Control Tower
      </Link>
    </div>
  )
}
