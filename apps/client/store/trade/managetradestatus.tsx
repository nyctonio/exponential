import { Dayjs } from 'dayjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TradeStatus = {
  id: number;
  date: Date;
  startTimeNSE: Date;
  endTimeNSE: Date;
  startTimeMCX: Date;
  endTimeMCX: Date;
  tradeActiveNSE: boolean;
  tradeActiveMCX: boolean;
  disabledInstruments: string[];
};
type state = {
  month: string | null;
  year: string | null;
  selectedDate: string | undefined;
  drawerOpen: boolean;
  statusData: TradeStatus[];
  modalData: {
    loading: boolean;
    tradeActiveNSE: boolean;
    tradeActiveMCX: boolean;
    startTimeNSE: Date | undefined;
    endTimeNSE: Date | undefined;
    startTimeMCX: Date | undefined;
    endTimeMCX: Date | undefined;
  };
};

type actions = {
  setMonth: (month: string) => void;
  setYear: (year: string) => void;
  setSelectedDate: (date: string | undefined) => void;
  setDrawerOpen: (open: boolean) => void;
  setStatusData: (statusDate: TradeStatus[]) => void;
  setModalData: (data: state['modalData']) => void;
};

export const useManageTradeStatus = create<state & actions>()(
  persist(
    (set) => ({
      drawerOpen: false,
      month: null,
      year: null,
      selectedDate: undefined,
      statusData: [],
      modalData: {
        endTimeMCX: undefined,
        endTimeNSE: undefined,
        startTimeMCX: undefined,
        startTimeNSE: undefined,
        tradeActiveMCX: true,
        tradeActiveNSE: true,
        loading: false,
      },
      setModalData: (data) => set({ modalData: data }),
      setStatusData: (statusData) => set({ statusData }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      setMonth: (month) => set({ month }),
      setYear: (year) => set({ year }),
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    {
      name: '__expo_manage-trade-status', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
