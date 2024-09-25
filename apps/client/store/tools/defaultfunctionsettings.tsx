import { ParsedUserAccessItem } from '@/types/user-access-management';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type State = {
  data: ParsedUserAccessItem[];
  editedFunctions: { funcId: number; value: boolean }[];
  userType: string;
  loading: boolean;
  formActive: boolean;
};

type Actions = {
  setFormActive: (formActive: boolean) => void;
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  updateData: (menuId: number, funcId: number, value: boolean) => void;
  setEditedFunctions: (data: any) => void;
  updateTableAccess: (menuId: number, value: boolean) => void;
  clearState: () => void;
  setUserType: (userType: string) => void;
};

export const useDefaultFunctionSettings = create<State & Actions>()(
  persist(
    (set) => ({
      data: [],
      editedFunctions: [],
      formActive: false,
      loading: false,
      selectedUser: null,
      userType: 'Master',
      setUserType: (userType) => set({ userType }),
      setData: (data: any) => set({ data }),
      setLoading: (loading: boolean) => set({ loading }),
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
          userType: 'Master',
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
      name: '__expo_default-function-setting-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
