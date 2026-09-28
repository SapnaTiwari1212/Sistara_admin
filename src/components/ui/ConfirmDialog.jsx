import { AlertTriangle, X } from 'lucide-react'
import Button from './Button'
import { cn } from '../../lib/utils'

/**
 * Accessible confirm dialog backed by the native <dialog> element.
 * Used for status changes so "Old → New" transitions are deliberate.
 */
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'Confirm',
  tone = 'primary',
  busy = false,
}) => (
  <div
    className={cn(
      'fixed inset-0 z-50 grid place-items-center p-5 transition-opacity duration-200',
      open ? 'opacity-100' : 'pointer-events-none opacity-0',
    )}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
  >
    <button
      type="button"
      className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
      aria-label="Close dialog"
      tabIndex={-1}
    />
    <div className="relative w-full max-w-md animate-popIn rounded-4xl border border-white/70 bg-white p-7 shadow-card">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-lavender-100 hover:text-ink"
        aria-label="Close"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-butter-100 text-butter-500">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 id="confirm-title" className="font-display text-xl font-extrabold text-ink">
        {title}
      </h2>
      {body && <div className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</div>}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button variant={tone} onClick={onConfirm} loading={busy} size="sm">
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
)