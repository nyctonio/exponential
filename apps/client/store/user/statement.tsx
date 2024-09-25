import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// tabs in the main content area

export type StatementProps = {
  statementData: {
    m2m: number;
    marginAvailable: number;
    openingBalance: number;
    realizedPL: number;
    normalUnrealizedPL: number;
    intradayUnrealizedPL: number;
    intradayMarginHold: number;
    normalMarginHold: number;
    deposit: number;
    withdrawal: number;
  };
  setStatementData: (data: {
    m2m: number;
    marginAvailable: number;
    openingBalance: number;
    realizedPL: number;
    normalUnrealizedPL: number;
    intradayUnrealizedPL: number;
    intradayMarginHold: number;
    normalMarginHold: number;
    deposit: number;
    withdrawal: number;
  }) => void;
};

export const useStatement = create<StatementProps>()(
  persist(
    (set) => ({
      statementData: {
        m2m: 0,
        marginAvailable: 0,
        openingBalance: 0,
        realizedPL: 0,
        normalUnrealizedPL: 0,
        intradayUnrealizedPL: 0,
        intradayMarginHold: 0,
        normalMarginHold: 0,
        deposit: 0,
        withdrawal: 0,
      },
      setStatementData: (data) => set({ statementData: data }),
    }),
    {
      name: '__expo_user-statement',
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
