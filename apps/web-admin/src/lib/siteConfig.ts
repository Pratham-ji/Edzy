/**
 * Centralized public domain & runtime origin helpers for Edzy Web ERP.
 */
export const CANONICAL_SITE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PUBLIC_SITE_URL) ||
  'https://edzy.pages.dev';

/** Returns the current browser origin when available, or falls back to the canonical URL. */
export function getRuntimeOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return CANONICAL_SITE_URL.replace(/\/$/, '');
}

/** Returns the public School Portal Login URL. */
export function getPortalUrl(preferCanonical = false): string {
  const base = preferCanonical
    ? CANONICAL_SITE_URL.replace(/\/$/, '')
    : getRuntimeOrigin();
  return `${base}/portal`;
}
