# Smart Truck Tracking & Yard/Bay Management — UI Demo

A **frontend-only** demo of QR-based truck tracking through a factory:
Security → Parking Yard → Bay → Exit, with a control-tower dashboard and an AI
insights layer. Everything runs on realistic **mock data** — no backend, no
database, no real AI/SMS. The service layer is designed so a real API and
PostgreSQL can be plugged in later without touching the UI.

## Tech stack

React 19 + Vite + TypeScript · React Router v6 · Tailwind CSS · Zustand ·
Recharts · lucide-react · qrcode.react · date-fns · @faker-js/faker.

## Getting started

```bash
cd truck-tracking-ui
npm install
cp .env.example .env   # optional; defaults to mock data
npm run dev
```

Open the printed local URL. Data is seeded automatically (~50 trucks for today +
7 days of history). Use **Reset demo data** in the header to reseed.

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

## Project layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full folder guide and
where a real backend/database would plug in.

## Build phases

1. **✅ Scaffold** — tooling, folder structure, types, routing, layouts, mock
   services and seed data.
2. **✅ Shared components** + Gate Entry + QR slip.
3. **✅ Yard kiosk** + Yard board.
4. **✅ Bay board** + Operator mobile + Gate exit.
5. **✅ Dashboard** + Truck detail + Reports.
6. **✅ AI Insights** + live simulator + demo script.

All six phases are complete.

## Demo script (client walkthrough)

A recommended ~5-minute click path. Use the header **Role** switcher to play each
persona and **Go live** to make boards update in real time. **Reset demo data**
restores the seeded starting point at any time.

1. **Control Tower** (Manager) — open the dashboard. Point out the KPI row
   (trucks inside plant, avg TAT, bay utilization, on-hold) and the charts
   (hourly inflow, TAT by stage, bay utilization, 7-day trend, inbound/outbound).
   Click **Go live** in the header so the numbers start moving.
2. **Gate Entry** (Security) — switch role to *Security*. Use **Pre-registered
   truck lookup** to auto-fill a truck, verify the documents, then **Approve &
   generate QR** to produce a printable gate-pass slip. Try rejecting one
   document to see a truck put **On hold**.
3. **Yard Kiosk** (Yard Kiosk) — open *Device screens → Yard Kiosk*. Tap **Scan
   my QR**, pick a cleared truck, choose a parking slot (or *I'm in the queue*)
   and show the issued **token** with queue position and estimated wait.
4. **Yard Board** (Manager) — view the yard map and FIFO queue. **Bump** a truck
   to high priority and watch it jump ahead in the queue.
5. **Bay Control Board** (Manager) — the main screen. Toggle **FIFO / Priority**,
   press **Call next truck** to assign a bay (note the WhatsApp/SMS preview and
   toast), then open **Display board** for the full-screen TV calling view.
6. **Operator App** (Bay Operator) — open *Device screens → Operator App*. Pick a
   called bay, **Scan QR to start**, watch the live timer, **Scan QR to
   complete**, then **Send to exit**.
7. **Gate Exit** (Security) — **Scan QR**, tick the exit-clearance checklist and
   **Confirm gate-out** to see the truck's total turnaround time.
8. **Truck Detail** — from **Trucks**, open any row to show the full journey
   timeline, QR, driver/document details and current location.
9. **AI Insights** — finish on the insights screen: bottleneck & anomaly cards
   with recommendations, the stage × hour **bottleneck heatmap**, and the
   **Ask AI** box (click a suggested question for an instant answer).
10. **Reports** — filter the TAT report by date/bay/transporter and click
    **Export CSV** to download the filtered data.

