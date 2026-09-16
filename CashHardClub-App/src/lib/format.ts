export function formatPrice(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

export interface DateParts {
  day: string;
  month: string;
  weekday: string;
  time: string;
  full: string;
  valid: boolean;
}

/** Human-readable event date pieces in the phone's locale and time zone. */
export function dateParts(iso: string | undefined): DateParts {
  const d = iso ? new Date(iso) : new Date(NaN);
  if (Number.isNaN(d.getTime())) return { day: '', month: '', weekday: '', time: '', full: 'Date to be announced', valid: false };
  try {
    const day = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(d);
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d).toUpperCase();
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d);
    const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);
    return { day, month, weekday, time, full: `${longDate} · ${time}`, valid: true };
  } catch {
    return { day: String(d.getDate()), month: '', weekday: '', time: '', full: d.toDateString(), valid: true };
  }
}

/** Squarespace CDN images accept ?format=<width>w; other hosts are returned untouched. */
export function imageAt(url: string, width: 750 | 1000 | 1500 | 2500): string {
  if (!/squarespace/i.test(url)) return url;
  if (/[?&]format=\d+w/.test(url)) return url.replace(/format=\d+w/, `format=${width}w`);
  return `${url}${url.includes('?') ? '&' : '?'}format=${width}w`;
}
