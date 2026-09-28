/**
 * OrderDetail — full breakdown + status history for one order.
 * ---------------------------------------------------------------------------
 * Prefers the list copy from OrdersContext; falls back to a fresh fetch by id
 * so a deep link straight to /orders/:id still loads. Status changes are
 * confirmed, then pushed onto the history via the optimistic updater.
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { useOrders } from '../context/OrdersContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import adminOrderService from '../services/adminOrderService'
import { getServiceById, getAccent } from '../config/services'
import { formatDate, formatDateTime, deliveryLabel, cn } from '../lib/utils'
import { StatusBadge } from '../components/ui/Badge'
import { StatusTimeline, StatItem } from '../components/orders/StatusTimeline'
import { PriceBreakdown } from '../components/orders/PriceBreakdown'
import { FileMetaList } from '../components/orders/FileMetaList'
import { StatusSelect } from '../components/orders/StatusSelect'
import { EmptyState } from '../components/ui/EmptyState'
import { RouteFallback } from '../components/ui/Skeleton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAdminAuth()
  const { getOrder, updateStatus } = useOrders()

  const [order, setOrder] = useState(() => getOrder(id))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [proposed, setProposed] = useState(null)
  const [saving, setSaving] = useState(false)

  /* Deep-link fallback: if the list never loaded this order, fetch it alone. */
  useEffect(() => {
    let mounted = true
    if (!order) {
      setLoading(true)
      adminOrderService
        .getById(id)
        .then((row) => mounted && setOrder(row))
        .catch(() => mounted && setError('Order not found.'))
        .finally(() => mounted && setLoading(false))
      return () => {
        mounted = false
      }
    }
    return undefined
  }, [order, id])

  if (loading) return <RouteFallback label="Fetching order…" />
  if (!order)
    return (
      <EmptyState
        icon={Paperclip}
        title="Order not found"
        description={error || `No order with id ${id} exists.`}
        action={
          <Link to="/orders" className="btn-primary btn-sm">
            Back to orders
          </Link>
        }
      />
    )

  const serv = getServiceById(order.serviceId)
  const accent = getAccent(serv?.accent)

  const confirmChange = async () => {
    if (!proposed) return
    setSaving(true)
    try {
      const updated = await updateStatus(order.id, proposed)
      setOrder(updated)
      setProposed(null)
    } catch (err) {
      setProposed(null)
      window.alert(err?.message || 'Could not update the status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const files = [
    ...(order.requirements || []).map((f) => f.name),
    ...(order.references || []).map((f) => f.name),
  ]

  return (
    <div className="flex flex-col gap-5">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition-colors hover:text-pink-600">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to orders
      </Link>

      {/* Header card */}
      <section className="overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-card">
        <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('grid h-14 w-14 shrink-0 place-items-center rounded-3xl', accent.bg)}>
              <span className={cn('font-display text-xl font-extrabold', accent.text)}>
                {(serv?.short || order.serviceName).charAt(0)}
              </span>
            </div>
            <div>
              <p className={cn('font-display text-xs font-extrabold uppercase tracking-[0.2em]', accent.text)}>
                {order.serviceName}
              </p>
              <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{order.id}</h1>
              <p className="text-sm font-semibold text-ink-muted">
                {order.customerName} · {order.customerEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <StatusBadge status={order.status} />
            <StatusSelect
              value={order.status}
              disabled={saving}
              onChange={(next) => setProposed(next)}
              aria-label="Change order status"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-lavender-200 bg-lavender-200 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem label="Deadline" value={order.deadline || '—'} />
          <StatItem label="Delivery date" value={formatDate(order.deliveryDate)} accent="text-pink-600" sub={deliveryLabel(order.deliveryDate)} />
          <StatItem label="Placed" value={formatDateTime(order.createdAt)} />
          <StatItem label="Quantity" value={`${order.quantity} ${order.quantity === 1 ? order.unitSingular : order.unitLabel}`} />
        </div>
        <div className="grid grid-cols-1 gap-px bg-lavender-200 sm:grid-cols-3">
          <StatItem label="Payment" value={order.paidAt ? `Paid ${formatDate(order.paidAt)}` : 'Awaiting payment'} sub={order.paymentRef || '—'} />
          <StatItem label="Status updated" value={formatDateTime(order.statusUpdatedAt)} />
          <StatItem label="Files" value={files.length > 0 ? `${files.length} attached` : 'None'} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Quote + instructions */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <PriceBreakdown order={order} />

          <section className="rounded-4xl border border-white/70 bg-white/80 p-5 shadow-card sm:p-6">
            <h2 className="mb-3 font-display text-sm font-extrabold text-ink">Instructions from the customer</h2>
            {order.instructions ? (
              <p className="text-pretty text-sm font-medium leading-relaxed text-ink-soft">{order.instructions}</p>
            ) : (
              <p className="text-sm italic text-ink-muted">No special instructions.</p>
            )}
          </section>
        </div>

        {/* Files + history */}
        <div className="flex flex-col gap-5">
          <section className="rounded-4xl border border-white/70 bg-white/80 p-5 shadow-card sm:p-6">
            <h2 className="mb-4 font-display text-sm font-extrabold text-ink">
              Files ({files.length})
            </h2>
            <FileMetaList order={order} />
          </section>

          <StatusTimeline order={order} />
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-ink-muted">
        Managed by {user?.name || 'admin'} · demo mode persists changes to this browser.
      </p>

      <ConfirmDialog
        open={Boolean(proposed)}
        onClose={() => {
          if (!saving) setProposed(null)
        }}
        onConfirm={confirmChange}
        busy={saving}
        title={proposed ? `Move ${order.id} to “${proposed}”?` : 'Confirm status change'}
        body={
          proposed
            ? `This takes the order from ${order.status} → ${proposed} and records it in the status history.`
            : undefined
        }
        confirmLabel="Move status"
      />
    </div>
  )
}