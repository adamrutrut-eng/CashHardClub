import { fetchJson } from '@/lib/fetchJson';
import { slugOf } from '@/lib/links';
import { STORE_LIVE_JSON_URL } from './content';

export interface LiveInfo {
  soldOut: boolean;
  limited: boolean;
  gallery: string[];
}

interface SqVariant {
  unlimited?: boolean;
  qtyInStock?: number;
}
interface SqItem {
  fullUrl?: string;
  soldOut?: boolean;
  variants?: SqVariant[];
  items?: { assetUrl?: string }[];
}

/**
 * Best-effort live stock + gallery from the Squarespace store's JSON view, keyed by product slug.
 * The app is fully functional without it: any failure simply leaves products unchanged.
 */
export async function fetchLiveStore(): Promise<Map<string, LiveInfo>> {
  const data = await fetchJson<{ items?: unknown[] }>(STORE_LIVE_JSON_URL, 7000);
  const map = new Map<string, LiveInfo>();
  for (const raw of data.items ?? []) {
    if (!raw || typeof raw !== 'object') continue;
    const it = raw as SqItem;
    const slug = slugOf(it.fullUrl ?? '');
    if (!slug) continue;
    const variants = Array.isArray(it.variants) ? it.variants.filter((v): v is SqVariant => !!v && typeof v === 'object') : [];
    const finite = variants.filter((v) => v.unlimited !== true);
    const soldOut = it.soldOut === true || (variants.length > 0 && finite.length === variants.length && finite.every((v) => (v.qtyInStock ?? 0) <= 0));
    const limited = !soldOut && finite.some((v) => (v.qtyInStock ?? 0) > 0);
    const gallery = (Array.isArray(it.items) ? it.items : [])
      .map((i) => (i && typeof i.assetUrl === 'string' ? i.assetUrl : ''))
      .filter((u) => u.startsWith('https://'))
      .map((u) => `${u}?format=1500w`);
    map.set(slug, { soldOut, limited, gallery });
  }
  return map;
}
