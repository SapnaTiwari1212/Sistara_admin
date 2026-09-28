/**
 * SISTARA ADMIN — central configuration.
 * ---------------------------------------------------------------------------
 * Brand copy, staff accounts, order statuses and table defaults live here.
 * Order statuses and their pastel badge styles are mirrored verbatim from the
 * customer app (`Sistara/src/config/siteConfig.js`) so both sides agree.
 */

export const adminConfig = {
  brand: {
    name: 'SISTARA',
    tagline: 'ADMIN',
    promise: 'Zero Fault. Your Ideas, Our Creativity.',
    copyrightYear: 2026,
  },

  /** Where the panel points back to the public site. */
  customerSite: {
    label: 'Open customer site',
    url: 'http://localhost:5173',
  },

  /**
   * STAFF ACCOUNTS (demo only)
   * -------------------------------------------------------------------------
   * In demo mode this list is the whole "database". When Supabase is wired up
   * (see `sql/schema.sql`), sign-in is checked against `profiles.role =
   * 'admin'` instead — never a client-side account list.
   *
   * These are SHARED demo credentials, deliberately not individual accounts.
   */
  staffAccounts: [
    {
      id: 'staff_admin',
      name: 'SISTARA Admin',
      email: 'admin@sistara.in',
      password: 'Sistara@2026',
      role: 'admin',
    },
  ],

  /** Order statuses, matching the customer app's journey exactly. */
  orderStatuses: ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed'],

  /** Deadline vocabulary, mirrored from the customer app for labels. */
  deadlines: {
    '24h': '24 hours',
    '3d': '3 days',
    '5d': '5 days',
    '7d': '7 days',
    custom: 'Custom',
  },

  /** Map of status -> pastel badge styling (copied from the customer app). */
  statusStyles: {
    Pending: 'bg-butter-100 text-butter-500 border-butter-300',
    Confirmed: 'bg-sky-100 text-sky-500 border-sky-300',
    'In Progress': 'bg-lavender-100 text-grape-500 border-lavender-300',
    Ready: 'bg-pink-100 text-pink-600 border-pink-300',
    Completed: 'bg-mint-100 text-mint-500 border-mint-300',
  },

  /** Default column the Orders table is sorted by, newest first. */
  defaultSort: { key: 'createdAt', dir: 'desc' },
}

export const getStatusStyle = (status) =>
  adminConfig.statusStyles[status] || 'bg-lavender-100 text-grape-500 border-lavender-300'