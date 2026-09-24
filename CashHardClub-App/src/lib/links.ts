/**
 * Turns a URL that arrives from outside (a push notification's Launch URL, a shared link)
 * into something the app can act on. Owners paste ordinary store links into OneSignal;
 * the app opens the matching native product screen instead of a web page.
 */
export type Incoming =
  | { kind: 'product'; slug: string }
  | { kind: 'route'; path: string }
  | { kind: 'web'; url: string }
  | { kind: 'ignore' };

const STORE_HOSTS = new Set(['cashhardclub.com', 'www.cashhardclub.com', 'shop.cashhardclub.com', 'shopcashhardclub.squarespace.com']);

/** Last path segment of a Squarespace product URL (…/store-XXXX/p/<slug>), or '' */
export function slugOf(url: string): string {
  const m = url.match(/\/p\/([^/?#]+)/);
  if (!m) return '';
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export function productSlugFromUrl(url: string): string | null {
  const m = url.match(/^https:\/\/([^/]+)\/store-[A-Za-z0-9]+\/p\/([^/?#]+)/i);
  if (!m || !STORE_HOSTS.has(m[1].toLowerCase())) return null;
  try {
    return decodeURIComponent(m[2]);
  } catch {
    return m[2];
  }
}

export function parseIncoming(raw: string): Incoming {
  const url = (raw ?? '').trim();
  if (!url) return { kind: 'ignore' };
  const scheme = url.match(/^cashhardclub:\/\/(.*)$/i);
  if (scheme) return { kind: 'route', path: '/' + scheme[1].replace(/^\/+/, '') };
  const slug = productSlugFromUrl(url);
  if (slug) return { kind: 'product', slug };
  if (/^https:\/\//i.test(url)) return { kind: 'web', url };
  return { kind: 'ignore' };
}
