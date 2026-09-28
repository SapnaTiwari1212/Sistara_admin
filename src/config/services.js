/**
 * SISTARA ADMIN — service catalogue (read-only mirror).
 * ---------------------------------------------------------------------------
 * This is a lightweight, READ-ONLY copy of the customer app's service list:
 * ids, names and accents are used here only for labels and filter options.
 * Pricing is NOT editable in the admin yet, so the numbers are display-only.
 *
 * The single source of truth for services is `src/config/services.js` in the
 * SISTARA customer app — when a backend lands, load services from the
 * database instead of duplicating them here.
 */

export const services = [
  { id: 'assignments', name: 'Assignments & Files', short: 'Assignments', accent: 'pink', basePrice: 49, perUnitPrice: 2, unit: 'page', unitLabel: 'pages', minQuantity: 1, maxQuantity: 200, defaultQuantity: 5 },
  { id: 'lab-manuals', name: 'Lab Manuals & Practical Files', short: 'Lab Manual', accent: 'mint', basePrice: 79, perUnitPrice: 3, unit: 'experiment', unitLabel: 'experiments', minQuantity: 1, maxQuantity: 60, defaultQuantity: 6 },
  { id: 'creative-ppt', name: 'Creative PPTs', short: 'Creative PPT', accent: 'lavender', basePrice: 99, perUnitPrice: 8, unit: 'slide', unitLabel: 'slides', minQuantity: 5, maxQuantity: 120, defaultQuantity: 10 },
  { id: 'project-reports', name: 'Project Reports', short: 'Project Report', accent: 'sky', basePrice: 149, perUnitPrice: 4, unit: 'page', unitLabel: 'pages', minQuantity: 5, maxQuantity: 150, defaultQuantity: 20 },
  { id: 'handmade-cards', name: 'Handmade Cards', short: 'Handmade Card', accent: 'pink', basePrice: 99, perUnitPrice: 35, unit: 'card', unitLabel: 'cards', minQuantity: 1, maxQuantity: 100, defaultQuantity: 1 },
  { id: 'stationery', name: 'Custom Stationery', short: 'Stationery', accent: 'butter', basePrice: 129, perUnitPrice: 60, unit: 'piece', unitLabel: 'pieces', minQuantity: 1, maxQuantity: 200, defaultQuantity: 5 },
  { id: 'bookmarks', name: 'Bookmarks', short: 'Bookmark', accent: 'lavender', basePrice: 29, perUnitPrice: 15, unit: 'bookmark', unitLabel: 'bookmarks', minQuantity: 5, maxQuantity: 300, defaultQuantity: 10 },
  { id: 'custom', name: 'Custom Request', short: 'Custom Request', accent: 'grape', basePrice: 99, perUnitPrice: 0, unit: 'item', unitLabel: 'items', minQuantity: 1, maxQuantity: 100, defaultQuantity: 1 },
]

export const getServiceById = (id) => services.find((s) => s.id === id) || null

/**
 * Accent → Tailwind class maps, kept in sync with the customer app so the
 * admin's service labels match the site's pastel identity.
 */
export const accentStyles = {
  pink: {
    bg: 'bg-pink-100',
    softBg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
  },
  lavender: {
    bg: 'bg-lavender-100',
    softBg: 'bg-lavender-50',
    text: 'text-grape-500',
    border: 'border-lavender-200',
  },
  sky: {
    bg: 'bg-sky-100',
    softBg: 'bg-sky-50',
    text: 'text-sky-500',
    border: 'border-sky-200',
  },
  butter: {
    bg: 'bg-butter-100',
    softBg: 'bg-butter-50',
    text: 'text-butter-500',
    border: 'border-butter-200',
  },
  mint: {
    bg: 'bg-mint-100',
    softBg: 'bg-mint-100/50',
    text: 'text-mint-500',
    border: 'border-mint-300',
  },
  grape: {
    bg: 'bg-grape-100',
    softBg: 'bg-lavender-50',
    text: 'text-grape-600',
    border: 'border-grape-200',
  },
}

export const getAccent = (key) => accentStyles[key] || accentStyles.pink