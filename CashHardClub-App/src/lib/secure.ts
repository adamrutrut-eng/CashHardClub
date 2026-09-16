import * as SecureStore from 'expo-secure-store';

/**
 * Keychain (iOS) / Keystore-backed (Android) storage for sensitive values.
 * v1 stores nothing sensitive; v1.1 (members) keeps auth session tokens here — never in AsyncStorage.
 * Values are limited to 2048 bytes; larger blobs must be encrypted with a key kept here (see docs/10-ARCHITECTURE-V1.1.md).
 */
export async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY });
    return true;
  } catch {
    return false;
  }
}

export async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* already gone */
  }
}
