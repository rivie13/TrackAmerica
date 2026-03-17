// Platform-aware fetch that handles CORS restrictions on web.
// Mobile (React Native) has no CORS restrictions — calls APIs directly.
// Web browsers enforce CORS — we proxy through a CORS service for APIs that don't support it.
//
// Set EXPO_PUBLIC_CORS_PROXY_URL in .env to opt-in to a CORS proxy (e.g. https://corsproxy.io/?).
// If not set, requests are made directly without a third-party proxy.
// NOTE: Never proxy URLs containing sensitive query params (API keys, tokens).

import { Platform } from 'react-native';

// Optional CORS proxy URL, configurable via environment.
const CORS_PROXY: string | undefined =
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  typeof process.env.EXPO_PUBLIC_CORS_PROXY_URL === 'string' &&
  process.env.EXPO_PUBLIC_CORS_PROXY_URL.length > 0
    ? process.env.EXPO_PUBLIC_CORS_PROXY_URL
    : undefined;

// APIs known to block CORS from browsers
const CORS_BLOCKED_HOSTS = [
  'api.stlouisfed.org',
  'www.realclearpolitics.com',
  'orig.realclearpolitics.com',
];

/** Returns true if the URL contains query params that are likely sensitive (API keys, tokens). */
function hasSensitiveQuery(url: string): boolean {
  try {
    const search = new URL(url).search.toLowerCase();
    if (!search) return false;
    const sensitiveParams = ['api_key', 'apikey', 'key', 'token', 'access_token'];
    return sensitiveParams.some((p) => search.includes(`${p}=`));
  } catch {
    return false;
  }
}

function needsProxy(url: string): boolean {
  if (Platform.OS !== 'web' || !CORS_PROXY) return false;
  // Never send URLs with sensitive query params through a third-party proxy.
  if (hasSensitiveQuery(url)) return false;
  try {
    const hostname = new URL(url).hostname;
    return CORS_BLOCKED_HOSTS.some((h) => hostname.includes(h));
  } catch {
    return false;
  }
}

export async function corsFetch(url: string, options?: RequestInit): Promise<Response> {
  const finalUrl = needsProxy(url) && CORS_PROXY ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
  return fetch(finalUrl, options);
}
