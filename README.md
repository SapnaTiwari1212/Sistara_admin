# SISTARA Admin — Zero Fault

Staff panel for the [SISTARA](https://github.com/SapnaTiwari1212/Sistara) student
creative studio. Staff sign in and manage customer orders: filter, search, view
the full order detail (quote snapshot, files, status history) and move orders
through their statuses.

Built with the **same stack and pastel design language** as the customer site:
**React 18 + Vite 6 + Tailwind CSS 3 + React Router 6 + Framer Motion**.

---

## Quick start

```bash
npm install
npm run dev
```

Then open **<http://localhost:5173/>** and sign in with the demo credentials
shown on the login screen (also below).

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start the dev server on port 5173 (hot reload)     |
| `npm run build`    | Production build into `dist/`                      |
| `npm run preview`  | Serve the production build locally                 |
| `npm run lint`     | ESLint over the whole project                      |
| `npm test`         | Order filter/sort/stats unit tests (plain Node)    |

Requires **Node 18+**.

### Demo staff account

| Email            | Password     |
| ---------------- | ------------ |
| `admin@sistara.in` | `Sistara@2026` |

These are **shared demo credentials** defined in `src/config/adminConfig.js` —
never real accounts. A real deployment checks `profiles.role = 'admin'`
server-side (see `sql/schema.sql`), so no credentials ever live in a repo.

---

## Project structure

```
sql/
  schema.sql              Supabase tables, indexes, admin_orders view + RLS
src/
  config/
    adminConfig.js         brand, staff accounts, statuses + badge styles
    services.js            read-only mirror of the customer service catalogue
  lib/
    env.js                 reads VITE_* variables
    orderFilters.js        pure filter / sort / stats helpers (unit-tested)
    storage.js             namespaced localStorage (prefix sistara-admin:)
    utils.js               formatting, cn(), ids
  services/
    adminAuthService.js    staff sign-in → swap for Supabase auth
    adminOrderService.js   orders CRUD → swap for your API / Supabase
    mock/
      seedOrders.js        deterministic ~34-order demo dataset
  context/
    AdminAuthContext.jsx   current staff user, sign-in/out
    OrdersContext.jsx      order list + filter state, optimistic status updates
  components/
    layout/  orders/  ui/
  pages/                   Login, Orders, OrderDetail, NotFound
test/
  orderFilters.test.mjs    pure-Node tests, same style as the customer app
```

### Data flow

```
page  →  context  →  service  →  storage (localStorage in demo mode)
```

Every service exposes the same signatures it will keep when a real backend is
wired in, so screens do not change — only the service method bodies do.

---

## Order record

An admin order mirrors the customer app's record (id, service, quantity,
`amount` + immutable `price` snapshot, requirements/references file metadata,
instructions, deadline, status, payment fields) plus denormalised
`customerName` / `customerEmail` for display. The abuse-free pattern from the
customer app is preserved here:

1. **`amount` is the only payable figure.** It is computed once at order
   creation; `price` is an immutable snapshot. The admin never re-derives or
   double-charges it.
2. **A relaxed deadline is a negative `rush`**, rendered as a
   "Relaxed-rate saving" line in the quote breakdown on the detail page.

Statuses are the same five the customer site shows:
`Pending → Confirmed → In Progress → Ready → Completed`.

---

## Status management

The admin may set **any status from any other**, each behind a confirm dialog
naming the `Old → New` transition. Every change is recorded in the order's
`statusHistory` (newest first). Opt-in and confirmed, so a misclick can't move
a customer's job.

---

## Demo behaviour

| Area    | Demo implementation                                                     | Going live                                                                   |
| ------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Auth    | Shared staff account checked against `adminConfig.staffAccounts`         | `adminAuthService` → Supabase `signInWithPassword` + `profiles.role = 'admin'` |
| Orders  | Seeded once into localStorage (`sistara-admin:orders`), edited in place  | `adminOrderService` → `admin_orders` view / `orders` table                    |
| Status  | Optimistic update with rollback on error, `statusHistory` recorded      | Same UI, server `update order set status…`                                    |

Demo data is namespaced under `sistara-admin:*` in localStorage — clear those
keys to reseed. The customer app uses its own `sistara:*` namespace, so the two
never collide.

---

## Connecting Supabase

1. Apply `sql/schema.sql` to the same Supabase project as the customer app.
2. Copy `.env.example` to `.env` in this app (and the customer app) and set
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. Swap the bodies of `adminAuthService.js` and `adminOrderService.js` for the
   Supabase calls noted in their headers and in `sql/schema.sql`.

| Variable                 | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                     |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key               |

No secrets belong in `.env` — only public (`VITE_`) variables may ever reach
the browser.

---

## Accessibility & responsiveness

- Mirrors the customer app: pastel brand palette, Baloo 2 / Quicksand, rounded
  surfaces, focus-visible rings, labelled form fields.
- Desktop = table with sortable headers; mobile = stacked order cards with the
  same inline status control.
- Status is never conveyed by colour alone — every badge has a label.
- The nav collapses to a slide-over drawer on small screens.

## Verification

```bash
npm test        # filter / sort / stats maths
npm run lint    # ESLint
npm run build   # production build
```