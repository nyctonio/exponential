import {
  McxBidStopLossSetting,
  TableBidStopLossSetting,
  UserCuttingSetting,
  UserCuttingSettingUpdate,
} from '@/types/advance-settings/auto-cut-settings';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type State = {
  username: string;
  tradeAutoCut: boolean;
  selectedUser: {
    username: string;
    id: number;
  } | null;
  loading: boolean;
  storeEmpty: boolean;
  editMode: boolean;
  bidSettings: TableBidStopLossSetting[];
  mcxBidSettings: McxBidStopLossSetting[];
  cuttingSettings: UserCuttingSetting[];
};

type Actions = {
  setUsername: (value: string) => void;
  setSelectedUser: (username: string, id: number) => void;
  setBidSettings: (settings: TableBidStopLossSetting[]) => void;
  setLoading: (value: boolean) => void;
  setStoreEmpty: (value: boolean) => void;
  setEditMode: (value: boolean) => void;
  setMcxBidSettings: (value: McxBidStopLossSetting[]) => void;
  setCuttingSettings: (data: UserCuttingSetting[]) => void;
  setTradeAutoCut: (value: boolean) => void;
  clearStore: () => void;
};

export const useAutoCutSettingsStore = create<State & Actions>()(
  persist(
    (set) => ({
      loading: false,
      editMode: false,
      username: '',
      tradeAutoCut: true,
      bidSettings: [],
      mcxBidSettings: [],
      selectedUser: null,
      storeEmpty: true,
      updatedSettings: {
        cuttingSettings: [],
        bidSettings: [],
        mcxBidSettings: [],
      },
      cuttingSettings: [],
      setEditMode: (value) => set({ editMode: value }),
      setLoading: (value) => set({ loading: value }),
      setUsername: (value) => set({ username: value }),
      setSelectedUser: (username, id) =>
        set({ selectedUser: { id, username } }),
      setBidSettings: (settings) => set({ bidSettings: settings }),
      setStoreEmpty: (value: boolean) => set({ storeEmpty: value }),
      setMcxBidSettings: (value) => set({ mcxBidSettings: value }),

      setCuttingSettings: (data) => set({ cuttingSettings: data }),
      setTradeAutoCut: (value) => set({ tradeAutoCut: value }),
      clearStore: () =>
        set({
          tradeAutoCut: true,
          bidSettings: [],
          cuttingSettings: [],
          editMode: false,
          loading: false,
          mcxBidSettings: [],
          selectedUser: null,
          storeEmpty: true,
          username: '',
        }),
    }),
    {
      name: '__expo_trade-auto-cut-settings-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
