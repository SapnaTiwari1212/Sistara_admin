/**
 * Order filtering / sorting / stats unit tests.
 * Run with `npm test` — plain Node, no test framework (mirrors the customer
 * app's pricing tests).
 */
import { filterOrders, sortOrders, computeStats, appendStatusHistory } from '../src/lib/orderFilters.js'

let pass = 0
const fails = []

const eq = (label, actual, expected) => {
  if (Object.is(actual, expected)) {
    pass++
    console.log(`PASS  ${label} = ${actual}`)
  } else {
    fails.push(`${label}: expected ${expected}, got ${actual}`)
    console.log(`FAIL  ${label}: expected ${expected}, got ${actual}`)
  }
}

const ok = (label, cond, detail = '') => {
  if (cond) {
    pass++
    console.log(`PASS  ${label}${detail ? ' — ' + detail : ''}`)
  } else {
    fails.push(label)
    console.log(`FAIL  ${label}${detail ? ' — ' + detail : ''}`)
  }
}

const order = (over = {}) => ({
  id: 'SIST-AAAAAA',
  customerName: 'Ananya Sharma',
  customerEmail: 'ananya.sharma@gmail.com',
  serviceId: 'creative-ppt',
  serviceName: 'Creative PPTs',
  amount: 167,
  status: 'Confirmed',
  createdAt: '2026-09-01T09:00:00.000Z',
  deliveryDate: '2026-09-05T09:00:00.000Z',
  ...over,
})

const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed']

const ORDERS = [
  order({ id: 'SIST-PENDING', status: 'Pending', amount: 49, createdAt: '2026-09-28T09:00:00.000Z' }),
  order({ id: 'SIST-READY', status: 'Ready', amount: 300, createdAt: '2026-09-10T09:00:00.000Z' }),
  order({
    id: 'SIST-CUSTOM',
    serviceId: 'custom',
    serviceName: 'Custom Request',
    customerName: 'Riya Patel',
    customerEmail: 'riya.p@outlook.com',
    status: 'In Progress',
    amount: 120,
    createdAt: '2026-09-20T09:00:00.000Z',
  }),
]

console.log('\n— filterOrders —')
eq('no filter returns all', filterOrders(ORDERS).length, 3)
eq('by status', filterOrders(ORDERS, { status: 'Pending' })[0].id, 'SIST-PENDING')
eq('by serviceId', filterOrders(ORDERS, { serviceId: 'custom' }).length, 1)
eq('by case-insensitive query (name)', filterOrders(ORDERS, { query: 'riya' }).length, 1)
eq('by case-insensitive query (email)', filterOrders(ORDERS, { query: 'OUTLOOK' }).length, 1)
eq('by query on order id', filterOrders(ORDERS, { query: 'sist-pend' })[0].id, 'SIST-PENDING')
eq('query ignores fields not requested', filterOrders(ORDERS, { query: 'SIST-PENDING', fields: ['customerName'] }).length, 0)
ok('empty query matches everything', filterOrders(ORDERS, { query: '  ' }).length === 3)
eq('combined status + service', filterOrders(ORDERS, { status: 'In Progress', serviceId: 'custom' }).length, 1)

console.log('\n— sortOrders —')
eq('createdAt desc (default)', sortOrders(ORDERS)[0].id, 'SIST-PENDING')
eq('createdAt asc', sortOrders(ORDERS, { key: 'createdAt', dir: 'asc' })[0].id, 'SIST-READY')
eq('amount desc', sortOrders(ORDERS, { key: 'amount' })[0].id, 'SIST-READY')
eq('amount asc', sortOrders(ORDERS, { key: 'amount', dir: 'asc' })[0].id, 'SIST-PENDING')
eq('status order (Pending first)', sortOrders(ORDERS, { key: 'status' })[0].id, 'SIST-PENDING')
eq('does not mutate input', ORDERS[0].id, 'SIST-PENDING')

console.log('\n— computeStats —')
const stats = computeStats(ORDERS, STATUSES)
eq('total', stats.total, 3)
eq('byStatus.Pending', stats.byStatus.Pending, 1)
eq('byStatus.Completed (zero-filled)', stats.byStatus.Completed, 0)
eq('revenue', stats.revenue, 469)
eq('revenueConfirmed excludes Pending', stats.revenueConfirmed, 420)
eq('awaitingPayment', stats.awaitingPayment, 1)

console.log('\n— appendStatusHistory —')
const withHistory = order({ statusHistory: [{ status: 'Confirmed', at: '2026-09-01T09:00:00.000Z' }] })
const next = appendStatusHistory(withHistory, 'In Progress', '2026-09-21T09:00:00.000Z')
eq('newest entry first', next[0].status, 'In Progress')
eq('previous entry preserved', next[1].status, 'Confirmed')
eq('order without history gets an array', appendStatusHistory(order({ statusHistory: null }), 'Ready').length, 1)

console.log(`\n${pass} passed, ${fails.length} failed`)
if (fails.length > 0) {
  console.error('\nFailures:\n' + fails.map((f) => `  • ${f}`).join('\n'))
  process.exit(1)
}