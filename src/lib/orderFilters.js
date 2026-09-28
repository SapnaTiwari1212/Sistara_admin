/**
 * Pure order filtering / sorting / stats helpers.
 * ---------------------------------------------------------------------------
 * No React, no storage — these are unit-tested in `test/orderFilters.test.mjs`
 * and used by both the Orders page and the mock order service.
 *
 * An admin-facing order mirrors the customer app's record (see the customer
 * `orderService.js`) plus a denormalised `customerName` / `customerEmail`:
 *
 *   {
 *     id, userId, customerName, customerEmail,
 *     serviceId, serviceName, serviceIcon,
 *     quantity, unitLabel, unitSingular,
 *     requirements: [{ name, size, type }],
 *     references: [{ name, size, type }],
 *     instructions, deadline, notes,
 *     amount, price: { base, extras, rush, subtotal, discount, tax, total },
 *     deliveryDate, status, createdAt, paidAt, paymentRef,
 *     statusUpdatedAt, statusHistory: [{ status, at }]
 *   }
 */

export const KEY_STATUS = 'status'
export const KEY_SERVICE = 'serviceId'
export const KEY_QUERY = 'query'

/** "All" is the neutral filter value for both dropdowns. */
export const ALL = 'All'

/**
 * Filters a list of orders by status, service and free-text query.
 * `fields` controls which properties `query` matches against (the caller
 * chooses, so this function stays framework-independent).
 */
export const filterOrders = (
  orders,
  { status = ALL, serviceId = ALL, query = '', fields = ['id', 'customerName', 'customerEmail'] } = {},
) => {
  const q = String(query || '').trim().toLowerCase()
  return orders.filter((order) => {
    if (status !== ALL && order.status !== status) return false
    if (serviceId !== ALL && order.serviceId !== serviceId) return false
    if (!q) return true
    return fields.some((field) => String(order[field] || '').toLowerCase().includes(q))
  })
}

/**
 * Sorts a list of orders. Supported keys: createdAt (default), deliveryDate,
 * amount, status. Status sorts by its index in `statusOrder`.
 */
export const sortOrders = (orders, { key = 'createdAt', dir = 'desc' } = {}, statusOrder = []) => {
  const sign = dir === 'asc' ? 1 : -1
  const statusIndex = (status) => {
    const i = statusOrder.indexOf(status)
    return i === -1 ? statusOrder.length : i
  }
  return [...orders].sort((a, b) => {
    let diff = 0
    if (key === 'status') {
      diff = statusIndex(a.status) - statusIndex(b.status)
    } else {
      const av = a[key]
      const bv = b[key]
      if (av == null && bv == null) diff = 0
      else if (av == null) diff = -1
      else if (bv == null) diff = 1
      else {
        diff = av > bv ? 1 : av < bv ? -1 : 0
      }
    }
    return diff * sign
  })
}

/**
 * Dashboard-style numbers for a set of orders:
 *   total             — order count
 *   byStatus          — { Pending: n, Confirmed: n, … }
 *   revenue           — sum of `amount` across all orders
 *   revenueConfirmed  — sum of `amount` for paid, customer-visible orders
 *                      (anything past Pending has been paid)
 *   awaitingPayment   — unpaid count (still Pending)
 */
export const computeStats = (orders = [], statuses = []) => {
  const byStatus = Object.fromEntries(statuses.map((s) => [s, 0]))
  let revenue = 0
  let revenueConfirmed = 0
  let awaitingPayment = 0
  for (const order of orders) {
    if (order.status in byStatus) byStatus[order.status] += 1
    const amount = Number(order.amount) || 0
    revenue += amount
    if (order.status !== 'Pending') revenueConfirmed += amount
    if (order.status === 'Pending') awaitingPayment += 1
  }
  return { total: orders.length, byStatus, revenue, revenueConfirmed, awaitingPayment }
}

/**
 * History for a status change — a fresh entry pushed onto the order's
 * `statusHistory`, newest first.
 */
export const appendStatusHistory = (order, status, at = new Date().toISOString()) => {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
  return [{ status, at }, ...history]
}