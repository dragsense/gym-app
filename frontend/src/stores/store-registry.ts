
// Stores
import { useGlobalStore } from '@/stores';


export function useRegisteredStore<TStore>(key: string) {
    return useGlobalStore.getState().getStore<TStore>(key);
}

export function registerStore<TStore>(key: string, store: TStore) {
  useGlobalStore.getState().addStore(key, store);
  return store;
}

export function deregisterStore(key: string) {
  useGlobalStore.getState().removeStore(key);
}