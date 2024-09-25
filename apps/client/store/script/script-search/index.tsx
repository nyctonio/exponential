import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ScriptState = {
  searchScript: {
    exchange: string;
    searchValue: string;
    options: {
      tradingsymbol: string;
      exchange: string;
      id: string;
      instrument_token: string;
    }[];
  };
  selectedScripts: string[];
  scriptAddCount: number;
  increaseScriptAddCount: () => void;
  setSelectedScripts: (data: string[]) => void;
  setSearchScript: (data: { exchange: string; searchValue: string }) => void;
  setSearchScriptOptions: (
    options: {
      tradingsymbol: string;
      exchange: string;
      id: string;
      instrument_token: string;
    }[]
  ) => void;
};

export const useSearchScripts = create<ScriptState>()(
  persist(
    (set, get) => ({
      searchScript: {
        exchange: '',
        options: [],
        searchValue: '',
      },
      selectedScripts: [],
      scriptAddCount: 0,
      increaseScriptAddCount: () =>
        set((state) => {
          return {
            scriptAddCount: state.scriptAddCount + 1,
          };
        }),
      setSelectedScripts: (data) => set({ selectedScripts: data }),
      setSearchScript: (data) =>
        set((state) => {
          return {
            searchScript: {
              exchange: data.exchange,
              searchValue: data.searchValue,
              options: state.searchScript.options,
            },
          };
        }),
      setSearchScriptOptions: (options) =>
        set((state) => {
          return {
            searchScript: {
              exchange: state.searchScript.exchange,
              searchValue: state.searchScript.searchValue,
              options: options,
            },
          };
        }),
    }),
    {
      name: '__expo_script-search', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
