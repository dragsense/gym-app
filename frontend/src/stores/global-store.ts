import { create } from 'zustand';


type StoresMap = Map<string, any>;

interface IGlobalStore {
  stores: StoresMap;
  addStore: <T>(key: string, store: T) => void;
  getStore: <T>(key: string) => T | undefined;
  removeStore: (key: string) => void;
}

export const useGlobalStore = create<IGlobalStore>((set, get) => ({
  stores: new Map(),

  addStore: (key, store) => {
    set((state) => {
      const newStores = new Map(state.stores);
      newStores.set(key, store);
      return { stores: newStores };
    });
  },

  getStore: (key) => {
    return get().stores.get(key);
  },

  removeStore: (key) => {
    set((state) => {
      const newStores = new Map(state.stores);
      newStores.delete(key);
      return { stores: newStores };
    });
  },
}));