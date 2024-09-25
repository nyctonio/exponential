import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SuspiciousTrades = {
  tradeType: string;
  scriptName: string;
  exchange: string;
  isIntraday: string;
  orderType: string;
  buyPrice: string;
  sellPrice: string;
  lotSize: number;
  quantity: number;
  quantityLeft: number;
  transactionStatus: string;
  margin: string;
  marginChargedType: string;
  marginChargedRate: number;
  brokerage: string;
  brokerageChargedType: string;
  brokerageChargedRate: number;
  isReconciliation: boolean;
  orderExecutionDate: string;
  ipAddr: string;
  location: string;
  flag: string;
  parentId: number;
  userId: number;
  score: number;
  remark: string;
  deviceId: number;
  deviceType: string;
};

type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  suspiciousTrades: SuspiciousTrades[];
};

type actions = {
  setSuspiciousTrades: (suspiciousTrades: SuspiciousTrades[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useSuspiciousTrades = create<state & actions>()(
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
      name: '__expo_suspicious_trades',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
