import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/Toaster'
import { useDataStore } from '@/store/useDataStore'

/** App root — loads the demo dataset once, then renders the active layout. */
export function RootLayout() {
  const load = useDataStore((s) => s.load)
  const loaded = useDataStore((s) => s.loaded)

  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}
