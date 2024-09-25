import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InstrumentType } from '@/types/advance-settings/brokerage-settings';

type TableDataType = {
  loading: boolean;
  fetched: boolean;
  userId: number | null;
  username: string;
  script: string;
  exchange: string;
  userType: string | null;
  instrumentsData: InstrumentType[];
};

type State = {
  tableData: TableDataType;
  username: string;
  dropdownData: {
    id: number;
    name: string;
    value: string;
  }[];
  brokerageTypeDropdown: {
    id: number;
    name: string;
    value: string;
  }[];
  formActive: boolean;
};

type Actions = {
  setFormActive: (formActive: boolean) => void;
  setTableData: (tableData: TableDataType) => void;
  setUsername: (username: string) => void;
  setDropDownData: (
    dropdownData: {
      id: number;
      name: string;
      value: string;
    }[]
  ) => void;
  setBrokerageTypeDropdown: (
    brokerageTypeDropdown: {
      id: number;
      name: string;
      value: string;
    }[]
  ) => void;
};

export const useBrokerageStore = create<State & Actions>()(
  persist(
    (set) => ({
      tableData: {
        loading: false,
        fetched: false,
        script: '',
        username: '',
        exchange: '',
        instrumentsData: [],
        userId: -1,
        userType: null,
      },
      username: '',
      dropdownData: [],
      formActive: false,
      brokerageTypeDropdown: [],
      setFormActive: (formActive: boolean) => set({ formActive }),
      setTableData: (tableData) => set({ tableData }),
      setDropDownData: (dropdownData) => set({ dropdownData }),
      setBrokerageTypeDropdown: (brokerageTypeDropdown) =>
        set({ brokerageTypeDropdown }),
      setUsername: (username) => set({ username }),
    }),
    {
      name: '__expo_brokerage_setting_store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
