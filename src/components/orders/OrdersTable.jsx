import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react'
import { formatINR, formatDate, deliveryLabel, relativeTime, cn } from '../../lib/utils'
import { StatusSelect } from './StatusSelect'
import { getAccent } from '../../config/services'

const SORTABLE = {
  createdAt: 'Created',
  amount: 'Amount',
  deliveryDate: 'Delivery',
  status: 'Status',
}

const SortHeader = ({ label, sortKey, sort, onSort, className = '' }) => {
  const active = sort?.key === sortKey
  const dir = sort?.dir || 'desc'
  return (
    <button
      type="button"
      onClick={() => onSort({ key: sortKey, dir: active && dir === 'asc' ? 'desc' : 'asc' })}
      className={cn(
        'group inline-flex items-center gap-1 uppercase tracking-wide font-display text-[11px] font-bold transition-colors hover:text-ink',
        active ? 'text-ink' : 'text-ink-muted',
        className,
      )}
    >
      {label}
      {active ? (
        dir === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-pink-500" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3 w-3 text-pink-500" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" aria-hidden="true" />
      )}
    </button>
  )
}

/**
 * Orders table (desktop) / stacked cards (mobile), with click-to-sort headers
 * and an inline status dropdown. `onStatusChange(order, nextStatus)` opens the
 * confirm dialog at the page level; `onRowClick` opens the detail panel.
 */
export const OrdersTable = ({ orders, sort, onSort, onStatusChange, onRowClick }) => {
  if (orders.length === 0) return null

  return (
    <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-card">
      {/* Desktop table */}
      <table className="hidden w-full border-collapse text-left lg:table">
        <thead>
          <tr className="border-b border-lavender-200/70 bg-cream-50/80">
            <th scope="col" className="px-5 py-4 font-display text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              Order / Service
            </th>
            <th scope="col" className="px-3 py-4 font-display text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              Customer
            </th>
            <th scope="col" className="px-3 py-4">
              <SortHeader label="Amount" sortKey="amount" sort={sort} onSort={onSort} />
            </th>
            <th scope="col" className="px-3 py-4">
              <SortHeader label="Delivery" sortKey="deliveryDate" sort={sort} onSort={onSort} />
            </th>
            <th scope="col" className="px-3 py-4">
              <SortHeader label="Created" sortKey="createdAt" sort={sort} onSort={onSort} />
            </th>
            <th scope="col" className="px-3 py-4">
              <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />
            </th>
            <th scope="col" className="w-10 px-3 py-4" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const accent = getAccent(order.serviceIcon)
            return (
              <tr
                key={order.id}
                className="table-row-hover cursor-pointer border-b border-lavender-100 last:border-0"
                onClick={() => onRowClick(order)}
              >
                <td className="px-5 py-4">
                  <p className="font-display text-sm font-extrabold text-ink">{order.id}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                    <span className={cn('h-2 w-2 rounded-full', accent.bg)} aria-hidden="true" />
                    {order.serviceName}
                  </p>
                </td>
                <td className="px-3 py-4">
                  <p className="max-w-[11rem] truncate text-sm font-bold text-ink">{order.customerName}</p>
                  <p className="max-w-[11rem] truncate text-xs text-ink-muted">{order.customerEmail}</p>
                </td>
                <td className="px-3 py-4 font-display text-sm font-extrabold text-ink">
                  {formatINR(order.amount)}
                </td>
                <td className="px-3 py-4">
                  <p className="text-sm font-semibold text-ink">{formatDate(order.deliveryDate)}</p>
                  <p className="text-xs text-ink-muted">{deliveryLabel(order.deliveryDate)}</p>
                </td>
                <td className="px-3 py-4 text-xs font-semibold text-ink-muted">
                  {relativeTime(order.createdAt)}
                </td>
                <td className="px-3 py-4">
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusSelect value={order.status} onChange={(next) => onStatusChange(order, next)} />
                  </div>
                </td>
                <td className="px-3 py-4 text-ink-muted">
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-lavender-100 lg:hidden">
        {orders.map((order) => {
          const accent = getAccent(order.serviceIcon)
          return (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => onRowClick(order)}
                className="w-full px-5 py-4 text-left transition-colors hover:bg-lavender-50/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold text-ink">{order.id}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                      <span className={cn('h-2 w-2 rounded-full', accent.bg)} aria-hidden="true" />
                      {order.serviceName}
                    </p>
                    <p className="mt-2 text-sm font-bold text-ink">{formatINR(order.amount)}</p>
                    <p className="text-xs text-ink-muted">
                      {deliveryLabel(order.deliveryDate)} · {relativeTime(order.createdAt)}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <StatusSelect value={order.status} onChange={(next) => onStatusChange(order, next)} />
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}