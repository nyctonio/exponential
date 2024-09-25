import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AdminNotificationType = {
  id: number;
  isDeleted: boolean;
  is_hierarchy: boolean;
  message: string;
  title: string;
  userType: {
    id: number;
    prjSettName: string;
    prjSettKey: string;
    prjSettDisplayName: string;
    prjSettSortOrder: number;
    prjSettActive: boolean;
    prjSettConstant: string;
    createdAt: string;
    isDeleted: boolean;
    deletedAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  users: [];
};

type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  adminNotifications: AdminNotificationType[];
};

type actions = {
  setAdminNotifications: (adminNotifications: AdminNotificationType[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useAdminNotifications = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      adminNotifications: [],
      refreshCount: 0,
      setLoading: (loading) => set({ loading }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setPagination: (pagination) => set({ pagination }),
      setAdminNotifications: (adminNotifications) =>
        set({ adminNotifications }),
    }),
    {
      name: '__expo_admin_notifications',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
