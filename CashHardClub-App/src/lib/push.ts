import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationClickEvent, NotificationWillDisplayEvent } from 'react-native-onesignal';

/**
 * OneSignal integration, done Apple's way (guideline 4.5.4):
 *  - the OS permission prompt is only shown from the Alerts screen, after consent copy, on a user tap
 *  - alerts are promotional, so they are opt-in and there is an in-app switch to opt out
 *  - the app works fully with alerts off
 *  - consent gating: nothing is sent to OneSignal and no subscription exists until the user first turns
 *    alerts on (setConsentRequired before initialize, setConsentGiven only inside the opt-in)
 * Expo Go has no OneSignal native module, so everything degrades to a visible "unavailable" state there.
 */
type OneSignalModule = typeof import('react-native-onesignal');

function loadModule(): OneSignalModule | null {
  if (Constants.executionEnvironment === 'storeClient') return null; // Expo Go
  try {
    return require('react-native-onesignal') as OneSignalModule;
  } catch {
    return null;
  }
}

const mod = loadModule();
const PREF_KEY = 'chc.alerts.pref.v1';
const INTEREST_KEY = 'chc.alerts.interests.v1';
// Tag budget: the OneSignal Free plan allows 6 data tags per user; the app uses 3 (alerts, drops, events).
// Don't add consent or other tags — the consent state lives in setConsentGiven and on the device (PREF_KEY).

export const pushAvailable = !!mod?.OneSignal;

export function getOneSignalAppId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  const extra = Constants.expoConfig?.extra as { oneSignalAppId?: unknown } | undefined;
  const fromConfig = extra?.oneSignalAppId;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  if (typeof fromConfig === 'string' && fromConfig.trim()) return fromConfig.trim();
  return '';
}

let initialized = false;
/** PREF_KEY as read by loadPushPref(); undefined until that read finishes. */
let storedPref: string | null | undefined;

/**
 * Reads the stored alerts choice so initPush can restore consent *before* OneSignal.initialize
 * (otherwise iOS starts every launch without consent and can drop a cold-start notification tap).
 * The root layout awaits this behind the splash screen. Never rejects.
 */
export async function loadPushPref(): Promise<void> {
  storedPref = await AsyncStorage.getItem(PREF_KEY).catch(() => null);
}

/** Call once at app start (after loadPushPref). Safe to call again. Returns whether OneSignal is live. */
export function initPush(): boolean {
  if (!mod || initialized) return initialized;
  const appId = getOneSignalAppId();
  if (!appId) {
    if (__DEV__) console.warn('[push] No OneSignal App ID configured — set EXPO_PUBLIC_ONESIGNAL_APP_ID or app.json extra.oneSignalAppId');
    return false;
  }
  const { OneSignal, LogLevel } = mod;
  OneSignal.Debug.setLogLevel(__DEV__ ? LogLevel.Warn : LogLevel.None);
  // Privacy promise: no OneSignal data flow before the user's in-app opt-in.
  OneSignal.setConsentRequired(true);
  // Returning user who already opted in: restore consent before initialize so the SDK starts normally.
  if (storedPref === 'on') OneSignal.setConsentGiven(true);
  OneSignal.initialize(appId);
  if (storedPref === undefined) {
    // Fallback if loadPushPref() was not awaited: restore consent as soon as the pref is read.
    AsyncStorage.getItem(PREF_KEY)
      .then((pref) => {
        if (pref === 'on') OneSignal.setConsentGiven(true);
      })
      .catch(() => {});
  }
  // Show alerts even while the app is in the foreground.
  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: NotificationWillDisplayEvent) => {
    event.preventDefault();
    event.getNotification().display();
  });
  initialized = true;
  return true;
}

export type PushClickHandler = (url: string | null, data: Record<string, unknown> | null) => void;

/** Fires when a user taps a notification (cold start included). Returns an unsubscribe function. */
export function addPushClickListener(handler: PushClickHandler): () => void {
  if (!mod || !initialized) return () => {};
  const { OneSignal } = mod;
  const listener = (event: NotificationClickEvent) => {
    const n = event.notification as unknown as { launchURL?: string; launchUrl?: string; additionalData?: unknown };
    const data = n.additionalData && typeof n.additionalData === 'object' ? (n.additionalData as Record<string, unknown>) : null;
    const dataUrl = data && typeof data.url === 'string' ? data.url : null;
    handler(dataUrl ?? n.launchURL ?? n.launchUrl ?? null, data);
  };
  OneSignal.Notifications.addEventListener('click', listener);
  return () => OneSignal.Notifications.removeEventListener('click', listener);
}

export interface PushState {
  available: boolean;
  configured: boolean;
  loaded: boolean;
  permission: boolean;
  canRequest: boolean;
  optedIn: boolean;
  enabled: boolean;
}

const initialState: PushState = {
  available: pushAvailable,
  configured: false,
  loaded: false,
  permission: false,
  canRequest: true,
  optedIn: false,
  enabled: false,
};

/** Set by enable() while the in-app opt-in is in flight, so a permission grant from that flow completes it. */
let pendingEnable = false;

async function readInterests(): Promise<Interests> {
  try {
    const raw = await AsyncStorage.getItem(INTEREST_KEY);
    if (!raw) return defaultInterests;
    const parsed = JSON.parse(raw) as Partial<Interests>;
    return { drops: parsed.drops !== false, events: parsed.events !== false };
  } catch {
    return defaultInterests;
  }
}

async function markOn() {
  if (!mod) return;
  mod.OneSignal.setConsentGiven(true);
  mod.OneSignal.User.pushSubscription.optIn();
  // Tags set before consent were dropped by the SDK, so send the full set now.
  const interests = await readInterests();
  mod.OneSignal.User.addTags({ alerts: 'on', drops: interests.drops ? 'on' : 'off', events: interests.events ? 'on' : 'off' });
  await AsyncStorage.setItem(PREF_KEY, 'on').catch(() => {});
}

/** The device's alert IDs, for "Delete my alert data". Both null when alerts never registered here. */
export async function getAlertIds(): Promise<{ subscriptionId: string | null; onesignalId: string | null }> {
  if (!mod || !initialized) return { subscriptionId: null, onesignalId: null };
  try {
    return {
      subscriptionId: await mod.OneSignal.User.pushSubscription.getIdAsync(),
      onesignalId: await mod.OneSignal.User.getOnesignalId(),
    };
  } catch {
    return { subscriptionId: null, onesignalId: null };
  }
}

export function usePushState() {
  const [state, setState] = useState<PushState>(initialState);

  const refresh = useCallback(async () => {
    if (!mod || !initialized) {
      setState((s) => ({ ...s, loaded: true, configured: initialized }));
      return;
    }
    const { OneSignal } = mod;
    try {
      const [permission, canRequest, optedIn, pref] = await Promise.all([
        OneSignal.Notifications.getPermissionAsync(),
        OneSignal.Notifications.canRequestPermission(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
        AsyncStorage.getItem(PREF_KEY).catch(() => null),
      ]);
      // On Android 12 and lower permission is granted at install, so "on" also needs the in-app opt-in.
      const enabled = permission && optedIn && pref === 'on';
      setState({ available: true, configured: true, loaded: true, permission, canRequest, optedIn, enabled });
    } catch {
      setState((s) => ({ ...s, loaded: true, configured: true }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const appState = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    if (!mod || !initialized) return () => appState.remove();
    const { OneSignal } = mod;
    const onPermission = async (granted: boolean) => {
      // Granted from the Settings app after an earlier in-app opt-in (or during one) → finish it.
      // A grant with no in-app opt-in must not sign anyone up for promotional alerts.
      if (granted) {
        const pref = await AsyncStorage.getItem(PREF_KEY).catch(() => null);
        if (pref === 'on' || pendingEnable) await markOn();
      }
      refresh();
    };
    const onSubscription = () => refresh();
    OneSignal.Notifications.addEventListener('permissionChange', onPermission);
    OneSignal.User.pushSubscription.addEventListener('change', onSubscription);
    return () => {
      appState.remove();
      OneSignal.Notifications.removeEventListener('permissionChange', onPermission);
      OneSignal.User.pushSubscription.removeEventListener('change', onSubscription);
    };
  }, [refresh]);

  /** Ask the OS (in context) and opt in. Resolves true when alerts are on. */
  const enable = useCallback(async (): Promise<boolean> => {
    if (!mod || !initialized) return false;
    const { OneSignal } = mod;
    pendingEnable = true;
    try {
      // The tap on "On" is the opt-in. Consent must be given before requestPermission: on iOS the SDK
      // silently drops requestPermission without consent and its promise never resolves.
      OneSignal.setConsentGiven(true);
      let granted = await OneSignal.Notifications.getPermissionAsync();
      if (!granted) granted = await OneSignal.Notifications.requestPermission(true);
      if (granted) await markOn();
      await refresh();
      return granted;
    } finally {
      pendingEnable = false;
    }
  }, [refresh]);

  const disable = useCallback(async () => {
    if (!mod || !initialized) return;
    // Consent stays granted (never setConsentGiven(false)); the record is kept but unsubscribed.
    mod.OneSignal.User.pushSubscription.optOut();
    mod.OneSignal.User.addTags({ alerts: 'off' });
    await AsyncStorage.setItem(PREF_KEY, 'off').catch(() => {});
    await refresh();
  }, [refresh]);

  return { ...state, refresh, enable, disable };
}

export type Interest = 'drops' | 'events';
export type Interests = Record<Interest, boolean>;
const defaultInterests: Interests = { drops: true, events: true };

/** Which kinds of alerts the user wants; mirrored to OneSignal tags for dashboard segments. */
export function useInterests(): [Interests, (key: Interest, on: boolean) => void] {
  const [interests, setInterests] = useState<Interests>(defaultInterests);
  useEffect(() => {
    AsyncStorage.getItem(INTEREST_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<Interests>;
        setInterests({ drops: parsed.drops !== false, events: parsed.events !== false });
      })
      .catch(() => {});
  }, []);
  const set = useCallback((key: Interest, on: boolean) => {
    setInterests((prev) => {
      const next = { ...prev, [key]: on };
      AsyncStorage.setItem(INTEREST_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    if (mod && initialized) mod.OneSignal.User.addTags({ [key]: on ? 'on' : 'off' });
  }, []);
  return [interests, set];
}
