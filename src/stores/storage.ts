import { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
} catch (e) {
  console.warn('[Storage] MMKV unavailable, falling back to AsyncStorage.', e);
  zustandStorageImpl = {
    setItem: (name, value) => AsyncStorage.setItem(name, value),
    getItem: (name) => AsyncStorage.getItem(name),
    removeItem: (name) => AsyncStorage.removeItem(name),
  };
}

export const zustandStorage: StateStorage = zustandStorageImpl;
