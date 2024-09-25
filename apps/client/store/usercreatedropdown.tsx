import { CreateUserDropdown } from '@/types/dropdowndata';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DropdownDataProps = {
  userCreateData: CreateUserDropdown;
  setCreateUserDropdownData: (data: CreateUserDropdown) => void;
};

export const useDropdownData = create<DropdownDataProps>()(
  persist(
    (set) => ({
      userCreateData: null,
      setCreateUserDropdownData(data) {
        set((state) => {
          state.userCreateData = data;
          return state;
        });
      },
    }),
    {
      name: 'dropdown-data',
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
