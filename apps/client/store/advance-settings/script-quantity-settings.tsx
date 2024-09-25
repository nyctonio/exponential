import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  EditedInstrument,
  ScriptQuantityFormData,
  ScriptQuantityInstrument,
  ScriptQuantityUplineData,
  ScriptQuantityUserData,
} from '@/types/advance-settings/script-quantity-settings';
import moment from 'moment';

export type scriptQuantity = {
  tableData: {
    loading: boolean;
    fetched: boolean;
    script: string;
    userType: string;
    username: string;
    exchange: string;
    instrumentsData: ScriptQuantityInstrument[];
  };
  dropdownData: {
    id: number;
    name: string;
    value: string;
  }[];
  username: string;
  setUsername: (username: string) => void;
  userId: null | number;
  setUserId: (userId: number) => void;
  setDropDownData: (
    dropdownData: {
      id: number;
      name: string;
      value: string;
    }[]
  ) => void;
  uplineExchangeData: ScriptQuantityUplineData;
  userExchangeData: ScriptQuantityUserData;
  setExchangeData: (
    userExchangeData: ScriptQuantityUserData,
    uplineExchangeData: ScriptQuantityUplineData
  ) => void;
  setTableData: (tableData: {
    loading: boolean;
    fetched: boolean;
    script: string;
    username: string;
    userType: string;
    exchange: string;
    instrumentsData: ScriptQuantityInstrument[];
  }) => void;
  allowedExchange: { id: number; name: string }[];
  setAllowedExchange: (exchangeData: { id: number; name: string }[]) => void;
  editedInstruments: EditedInstrument[];
  setEditedInstruments: (editedInstruments: EditedInstrument[]) => void;
  formActive: boolean;
  setFormActive: (value: boolean) => void;
};

export const useScriptQuantity = create<scriptQuantity>()(
  persist(
    (set) => ({
      tableData: {
        fetched: false,
        loading: false,
        exchange: '',
        userType: '',
        instrumentsData: [],
        script: '',
        username: '',
      },
      username: '',
      setUsername: (username) => set({ username }),
      userId: null,
      setUserId: (userId) => set({ userId }),
      dropdownData: [],
      setDropDownData: (dropdownData) => {
        set({
          dropdownData,
        });
      },
      uplineExchangeData: [],
      userExchangeData: [],
      setExchangeData: (
        userExchangeData: ScriptQuantityUserData,
        uplineExchangeData: ScriptQuantityUplineData
      ) => {
        set({
          uplineExchangeData,
          userExchangeData,
        });
      },
      setTableData: (tableData) => {
        set({
          tableData: tableData,
        });
      },
      allowedExchange: [],
      setAllowedExchange: (exchangeData) => {
        set({
          allowedExchange: exchangeData,
        });
      },
      editedInstruments: [],
      formActive: false,
      setEditedInstruments: (editedInstruments: EditedInstrument[]) => {
        set({
          editedInstruments,
        });
      },
      setFormActive: (value: boolean) => {
        set({
          formActive: value,
        });
      },
    }),
    {
      name: '__expo_script-quantity-settings-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
