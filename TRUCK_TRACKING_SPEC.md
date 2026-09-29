# Task: Build a UI-only demo app for "Smart Truck Tracking & Yard/Bay Management" (React + mock data)

## 1. Context

A factory handles ~50 trucks/day with 13 loading/unloading bays. Trucks pass through: Security → Parking Yard → Bay → Exit. We need a CLIENT DEMO that shows real-time visibility of every truck's journey using QR-code tracking, plus an AI insights layer.

**THIS IS FRONTEND ONLY.** No backend, no real DB, no real AI/SMS calls. Everything is driven by realistic mock data and simulated behavior. Design the code so a real API and PostgreSQL can be plugged in later by replacing the service layer only.

### Business problem (for reference)

- ~50 trucks in/out of the factory daily, ~13 loading/unloading bays
- Multiple touchpoints: security, parking, loading/unloading, exit clearance
- Need real-time visibility of: entry/gate-in status, security & document clearance, parking yard location and waiting time, bay allocation and occupancy, loading/unloading progress, turnaround time (TAT), exit clearance/gate-out, dashboards and reports

### Proposed solution flow

1. **QR-code based intelligent tracking** with an AI layer giving business insights and bottleneck detection.
2. **Step 1 – Gate entry:** capture truck and driver document info (reuse if already available). A unique QR code is generated and used to trace the truck inside the campus. Physical QR slips are issued.
3. **Step 2 – Yard management:** on reaching the yard, the driver scans the QR at a kiosk and either picks a parking slot (if physically marked) or confirms they are in the parking queue. Captured for FIFO (token system).
4. **Step 3 – Bay management:** the operator sees in real time which bays are loading and which are empty, and plans the queue. Driver is notified via SMS/WhatsApp and on a display to call the next truck, based on ticket queue or priority.
5. **Step 4 – Start loading:** at the bay, the operator scans the QR to start loading/unloading.
6. **Step 5 – Complete loading:** the operator scans the QR to confirm completion.
7. **Step 6 – Next station / exit:** the truck goes to the next station if there is one, otherwise back to the gate, where scanning the QR marks the exit.

Notes:
- All data feeds average lead time and other key metrics.
- Physical QR slips are issued.
- Kiosk at the parking area for drivers to scan and get a token.
- Mobile app scanning for operators to start/complete loading.
- AI on top for insights and a KPI-driven dashboard.

---

## 2. Tech stack

- React 18 + Vite + TypeScript
- React Router v6
- Tailwind CSS + shadcn/ui (or Radix) for components; lucide-react for icons
- Recharts for charts
- Zustand for global state (trucks, bays, yard, notifications)
- qrcode.react for QR generation; a "Simulate Scan" button/modal in place of real scanning (optionally html5-qrcode behind a feature flag)
- date-fns, @faker-js/faker for mock data
- ESLint + Prettier, absolute imports via `@/`
- PostgreSQL: **not in scope now** (placeholder only)
- Responsive: desktop for control tower/dashboard; tablet layout for yard kiosk; mobile layout for bay operator app

---

## 3. Project structure (create from scratch)

```
truck-tracking-ui/
├── public/
├── src/
│   ├── app/                  # router, providers, layouts
│   │   ├── router.tsx
│   │   └── layouts/ (DesktopLayout, KioskLayout, MobileLayout)
│   ├── features/
│   │   ├── auth/             # mock role switcher (Security, Yard Kiosk, Bay Operator, Manager)
│   │   ├── gate/             # gate-in, doc clearance, QR slip, gate-out
│   │   ├── yard/             # kiosk scan, token/FIFO queue, yard map
│   │   ├── bays/             # bay board, call-next, assign
│   │   ├── operator/         # mobile scan: start/complete loading
│   │   ├── trucks/           # truck list, truck detail + journey timeline
│   │   ├── dashboard/        # control tower KPIs
│   │   ├── insights/         # AI insights & bottleneck cards
│   │   └── reports/          # TAT reports, filters, export (mock CSV)
│   ├── components/           # shared UI (StatusBadge, QRCard, Timeline, KpiCard, ScanModal, DataTable)
│   ├── services/             # API abstraction – ONLY place that touches mock data
│   │   ├── api.ts            # interface definitions
│   │   ├── mock/             # mockApi.ts, seed data, live simulator
│   │   └── index.ts          # exports active implementation (mock now, http later)
│   ├── store/                # zustand stores
│   ├── types/                # domain types (Truck, Bay, YardSlot, Token, TruckEvent, Insight...)
│   ├── hooks/
│   ├── utils/                # tat calculators, formatters, constants
│   ├── styles/
│   └── main.tsx
├── db/                       # placeholder for later
│   └── README.md             # note: PostgreSQL schema to be added; include draft schema.sql if time permits
├── docs/
│   └── ARCHITECTURE.md       # folder purpose, how to swap mock → real API
├── .env.example              # VITE_USE_MOCK=true
└── README.md                 # setup, run, demo script
```

---

## 4. Domain model & status lifecycle

Truck status flow (single source of truth, use an enum):

`EXPECTED → GATE_IN → SECURITY_CHECK → DOC_CLEARED → IN_YARD_QUEUE → CALLED_TO_BAY → AT_BAY → LOADING/UNLOADING → COMPLETED → EXIT_CLEARANCE → GATE_OUT`

Also support `ON_HOLD` with a reason (e.g. "Document mismatch").

Key entities:
- **Truck:** id, regNo, transporter, driver name/phone/license, type (INBOUND/OUTBOUND), material, priority (NORMAL/HIGH), QR id
- **Token:** number, FIFO position
- **YardSlot:** id, zone, status
- **Bay:** id 1–13, status (FREE/OCCUPIED/RESERVED/MAINTENANCE), current truck, start time, progress %
- **TruckEvent:** truckId, stage, timestamp, actor — used to compute waiting time and TAT per stage

---

## 5. Screens to build (role-based nav via a mock role switcher in the header)

### A. Gate Entry (Security role, desktop/tablet)
- Form to capture truck + driver + document details; "Pre-registered trucks" lookup that auto-fills data
- Document checklist (LR, Invoice, Driver License, PUC, Insurance) with Verified/Rejected toggle
- On approval → generate unique QR + printable slip preview (token no., truck no., date/time, QR) with a Print button
- Gate-in / clearance status list

### B. Yard Kiosk (tablet, big touch UI)
- "Scan your QR" screen (Simulate Scan → pick a truck)
- Option 1: choose a parking slot from a visual yard map; Option 2: "Confirm I'm in queue"
- Shows token number, queue position, estimated wait; large fonts, minimal steps

### C. Yard Board (desktop)
- Yard map (slots coloured by state) + FIFO queue table with waiting time, priority flag, and ability for a manager to bump priority

### D. Bay Control Board (desktop, main demo screen)
- Grid of 13 bays with live status, truck no., elapsed time, progress bar, colour-coded
- Queue panel on the side: next trucks (FIFO or priority mode toggle)
- "Call next truck" → assigns to a free bay, shows a mock SMS/WhatsApp toast + message preview
- "Display board" mode (full-screen TV view: "Now calling: TN-XX-1234 → Bay 5")

### E. Operator Mobile App (mobile layout)
- Bay selection, "Scan QR to START loading/unloading", live timer, "Scan QR to COMPLETE", then "Send to next station / Send to exit"
- Use the Simulate Scan modal

### F. Gate Exit
- Scan QR → exit clearance checklist (loading completed, docs handed over) → gate-out confirmation showing total TAT

### G. Control Tower Dashboard (desktop)
- KPI cards: trucks inside plant, in yard, at bays, completed today, avg TAT, avg yard wait, bay utilization %, on-hold count
- Charts: hourly truck inflow, TAT by stage (stacked bar), bay utilization per bay, TAT trend (7 days), inbound vs outbound split
- Live "Trucks in plant" table with status badges and filters

### H. Truck Detail
- Journey timeline (each stage with timestamp and duration), QR, driver/doc details, current location

### I. AI Insights (highlight for the demo)
- Mocked but realistic insight cards, e.g.:
  - "Bay 7 has 32% higher avg loading time than others"
  - "Yard wait peaks 10–12 AM — suggest staggering arrivals"
  - "Transporter X has 3× doc-rejection rate"
  - "Predicted TAT for the next truck: 84 min"
  - "Bottleneck: security doc verification (avg 14 min)"
- Bottleneck heatmap (stage × hour), anomaly alerts, recommended actions with severity tags
- Simple "Ask AI" chat box with 4–5 canned questions and pre-written answers (no real API)

### J. Reports
- Filters (date range, bay, transporter, material, type); TAT report table; charts; "Export CSV" (client-side mock)

---

## 6. Mock data & simulation

- Seed ~50 trucks for today spread across all statuses, plus 7 days of historical completed trips for trends
- Use realistic Indian truck numbers (e.g. `TN 09 AB 1234`), transporters, materials, driver names
- 13 bays, ~25 yard slots across zones A/B/C
- Live simulator (`setInterval`, togglable) that occasionally advances trucks through stages and updates bays so the demo looks real-time; add a "Reset demo data" button
- All data access goes through `services/` (async functions with small artificial delays), never imported directly in components

---

## 7. UX & quality requirements

- Clean, professional industrial-enterprise look; status colours consistent everywhere (defined in one constants file); dark mode optional
- Loading skeletons, empty states, toasts for actions
- Left sidebar navigation for desktop; role switcher for demo purposes
- Accessible, keyboard-friendly, no console errors or TypeScript errors
- Keep components small and typed; no business logic inside JSX-heavy files

---

## 8. Deliverables & phased approach

Work in phases and **pause after each phase for review**:

1. Scaffold project, tooling, folder structure, types, routing, layouts, mock services and seed data
2. Shared components + Gate Entry + QR slip
3. Yard kiosk + Yard board
4. Bay board + Operator mobile + Gate exit
5. Dashboard + Truck detail + Reports
6. AI Insights + live simulator + README with a step-by-step demo script (recommended click path for the client walkthrough)

**Do NOT** implement a real backend, authentication, or database. Mention in `ARCHITECTURE.md` where those would plug in.

---

## 9. Open question

The original flow skipped "Step #5" (went from #4 to #6). Treated here as one continuous flow. Confirm whether an intermediate station (e.g. weighbridge) should be added.
