// Platform-aware fetch that handles CORS restrictions on web.
// Mobile (React Native) has no CORS restrictions — calls APIs directly.
// Web browsers enforce CORS — we proxy through a CORS service for APIs that don't support it.

import { Platform } from 'react-native';

const CORS_PROXY = 'https://corsproxy.io/?';

// APIs known to block CORS from browsers
const CORS_BLOCKED_HOSTS = [
  'api.stlouisfed.org',
  'www.realclearpolitics.com',
  'orig.realclearpolitics.com',
];

function needsProxy(url: string): boolean {
  if (Platform.OS !== 'web') return false;
  try {
    const hostname = new URL(url).hostname;
    return CORS_BLOCKED_HOSTS.some((h) => hostname.includes(h));
  } catch {
    return false;
  }
}

export async function corsFetch(url: string, options?: RequestInit): Promise<Response> {
  const finalUrl = needsProxy(url) ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
  return fetch(finalUrl, options);
}
