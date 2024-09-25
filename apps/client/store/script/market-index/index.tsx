import { create } from 'zustand';

export type MarketIndex = {
  instrumentToken: string;
  name: string;
  value: string | null;
  change: number | null;
  perChange: number | null;
  status: string | null;
};

export type ScriptState = {
  indexes: MarketIndex[];
  setIndexes: (indexes: MarketIndex[]) => void;
  updateIndexes: (indexes: any) => void;
};

export const useMarketIndex = create<ScriptState>()((set) => ({
  indexes: [],
  setIndexes: (data) => set({ indexes: data }),
  updateIndexes: (data) =>
    set((state) => ({
      indexes: state.indexes.map((a) => {
        if (a.instrumentToken == data.instrumentToken) {
          let status = null;
          if (a.value && a.value < data.ltp) {
            status = 'INCREASE';
          }
          if (a.value && a.value > data.ltp) {
            status = 'DECREASE';
          }
          return {
            ...a,
            value: data.ltp,
            perChange: data.change,
            status,
          };
        }
        return a;
      }),
    })),
}));
