import { StateStorage } from 'zustand/middleware';

// In-memory fallback used when MMKV is unavailable (e.g. Expo Go)
const memoryStore: Record<string, string> = {};

let zustandStorageImpl: StateStorage;

try {
  // MMKV throws at module load time in Expo Go — catch it here
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkvStorage = new MMKV({ id: 'twentify-storage' });

  zustandStorageImpl = {
    setItem: (name, value) => mmkvStorage.set(name, value),
    getItem: (name) => mmkvStorage.getString(name) ?? null,
    removeItem: (name) => mmkvStorage.delete(name),
  };
} catch {
  // Expo Go fallback: simple in-memory store (state resets on reload, which is fine for dev)
  zustandStorageImpl = {
    setItem: (name, value) => { memoryStore[name] = value; },
    getItem: (name) => memoryStore[name] ?? null,
    removeItem: (name) => { delete memoryStore[name]; },
  };
}

export const zustandStorage: StateStorage = zustandStorageImpl;
