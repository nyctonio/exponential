import { create } from 'zustand';
import { UserType, WatchListType, MenuType } from './types';
import { persist, createJSONStorage } from 'zustand/middleware';

type State = {
  user: UserType;
  menus: MenuType;
  watchlist: {
    active: number;
    list: WatchListType[];
    columns: {
      id: number;
      name: string;
      width: string;
    }[];
  };
  config: {
    isDemoId: boolean;
    validTillDate: string;
    tradeAutoCut: boolean;
    isIntradayAllowed: boolean;
    tradeAllowedinQty: boolean;
    onlySquareOff: boolean;
    autoCutSettings: {
      bidStopSettings: {
        option: string;
        outside: boolean;
        between: boolean;
        cmp: number;
      }[];
      mcxBidStopSettings: {
        instrumentName: string;
        bidValue: number;
        stopLossValue: number;
      }[];
    };
  };
  exchange: {
    id: number;
    exchangeName: string;
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
    fastTradeLotSize: number;
    fastTradeActive: boolean;
  }[];
  scriptQty: {
    script: string;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
    active: boolean;
  }[];
  allowedExchange: string[];
  openOrders: { scriptName: string; quantityLeft: number }[];
};

type Actions = {
  setUser: (user: UserType) => void;
  setMenus: (menus: MenuType) => void;
  removeUser: () => void;
  setUserConfig: (userConfig: {
    isDemoId: boolean;
    validTillDate: string;
    tradeAutoCut: boolean;
    isIntradayAllowed: boolean;
    tradeAllowedinQty: boolean;
    onlySquareOff: boolean;
    autoCutSettings: {
      bidStopSettings: {
        option: string;
        outside: boolean;
        between: boolean;
        cmp: number;
      }[];
      mcxBidStopSettings: {
        instrumentName: string;
        bidValue: number;
        stopLossValue: number;
      }[];
    };
  }) => void;
  setWatchlist: (watchlist: {
    active: number;
    list: WatchListType[];
    columns: {
      id: number;
      name: string;
      width: string;
    }[];
  }) => void;
  setAllowedExchange: (exchange: string[]) => void;
  setExchange: (
    exchange: {
      id: number;
      exchangeName: string;
      exchangeMaxLotSize: number;
      scriptMaxLotSize: number;
      tradeMaxLotSize: number;
      fastTradeLotSize: number;
      fastTradeActive: boolean;
    }[]
  ) => void;
  setScriptQty: (
    scriptQty: {
      script: string;
      scriptMaxLotSize: number;
      tradeMaxLotSize: number;
      active: boolean;
    }[]
  ) => void;

  setOpenOrders: (
    orders: { scriptName: string; quantityLeft: number }[]
  ) => void;
};

export const useUserStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: null,
      menus: [],
      watchlist: {
        active: 0,
        list: [],
        columns: [],
      },
      config: {
        isDemoId: false,
        validTillDate: '',
        tradeAutoCut: false,
        isIntradayAllowed: false,
        tradeAllowedinQty: false,
        onlySquareOff: false,
        autoCutSettings: {
          bidStopSettings: [],
          mcxBidStopSettings: [],
        },
      },
      exchange: [],
      scriptQty: [],
      allowedExchange: [],
      openOrders: [],
      setOpenOrders: (orders) => set({ openOrders: orders }),
      setAllowedExchange: (exchange) => set({ allowedExchange: exchange }),
      setMenus: (menus) => set({ menus }),
      setUser: (user) => set({ user }),
      setUserConfig: (config) => set({ config }),
      removeUser: () => set({ user: null }),
      setWatchlist: (watchlist) => set({ watchlist }),
      setExchange: (exchange) => set({ exchange }),
      setScriptQty: (scriptQty) => set({ scriptQty }),
    }),
    {
      name: '__expo_user', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// export const useUserStore = (selector, compare) => {
//   /*
//   This a fix to ensure zustand never hydrates the store before React hydrates the page.
//   Without this, there is a mismatch between SSR/SSG and client side on first draw which produces
//   an error.
//    */
//   const store = userStore(selector, compare);
//   const [isHydrated, setHydrated] = useState(false);
//   useEffect(() => setHydrated(true), []);
//   return isHydrated ? store : selector(emptyState);
// };
