export interface Product {
  id: string;
  name: string;
  price: number;
  img: string;
  url: string;
  bay?: string;
  was?: number | null;
  sizes: string[];
  colors: string[];
  desc?: string;
  /** Transparent cut-out render (PNG) */
  cut?: string;
  /** Short looping product film (MP4) */
  loop?: string;
  /** Live store enrichment (best effort) */
  soldOut: boolean;
  limited: boolean;
  gallery: string[];
}

export type EventStatus = 'on-sale' | 'free' | 'announced' | 'sold-out' | 'past';
export type EventKind = 'event' | 'drop';

export interface ClubEvent {
  id: string;
  kind: EventKind;
  name: string;
  start?: string;
  end?: string;
  venue?: string;
  address?: string;
  city?: string;
  summary?: string;
  details?: string;
  image?: string;
  /** Ticket / product page on the official store (HTTPS) */
  url?: string;
  status: EventStatus;
  price?: number | null;
  age?: string;
}

export type ContentStatus = 'ready' | 'refreshing' | 'offline';
