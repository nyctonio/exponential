import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ContactUsData = {
  id: number;
  message: string;
  name: string;
  email: string;
  subject: string;
  phone: string;
  status: string;
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
  contactUsData: ContactUsData[];
};

type actions = {
  setContactUsData: (contactUsData: ContactUsData[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useContactUsStore = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      loading: false,
      refreshCount: 0,
      contactUsData: [],
      setContactUsData: (contactUsData) => set({ contactUsData }),
      setLoading: (loading) => set({ loading }),
      setPagination: (pagination) => set({ pagination }),
      setRefreshCount: (count) => set({ refreshCount: count }),
    }),
    {
      name: '__expo_contact_us',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
