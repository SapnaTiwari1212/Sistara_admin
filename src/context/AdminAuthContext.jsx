import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import adminAuthService, { isStaffUser } from '../services/adminAuthService'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    setLoading(true)
    try {
      const session = await adminAuthService.getSession()
      setUser(session && isStaffUser(session.user) ? session.user : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const signIn = useCallback(
    async (credentials) => {
      const session = await adminAuthService.signIn(credentials)
      setUser(isStaffUser(session?.user) ? session.user : null)
      return session
    },
    [],
  )

  const signOut = useCallback(async () => {
    await adminAuthService.signOut()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refreshSession, isStaff: isStaffUser(user) }),
    [user, loading, signIn, signOut, refreshSession],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}