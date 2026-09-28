import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClipboardList, ExternalLink, LogOut, Menu, Sparkles, X } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { adminConfig } from '../../config/adminConfig'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [{ to: '/orders', label: 'Orders', icon: ClipboardList }]

const SidebarContent = ({ onNavigate }) => (
  <div className="flex h-full flex-col gap-6 p-5">
    <div className="flex items-center gap-3 px-1">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-200 to-lavender-200 text-ink shadow-pop-sm">
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-extrabold tracking-tight text-ink">
          {adminConfig.brand.name}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-pink-500">
          {adminConfig.brand.tagline}
        </p>
      </div>
    </div>

    <nav className="flex flex-1 flex-col gap-1.5">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 font-display text-sm font-bold transition-colors duration-150',
              isActive
                ? 'bg-pink-100 text-ink shadow-pop-sm'
                : 'text-ink-soft hover:bg-lavender-50 hover:text-ink',
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {label}
        </NavLink>
      ))}

      <a
        href={adminConfig.customerSite.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold text-ink-muted transition-colors hover:bg-lavender-50 hover:text-ink"
      >
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
        {adminConfig.customerSite.label}
      </a>
    </nav>

    <StaffMenu />
  </div>
)

const StaffMenu = () => {
  const { user, signOut } = useAdminAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex items-center gap-3 rounded-3xl border-2 border-lavender-200 bg-white/80 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lavender-100 font-display text-sm font-extrabold text-grape-500">
        {(user?.name || 'A').slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate font-display text-sm font-bold text-ink">{user?.name}</p>
        <p className="truncate text-[11px] font-semibold text-ink-muted">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full p-2 text-ink-muted transition-colors hover:bg-pink-50 hover:text-pink-600"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

/**
 * Admin shell: fixed sidebar on desktop, slide-over drawer on mobile,
 * sticky topbar. Search lives in the Orders page, not here.
 */
const AdminLayout = () => {
  const { user } = useAdminAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[16rem] border-r border-lavender-200/70 bg-white/70 backdrop-blur-sm lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <aside className="animate-popIn absolute inset-y-0 left-0 w-[17rem] bg-white shadow-card">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-full p-1.5 text-ink-muted hover:bg-lavender-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-[16rem]">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-lavender-200/70 bg-cream/90 px-5 py-3 backdrop-blur-sm sm:px-8">
          <button
            type="button"
            className="rounded-full p-2 text-ink-soft hover:bg-lavender-100 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-extrabold text-ink">
              Welcome back, {user?.name?.split(' ')[0] || 'staff'}
            </p>
            <p className="hidden text-xs font-semibold text-ink-muted sm:block">
              {adminConfig.brand.promise}
            </p>
          </div>
        </header>

        <main className="px-5 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout