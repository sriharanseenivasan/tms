import { UserCog } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Role } from '@/types'
import { ROLE_LABELS } from '@/utils/constants'

/** Demo-only role switcher shown in the header (Section 5). */
export function RoleSwitcher() {
  const role = useAuthStore((s) => s.role)
  const setRole = useAuthStore((s) => s.setRole)

  return (
    <label className="flex items-center gap-2 text-sm">
      <UserCog className="h-4 w-4 text-muted" />
      <span className="hidden font-medium text-muted sm:inline">Role</span>
      <select
        aria-label="Switch demo role"
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="rounded-md border border-line bg-panel px-2 py-1.5 text-sm font-medium text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {Object.values(Role).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </label>
  )
}
