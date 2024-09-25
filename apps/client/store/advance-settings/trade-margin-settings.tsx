import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InstrumentType } from '@/types/advance-settings/trade-margin-settings';

type State = {
  username: string;
  tableData: {
    loading: boolean;
    userType: string;
    fetched: boolean;
    userId: number;
    intraDayAllowed: boolean;
    username: string;
    script: string;
    exchange: string;
    instrumentsData: InstrumentType[];
  };
  dropdownData: {
    id: number;
    name: string;
    value: string;
  }[];
  formActive: boolean;
};

type Actions = {
  setUsername: (username: string) => void;
  setFormActive: (formActive: boolean) => void;
  setTableData: (tableData: {
    loading: boolean;
    userType: string;
    fetched: boolean;
    userId: number;
    intraDayAllowed: boolean;
    username: string;
    script: string;
    exchange: string;
    instrumentsData: InstrumentType[];
  }) => void;
  setDropDownData: (
    dropdownData: {
      id: number;
      name: string;
      value: string;
    }[]
  ) => void;
};

export const useTradeMarginStore = create<State & Actions>()(
  persist(
    (set) => ({
      username: '',
      setUsername: (username) => set({ username }),
      tableData: {
        loading: false,
        fetched: false,
        script: '',
        username: '',
        userType: '',
        exchange: '',
        instrumentsData: [],
        intraDayAllowed: false,
        userId: -1,
      },
      dropdownData: [],
      formActive: false,
      marginTypeDropdown: [],
      setFormActive: (formActive: boolean) => set({ formActive }),
      setTableData: (tableData) => set({ tableData }),
      setDropDownData: (dropdownData) => set({ dropdownData }),
    }),
    {
      name: '__expo_trade-margin-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
