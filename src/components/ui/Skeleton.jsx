import { cn } from '../../lib/utils'

/** Springy pastel loader used while data is fetched. */
export const RouteFallback = ({ label = 'Loading…' }) => (
  <div className="grid min-h-[60vh] place-items-center">
    <div className="flex flex-col items-center gap-3">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-lavender-200 border-t-pink-400" />
      <p className="font-display text-sm font-bold text-ink-muted">{label}</p>
    </div>
  </div>
)

/** Skeleton row for the orders table while it loads. */
export const TableSkeleton = ({ rows = 6, columns = 6 }) => (
  <div className="overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-card">
    <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-3 lg:grid-cols-[repeat(6,minmax(0,1fr))]">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded-full bg-lavender-100" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className={cn(
          'grid grid-cols-2 gap-3 border-t border-lavender-100 px-5 py-4 sm:grid-cols-3 lg:grid-cols-[repeat(6,minmax(0,1fr))]',
          r % 2 === 1 && 'bg-cream-50',
        )}
      >
        {Array.from({ length: columns }).map((_, c) => (
          <div key={c} className="h-4 animate-pulse rounded-full bg-lavender-100/70" style={{ width: `${55 + ((r * 7 + c * 13) % 40)}%` }} />
        ))}
      </div>
    ))}
  </div>
)