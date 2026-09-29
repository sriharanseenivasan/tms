export interface ExitCheckItem {
  key: string
  label: string
}

/** Exit-clearance checklist items (Section 5F). */
export const EXIT_CHECK_ITEMS: ExitCheckItem[] = [
  { key: 'loading', label: 'Loading / unloading completed' },
  { key: 'docs', label: 'Documents handed over' },
  { key: 'seal', label: 'Vehicle sealed & inspected' },
]
