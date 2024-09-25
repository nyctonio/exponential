import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SettelmentLogsType = {
  transactionParticularId: number;
  transactionParticular: 'Brokerage Collected' | 'Trade Profit' | 'Trade Loss';
  companyAmount: number;
  masterAmount: number;
  brokerAmount: number;
  subBrokerAmount: number;
  totalAmount: number;
  userId: number;
  username: string;
  upline: string;
  userType: string;
  startDate: Date;
  endDate: Date;
};

type state = {
  settlementLogs: SettelmentLogsType[];
  loading: boolean;
  pagination: {
    pageNumber: number;
    pageSize: number;
    total: number;
  };
  refreshCount: number;
};

type actions = {
  setLoading: (loading: boolean) => void;
  setRefreshCount: (refreshCount: number) => void;
  setSettelmentLogs: (settelmentLogs: SettelmentLogsType[]) => void;
  setPagination: ({
    pageNumber,
    pageSize,
    total,
  }: {
    pageNumber: number;
    pageSize: number;
    total: number;
  }) => void;
};

export const useSettelmentLogs = create<state & actions>()(
  persist(
    (set) => ({
      settlementLogs: [],
      loading: false,
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      refreshCount: 0,
      setLoading: (loading: boolean) => set((state) => ({ loading })),
      setRefreshCount: (refreshCount: number) =>
        set((state) => ({ refreshCount })),
      setSettelmentLogs: (settlementLogs: SettelmentLogsType[]) =>
        set((state) => ({ settlementLogs })),
      setPagination: (pagination) => set({ pagination }),
    }),
    {
      name: '__expo_settelment_logs',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
