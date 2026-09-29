# Database (placeholder — not in scope yet)

This demo is **frontend-only** and uses in-memory mock data. PostgreSQL is not
wired up. When a real backend is added, the schema and migrations live here.

The service contract the UI already depends on is `src/services/api.ts`
(`TruckTrackingApi`). A real implementation would map these entities to tables:

- `trucks` — id, reg_no, transporter, driver_*, type, material, priority, qr_id, status, hold_reason
- `tokens` — id, number, truck_id, fifo_position, issued_at
- `yard_slots` — id, zone, label, status, truck_id
- `bays` — id (1–13), status, current_truck_id, start_time, progress
- `truck_events` — id, truck_id, stage, timestamp, actor, note
- `trips` — historical completed journeys for reporting

A draft `schema.sql` will be added in a later iteration.
