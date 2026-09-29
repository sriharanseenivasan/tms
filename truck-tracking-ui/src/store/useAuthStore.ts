import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role } from '@/types'

interface AuthState {
  role: Role
  setRole: (role: Role) => void
}

/** Mock auth — just a role switcher for the demo (no real authentication). */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: Role.MANAGER,
      setRole: (role) => set({ role }),
    }),
    { name: 'tms-role' },
  ),
)
