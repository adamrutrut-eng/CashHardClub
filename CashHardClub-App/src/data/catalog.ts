import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchJson } from '@/lib/fetchJson';
import { PRODUCTS_URL } from './content';
import snapshot from './snapshots/products.json';
import type { Product } from './types';

const CACHE_KEY = 'chc.catalog.v1';

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string' && !!s.trim()) : []);

/** Validates an untrusted products.json payload. Unknown/invalid entries are dropped, never crash the app. */
export function normalizeProducts(input: unknown): Product[] | null {
  if (!input || typeof input !== 'object') return null;
  const list = (input as { products?: unknown }).products;
  if (!Array.isArray(list)) return null;
  const out: Product[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const id = str(r.id);
    const name = str(r.name);
    const img = str(r.img);
    const url = str(r.url);
    const price = num(r.price);
    if (!id || !name || !img || !url || price === undefined) continue;
    if (!url.startsWith('https://') || !img.startsWith('https://')) continue;
    out.push({
      id,
      name,
      price,
      img,
      url,
      bay: str(r.bay),
      was: num(r.was) ?? null,
      sizes: strList(r.sizes),
      colors: strList(r.colors),
      desc: str(r.desc),
      cut: str(r.cut),
      loop: str(r.loop),
      soldOut: r.soldOut === true,
      limited: r.limited === true,
      gallery: strList(r.gallery),
    });
  }
  return out;
}

/** Shipped inside the binary so the shop renders instantly, even offline on first launch. */
export const bundledProducts: Product[] = normalizeProducts(snapshot) ?? [];

export async function readCachedProducts(): Promise<Product[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? normalizeProducts(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function fetchRemoteProducts(): Promise<Product[]> {
  const data = await fetchJson<unknown>(PRODUCTS_URL);
  const list = normalizeProducts(data);
  if (!list || list.length === 0) throw new Error('products.json is empty or malformed');
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
  return list;
}
