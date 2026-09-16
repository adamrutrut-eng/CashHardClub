import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'chc.saved.v1';

/** Saved pieces live on the device only (no account needed). */
export async function readSaved(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function writeSaved(ids: string[]) {
  AsyncStorage.setItem(KEY, JSON.stringify(ids)).catch(() => {});
}
