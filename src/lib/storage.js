/**
 * Namespaced browser storage helpers for the admin panel.
 * ---------------------------------------------------------------------------
 * Same resilience contract as the customer app (`sistara:`), but namespaced
 * under its own prefix so the two apps never collide in localStorage.
 *
 * Wrapped in try/catch because storage can throw in private-mode browsers,
 * and so the app degrades to in-memory only instead of crashing.
 */

const PREFIX = 'sistara-admin:'

const memoryFallback = new Map()

const safe = (fn, fallback) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

const getItem = (key, fallback) =>
  safe(() => {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  }, memoryFallback.has(key) ? memoryFallback.get(key) : fallback)

const setItem = (key, value) =>
  safe(() => {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  }, memoryFallback.set(key, value))

const removeItem = (key) =>
  safe(() => {
    window.localStorage.removeItem(PREFIX + key)
  }, memoryFallback.delete(key))

const store = {
  get: getItem,
  set: setItem,
  remove: removeItem,
}

export default store