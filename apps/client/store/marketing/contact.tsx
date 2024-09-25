import { create } from 'zustand';

type State = {
  values: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
};

type Actions = {
  setValues: (contactData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) => void;
};

export const useContactStore = create<State & Actions>((set) => ({
  values: {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  },
  setValues: (values: State['values']) => set({ values: values }),
}));
