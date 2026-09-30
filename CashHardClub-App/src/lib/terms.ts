import { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * One-time Terms of Use acceptance (clickwrap). Bump TERMS_VERSION — same YYYY-MM-DD as the
 * "Version" on cashhardclub.com/terms — only for a material change: everyone sees the screen again.
 * Stored on the device only; nothing is sent anywhere.
 */
export const TERMS_VERSION = '2026-09-29';
const KEY = 'chc.terms.accepted.v1';

/** The version this device last agreed to, or null (never agreed, or storage unavailable). */
export async function getAcceptedTermsVersion(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: unknown };
    return typeof parsed.version === 'string' ? parsed.version : null;
  } catch {
    return null;
  }
}

/** Records acceptance of the current version. Never throws: a storage failure must not trap the user. */
export async function acceptTerms(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ version: TERMS_VERSION, acceptedAt: new Date().toISOString() }));
  } catch {
    /* the screen simply shows again next launch */
  }
}

export interface TermsState {
  accepted: boolean;
  /** Version accepted before this launch (null on a fresh install) — drives the "updated" wording. */
  previousVersion: string | null;
  accept: () => Promise<void>;
}

export const TermsContext = createContext<TermsState>({ accepted: false, previousVersion: null, accept: async () => {} });

export function useTerms(): TermsState {
  return useContext(TermsContext);
}
