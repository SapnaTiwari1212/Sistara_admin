/**
 * Admin order service — demo persistence, shaped like a server-admined table.
 * ---------------------------------------------------------------------------
 * In demo mode orders live in localStorage (namespace `sistara-admin:orders`)
 * and are seeded on first call. The record shape is documented in
 * `src/lib/orderFilters.js`.
 *
 * TO CONNECT A BACKEND: replace the method bodies with your API/Supabase
 * calls — `select * from admin_orders`, `patch status`, etc. The component /
 * page-facing signatures do not change, and `sql/schema.sql` ships the admin
 * view, indexes and RLS policies this expects.
 */

import store from '../lib/storage'
import { ALL, filterOrders, sortOrders, computeStats } from '../lib/orderFilters'
import { seedOrders } from './mock/seedOrders'
import { adminConfig } from '../config/adminConfig'

const ORDERS_KEY = 'orders'

/** Simulated network latency, so loading states reflect a real flow. */
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

const getOrders = () => store.get(ORDERS_KEY, null)
const saveOrders = (orders) => store.set(ORDERS_KEY, orders)

/** Seeds demo data once; returns whatever is persisted (seed or prior edits). */
const ensureSeeded = () => {
  const existing = getOrders()
  if (Array.isArray(existing)) return existing
  const seeded = seedOrders()
  saveOrders(seeded)
  return seeded
}

export const adminOrderService = {
  isDemo: true,

  /** All orders, newest-first by default, respecting current admin filters. */
  async list(filter = {}, sort = adminConfig.defaultSort) {
    await delay(250)
    const all = ensureSeeded()
    const filtered = filterOrders(all, {
      status: filter.status || ALL,
      serviceId: filter.serviceId || ALL,
      query: filter.query || '',
      fields: ['id', 'customerName', 'customerEmail', 'serviceName'],
    })
    return sortOrders(filtered, sort, adminConfig.orderStatuses)
  },

  async getById(orderId) {
    await delay(150)
    return ensureSeeded().find((o) => o.id === orderId) || null
  },

  /**
   * Sets any status → any status. Records the move in `statusHistory` and
   * bumps `paidAt` when an order leaves `Pending` for the first time (in the
   * customer app, payment confirmation is what moves Pending → Confirmed).
   */
  async updateStatus(orderId, status) {
    await delay(300)
    if (!adminConfig.orderStatuses.includes(status)) {
      throw new Error(`Unknown status "${status}".`)
    }
    const orders = ensureSeeded()
    const index = orders.findIndex((o) => o.id === orderId)
    if (index === -1) throw new Error('Order not found.')
    const order = orders[index]
    const now = new Date().toISOString()
    const next = {
      ...order,
      status,
      statusUpdatedAt: now,
      paidAt: status !== 'Pending' ? order.paidAt || now : null,
      paymentRef: status !== 'Pending' ? order.paymentRef || `PAY${Date.now()}` : null,
      statusHistory: [
        { status, at: now },
        ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
      ],
    }
    orders[index] = next
    saveOrders(orders)
    return next
  },

  /** Dashboard numbers for the whole dataset. */
  async stats() {
    await delay(150)
    return computeStats(ensureSeeded(), adminConfig.orderStatuses)
  },
}

export default adminOrderService