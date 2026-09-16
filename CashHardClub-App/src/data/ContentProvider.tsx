import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { openInAppBrowser } from '@/lib/browser';
import { parseIncoming, slugOf } from '@/lib/links';
import { bundledProducts, fetchRemoteProducts, readCachedProducts } from './catalog';
import { bundledEvents, fetchRemoteEvents, readCachedEvents } from './events';
import { readSaved, writeSaved } from './saved';
import { fetchLiveStore, type LiveInfo } from './squarespace';
import type { ClubEvent, ContentStatus, Product } from './types';

interface ContentValue {
  products: Product[];
  events: ClubEvent[];
  status: ContentStatus;
  lastSync: number | null;
  refresh: () => Promise<void>;
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  productById: (id: string) => Product | undefined;
  eventById: (id: string) => ClubEvent | undefined;
  /** Route an external URL (push Launch URL, shared link) to the right native screen. */
  openUrl: (url: string) => Promise<void>;
}

const ContentContext = createContext<ContentValue | null>(null);

function applyLive(list: Product[], live: Map<string, LiveInfo> | null): Product[] {
  if (!live) return list;
  return list.map((p) => {
    const info = live.get(slugOf(p.url));
    return info ? { ...p, soldOut: info.soldOut, limited: info.limited, gallery: info.gallery } : p;
  });
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(bundledProducts);
  const [events, setEvents] = useState<ClubEvent[]>(bundledEvents);
  const [status, setStatus] = useState<ContentStatus>('ready');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const liveRef = useRef<Map<string, LiveInfo> | null>(null);
  const productsRef = useRef(products);
  const eventsRef = useRef(events);
  productsRef.current = products;
  eventsRef.current = events;

  const refresh = useCallback(async () => {
    setStatus('refreshing');
    const [remoteProducts, remoteEvents, live] = await Promise.allSettled([fetchRemoteProducts(), fetchRemoteEvents(), fetchLiveStore()]);
    if (live.status === 'fulfilled') liveRef.current = live.value;
    let anyOk = false;
    if (remoteProducts.status === 'fulfilled') {
      anyOk = true;
      setProducts(applyLive(remoteProducts.value, liveRef.current));
    } else if (live.status === 'fulfilled') {
      setProducts((prev) => applyLive(prev, liveRef.current));
    }
    if (remoteEvents.status === 'fulfilled') {
      anyOk = true;
      setEvents(remoteEvents.value);
    }
    setStatus(anyOk ? 'ready' : 'offline');
    if (anyOk) setLastSync(Date.now());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cachedProducts, cachedEvents, saved] = await Promise.all([readCachedProducts(), readCachedEvents(), readSaved()]);
      if (cancelled) return;
      if (cachedProducts && cachedProducts.length > 0) setProducts(cachedProducts);
      if (cachedEvents) setEvents(cachedEvents);
      setSavedIds(saved);
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);
  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeSaved(next);
      return next;
    });
  }, []);

  const productById = useCallback((id: string) => productsRef.current.find((p) => p.id === id), []);
  const eventById = useCallback((id: string) => eventsRef.current.find((e) => e.id === id), []);

  const openUrl = useCallback(
    async (raw: string) => {
      const parsed = parseIncoming(raw);
      switch (parsed.kind) {
        case 'route':
          router.push(parsed.path as never);
          return;
        case 'product': {
          const product = productsRef.current.find((p) => slugOf(p.url) === parsed.slug);
          if (product) {
            router.push({ pathname: '/product/[id]', params: { id: product.id } });
            return;
          }
          const event = eventsRef.current.find((e) => e.url && slugOf(e.url) === parsed.slug);
          if (event) {
            router.push({ pathname: '/event/[id]', params: { id: event.id } });
            return;
          }
          await openInAppBrowser(raw);
          return;
        }
        case 'web': {
          const event = eventsRef.current.find((e) => e.url === parsed.url);
          if (event) {
            router.push({ pathname: '/event/[id]', params: { id: event.id } });
            return;
          }
          await openInAppBrowser(parsed.url);
          return;
        }
        default:
          return;
      }
    },
    [router],
  );

  const value = useMemo<ContentValue>(
    () => ({ products, events, status, lastSync, refresh, savedIds, isSaved, toggleSaved, productById, eventById, openUrl }),
    [products, events, status, lastSync, refresh, savedIds, isSaved, toggleSaved, productById, eventById, openUrl],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx;
}
