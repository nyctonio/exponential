import { create } from 'zustand';

type State = {
  values: {
    title: string;
    message: string;
    userType: {
      userType: string;
      id: number;
    };
    is_hierarchy: boolean;
    users: Number[];
  };
};

type Actions = {
  setValues: (notificationData: {
    title: string;
    message: string;
    userType: {
      userType: string;
      id: number;
    };
    is_hierarchy: boolean;
    users: Number[];
  }) => void;
};

export const useSendNotificationStore = create<State & Actions>((set) => ({
  values: {
    is_hierarchy: false,
    message: '',
    title: '',
    users: [],
    userType: {
      id: 6,
      userType: 'All',
    },
  },
  setValues: (values: State['values']) => set({ values: values }),
}));
