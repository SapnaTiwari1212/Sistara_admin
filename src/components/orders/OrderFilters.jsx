import { RotateCcw, Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { adminConfig } from '../../config/adminConfig'
import { services } from '../../config/services'
import { Select } from '../ui/Input'

/** Status chips + service select + search, wired straight into OrdersContext. */
export const OrderFilters = ({ status, serviceId, query, stats, onStatus, onService, onQuery, onReset }) => {
  const counts = stats?.byStatus || {}
  const totalCount = stats?.total || 0

  const chips = [{ value: 'All', label: 'All', count: totalCount }, ...adminConfig.orderStatuses.map((s) => ({ value: s, label: s, count: counts[s] || 0 }))]

  return (
    <section aria-label="Filter orders" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lavender-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search order id, name, email…"
            aria-label="Search orders"
            className="field !min-h-0 !rounded-full !py-2.5 !pl-11 !pr-10 !text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:bg-lavender-100 hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <Select
          value={serviceId}
          onChange={(e) => onService(e.target.value)}
          aria-label="Filter by service"
          className="!min-h-0 w-auto !rounded-full !py-2.5 !pr-9 !pl-4 !text-sm"
        >
          <option value="All">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-bold text-ink-muted transition-colors hover:bg-lavender-50 hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map(({ value, label, count }) => {
          const active = status === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onStatus(value)}
              className={cn(
                'pill shrink-0 cursor-pointer !py-2 transition-all duration-150',
                active
                  ? 'bg-ink text-cream shadow-pop-sm'
                  : 'border-2 border-lavender-200 bg-white/80 text-ink-soft hover:border-lavender-300 hover:bg-lavender-50',
              )}
            >
              {label}
              <span
                className={cn(
                  'ml-1 inline-flex min-w-[1.4rem] items-center justify-center rounded-full px-1.5 py-0.5 font-display text-[10px] font-extrabold',
                  active ? 'bg-white/20 text-cream' : 'bg-cream-200 text-ink-soft',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}