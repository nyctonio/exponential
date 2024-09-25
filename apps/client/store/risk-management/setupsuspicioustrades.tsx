import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SetSuspiciousTrades = {
  _id: string;
  condition: string;
  level: string;
  priority: number;
  status: string;
  points: number;
  keyword: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
};

type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  suspiciousTrades: SetSuspiciousTrades[];
};

type actions = {
  setSuspiciousTrades: (suspiciousTrades: SetSuspiciousTrades[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useSetSuspiciousTrades = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      suspiciousTrades: [],
      refreshCount: 0,
      setLoading: (loading) => set({ loading }),
      setSuspiciousTrades: (suspiciousTrades) => set({ suspiciousTrades }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setPagination: (pagination) => set({ pagination }),
    }),
    {
      name: '__expo_setsuspicious_trades',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
