/** Centralised, typed access to build-time environment variables. */

export const APP_NAME: string = import.meta.env.VITE_APP_NAME?.trim() || 'FluidBoard';

/**
 * Base URL used when generating shareable links. Falls back to the current
 * origin at runtime so the app works on any deployment without configuration.
 */
export function getBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
