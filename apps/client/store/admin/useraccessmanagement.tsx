import { ParsedUserAccessItem } from '@/types/user-access-management';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type State = {
  data: ParsedUserAccessItem[];
  editedFunctions: { funcId: number; value: boolean }[];
  username: string;
  selectedUser: { username: string; id: number } | null;
  loading: boolean;
  formActive: boolean;
};

type Actions = {
  setFormActive: (formActive: boolean) => void;
  setData: (data: any) => void;
  setSelectedUser: (data: { id: number; username: string } | null) => void;
  setLoading: (loading: boolean) => void;
  setUsername: (username: string) => void;
  updateData: (menuId: number, funcId: number, value: boolean) => void;
  setEditedFunctions: (data: any) => void;
  updateTableAccess: (menuId: number, value: boolean) => void;
  clearState: () => void;
};

export const userUserAccessStore = create<State & Actions>()(
  persist(
    (set) => ({
      data: [],
      editedFunctions: [],
      formActive: false,
      loading: false,
      selectedUser: null,
      username: '',
      setData: (data: any) => set({ data }),
      setLoading: (loading: boolean) => set({ loading }),
      setSelectedUser: (data: { id: number; username: string } | null) =>
        set({ selectedUser: data }),
      setUsername: (username: string) => set({ username }),
      updateData: (menuId: number, funcId: number, value: boolean) =>
        set((state) => {
          let menuIndex = state.data.findIndex((item) => {
            return item.menuId == menuId;
          });
          if (menuIndex != -1) {
            let functionIndex = state.data[menuIndex].functions.findIndex(
              (a) => a.funcId == funcId
            );

            if (functionIndex != -1) {
              state.data[menuIndex].functions[functionIndex].isAccess = value;
              let editedFunctionsCheck = state.editedFunctions.findIndex(
                (a) => a.funcId == funcId
              );
              if (editedFunctionsCheck == -1) {
                state.editedFunctions.push({ funcId: funcId, value });
              } else {
                state.editedFunctions[editedFunctionsCheck].value = value;
              }
            }
          }

          return { data: state.data, editedFunctions: state.editedFunctions };
        }),
      setFormActive: (formActive: boolean) => set({ formActive }),
      setEditedFunctions: (data) => {
        set({ editedFunctions: [] });
      },
      clearState: () => {
        set({
          data: [],
          formActive: false,
          loading: false,
          selectedUser: null,
          username: '',
          editedFunctions: [],
        });
      },
      updateTableAccess: (menuId: number, value: boolean) => {
        set((state) => {
          let menuIndex = state.data.findIndex((a) => a.menuId == menuId);
          let editedFunctionsMenuCheck = state.editedFunctions.findIndex(
            (a) => {
              return a.funcId == state.data[menuIndex].menuFuncId;
            }
          );

          if (editedFunctionsMenuCheck == -1) {
            state.editedFunctions.push({
              funcId: state.data[menuIndex].menuFuncId || -1,
              value,
            });
          } else {
            state.editedFunctions[editedFunctionsMenuCheck].value = value;
          }

          if (menuIndex != -1) {
            state.data[menuIndex].isMenuAccess = value;
            state.data[menuIndex].functions.map((item, index) => {
              state.data[menuIndex].functions[index].isAccess = value;
              let editedFunctionsCheck = state.editedFunctions.findIndex(
                (a) => a.funcId == state.data[menuIndex].functions[index].funcId
              );
              if (editedFunctionsCheck == -1) {
                state.editedFunctions.push({
                  funcId: state.data[menuIndex].functions[index].funcId,
                  value,
                });
              } else {
                state.editedFunctions[editedFunctionsCheck].value = value;
              }
            });
          }

          return { data: state.data, editedFunctions: state.editedFunctions };
        });
      },
    }),
    {
      name: '__expo_user-access-management-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
