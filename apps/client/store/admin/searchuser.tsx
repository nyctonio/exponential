import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SearchedUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  m2mSquareOff: boolean;
  smSquareOff: boolean;
  onlySquareOff: boolean;
  createdAt: Date;
  userType: {
    id: number;
    prjSettDisplayName: string;
    prjSettConstant: string;
  };
  createdByUser: {
    username: string;
  };
  openingBalance: number;
  userStatus: {
    id: number;
    prjSettDisplayName: string;
    prjSettConstant: string;
  };
};

type State = {
  username: string;
  userType: string;
  upline: {
    broker: [];
    subBroker: [];
  };
  pagination: {
    pageNumber: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  storeEmpty: boolean;
  sort: {
    username: 'ASC' | 'DESC' | 'NONE';
    userType: 'ASC' | 'DESC' | 'NONE';
    upline: 'ASC' | 'DESC' | 'NONE';
    name: 'ASC' | 'DESC' | 'NONE';
    onlySquareOff: 'ASC' | 'DESC' | 'NONE';
    createdDate: 'ASC' | 'DESC' | 'NONE';
    lastLogin: 'ASC' | 'DESC' | 'NONE';
  };
  refreshCount: number;
  users: SearchedUser[];
  brokersData: {
    id: number;
    username: string;
    userType: {
      id: number;
      prjSettConstant: string;
    };
  }[];
  subBrokersData: {
    id: number;
    username: string;
    userType: {
      id: number;
      prjSettConstant: string;
    };
  }[];
  modalStatus: {
    userId: number;
    password: boolean;
    loginHistory: boolean;
    updateStatus: boolean;
    transaction: boolean;
    penalty: boolean;
  };
  constants: {
    userType: {
      id: number;
      prjSettConstant: string;
      prjSettDisplayName: string;
    }[];
    userStatus: {
      id: number;
      prjSettConstant: string;
      prjSettDisplayName: string;
    }[];
  };
};

type Actions = {
  setUsername: (username: string) => void;
  setUserType: (username: string) => void;
  setUpline: (upline: { broker: []; subBroker: [] }) => void;
  setPagination: ({
    pageNumber,
    pageSize,
    total,
  }: {
    pageNumber: number;
    pageSize: number;
    total: number;
  }) => void;
  setLoading: (value: boolean) => void;
  setSort: (sort: {
    username: 'ASC' | 'DESC' | 'NONE';
    userType: 'ASC' | 'DESC' | 'NONE';
    upline: 'ASC' | 'DESC' | 'NONE';
    name: 'ASC' | 'DESC' | 'NONE';
    onlySquareOff: 'ASC' | 'DESC' | 'NONE';
    createdDate: 'ASC' | 'DESC' | 'NONE';
    lastLogin: 'ASC' | 'DESC' | 'NONE';
  }) => void;
  incRefresh: () => void;
  setUsers: (users: SearchedUser[]) => void;
  setStoreEmpty: (value: boolean) => void;
  setBrokersData: (
    brokersData: {
      id: number;
      username: string;
      userType: {
        id: number;
        prjSettConstant: string;
      };
    }[]
  ) => void;
  setSubBrokersData: (
    subBrokersData: {
      id: number;
      username: string;
      userType: {
        id: number;
        prjSettConstant: string;
      };
    }[]
  ) => void;
  setModalStatus: (modalStatus: {
    userId: number;
    password: boolean;
    loginHistory: boolean;
    updateStatus: boolean;
    transaction: boolean;
    penalty: boolean;
  }) => void;
  setConstants: (constantData: {
    userType: {
      id: number;
      prjSettConstant: string;
      prjSettDisplayName: string;
    }[];
    userStatus: {
      id: number;
      prjSettConstant: string;
      prjSettDisplayName: string;
    }[];
  }) => void;
};

export const userSearchUserStore = create<State & Actions>()(
  persist(
    (set) => ({
      users: [],
      pagination: {
        pageNumber: 1,
        pageSize: 15,
        total: 0,
      },
      refreshCount: 0,
      sort: {
        createdDate: 'NONE',
        lastLogin: 'NONE',
        name: 'NONE',
        onlySquareOff: 'NONE',
        upline: 'NONE',
        username: 'NONE',
        userType: 'NONE',
      },
      upline: {
        broker: [],
        subBroker: [],
      },
      username: '',
      userType: 'all',
      loading: false,
      storeEmpty: true,
      brokersData: [],
      subBrokersData: [],
      modalStatus: {
        loginHistory: false,
        password: false,
        updateStatus: false,
        transaction: false,
        penalty: false,
        userId: -1,
      },
      constants: {
        userStatus: [],
        userType: [],
      },
      incRefresh: () =>
        set((state) => {
          state.refreshCount = state.refreshCount + 1;
          return state;
        }),
      setPagination: ({ pageNumber, pageSize, total }) =>
        set({ pagination: { pageNumber, pageSize, total } }),

      setSort: (sort) =>
        set({
          sort: {
            createdDate: sort.createdDate,
            lastLogin: sort.lastLogin,
            name: sort.name,
            onlySquareOff: sort.onlySquareOff,
            upline: sort.upline,
            username: sort.username,
            userType: sort.userType,
          },
        }),

      setUpline: (upline) =>
        set({ upline: { broker: upline.broker, subBroker: upline.subBroker } }),
      setUsername: (username) => set({ username }),
      setUsers: (users) => set({ users }),
      setUserType: (userType) => set({ userType }),
      setLoading: (value) => set({ loading: value }),
      setStoreEmpty: (value) => set({ storeEmpty: value }),
      setBrokersData: (brokersData) => set({ brokersData }),
      setSubBrokersData: (subBrokersData) =>
        set({ subBrokersData: subBrokersData }),
      setModalStatus: (modalData) => set({ modalStatus: modalData }),
      setConstants: (constantsData) => set({ constants: constantsData }),
    }),
    {
      name: '__expo_search-client', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
