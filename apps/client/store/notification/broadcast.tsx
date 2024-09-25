import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BroadCastMessageData = {
  id: number;
  type: string;
  severity: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

type state = {
  loading: boolean;
  refreshCount: number;
  messages: BroadCastMessageData[];
};

type actions = {
  setLoading: (loading: boolean) => void;
  setRefreshCount: (count: number) => void;
  setMessages: (messages: BroadCastMessageData[]) => void;
};

export const useBroadCastMessages = create<state & actions>()(
  persist(
    (set) => ({
      loading: false,
      refreshCount: 0,
      messages: [],
      setLoading: (loading) => set({ loading }),
      setRefreshCount: (count) => set({ refreshCount: count }),
      setMessages: (messages) => set({ messages }),
    }),
    {
      name: '__expo_messages',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
