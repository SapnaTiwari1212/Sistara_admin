-- ============================================================================
-- SISTARA — Supabase schema for the ADMIN panel
-- ============================================================================
-- Run against the same Supabase project that hosts the customer app, then set
-- VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in BOTH apps and swap the method
-- bodies in `adminAuthService.js` / `adminOrderService.js`. No UI changes.
--
-- The customer app already stores orders as `orders(user_id, service_id,
-- amount, price, status, ...)`. This schema adds the piece that makes an
-- admin panel safe: a `role` column gated by RLS so only admins can read or
-- write orders, and a safe `admin_orders` view that denormalises customer
-- contact info the way the admin UI expects.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Roles
-- ----------------------------------------------------------------------------
-- One row per app user, mirroring the customer app's `public.profiles` or the
-- default `.auth.users` profile. `role` is 'customer' (default) or 'admin'.
-- Customers NEVER see this table (RLS below); the admin app reads it to gate
-- staff access.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Admin accounts are granted manually; never expose self-promotion.
revoke update on public.profiles from authenticated;

-- Grant a user admin (run once, as a postgres/owner, with a real auth user id):
--   update public.profiles set role = 'admin' where id = '<auth-user-id>';

-- ----------------------------------------------------------------------------
-- 2. Orders
-- ----------------------------------------------------------------------------
-- Mirrors the record the customer app already writes. `status` uses the same
-- vocabulary the customer site renders:
--   'Pending' -> 'Confirmed' -> 'In Progress' -> 'Ready' -> 'Completed'
-- `price` is the immutable quote snapshot the student agreed to (jsonb so we
-- never re-derive it); `payment_ref` / `paid_at` come from the checkout.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,             -- e.g. SIST-8F3K2Q
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id text not null,
  service_name text not null,
  service_icon text,
  quantity integer not null default 1,
  unit_label text,
  unit_singular text,
  requirements jsonb not null default '[]'::jsonb,   -- file metadata only
  references jsonb not null default '[]'::jsonb,
  instructions text not null default '',
  deadline text,
  notes text not null default '',
  amount numeric(10, 2) not null default 0,          -- authoritative payable figure
  price jsonb,                                       -- immutable quote snapshot
  delivery_date timestamptz,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed')),
  status_history jsonb not null default '[]'::jsonb, -- [{ status, at }] newest first
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  payment_ref text
);

create index if not exists idx_orders_user      on public.orders (user_id);
create index if not exists idx_orders_status    on public.orders (status);
create index if not exists idx_orders_created   on public.orders (created_at desc);
create index if not exists idx_orders_service   on public.orders (service_id);
create index if not exists idx_orders_public_id on public.orders (public_id);

-- ----------------------------------------------------------------------------
-- 3. Admin view — denormalised rows for the panel
-- ----------------------------------------------------------------------------
-- Joins orders to the customer profile so the UI gets customerName/Email
-- without the admin app ever doing a second query (or seeing password data).

create or replace view public.admin_orders as
select
  o.id,
  o.public_id                                                        as id,
  o.user_id,
  p.full_name                                                        as customer_name,
  p.email                                                            as customer_email,
  o.service_id,
  o.service_name,
  o.service_icon,
  o.quantity,
  o.unit_label,
  o.unit_singular,
  o.requirements,
  o.references,
  o.instructions,
  o.deadline,
  o.notes,
  o.amount,
  o.price,
  o.delivery_date,
  o.status,
  o.status_history,
  o.created_at,
  o.paid_at,
  o.payment_ref
from public.orders o
left join public.profiles p on p.id = o.user_id;

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
-- The customer app's RLS (not repeated here): users can only read/update their
-- OWN orders. The admin panel instead needs everyone's order rows — so enable
-- this only as an ADMIN-scoped path, never broadly.

alter table public.orders  enable row level security;
alter table public.profiles enable row level security;

-- Admins can see the whole table through the admin view.
create policy "admin can read all orders"
  on public.orders for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Admins can advance/change order status.
create policy "admin can update orders"
  on public.orders for update
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- admins can read the admin view (view inherits owner permissions only if the
-- owner grants it; safer: select policy on the view for admins).
create policy "admin can read admin orders view"
  on public.orders for select
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ----------------------------------------------------------------------------
-- 5. After switching the admin to Supabase
-- ----------------------------------------------------------------------------
--  * `adminAuthService.signIn`  → supabase.auth.signInWithPassword + role check
--  * `adminAuthService.getSession` → read the session, map the profile's role
--  * `adminOrderService.list`   → select * from admin_orders
--  * `adminOrderService.getById`→ select * from admin_orders where id = $1
--  * `adminOrderService.updateStatus` → update public.orders set status...,
--    status_history = $2, then return the row via admin_orders
--  * `adminOrderService.stats`  → aggregate over admin_orders in SQL
--
-- Component-facing signatures never change.
-- ============================================================================