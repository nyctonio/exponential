import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BrokerageSharingType = {
  id: number | string;
  exchange: string;
  brokerageType: 'crore' | 'lot';
  total: number;
  upline: number | null;
  self: number;
  master: number | null;
  broker: number | null;
  subbroker: number | null;
  thirdparty: number | null;
  thirdpartyremarks: string | null;
  isUpdated: boolean;
};

export type PlSharingType = {
  id: number;
  exchange: string;
  upline: number | null;
  self: number;
  master: number | null;
  broker: number | null;
  subbroker: number | null;
  thirdparty: number | null;
  thirdpartyremarks: string | null;
  isUpdated: boolean;
};

export type RentSharingType = {
  id: number;
  upline: number | null;
  total: number | null;
  self: number | null;
  master: number | null;
  broker: number | null;
  subbroker: number | null;
  thirdparty: number | null;
  thirdpartyremarks: string | null;
};

type TableDataType = {
  fetched: boolean;
  loading: boolean;
  userId: number;
  username: string;
  brokerageSharing: BrokerageSharingType[];
  plSharing: PlSharingType[];
  rentSharing: any | null;
};

type State = {
  tableData: TableDataType;
  formActive: boolean;
};

type Actions = {
  setFormActive: (formActive: boolean) => void;
  setTableData: (tableData: TableDataType) => void;
};

export const usePlBrokerageSharingStore = create<State & Actions>()(
  persist(
    (set) => ({
      tableData: {
        loading: false,
        fetched: false,
        username: '',
        plSharing: [],
        brokerageSharing: [],
        userId: 0,
        rentSharing: null,
      },
      formActive: false,
      setFormActive: (formActive: boolean) => set({ formActive }),
      setTableData: (tableData) => set({ tableData }),
    }),
    {
      name: '__expo_brokerage-sharing-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
