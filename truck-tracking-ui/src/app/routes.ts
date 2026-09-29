/** Central route path registry — referenced by the router and navigation. */
export const ROUTES = {
  dashboard: '/dashboard',
  trucks: '/trucks',
  truckDetail: (id = ':id') => `/trucks/${id}`,
  gateEntry: '/gate/entry',
  gateExit: '/gate/exit',
  yardBoard: '/yard/board',
  bays: '/bays',
  insights: '/insights',
  reports: '/reports',
  kiosk: '/kiosk',
  operator: '/operator',
} as const
