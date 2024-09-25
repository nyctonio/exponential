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
  brokerage: number;
  margin: number;
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
  isIntraday: boolean;
};
type state = {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  loading: boolean;
  refreshCount: number;
  sort: {
    username: 'ASC' | 'DESC' | 'NONE';
    exchange: 'ASC' | 'DESC' | 'NONE';
    orderExecutionDate: 'ASC' | 'DESC' | 'NONE';
    orderCreationDate: 'ASC' | 'DESC' | 'NONE';
    scriptName: 'ASC' | 'DESC' | 'NONE';
    transactionStatus: 'ASC' | 'DESC' | 'NONE';
    brokerage: 'ASC' | 'DESC' | 'NONE';
    margin: 'ASC' | 'DESC' | 'NONE';
    buyPrice: 'ASC' | 'DESC' | 'NONE';
    sellPrice: 'ASC' | 'DESC' | 'NONE';
    buyLots: 'ASC' | 'DESC' | 'NONE';
    buyQuantity: 'ASC' | 'DESC' | 'NONE';
    sellLots: 'ASC' | 'DESC' | 'NONE';
    sellQuantity: 'ASC' | 'DESC' | 'NONE';
    balanceLots: 'ASC' | 'DESC' | 'NONE';
  };
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
  setSort: (sort: {
    username: 'ASC' | 'DESC' | 'NONE';
    exchange: 'ASC' | 'DESC' | 'NONE';
    orderExecutionDate: 'ASC' | 'DESC' | 'NONE';
    orderCreationDate: 'ASC' | 'DESC' | 'NONE';
    scriptName: 'ASC' | 'DESC' | 'NONE';
    transactionStatus: 'ASC' | 'DESC' | 'NONE';
    brokerage: 'ASC' | 'DESC' | 'NONE';
    margin: 'ASC' | 'DESC' | 'NONE';
    buyPrice: 'ASC' | 'DESC' | 'NONE';
    sellPrice: 'ASC' | 'DESC' | 'NONE';
    buyLots: 'ASC' | 'DESC' | 'NONE';
    buyQuantity: 'ASC' | 'DESC' | 'NONE';
    sellLots: 'ASC' | 'DESC' | 'NONE';
    sellQuantity: 'ASC' | 'DESC' | 'NONE';
    balanceLots: 'ASC' | 'DESC' | 'NONE';
  }) => void;
};

export const useManageTrades = create<state & actions>()(
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
      sort: {
        username: 'NONE',
        exchange: 'NONE',
        orderExecutionDate: 'NONE',
        orderCreationDate: 'NONE',
        scriptName: 'NONE',
        transactionStatus: 'NONE',
        brokerage: 'NONE',
        margin: 'NONE',
        buyPrice: 'NONE',
        sellPrice: 'NONE',
        buyLots: 'NONE',
        buyQuantity: 'NONE',
        sellLots: 'NONE',
        sellQuantity: 'NONE',
        balanceLots: 'NONE',
      },
      setRefreshCount: (count) => set({ refreshCount: count }),
      setFilter: (filter) => set({ filter }),
      setLoading: (loading) => set({ loading }),
      setOrders: (orders) => set({ orders }),
      setPagination: (pagination) => set({ pagination }),
      setSort: (sort) =>
        set({
          sort,
        }),
    }),
    {
      name: '__expo_manage-trades-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
