import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import adminOrderService from '../services/adminOrderService'
import { adminConfig } from '../config/adminConfig'

const OrdersContext = createContext(null)

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ total: 0, byStatus: {}, revenue: 0, revenueConfirmed: 0, awaitingPayment: 0 })

  /* Live filter/sort state — applied client-side through the pure helpers in
     `src/lib/orderFilters.js` so the UI stays instant while typing. */
  const [status, setStatus] = useState('All')
  const [serviceId, setServiceId] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(adminConfig.defaultSort)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rows, nextStats] = await Promise.all([
        adminOrderService.list({ status, serviceId, query }, sort),
        adminOrderService.stats(),
      ])
      setOrders(rows)
      setStats(nextStats)
    } catch (err) {
      setError(err?.message || 'Could not load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [status, serviceId, query, sort])

  /* Slight debounce so typing in the search box doesn't hammer the service
     (or, later, the network) with a 250ms call per keystroke. */
  useEffect(() => {
    const timer = setTimeout(refresh, 180)
    return () => clearTimeout(timer)
  }, [refresh])

  const resetFilters = useCallback(() => {
    setStatus('All')
    setServiceId('All')
    setQuery('')
    setSort(adminConfig.defaultSort)
  }, [])

  /**
   * Optimistic status change with rollback: the row reflects the new status
   * immediately; if the service rejects it we revert to the previous record.
   */
  const updateStatus = useCallback(async (orderId, nextStatus) => {
    const previous = orders.find((o) => o.id === orderId)
    if (!previous) return null
    const optimistic = { ...previous, status: nextStatus }
    setOrders((current) => current.map((o) => (o.id === orderId ? optimistic : o)))
    try {
      const updated = await adminOrderService.updateStatus(orderId, nextStatus)
      setOrders((current) => current.map((o) => (o.id === orderId ? updated : o)))
      return updated
    } catch (err) {
      setOrders((current) => current.map((o) => (o.id === orderId ? previous : o)))
      throw err
    }
  }, [orders])

  const getOrder = useCallback(
    (orderId) => orders.find((o) => o.id === orderId) || null,
    [orders],
  )

  const value = useMemo(
    () => ({
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
      getOrder,
      stats,
    }),
    [orders, loading, error, refresh, status, serviceId, query, sort, stats, resetFilters, updateStatus, getOrder, setStatus, setServiceId, setQuery, setSort],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export const useOrders = () => {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>')
  return ctx
}