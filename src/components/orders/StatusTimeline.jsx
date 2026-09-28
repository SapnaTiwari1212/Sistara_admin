import { formatDateTime } from '../../lib/utils'
import { StatusBadge } from '../ui/Badge'
import { cn } from '../../lib/utils'

/** Vertical trail of the order's status moves, newest first. */
export const StatusTimeline = ({ order }) => {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
  if (history.length === 0) return null

  return (
    <div>
      <p className="mb-3 font-display text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
        Status history
      </p>
      <ol className="relative space-y-3 border-l-2 border-lavender-200 pl-5">
        {history.map(({ status, at }, i) => (
          <li key={`${status}-${at}-${i}`} className="relative">
            <span
              className={cn(
                'absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full border-2 border-white',
                i === 0 ? 'bg-pink-400' : 'bg-lavender-300',
              )}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-xs font-semibold text-ink-muted">{formatDateTime(at)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Small labelled stat used across the detail page header. */
export const StatItem = ({ label, value, accent = 'text-ink' }) => (
  <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-3 shadow-pop-sm">
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-muted">{label}</p>
    <p className={cn('mt-0.5 font-display text-sm font-extrabold', accent)}>{value}</p>
  </div>
)