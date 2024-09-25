import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
export type SettelmentIndexesType = {
  transactionParticularId: number;
  transactionParticular: string;
  companyAmount: number;
  masterAmount: number;
  brokerAmount: number;
  subBrokerAmount: number;
  totalAmount: number;
};

type state = {
  settlementIndexes: SettelmentIndexesType[];
  loading: boolean;
};

type actions = {
  setLoading: (loading: boolean) => void;
  setSettelmentIndexes: (settelmentIndexes: SettelmentIndexesType[]) => void;
};

export const useSettelmentIndexes = create<state & actions>()(
  persist(
    (set) => ({
      settlementIndexes: [],
      loading: false,
      setLoading: (loading: boolean) => set((state) => ({ loading })),
      setSettelmentIndexes: (settlementIndexes: SettelmentIndexesType[]) =>
        set((state) => ({ settlementIndexes })),
    }),
    {
      name: '__expo_settelment_indexes',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
