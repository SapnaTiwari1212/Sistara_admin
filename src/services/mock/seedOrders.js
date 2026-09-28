/**
 * Demo seed data — deterministic, realistic orders for the admin panel.
 * ---------------------------------------------------------------------------
 * Seeded once into localStorage on first login (demo mode only), then edited
 * in place like real records. Deterministic on purpose: a fixed RNG seed means
 * the same dataset comes back after a localStorage reset, which keeps
 * screenshots, tests and walkthroughs stable.
 *
 * Each order follows the customer app's record shape (amount + an immutable
 * `price` snapshot, %-free — see the customer `orderService.js`) plus a
 * denormalised `customerName` / `customerEmail` for admin display.
 */

import { generateOrderId } from '../../lib/utils'
import { services, getServiceById } from '../../config/services'
import { adminConfig } from '../../config/adminConfig'

/** Small deterministic PRNG so the dataset is repeatable. */
const mulberry32 = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const rand = mulberry32(20260831)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const between = (min, max) => min + Math.floor(rand() * (max - min + 1))

/** Every customer-facing service id, listed here for seeding weights. */
const SERVICE_IDS = services.map((s) => s.id)

const CUSTOMERS = [
  ['Ananya Sharma', 'ananya.sharma@gmail.com'],
  ['Riya Patel', 'riya.p@outlook.com'],
  ['Karan Mehta', 'karan.mehta@gmail.com'],
  ['Ishita Verma', 'ishita.v@gmail.com'],
  ['Arjun Nair', 'arjun.nair23@gmail.com'],
  ['Sneha Reddy', 'sneha.reddy@gmail.com'],
  ['Aditya Singh', 'aditya.singh@yahoo.in'],
  ['Neha Gupta', 'neha.gupta@gmail.com'],
  ['Priyansh Joshi', 'priyansh.j@gmail.com'],
  ['Fatima Khan', 'fatima.khan@gmail.com'],
  ['Rohan Das', 'rohan.das@outlook.com'],
  ['Divya Pillai', 'divya.pillai@gmail.com'],
]

const DEADLINES = [
  { value: '24h', multiplier: 1.4 },
  { value: '3d', multiplier: 1 },
  { value: '5d', multiplier: 0.9 },
  { value: '7d', multiplier: 0.85 },
]

const NOTES = [
  'Please keep the pastel theme consistent.',
  'College format — attaching a sample in references.',
  'Needed before my submission slot.',
  '',
  'Make sure fonts are clearly readable when printed.',
  '',
  'Can we match the cover page from the example?',
]

/** Compose a price snapshot the same way the customer pricing does. */
const quoteFor = (service, quantity, deadline) => {
  const base = service.basePrice
  const extras = Math.max(0, quantity - 1) * service.perUnitPrice
  const rush = Math.round(base * (deadline.multiplier - 1))
  const subtotal = base + rush + extras
  const discount = 0
  const tax = 0
  const total = subtotal - discount + tax
  return { base, extras, rush, subtotal, discount, tax, total }
}

const SAMPLE_FILES = [
  { name: 'brief.pdf', size: 248000, type: 'application/pdf' },
  { name: 'topic-notes.docx', size: 512400, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { name: 'format-sample.pdf', size: 198200, type: 'application/pdf' },
  { name: 'reference-image.png', size: 1420000, type: 'image/png' },
  { name: 'old-project.pdf', size: 3040000, type: 'application/pdf' },
]

const STATUSES = adminConfig.orderStatuses

/** Rough per-status age windows (createdAt -> status allows a believable flow). */
const daysAgoFor = (status) =>
  ({
    Pending: between(0, 2),
    Confirmed: between(1, 4),
    'In Progress': between(3, 10),
    Ready: between(7, 16),
    Completed: between(12, 30),
  })[status]

export const seedOrders = () => {
  const orders = []
  for (let i = 0; i < 34; i += 1) {
    const status = pick(STATUSES)
    const service = getServiceById(pick(SERVICE_IDS))
    const quantity = between(Math.max(1, service.minQuantity), Math.min(service.minQuantity + between(2, 18), service.maxQuantity || 50))
    const deadline = pick(DEADLINES)
    const price = quoteFor(service, quantity, deadline)
    const [customerName, customerEmail] = pick(CUSTOMERS)

    const created = new Date()
    created.setHours(9, between(0, 59), between(0, 59), 0)
    created.setDate(created.getDate() - daysAgoFor(status))

    const delivery = new Date(created)
    const days = { '24h': 1, '3d': 3, '5d': 5, '7d': 7 }[deadline.value] ?? 3
    delivery.setDate(delivery.getDate() + days)

    // Status history: Pending at creation, then the current status once the
    // order advanced past that point.
    const statusHistory = [{ status, at: created.toISOString() }]
    if (status !== 'Pending') {
      const moved = new Date(created)
      moved.setDate(moved.getDate() + between(1, days))
      statusHistory.unshift({
        status: STATUSES[STATUSES.indexOf(status) - 1],
        at: moved.toISOString(),
      })
    }

    orders.push({
      id: generateOrderId(),
      userId: `u_${between(1000, 9999)}`,
      serviceId: service.id,
      serviceName: service.name,
      serviceIcon: service.accent,
      customerName,
      customerEmail,
      quantity,
      unitLabel: service.unitLabel || 'items',
      unitSingular: service.unit || 'item',
      requirements: i % 3 === 0 ? SAMPLE_FILES.slice(0, between(1, 2)) : [SAMPLE_FILES[i % SAMPLE_FILES.length]],
      references: i % 2 === 0 ? [SAMPLE_FILES[(i + 2) % SAMPLE_FILES.length]] : [],
      instructions: pick(NOTES),
      deadline: deadline.value,
      notes: '',
      amount: price.total,
      price,
      deliveryDate: delivery.toISOString(),
      status,
      createdAt: created.toISOString(),
      paidAt: status === 'Pending' ? null : created.toISOString(),
      paymentRef: status === 'Pending' ? null : `PAY${between(10000000, 99999999)}`,
      statusUpdatedAt: created.toISOString(),
      statusHistory,
    })
  }
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}