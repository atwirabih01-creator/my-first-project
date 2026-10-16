// Tiny local-only storage wrapper (Phase 1 keeps everything on this device).
// AsyncStorage uses the browser's localStorage on web. Every call is wrapped in
// try/catch so a blocked or full storage never crashes the app.
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'zaki:v1:';

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
