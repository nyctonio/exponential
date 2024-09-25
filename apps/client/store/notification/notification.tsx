import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NotificationsData = {
  id: number;
  title: string;
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
};

type state = {
  loading: boolean;
  refreshCount: number;
  notifications: NotificationsData[];
};

type actions = {
  setLoading: (loading: boolean) => void;
  setRefreshCount: (count: number) => void;
  setNotifications: (notifications: NotificationsData[]) => void;
};

export const useNotifications = create<state & actions>()(
  persist(
    (set) => ({
      loading: false,
      refreshCount: 0,
      notifications: [],
      setLoading: (loading) => set({ loading }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: '__expo_notifications',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
