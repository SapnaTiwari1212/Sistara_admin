/**
 * Admin auth service — staff-only sign-in.
 * ---------------------------------------------------------------------------
 * DEMO mode: credentials are checked against `adminConfig.staffAccounts`.
 * These are SHARED demo credentials, not real accounts — a real deployment
 * must never hold credentials in a committed config file.
 *
 * TO CONNECT SUPABASE (no component changes required):
 *   1. apply `sql/schema.sql` (gives `profiles.role`)
 *   2. `npm i @supabase/supabase-js`
 *   3. add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env
 *   4. swap the method bodies for:
 *        supabase.auth.signInWithPassword({ email, password })
 *        then verify `session.user.id` maps to a `profiles.role = 'admin'`
 *        row before allowing access (see isStaff below).
 *
 * The exported function signatures stay identical, so AdminAuthContext and
 * every screen keep working unchanged.
 */

import store from '../lib/storage'
import { isBackendConfigured } from '../lib/env'
import { adminConfig } from '../config/adminConfig'

const SESSION_KEY = 'adminSession'

/** Demo latency so loading states are visible and honest about being fake. */
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

const readSession = () => store.get(SESSION_KEY, null)
const writeSession = (session) => store.set(SESSION_KEY, session)
const clearSession = () => store.remove(SESSION_KEY)

const makeSession = (account) => ({
  user: { id: account.id, name: account.name, email: account.email, role: account.role },
  createdAt: new Date().toISOString(),
})

/** In demo mode, the locally configured staff list is the source of truth. */
const findStaff = (email) =>
  adminConfig.staffAccounts.find((a) => a.email.toLowerCase() === String(email).trim().toLowerCase())

/** Role gate: a signed-in user must hold `admin` before the panel opens. */
export const isStaffUser = (user) => Boolean(user && user.role === 'admin')

export const adminAuthService = {
  isDemo: !isBackendConfigured,

  async getSession() {
    await delay(150)
    const session = readSession()
    return session && isStaffUser(session.user) ? session : null
  },

  /** Signs in a staff member. Throws readable Errors for the form to show. */
  async signIn({ email, password }) {
    await delay(650)
    if (isBackendConfigured) {
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      // Then confirm `data.user.id` has `profiles.role = 'admin'`.
      return null
    }
    const account = findStaff(email)
    if (!account) throw new Error('No staff account found with this email.')
    if (account.password !== String(password)) {
      throw new Error('Incorrect password. Please try again.')
    }
    const session = makeSession(account)
    writeSession(session)
    return session
  },

  async signOut() {
    await delay(200)
    clearSession()
  },
}

export default adminAuthService