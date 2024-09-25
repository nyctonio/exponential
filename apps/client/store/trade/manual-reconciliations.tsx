import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ReconciliationsActionsType = {
  id: number;
  instrumentName: string;
  actionType: string;
  actionStatus: string;
  actionDate: string;
  affectedOrders: [];
  actionData: {
    dividend: {
      amount: number;
    } | null;
    bonus: {
      r1: number;
      r2: number;
    } | null;
    split: {
      r1: number;
      r2: number;
    } | null;
  };
};

type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  reconciliations: ReconciliationsActionsType[];
};

type actions = {
  setManualReconciliations: (
    reconciliations: ReconciliationsActionsType[]
  ) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useManualReconciliations = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      refreshCount: 0,
      reconciliations: [],
      setLoading: (loading) => set({ loading }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setPagination: (pagination) => set({ pagination }),
      setManualReconciliations: (reconciliations) => set({ reconciliations }),
    }),
    {
      name: '__expo_reconciliations',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
