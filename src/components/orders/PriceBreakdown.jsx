import { TrendingDown, Sparkles } from 'lucide-react'
import { formatINR, cn } from '../../lib/utils'

/**
 * Read-only reproduction of the quote the customer agreed to.
 * Renders straight from the order's immutable `price` snapshot so the admin
 * never re-derives or double-charges anything.
 */
export const PriceBreakdown = ({ order }) => {
  const price = order.price
  const hasLineItems = price && typeof price === 'object'
  const base = hasLineItems ? Number(price.base) || 0 : null
  const extras = hasLineItems ? Number(price.extras) || 0 : 0
  const rush = hasLineItems ? Number(price.rush) || 0 : 0
  const discount = hasLineItems ? Number(price.discount) || 0 : 0
  const tax = hasLineItems ? Number(price.tax) || 0 : 0

  return (
    <div className="rounded-3xl border-2 border-dashed border-lavender-200 bg-white/70 p-5">
      <h4 className="font-display text-sm font-extrabold text-ink">Quote snapshot</h4>

      <dl className="mt-3 space-y-2 font-body text-sm">
        {hasLineItems ? (
          <>
            {base !== null && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-ink-soft">Base price</dt>
                <dd className="font-bold text-ink">{formatINR(base)}</dd>
              </div>
            )}
            {extras > 0 && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-ink-soft">
                  Extra {Math.max(0, order.quantity - 1)} {order.unitLabel}
                </dt>
                <dd className="font-bold text-ink">{formatINR(extras)}</dd>
              </div>
            )}
            {rush !== 0 && (
              <div className="flex items-center justify-between gap-3">
                <dt className={cn('flex items-center gap-1.5 font-semibold', rush > 0 ? 'text-butter-500' : 'text-mint-500')}>
                  {rush > 0 ? <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
                  {rush > 0 ? 'Rush delivery' : 'Relaxed-rate saving'}
                </dt>
                <dd className={cn('font-bold', rush > 0 ? 'text-butter-500' : 'text-mint-500')}>
                  {rush > 0 ? '+' : '−'}
                  {formatINR(Math.abs(rush))}
                </dd>
              </div>
            )}
            {discount > 0 && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-mint-500">Discount</dt>
                <dd className="font-bold text-mint-500">−{formatINR(discount)}</dd>
              </div>
            )}
            {tax > 0 && (
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold text-ink-soft">Tax</dt>
                <dd className="font-bold text-ink">{formatINR(tax)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-lavender-200 pt-3">
              <dt className="font-display text-sm font-extrabold text-ink">Total</dt>
              <dd className="font-display text-lg font-extrabold text-pink-600">{formatINR(order.amount)}</dd>
            </div>
          </>
        ) : (
          <p className="text-sm font-semibold text-ink-soft">{formatINR(order.amount)}</p>
        )}
      </dl>

      {order.paymentRef && (
        <p className="mt-4 rounded-2xl bg-mint-100/70 px-3.5 py-2.5 font-body text-xs font-semibold text-ink-soft">
          ✓ Paid · ref {order.paymentRef}
        </p>
      )}
    </div>
  )
}