import { AppSetting } from '@/types/tools/manage-app-settings';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type State = {
  data: AppSetting[];
  loading: boolean;
  refresh: number;
  isStoreEmpty: boolean;
  editMode: boolean;
  filterData: {
    prjSettKey: string;
    prjSettName: string;
  };
  paginationData: {
    pageNumber: number;
    pageSize: number;
  };
  sort: {
    key:
      | 'prjSettKey'
      | 'prjSettName'
      | 'prjSettConstant'
      | 'prjSettDisplayName';
    value: 'ASC' | 'DESC';
  } | null;
  keyOptions: string[];
  total: number;
  createFormData: {
    applicationSettingKey: string;
    applicationSettingName: string;
    applicationSettingValue: string;
    applicationSettingDisplay: string;
    applicationSettingSort: number;
  };
};

type Actions = {
  setData: (data: AppSetting[]) => void;
  setLoading: (value: boolean) => void;
  setStoreCondition: (value: boolean) => void;
  setFilterData: (prjSettKey: string, prjSettName: string) => void;
  setPaginationData: (pageNumber: number, pageSize: number) => void;
  updateData: (
    id: number,
    diplayValue: string,
    sortOrder: number,
    active: boolean
  ) => void;
  setSort: (
    key:
      | 'prjSettKey'
      | 'prjSettName'
      | 'prjSettConstant'
      | 'prjSettDisplayName',
    value: 'ASC' | 'DESC'
  ) => void;
  setKeyOptions: (data: string[]) => void;
  clearState: () => void;
  setSortNull: () => void;
  setRefresh: () => void;
  setTotal: (value: number) => void;
  setCreateFormData: (
    applicationSettingKey: string,
    applicationSettingName: string,
    applicationSettingValue: string,
    applicationSettingDisplay: string,
    applicationSettingSort: number
  ) => void;
  setEditMode: (value: boolean) => void;
};

export const useManageAppSettingsStore = create<State & Actions>()(
  persist(
    (set) => ({
      data: [],
      isStoreEmpty: true,
      filterData: {
        prjSettKey: '',
        prjSettName: '',
      },
      total: 0,
      keyOptions: [],
      loading: false,
      paginationData: {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
      },
      refresh: 0,
      sort: null,
      editMode: false,
      clearState: () =>
        set({
          filterData: { prjSettKey: '', prjSettName: '' },
          data: [],
          paginationData: { pageNumber: 1, pageSize: 10 },
          sort: null,
          isStoreEmpty: true,
        }),
      setData: (data) => set({ data }),
      setFilterData: (prjSettKey: string, prjSettName: string) =>
        set({ filterData: { prjSettKey, prjSettName } }),
      setLoading: (value: boolean) => set({ loading: value }),
      setPaginationData: (pageNumber: number, pageSize: number) =>
        set({
          paginationData: {
            pageNumber: pageNumber,
            pageSize: pageSize,
          },
        }),
      setSort: (key, value) => set({ sort: { key, value } }),
      setStoreCondition: (value) => {
        set({ isStoreEmpty: value });
      },
      setKeyOptions: (data) => set({ keyOptions: data }),
      setSortNull: () => set({ sort: null }),
      updateData: (id, displayValue, sortOrder, active) => {
        set((state) => {
          let checkIndex = state.data.findIndex((a) => a.id == id);
          if (checkIndex != -1) {
            state.data[checkIndex].prjSettDisplayName = displayValue;
            state.data[checkIndex].prjSettSortOrder = sortOrder;
            state.data[checkIndex].prjSettActive = active;
          }
          return { data: state.data };
        });
      },
      setRefresh: () => {
        set((state) => {
          state.refresh = state.refresh + 1;
          return { refresh: state.refresh };
        });
      },
      setTotal: (value) => set({ total: value }),
      createFormData: {
        applicationSettingDisplay: '',
        applicationSettingKey: '',
        applicationSettingName: '',
        applicationSettingSort: 0,
        applicationSettingValue: '',
      },
      setCreateFormData: (
        applicationSettingKey,
        applicationSettingName,
        applicationSettingValue,
        applicationSettingDisplay,
        applicationSettingSort
      ) =>
        set({
          createFormData: {
            applicationSettingDisplay,
            applicationSettingKey,
            applicationSettingName,
            applicationSettingSort,
            applicationSettingValue,
          },
        }),

      setEditMode: (value) => set({ editMode: value }),
    }),
    {
      name: '__expo_manage-app-settings-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
