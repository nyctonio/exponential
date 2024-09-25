import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LogsInfo = {
  operation: string;
  loggedInUser: string;
  type: string;
  targetUsers: Number[];
  actionDoneBy: string;
  description: string;
  metadata: {
    additionalInfo: [{}];
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
  logsInfo: LogsInfo[];
};

type actions = {
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
  setLogsInfo: (logsInfo: LogsInfo[]) => void;
};

export const useLogsInfo = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      refreshCount: 0,
      logsInfo: [],
      setLoading: (loading) => set({ loading }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setPagination: (pagination) => set({ pagination }),
      setLogsInfo: (logsInfo) => set({ logsInfo }),
    }),
    {
      name: '__expo_watch_logs',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
