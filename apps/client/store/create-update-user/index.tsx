import { userInput } from '@/types/usercreate';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CreateUserType = {
  // basic details
  userName: string;
  userType: number | null;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  retypePassword: string;
  city: number | null;
  remarks: string;
  tradeSquareOffLimit: number | null;
  validTill: string;
  creditBalance: number | null;
  creditRemarks: string;
  demoId: boolean;
  brokerCount: number | null;
  subBrokerCount: number | null;
  clientCount: number | null;
  // exchange information
  tradeAllowedInQuantityNSE: boolean;
  exchangeAllowedNSE: boolean;
  exchangeAllowedMCX: boolean;
  exchangeAllowedFX: boolean;
  exchangeAllowedOptions: boolean;
  exchangeMaxLotSizeNSE: number | null;
  exchangeMaxLotSizeMCX: number | null;
  exchangeMaxLotSizeFX: number | null;
  exchangeMaxLotSizeOptions: number | null;
  scriptMaxLotSizeNSE: number | null;
  scriptMaxLotSizeMCX: number | null;
  scriptMaxLotSizeFX: number | null;
  scriptMaxLotSizeOptions: number | null;
  tradeMaxLotSizeNSE: number | null;
  tradeMaxLotSizeMCX: number | null;
  tradeMaxLotSizeFX: number | null;
  tradeMaxLotSizeOptions: number | null;
  // trade information
  m2mSquareOff: boolean;
  m2mSquareOffValue: number | null;
  shortMarginSquareOff: boolean;
  maximumLossPercentageCap: number | null;
  // brokerage type
  activeBrokerageTypeNSE: 'lot' | 'crore' | null;
  activeBrokerageTypeMCX: 'lot' | 'crore' | null;
  activeBrokerageTypeFX: 'lot' | 'crore' | null;
  activeBrokerageTypeOptions: 'lot' | 'crore' | null;
  // brokerage information
  brokeragePerCroreNSE: number | null;
  brokeragePerCroreMCX: number | null;
  brokeragePerCroreFX: number | null;
  brokeragePerCroreOptions: number | null;
  brokeragePerLotNSE: number | null;
  brokeragePerLotMCX: number | null;
  brokeragePerLotFX: number | null;
  brokeragePerLotOptions: number | null;
  // pl share
  plShareNSE: number | null;
  plShareMCX: number | null;
  plShareFX: number | null;
  plShareOptions: number | null;
  // margin type
  activeMarginTypeNSE: 'lot' | 'crore' | null;
  activeMarginTypeMCX: 'lot' | 'crore' | null;
  activeMarginTypeFX: 'lot' | 'crore' | null;
  activeMarginTypeOptions: 'lot' | 'crore' | null;
  // margin information
  tradeMarginPerCroreNSE: number | null;
  tradeMarginPerCroreMCX: number | null;
  tradeMarginPerCroreFX: number | null;
  tradeMarginPerCroreOptions: number | null;
  tradeMarginPerLotNSE: number | null;
  tradeMarginPerLotMCX: number | null;
  tradeMarginPerLotFX: number | null;
  tradeMarginPerLotOptions: number | null;
  // intraday information
  intradayTrade: boolean;
  intradayMarginPerCroreNSE: number | null;
  intradayMarginPerCroreMCX: number | null;
  intradayMarginPerCroreFX: number | null;
  intradayMarginPerCroreOptions: number | null;
  intradayMarginPerLotNSE: number | null;
  intradayMarginPerLotMCX: number | null;
  intradayMarginPerLotFX: number | null;
  intradayMarginPerLotOptions: number | null;
};

export type ParentUserType = {
  validTill: string;
  demoId: boolean;
  // exchange information
  tradeAllowedInQuantityNSE: boolean;
  exchangeAllowedNSE: boolean;
  exchangeAllowedMCX: boolean;
  exchangeAllowedFX: boolean;
  exchangeAllowedOptions: boolean;
  // script info
  exchangeMaxLotSizeNSE: number;
  exchangeMaxLotSizeMCX: number;
  exchangeMaxLotSizeFX: number;
  exchangeMaxLotSizeOptions: number;
  scriptMaxLotSizeNSE: number;
  scriptMaxLotSizeMCX: number;
  scriptMaxLotSizeFX: number;
  scriptMaxLotSizeOptions: number;
  tradeMaxLotSizeNSE: number;
  tradeMaxLotSizeMCX: number;
  tradeMaxLotSizeFX: number;
  tradeMaxLotSizeOptions: number;
  // brokerage information
  brokeragePerCroreNSE: number;
  brokeragePerCroreMCX: number;
  brokeragePerCroreFX: number;
  brokeragePerCroreOptions: number;
  brokeragePerLotNSE: number;
  brokeragePerLotMCX: number;
  brokeragePerLotFX: number;
  brokeragePerLotOptions: number;
  // margin information
  tradeMarginPerCroreNSE: number;
  tradeMarginPerCroreMCX: number;
  tradeMarginPerCroreFX: number;
  tradeMarginPerCroreOptions: number;
  tradeMarginPerLotNSE: number;
  tradeMarginPerLotMCX: number;
  tradeMarginPerLotFX: number;
  tradeMarginPerLotOptions: number;
  // intraday information
  intradayTrade: boolean;
  intradayMarginPerCroreNSE: number;
  intradayMarginPerCroreMCX: number;
  intradayMarginPerCroreFX: number;
  intradayMarginPerCroreOptions: number;
  intradayMarginPerLotNSE: number;
  intradayMarginPerLotMCX: number;
  intradayMarginPerLotFX: number;
  intradayMarginPerLotOptions: number;
};

export type DropDownType = {
  userTypeOptions: {
    options: {
      value: string;
      label: string;
      constant: string;
    }[];
    name: 'userType';
  };
  cityOptions: {
    options: {
      value: string;
      label: string;
      constant: string;
    }[];
    name: 'city';
  };
  tradeSquareOffLimitOptions: {
    options: {
      value: string;
      label: string;
      constant: string;
    }[];
    name: 'tradeSquareOffLimit';
  };
};

type State = {
  user: CreateUserType;
  copyUserId: number | null;
  editMode: boolean;
  updatedUser: {
    username: string;
    id: number;
    type: 'update' | 'copy' | 'behalf';
  };
  dropdowns: DropDownType;
  mode: 'create' | 'update';
  parent: ParentUserType;
  sectionId: number;
  parentFetch: boolean;
  errors: {
    basicDetails: {
      [key: string]: string;
    };
    exchangeSettings: {
      [key: string]: string;
    };
    brokerageSettings: {
      [key: string]: string;
    };
    marginSettings: {
      [key: string]: string;
    };
  };
};

type Actions = {
  resetUser: () => void;
  resetParent: () => void;
  setUser: (user: CreateUserType) => void;
  setUserField: (field: keyof userInput, value: any) => void;
  setCopyUserId: (id: number | null) => void;
  setEditMode: (mode: boolean) => void;
  setDropdowns: (dropdowns: DropDownType) => void;
  setMode: (mode: 'create' | 'update') => void;
  setParent: (parent: ParentUserType) => void;
  setUpdatedUser: ({
    username,
    id,
    type,
  }: {
    username: string;
    id: number;
    type: 'update' | 'copy' | 'behalf';
  } & Partial<CreateUserType>) => void;
  setSectionId: (id: number) => void;
  setParentFetch: (fetch: boolean) => void;
  setErrors: (section: string, errors: any) => void;
};

export const defaultUser: CreateUserType = {
  // basic details
  userName: '',
  userType: null,
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  password: '',
  retypePassword: '',
  city: null,
  remarks: '',
  tradeSquareOffLimit: null,
  validTill: '',
  creditBalance: null,
  creditRemarks: '',
  demoId: false,
  brokerCount: null,
  subBrokerCount: null,
  clientCount: null,
  // exchange information
  tradeAllowedInQuantityNSE: false,
  exchangeAllowedNSE: false,
  exchangeAllowedMCX: false,
  exchangeAllowedFX: false,
  exchangeAllowedOptions: false,
  exchangeMaxLotSizeNSE: null,
  exchangeMaxLotSizeMCX: null,
  exchangeMaxLotSizeFX: null,
  exchangeMaxLotSizeOptions: null,
  scriptMaxLotSizeNSE: null,
  scriptMaxLotSizeMCX: null,
  scriptMaxLotSizeFX: null,
  scriptMaxLotSizeOptions: null,
  tradeMaxLotSizeNSE: null,
  tradeMaxLotSizeMCX: null,
  tradeMaxLotSizeFX: null,
  tradeMaxLotSizeOptions: null,
  m2mSquareOff: false,
  m2mSquareOffValue: null,
  maximumLossPercentageCap: null,
  shortMarginSquareOff: false,
  activeBrokerageTypeNSE: null,
  activeBrokerageTypeMCX: null,
  activeBrokerageTypeFX: null,
  activeBrokerageTypeOptions: null,
  activeMarginTypeNSE: null,
  activeMarginTypeMCX: null,
  activeMarginTypeFX: null,
  activeMarginTypeOptions: null,
  brokeragePerCroreNSE: null,
  brokeragePerCroreMCX: null,
  brokeragePerCroreFX: null,
  brokeragePerCroreOptions: null,
  brokeragePerLotNSE: null,
  brokeragePerLotMCX: null,
  brokeragePerLotFX: null,
  brokeragePerLotOptions: null,
  plShareNSE: null,
  plShareMCX: null,
  plShareFX: null,
  plShareOptions: null,
  tradeMarginPerCroreNSE: null,
  tradeMarginPerCroreMCX: null,
  tradeMarginPerCroreFX: null,
  tradeMarginPerCroreOptions: null,
  tradeMarginPerLotNSE: null,
  tradeMarginPerLotMCX: null,
  tradeMarginPerLotFX: null,
  tradeMarginPerLotOptions: null,
  intradayTrade: false,
  intradayMarginPerCroreNSE: null,
  intradayMarginPerCroreMCX: null,
  intradayMarginPerCroreFX: null,
  intradayMarginPerCroreOptions: null,
  intradayMarginPerLotNSE: null,
  intradayMarginPerLotMCX: null,
  intradayMarginPerLotFX: null,
  intradayMarginPerLotOptions: null,
};

export const defaultDropdowns: DropDownType = {
  userTypeOptions: {
    options: [],
    name: 'userType',
  },
  cityOptions: {
    options: [],
    name: 'city',
  },
  tradeSquareOffLimitOptions: {
    options: [],
    name: 'tradeSquareOffLimit',
  },
};

export const defaultParent: ParentUserType = {
  validTill: '',
  demoId: false,
  tradeAllowedInQuantityNSE: false,
  exchangeAllowedNSE: false,
  exchangeAllowedMCX: false,
  exchangeAllowedFX: false,
  exchangeAllowedOptions: false,
  exchangeMaxLotSizeNSE: 0,
  exchangeMaxLotSizeMCX: 0,
  exchangeMaxLotSizeFX: 0,
  exchangeMaxLotSizeOptions: 0,
  scriptMaxLotSizeNSE: 0,
  scriptMaxLotSizeMCX: 0,
  scriptMaxLotSizeFX: 0,
  scriptMaxLotSizeOptions: 0,
  tradeMaxLotSizeNSE: 0,
  tradeMaxLotSizeMCX: 0,
  tradeMaxLotSizeFX: 0,
  tradeMaxLotSizeOptions: 0,
  brokeragePerCroreNSE: 0,
  brokeragePerCroreMCX: 0,
  brokeragePerCroreFX: 0,
  brokeragePerCroreOptions: 0,
  brokeragePerLotNSE: 0,
  brokeragePerLotMCX: 0,
  brokeragePerLotFX: 0,
  brokeragePerLotOptions: 0,
  tradeMarginPerCroreNSE: 0,
  tradeMarginPerCroreMCX: 0,
  tradeMarginPerCroreFX: 0,
  tradeMarginPerCroreOptions: 0,
  tradeMarginPerLotNSE: 0,
  tradeMarginPerLotMCX: 0,
  tradeMarginPerLotFX: 0,
  tradeMarginPerLotOptions: 0,
  intradayTrade: false,
  intradayMarginPerCroreNSE: 0,
  intradayMarginPerCroreMCX: 0,
  intradayMarginPerCroreFX: 0,
  intradayMarginPerCroreOptions: 0,
  intradayMarginPerLotNSE: 0,
  intradayMarginPerLotMCX: 0,
  intradayMarginPerLotFX: 0,
  intradayMarginPerLotOptions: 0,
};

export const useUserCreateStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      copyUserId: null,
      editMode: false,
      dropdowns: defaultDropdowns,
      mode: 'create',
      updatedUser: {
        id: -1,
        username: '',
        type: 'update',
      },
      parent: defaultParent,
      sectionId: 1,
      parentFetch: true,
      errors: {
        basicDetails: {},
        exchangeSettings: {},
        brokerageSettings: {},
        marginSettings: {},
      },
      resetParent: () => {
        return set((state) => {
          return {
            ...state,
            parent: defaultParent,
          };
        });
      },
      resetUser: () => {
        return set((state) => {
          return {
            ...state,
            user: defaultUser,
          };
        });
      },
      setUser: (user: CreateUserType) => {
        return set((state) => {
          return {
            ...state,
            user: {
              ...state.user,
              ...user,
            },
          };
        });
      },
      setUserField: (field: keyof userInput, value: any) => {
        return set((state) => {
          return {
            ...state,
            user: {
              ...state.user,
              [field]: value,
            },
          };
        });
      },
      setCopyUserId: (id: number | null) => {
        return set((state) => {
          return {
            ...state,
            copyUserId: id,
          };
        });
      },
      setEditMode: (mode: boolean) => {
        return set((state) => {
          return {
            ...state,
            editMode: mode,
          };
        });
      },
      setDropdowns: (dropdowns: DropDownType) => {
        return set((state) => {
          return {
            ...state,
            dropdowns,
          };
        });
      },
      setMode: (mode: 'create' | 'update') => {
        return set((state) => {
          return {
            ...state,
            mode,
          };
        });
      },
      setParent: (parent: ParentUserType) => {
        return set((state) => {
          return {
            ...state,
            parent,
          };
        });
      },
      setUpdatedUser: (data: {
        username: string;
        id: number;
        type: 'update' | 'copy' | 'behalf';
      }) => {
        return set((state) => {
          return {
            ...state,
            updatedUser: data,
          };
        });
      },
      setSectionId: (id: number) => {
        return set((state) => {
          return {
            ...state,
            sectionId: id,
          };
        });
      },
      setParentFetch: (fetch: boolean) => {
        return set((state) => {
          return {
            ...state,
            parentFetch: fetch,
          };
        });
      },
      setErrors: (section: string, errors: any) => {
        return set((state) => {
          return {
            ...state,
            errors: {
              ...state.errors,
              [section]: errors,
            },
          };
        });
      },
    }),
    {
      name: '__expo_create_user', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
