import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import printSafe from '@/utils/common/print';

export type userManual = {
  manualData: {
    manualId: number;
    manualName: string;
    manualKey: string;
    manualContent: string;
  }[];

  setManualData: (manualData: any) => void;
};

export const useUserManual = create<userManual>()(
  persist(
    (set) => ({
      manualData: [],
      setManualData: (manualData) => {
        set({ manualData });
      },
    }),
    {
      name: 'user-manual-data',
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
