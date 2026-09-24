/** Every external address the app talks to. All HTTPS (App Transport Security compliant). */
export const SITE_URL = 'https://cashhardclub.com';
export const PRODUCTS_URL = `${SITE_URL}/products.json`;
export const EVENTS_URL = `${SITE_URL}/events.json`;
export const PRIVACY_URL = `${SITE_URL}/privacy`;
export const SUPPORT_URL = `${SITE_URL}/support`;

export const STORE_URL = 'https://shopcashhardclub.squarespace.com/store-MFHja/merch';
export const TICKETS_URL = 'https://shopcashhardclub.squarespace.com/store-MFHja/registration-pass';
/** Undocumented-but-stable Squarespace JSON view of the store (live stock). Best effort only. */
export const STORE_LIVE_JSON_URL = 'https://shopcashhardclub.squarespace.com/store-MFHja?format=json';

export const INSTAGRAM_HANDLE = 'cashhardclub';
export const CONTACTS = [
  { name: 'Daniel White', email: 'danielwhite@cashhardclub.com' },
  { name: 'Kalen Cole', email: 'kalencole@cashhardclub.com' },
] as const;
export const SUPPORT_EMAIL = 'danielwhite@cashhardclub.com';
