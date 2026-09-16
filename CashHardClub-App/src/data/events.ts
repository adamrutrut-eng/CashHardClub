import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchJson } from '@/lib/fetchJson';
import { EVENTS_URL } from './content';
import snapshot from './snapshots/events.json';
import type { ClubEvent, EventStatus } from './types';

const CACHE_KEY = 'chc.events.v1';
const STATUSES: EventStatus[] = ['on-sale', 'free', 'announced', 'sold-out', 'past'];

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export function normalizeEvents(input: unknown): ClubEvent[] | null {
  if (!input || typeof input !== 'object') return null;
  const list = (input as { events?: unknown }).events;
  if (!Array.isArray(list)) return null;
  const out: ClubEvent[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const id = str(r.id);
    const name = str(r.name);
    if (!id || !name) continue;
    const url = str(r.url);
    const image = str(r.image);
    const status = STATUSES.includes(r.status as EventStatus) ? (r.status as EventStatus) : 'announced';
    out.push({
      id,
      name,
      kind: r.kind === 'drop' ? 'drop' : 'event',
      start: str(r.start),
      end: str(r.end),
      venue: str(r.venue),
      address: str(r.address),
      city: str(r.city),
      summary: str(r.summary),
      details: str(r.details),
      image: image && image.startsWith('https://') ? image : undefined,
      url: url && url.startsWith('https://') ? url : undefined,
      status,
      price: typeof r.price === 'number' ? r.price : null,
      age: str(r.age),
    });
  }
  return out;
}

export const bundledEvents: ClubEvent[] = normalizeEvents(snapshot) ?? [];

export async function readCachedEvents(): Promise<ClubEvent[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? normalizeEvents(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function fetchRemoteEvents(): Promise<ClubEvent[]> {
  const data = await fetchJson<unknown>(EVENTS_URL);
  const list = normalizeEvents(data);
  if (!list) throw new Error('events.json is malformed');
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
  return list;
}

/** An event is "past" once its end (or start) is behind us, or when the file says so. */
export function isPast(e: ClubEvent, now = Date.now()): boolean {
  if (e.status === 'past') return true;
  const when = e.end ?? e.start;
  if (!when) return false;
  const t = new Date(when).getTime();
  return Number.isFinite(t) && t < now;
}

export function splitEvents(events: ClubEvent[], now = Date.now()) {
  const time = (e: ClubEvent) => {
    const t = e.start ? new Date(e.start).getTime() : NaN;
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
  };
  const upcoming = events.filter((e) => !isPast(e, now)).sort((a, b) => time(a) - time(b));
  const past = events.filter((e) => isPast(e, now)).sort((a, b) => time(b) - time(a));
  return { upcoming, past };
}
