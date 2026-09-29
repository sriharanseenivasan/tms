import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { DesktopLayout } from '@/app/layouts/DesktopLayout'
import { KioskLayout } from '@/app/layouts/KioskLayout'
import { MobileLayout } from '@/app/layouts/MobileLayout'
import { ROUTES } from '@/app/routes'
import { NotFoundPage } from '@/components/NotFoundPage'
import { BayBoardPage } from '@/features/bays/BayBoardPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { GateEntryPage } from '@/features/gate/GateEntryPage'
import { GateExitPage } from '@/features/gate/GateExitPage'
import { InsightsPage } from '@/features/insights/InsightsPage'
import { OperatorPage } from '@/features/operator/OperatorPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { TruckDetailPage } from '@/features/trucks/TruckDetailPage'
import { TruckListPage } from '@/features/trucks/TruckListPage'
import { YardBoardPage } from '@/features/yard/YardBoardPage'
import { YardKioskPage } from '@/features/yard/YardKioskPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
      {
        element: <DesktopLayout />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.bays, element: <BayBoardPage /> },
          { path: ROUTES.yardBoard, element: <YardBoardPage /> },
          { path: ROUTES.gateEntry, element: <GateEntryPage /> },
          { path: ROUTES.gateExit, element: <GateExitPage /> },
          { path: ROUTES.trucks, element: <TruckListPage /> },
          { path: ROUTES.truckDetail(), element: <TruckDetailPage /> },
          { path: ROUTES.insights, element: <InsightsPage /> },
          { path: ROUTES.reports, element: <ReportsPage /> },
        ],
      },
      {
        element: <KioskLayout />,
        children: [{ path: ROUTES.kiosk, element: <YardKioskPage /> }],
      },
      {
        element: <MobileLayout />,
        children: [{ path: ROUTES.operator, element: <OperatorPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
