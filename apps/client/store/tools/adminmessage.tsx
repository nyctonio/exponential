import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AdminBroadCastMessageType = {
  id: number;
  isDeleted: boolean;
  title: string;
  message: string;
  severity: string;
  type: string;
  users: [];
  frequency: string;
  scheduled_data: [
    {
      time: string;
      executed: false;
    },
  ];
  from_date: string;
  to_date: string;
  createdAt: string;
  updatedAt: string;
  valid_for: string;
};

type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  adminMessages: AdminBroadCastMessageType[];
};

type actions = {
  setAdminBroadCastMessages: (
    adminMessages: AdminBroadCastMessageType[]
  ) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useAdminBroadCastMessage = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      adminMessages: [],
      refreshCount: 0,
      setLoading: (loading) => set({ loading }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setPagination: (pagination) => set({ pagination }),
      setAdminBroadCastMessages: (adminMessages) => set({ adminMessages }),
    }),
    {
      name: '__expo_admin_messages',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
