/**
 * Orders — the main list behind every protected route in the panel.
 * ---------------------------------------------------------------------------
 * Filter/sort/search state lives in OrdersContext and is applied client-side
 * through the pure helpers in `src/lib/orderFilters.js`. Status changes go
 * through a confirm dialog so "Old → New" moves are deliberate, then hit the
 * service's optimistic updater.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilterX } from 'lucide-react'
import { useOrders } from '../context/OrdersContext'
import { OrderFilters } from '../components/orders/OrderFilters'
import { OrdersTable } from '../components/orders/OrdersTable'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export default function Orders() {
  const {
    orders,
    loading,
    error,
    refresh,
    status,
    setStatus,
    serviceId,
    setServiceId,
    query,
    setQuery,
    sort,
    setSort,
    resetFilters,
    updateStatus,
    stats,
  } = useOrders()

  const navigate = useNavigate()

  const [change, setChange] = useState(null)
  const [saving, setSaving] = useState(false)

  const openChange = (order, next) => setChange({ order, next })

  const confirmChange = async () => {
    if (!change) return
    setSaving(true)
    try {
      await updateStatus(change.order.id, change.next)
      setChange(null)
    } catch (err) {
      setChange(null)
      window.alert(err?.message || 'Could not update that order’s status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <OrderFilters
        status={status}
        serviceId={serviceId}
        query={query}
        stats={stats}
        onStatus={setStatus}
        onService={setServiceId}
        onQuery={setQuery}
        onReset={resetFilters}
      />

      {loading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : error ? (
        <EmptyState
          icon={FilterX}
          title="Could not load orders"
          description={error}
          action={
            <button type="button" onClick={refresh} className="btn-primary btn-sm">
              Try again
            </button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={FilterX}
          title="No orders match"
          description="Try clearing the filters, or wait for new orders from the customer site."
          action={
            <button type="button" onClick={resetFilters} className="btn-secondary btn-sm">
              Reset filters
            </button>
          }
        />
      ) : (
        <OrdersTable
          orders={orders}
          sort={sort}
          onSort={setSort}
          onStatusChange={openChange}
          onRowClick={(order) => navigate(`/orders/${order.id}`)}
        />
      )}

      <ConfirmDialog
        open={Boolean(change)}
        onClose={() => {
          if (!saving) setChange(null)
        }}
        onConfirm={confirmChange}
        busy={saving}
        title={change ? `Move ${change.order.id} to “${change.next}”?` : 'Confirm status change'}
        body={
          change
            ? `This takes the order from ${change.order.status} → ${change.next} and records it in the status history.`
            : undefined
        }
        confirmLabel="Move status"
      />
    </div>
  )
}