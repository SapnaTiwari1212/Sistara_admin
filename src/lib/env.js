/**
 * Environment access.
 * ---------------------------------------------------------------------------
 * Only PUBLIC variables (VITE_*) may ever be read from here — anything
 * prefixed VITE_ is bundled into the client and is therefore public.
 *
 * Secrets (service-role keys, Razorpay secret keys) must stay on the server.
 */

const env = import.meta.env || {}

export const ENV = {
  supabaseUrl: env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || '',
}

/** True when a real backend has been wired up. */
export const isBackendConfigured = Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey)

/** Demo mode keeps the full UI working without any credentials. */
export const isDemoMode = !isBackendConfigured