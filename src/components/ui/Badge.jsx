import { cn } from '../../lib/utils'
import { getStatusStyle } from '../../config/adminConfig'

/** Pastel status pill, identical to the customer app's rendering. */
export const StatusBadge = ({ status, className = '' }) => (
  <span
    className={cn(
      'pill border-2 whitespace-nowrap text-[11px] uppercase tracking-wide',
      getStatusStyle(status),
      className,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
    {status}
  </span>
)

/** Generic pastel pill for tags and metadata. */
export const Tag = ({ children, tone = 'lavender', className = '' }) => {
  const tones = {
    lavender: 'bg-lavender-100 text-grape-500',
    pink: 'bg-pink-100 text-pink-600',
    sky: 'bg-sky-100 text-sky-500',
    butter: 'bg-butter-100 text-butter-500',
    mint: 'bg-mint-100 text-mint-500',
    cream: 'bg-cream-200 text-ink-soft',
  }
  return <span className={cn('pill', tones[tone] || tones.lavender, className)}>{children}</span>
}