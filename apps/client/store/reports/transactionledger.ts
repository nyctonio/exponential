import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TransactionLedger = {
  id: number;
  transactionAmount: string;
  transactionRemarks: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  order: {
    id: number;
    scriptName: string;
    quantity: number;
  };
  user: {
    id: number;
    username: string;
  };
  transactionParticular: {
    id: number;
    prjSettConstant: string;
  };
  transactionType: {
    id: number;
    prjSettConstant: string;
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
  transactionLedger: TransactionLedger[];
};

type actions = {
  setTransactionLedger: (transactionLedger: TransactionLedger[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useTransactionLedger = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      transactionLedger: [],
      refreshCount: 0,
      setLoading: (loading) => set({ loading }),
      setTransactionLedger: (transactionLedger) => set({ transactionLedger }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setPagination: (pagination) => set({ pagination }),
    }),
    {
      name: '__expo_transaction_ledger',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
