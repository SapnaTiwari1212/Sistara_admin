import { adminConfig, getStatusStyle } from '../../config/adminConfig'
import { cn } from '../../lib/utils'

/**
 * Compact, status-styled dropdown for order rows.
 * Selecting any value other than the current one bubbles the change up so the
 * parent can open the confirm dialog — status changes are deliberate.
 */
export const StatusSelect = ({ value, onChange, disabled = false }) => (
  <select
    value={value}
    disabled={disabled}
    onChange={(e) => {
      const next = e.target.value
      if (next !== value) onChange(next)
    }}
    aria-label="Order status"
    className={cn(
      'inline-flex cursor-pointer items-center self-start rounded-full border-2 px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wide outline-none focus-visible:ring-4 focus-visible:ring-pink-200',
      getStatusStyle(value),
      'appearance-none pr-1 transition-all duration-150 hover:-translate-y-0.5',
      disabled && 'cursor-not-allowed opacity-60',
    )}
  >
    {adminConfig.orderStatuses.map((s) => (
      <option key={s} value={s} className="normal-case tracking-normal">
        {s}
      </option>
    ))}
  </select>
)