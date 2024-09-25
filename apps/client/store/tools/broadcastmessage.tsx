import { create } from 'zustand';

type Values = {
  title: string;
  message: string;
  type: string;
  valid_for: {
    userType: string;
    id: number;
  };
  frequency: number;
  severity: string;
  from_date: string;
  to_date: string;
  users: Number[];
  multiple: boolean;
};

type State = {
  values: Values;
  timeInputs: string[];
};

type Actions = {
  setValues: (broadcastData: {
    title: string;
    message: string;
    type: string;
    valid_for: {
      userType: string;
      id: number;
    };
    frequency: number;
    severity: string;
    from_date: string;
    to_date: string;
    users: Number[];
    multiple: boolean;
  }) => void;
  setTimeInput: (timeInputs: string[]) => void;
};

export const useBroadCastStore = create<State & Actions>((set) => ({
  values: {
    title: '',
    message: '',
    type: '',
    users: [],
    valid_for: {
      id: 6,
      userType: 'All',
    },
    from_date: '',
    to_date: '',
    severity: '',
    frequency: 0,
    multiple: false,
  },
  timeInputs: [],
  setValues: (values: State['values']) => set({ values: values }),
  setTimeInput: (timeInputs) => set({ timeInputs }),
}));
