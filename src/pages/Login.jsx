/**
 * Login — staff-only sign-in for the SISTARA Admin panel.
 * ---------------------------------------------------------------------------
 * Demo credentials come from adminConfig.staffAccounts (admin@sistara.in /
 * Sistara@2026). Real auth plugs in via adminAuthService without UI changes.
 */

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Sparkles, Star } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminConfig } from '../config/adminConfig'

export default function Login() {
  const { isStaff, signIn } = useAdminAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState(adminConfig.staffAccounts[0].email)
  const [password, setPassword] = useState(adminConfig.staffAccounts[0].password)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isStaff) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-blob-pink min-h-screen">
      <div className="bg-grid-paper flex min-h-screen items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
          {/* Brand side — a note from the customer site's voice */}
          <div className="hidden flex-col justify-center gap-4 md:flex">
            <div className="inline-flex items-center gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 via-pink-400 to-lavender-300 text-white shadow-pop-sm">
                <Star size={26} fill="currentColor" />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-wide text-ink">
                SISTARA <span className="text-pink-500">ADMIN</span>
              </span>
            </div>

            <h1 className="text-balance font-display text-4xl font-extrabold leading-tight text-ink">
              Zero Fault.
              <br />
              <span className="text-transparent [background:linear-gradient(90deg,#F76E97,#9B85EC)] [background-clip:text] [color:transparent] [-webkit-background-clip:text]">
                Your Ideas, Our Creativity.
              </span>
            </h1>

            <p className="max-w-sm text-pretty text-sm font-medium leading-relaxed text-ink-soft">
              Assignments, lab manuals, creative PPTs, project reports, handmade cards, stationery and bookmarks —
              everything your student-sisters order, in one friendly dashboard.
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs font-bold text-ink-muted">
              <Sparkles size={16} className="text-pink-400" />
              34 seeded demo orders · pastel statuses · a warm welcome back
            </div>
          </div>

          {/* Form side */}
          <div className="card-soft p-7 sm:p-9">
            <div className="mb-6 md:hidden">
              <span className="font-display text-xl font-extrabold tracking-wide text-ink">
                SISTARA <span className="text-pink-500">ADMIN</span>
              </span>
            </div>

            <h2 className="font-display text-2xl font-extrabold text-ink">Staff sign in</h2>
            <p className="mt-1 text-sm font-medium text-ink-muted">
              Sign in to manage orders on the customer side.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="login-email" className="field-label">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                  placeholder="admin@sistara.in"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="field-label">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-600">
                  <AlertCircle size={17} className="shrink-0" />
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="card-doodle mt-6 p-4 text-xs font-semibold text-ink-soft">
              <p className="mb-1 font-display text-xs font-extrabold uppercase tracking-widest text-pink-500">
                Demo access
              </p>
              <p>
                <strong className="text-ink">Email:</strong> {adminConfig.staffAccounts[0].email}
                <br />
                <strong className="text-ink">Password:</strong>{' '}
                <code className="rounded-lg bg-lavender-100 px-1.5 py-0.5 font-bold text-grape-600">
                  {adminConfig.staffAccounts[0].password}
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}