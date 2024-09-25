import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ReconciliationType = {};

type state = {
  allowedExchange: { id: number; name: string }[];
};

type actions = {
  setAllowedExchange: (allowedExchange: { id: number; name: string }[]) => void;
};

export const useReconciliation = create<state & actions>()(
  persist(
    (set) => ({
      allowedExchange: [],
      setAllowedExchange: (allowedExchange: { id: number; name: string }[]) =>
        set({ allowedExchange }),
    }),
    {
      name: '__expo_reconciliation',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
