import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// tabs in the main content area

export type ConversionRateProps = {
  conversionScripts: { name: string; value: number }[] | null;
  setConversionScripts: (data: { name: string; value: number }[]) => void;
};

export const useConversionRate = create<ConversionRateProps>()(
  persist(
    (set) => ({
      conversionScripts: null,
      setConversionScripts: (data) => set({ conversionScripts: data }),
    }),
    {
      name: '__expo_mcx-conversion-rate',
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
