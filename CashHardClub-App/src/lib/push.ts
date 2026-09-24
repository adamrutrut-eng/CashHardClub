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

/** Call once at app start. Safe to call again. Returns whether OneSignal is live. */
export function initPush(): boolean {
  if (!mod || initialized) return initialized;
  const appId = getOneSignalAppId();
  if (!appId) {
    if (__DEV__) console.warn('[push] No OneSignal App ID configured — set EXPO_PUBLIC_ONESIGNAL_APP_ID or app.json extra.oneSignalAppId');
    return false;
  }
  const { OneSignal, LogLevel } = mod;
  OneSignal.Debug.setLogLevel(__DEV__ ? LogLevel.Warn : LogLevel.None);
  OneSignal.initialize(appId);
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

function markOn() {
  if (!mod) return;
  mod.OneSignal.User.pushSubscription.optIn();
  mod.OneSignal.User.addTags({ alerts: 'on' });
  AsyncStorage.setItem(PREF_KEY, 'on').catch(() => {});
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
      const [permission, canRequest, optedIn] = await Promise.all([
        OneSignal.Notifications.getPermissionAsync(),
        OneSignal.Notifications.canRequestPermission(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
      ]);
      setState({ available: true, configured: true, loaded: true, permission, canRequest, optedIn, enabled: permission && optedIn });
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
    const onPermission = (granted: boolean) => {
      // Granted from the Settings app after an earlier denial → finish the opt-in.
      if (granted) markOn();
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
    let granted = await OneSignal.Notifications.getPermissionAsync();
    if (!granted) granted = await OneSignal.Notifications.requestPermission(true);
    if (granted) markOn();
    await refresh();
    return granted;
  }, [refresh]);

  const disable = useCallback(async () => {
    if (!mod || !initialized) return;
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
