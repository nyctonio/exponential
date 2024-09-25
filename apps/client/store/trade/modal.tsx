import { create } from 'zustand';

export type ModalState = {
  open: boolean;
  script: string;
};

export type Actions = {
  setOpen: (open: boolean) => void;
  setScript: (script: string) => void;
};

export const useModal = create<ModalState & Actions>((set) => ({
  open: false,
  script: '',
  setOpen: (open: boolean) => set({ open }),
  setScript: (script: string) => set({ script }),
}));
