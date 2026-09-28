import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { RouteFallback } from '../ui/Skeleton'

/** Guards every panel route behind a staff session. */
const ProtectedRoute = ({ children }) => {
  const { user, loading, isStaff } = useAdminAuth()
  const location = useLocation()

  if (loading) return <RouteFallback label="Checking session…" />
  if (!isStaff || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export default ProtectedRoute