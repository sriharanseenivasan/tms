# Architecture

A UI-only demo for **Smart Truck Tracking & Yard/Bay Management**. Everything is
driven by realistic mock data; there is **no backend, database or real AI/SMS**.

## Folder purpose

```
src/
├── app/                 # router, routes registry, navigation, layouts
│   └── layouts/         # DesktopLayout, KioskLayout, MobileLayout
├── features/            # one folder per domain area (screens live here)
│   ├── auth/            # mock role switcher
│   ├── gate/            # gate-in, doc clearance, QR slip, gate-out
│   ├── yard/            # kiosk scan, FIFO queue, yard map
│   ├── bays/            # bay board, call-next, assign
│   ├── operator/        # mobile scan: start/complete loading
│   ├── trucks/          # truck list + detail / journey timeline
│   ├── dashboard/       # control tower KPIs
│   ├── insights/        # AI insights & bottleneck cards
│   └── reports/         # TAT reports, filters, export
├── components/          # shared, reusable UI
├── services/            # data contract + mock implementation (ONLY data source)
│   ├── api.ts           # TruckTrackingApi interface
│   ├── mock/            # mockApi.ts, seed.ts, simulator.ts
│   └── index.ts         # exports the active implementation
├── store/               # zustand stores (auth role, demo data)
├── types/               # domain types & status lifecycle
├── utils/               # constants (status colours), formatters, TAT calculators
└── styles/              # global Tailwind stylesheet
```

## Data flow

Components → `store/` (zustand) → `services/index.ts` → `services/mock/mockApi.ts`.
Components **never** import mock data or seed files directly. All service methods
are `async` with a small artificial latency so loading states behave realistically.

## Where a real backend plugs in

- **`src/services/api.ts`** is the single contract. To go live, add an
  `httpApi.ts` implementing `TruckTrackingApi` (fetch/axios against the REST API)
  and switch `src/services/index.ts` based on `VITE_USE_MOCK`.
- **Database:** map the entities in `src/types` to PostgreSQL tables (see
  `db/README.md`). No UI code changes are required.
- **Auth:** `store/useAuthStore.ts` is a mock role switcher. Real authentication
  would replace it and gate routes/actions by role.
- **AI / SMS / WhatsApp:** insights and notifications are mocked. Real
  integrations slot in behind the same service layer.

## Status lifecycle

`EXPECTED → GATE_IN → SECURITY_CHECK → DOC_CLEARED → IN_YARD_QUEUE → CALLED_TO_BAY
→ AT_BAY → LOADING/UNLOADING → COMPLETED → EXIT_CLEARANCE → GATE_OUT`, plus a
transient `ON_HOLD`. Defined once in `src/types/index.ts`; colours in
`src/utils/constants.ts`.
