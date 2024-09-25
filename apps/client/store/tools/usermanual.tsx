import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserManualType = {
  id: number;
  name: string;
  text: string;
  status: boolean;
};

type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  userManuals: UserManualType[];
};

type actions = {
  setUserManuals: (userManuals: UserManualType[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useUserManualStore = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      refreshCount: 0,
      userManuals: [],
      setUserManuals: (userManuals) => set({ userManuals }),
      setLoading: (loading) => set({ loading }),
      setPagination: (pagination) => set({ pagination }),
      setRefreshCount: (count) => set({ refreshCount: count }),
    }),
    {
      name: '__expo_user_manual',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
