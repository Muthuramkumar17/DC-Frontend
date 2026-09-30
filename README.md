# Bathroom Cleaning Operations — Phase 1

React + MUI implementation of the Enterprise Toilet Cleaning Booking Management System, scoped to the agreed build order:

1. **Customers** — list, create (with first service address + duplicate-mobile check), Customer 360 profile (Overview / Addresses / Bookings / Subscriptions tabs)
2. **Bookings** — list, 3-step new booking wizard with server-calculated pricing, atomic confirmation, booking detail
3. **Subscriptions** — list, detail with immutable period history and per-period visit schedules, renewal

Every other module in the nav (Visits, Payments, Invoices, Reports, Masters, Administration, Settings) is wired into routing and the sidebar but currently shows a "coming up next" placeholder, so the navigation structure matches the full spec even though only the first three modules are built out.

## Stack

React 18 · MUI 6 (+ MUI X DataGrid, MUI X Date Pickers) · React Router 6 · React Hook Form + Zod · TanStack Query · dayjs

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

> **Note on this build:** this project was written in a sandboxed environment with no internet access, so `npm install` / `npm run dev` could not be executed or verified end-to-end before handing it off. Every file was statically checked (JSX/JS syntax, all relative imports resolving, all named imports matching real exports, all hooks and JSX components properly imported) — see "What was verified" below — but a first `npm install && npm run dev` locally may still surface small issues (a prop mismatch, a v6/v7 MUI API edge case) that only show up at runtime. Treat this as a strong first draft to run and iterate on, not a guaranteed zero-bug build.

## Data layer

There is no backend yet. `src/api/db.js` is an in-memory mock database (persisted to `localStorage` so your data survives a refresh) that the `src/api/customers.js`, `bookings.js`, and `subscriptions.js` modules read and write through async functions shaped like real API calls (`await`, thrown errors on invalid state, etc.). This means:

- Swapping in a real backend later is a matter of replacing the bodies of those functions with `fetch`/axios calls — the screens themselves talk to `customers.js` / `bookings.js` / `subscriptions.js`, never to `db.js` directly.
- The **atomic booking confirmation** rule from the spec is implemented in `bookings.js` (`confirmBooking`): payment, invoice, subscription (find-or-create), period, and visits are all created synchronously in one function before a single `saveDb()` call, and a thrown error partway through leaves nothing persisted.
- **Renewals never touch prior periods**: `subscriptions.js` (`renewSubscription`) only ever inserts a new period/booking/payment/invoice/visit set and marks the previous period `Expired` — it never mutates old records.
- Seed data (3 customers with one address each) is created on first run so the app isn't empty.

To wipe local data during testing, run this in the browser console:
```js
localStorage.removeItem('tco_mock_db_v1'); location.reload();
```

## What was verified (statically, without a live build)

- Every `.js`/`.jsx` file parses as valid JS/JSX (esbuild syntax check, 0 errors)
- Every relative import path resolves to a real file, and every named import matches a real named export (esbuild bundle with only third-party packages marked external, 0 warnings)
- Every JSX component tag (`<Foo ... />`) has a matching import or local declaration in its file (custom script, 0 problems)
- Every React/React Query/React Hook Form hook call (`useXxx(...)`) has a matching import in its file (custom script, 0 problems)

What this *doesn't* catch: prop-shape mismatches, incorrect MUI component API usage, and other logic bugs that only a real bundler + browser would surface. If `npm run dev` throws on first run, the error message plus file/line will make it quick to fix.

## Design notes

- Palette is a deep teal ("clean/water", not the generic AI-cream/terracotta default) with amber reserved for money/attention states — see `src/theme.js` for the rationale.
- Business IDs (`CUS-000124`, `BKG-20260911-000014`, `INV/2026-27/000214`, etc.) are rendered in a monospace face everywhere via `EntityLink` and `Money`, since they're the load-bearing content of an ops tool like this.
- `EntityLink` currently only routes for Customer / Booking / Subscription (the built modules); Address/Payment/Invoice/Period/Visit render as styled, copyable text until their detail routes are built in a later phase.

## Next phase

Visits (calendar/today/day/area views + worksheets), Payments, Invoices, Reports, Masters CRUD screens, and Administration (Users/Roles/Audit Logs), per the implementation sequence in the original spec.
# DC-Frontend
