import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TradeOrder = {
  id: number;
  exchange: string;
  scriptName: string;
  orderType: string;
  tradeType: string;
  sellPrice: string;
  buyPrice: string;
  currentBuyPrice: string;
  currentSellPrice: string;
  quantity: number;
  quantityLeft: number;
  lotSize: number;
  transactionStatus: string;
  createdAt: string;
  updatedAt: string;
  orderCreationDate: Date;
  orderExecutionDate: Date;
  user: {
    id: number;
    username: string;
    createdByUser: {
      id: number;
      username: string;
    };
  };
};
type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  filter: {
    username: string;
    script: string;
    exchange: string;
    tradeDateFrom: string | undefined;
    tradeDateTo: string | undefined;
  };
  orders: TradeOrder[];
};

type actions = {
  setFilter: (filterData: {
    username: string;
    script: string;
    exchange: string;
    tradeDateFrom: string | undefined;
    tradeDateTo: string | undefined;
  }) => void;
  setOrders: (orders: TradeOrder[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }) => void;
  setRefreshCount: (count: number) => void;
};

export const useManageOrders = create<state & actions>()(
  persist(
    (set) => ({
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      filter: {
        exchange: '',
        script: '',
        tradeDateFrom: undefined,
        tradeDateTo: undefined,
        username: '',
      },
      loading: false,
      orders: [],
      refreshCount: 0,
      setRefreshCount: (count) => set({ refreshCount: count }),
      setFilter: (filter) => set({ filter }),
      setLoading: (loading) => set({ loading }),
      setOrders: (orders) => set({ orders }),
      setPagination: (pagination) => set({ pagination }),
    }),
    {
      name: '__expo_manage-orders-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
