import { create } from 'zustand';
import printSafe from '@/utils/common/print';

export type ScriptType = {
  instrumentToken: string;
  exchange: string;
  symbol: string;
  expiry: string;
  lotSize: number;
  buyQty: string;
  buyPrice: string;
  sellPrice: string;
  sellQty: string;
  ltp: string;
  change: string;
  open: string;
  high: string;
  low: string;
  close: string;
  isSelected: boolean;
  buy_price_status: string;
  buy_qty_status: string;
  change_status: string;
  ltp_status: string;
  sell_price_status: string;
  sell_qty_status: string;
  oi: number;
  tbq: number;
  tsq: number;
  volumeTraded: number;
};

export type ScriptState = {
  scripts: ScriptType[];
  setScripts: (scripts: ScriptType[]) => void;
  updateScript: (script: ScriptType) => void;
  selectScript: (symbol: string, exchange: string) => void;
  moveScript: (dir: string) => void;
  removeSelection: () => void;
  removeScript: (symbol: string, exchange: string) => void;
};

export const useScripts = create<ScriptState>()((set) => ({
  scripts: [],
  setScripts: (scripts: ScriptType[]) => set({ scripts }),
  updateScript: (script: ScriptType) =>
    set((state) => {
      // const _script = JSON.parse(JSON.stringify(script));
      // console.log(_script, _script.instrumentToken, _script.buyPrice);
      // state.scripts = state.scripts.filter((s) =>
      //   watchlistids.includes(s.exchange + ':' + s.symbol)
      // );
      // if (watchlistids.includes(script.exchange + ':' + script.symbol)) {
      let indexOfFiltered = state.scripts.findIndex((s) => {
        return String(s.instrumentToken) == String(script.instrumentToken);
      });
      // console.log('indexOfFiltered', indexOfFiltered, script, state.scripts);
      if (indexOfFiltered != -1) {
        if (state.scripts[indexOfFiltered].isSelected == true) {
          script.isSelected = true;
        }

        if (state.scripts[indexOfFiltered].change > script.change) {
          script.change_status = 'DECREASE';
        } else if (state.scripts[indexOfFiltered].change < script.change) {
          script.change_status = 'INCREASE';
        } else {
          script.change_status = state.scripts[indexOfFiltered].change_status;
        }

        if (
          parseFloat(state.scripts[indexOfFiltered].sellQty) >
          parseFloat(script.sellQty)
        ) {
          script.sell_qty_status = 'DECREASE';
        } else if (
          parseFloat(state.scripts[indexOfFiltered].sellQty) <
          parseFloat(script.sellQty)
        ) {
          script.sell_qty_status = 'INCREASE';
        } else {
          script.sell_qty_status =
            state.scripts[indexOfFiltered].sell_qty_status;
        }

        if (
          parseFloat(state.scripts[indexOfFiltered].buyQty) >
          parseFloat(script.buyQty)
        ) {
          script.buy_qty_status = 'DECREASE';
        } else if (
          parseFloat(state.scripts[indexOfFiltered].buyQty) <
          parseFloat(script.buyQty)
        ) {
          script.buy_qty_status = 'INCREASE';
        } else {
          script.buy_qty_status = state.scripts[indexOfFiltered].buy_qty_status;
        }

        if (
          parseFloat(state.scripts[indexOfFiltered].buyPrice) >
          parseFloat(script.buyPrice)
        ) {
          script.buy_price_status = 'DECREASE';
        } else if (
          parseFloat(state.scripts[indexOfFiltered].buyPrice) <
          parseFloat(script.buyPrice)
        ) {
          script.buy_price_status = 'INCREASE';
        } else {
          // set the previous status
          script.buy_price_status =
            state.scripts[indexOfFiltered].buy_price_status;
        }

        if (
          parseFloat(state.scripts[indexOfFiltered].sellPrice) >
          parseFloat(script.sellPrice)
        ) {
          script.sell_price_status = 'DECREASE';
        } else if (
          parseFloat(state.scripts[indexOfFiltered].sellPrice) <
          parseFloat(script.sellPrice)
        ) {
          script.sell_price_status = 'INCREASE';
        } else {
          script.sell_price_status =
            state.scripts[indexOfFiltered].sell_price_status;
        }

        if (
          parseFloat(state.scripts[indexOfFiltered].ltp) >
          parseFloat(script.ltp)
        ) {
          script.ltp_status = 'DECREASE';
        } else if (
          parseFloat(state.scripts[indexOfFiltered].ltp) <
          parseFloat(script.ltp)
        ) {
          script.ltp_status = 'INCREASE';
        } else {
          script.ltp_status = state.scripts[indexOfFiltered].ltp_status;
        }

        state.scripts[indexOfFiltered] = script;
        state.scripts[indexOfFiltered].instrumentToken =
          script.instrumentToken.toString();
      }
      return { scripts: [...state.scripts] };
      // } else {
      //   return { scripts: [...state.scripts] };
      // }
    }),

  removeScript: (symbol: string, exchange: string) =>
    set((state) => {
      let scriptIndex = state.scripts.findIndex((a) => {
        return a.symbol == symbol && a.exchange == exchange;
      });
      state.scripts.splice(scriptIndex, 1);
      return { scripts: [...state.scripts] };
    }),

  selectScript: (symbol: string, exchange: string) =>
    set((state) => {
      let scriptIndex = state.scripts.findIndex((a) => {
        return a.exchange == exchange && a.symbol == symbol;
      });

      state.scripts.map((data, index) => {
        state.scripts[index].isSelected = false;
      });

      if (scriptIndex != -1) {
        state.scripts[scriptIndex] = {
          ...state.scripts[scriptIndex],
          isSelected: true,
        };
      }

      return { scripts: [...state.scripts] };
    }),

  moveScript: (dir: string) => {
    set((state) => {
      let currIndex = state.scripts.findIndex((a) => {
        return a.isSelected == true;
      });

      if (currIndex != -1) {
        if (dir == 'down') {
          if (currIndex == state.scripts.length - 1) {
          } else {
            state.scripts[currIndex].isSelected = false;
            state.scripts[currIndex + 1].isSelected = true;
          }
        } else {
          if (currIndex == 0) {
          } else {
            state.scripts[currIndex].isSelected = false;
            state.scripts[currIndex - 1].isSelected = true;
          }
        }
      }

      return { scripts: state.scripts };
    });
  },

  removeSelection: () => {
    set((state) => {
      let currIndex = state.scripts.findIndex((a) => {
        return a.isSelected == true;
      });
      if (currIndex != -1) {
        state.scripts[currIndex].isSelected = false;
      }
      return { scripts: state.scripts };
    });
  },
}));

// updateScript: (script: ScriptType) =>
// set((state) => {
//   // state.scripts = state.scripts.filter((s) =>
//   //   watchlistids.includes(s.exchange + ':' + s.symbol)
//   // );
//   // if (watchlistids.includes(script.exchange + ':' + script.symbol)) {
//   let indexOfFiltered = state.scripts.findIndex(
//     (s) => s.instrumentToken == script.instrumentToken
//   );
//   if (indexOfFiltered != -1) {
//     if (state.scripts[indexOfFiltered].isSelected == true) {
//       script.isSelected = true;
//     }

//     if (state.scripts[indexOfFiltered].change > script.change) {
//       script.change_status = 'DECREASE';
//     } else if (state.scripts[indexOfFiltered].change < script.change) {
//       script.change_status = 'INCREASE';
//     } else {
//       script.change_status = state.scripts[indexOfFiltered].change_status;
//     }

//     if (
//       parseFloat(state.scripts[indexOfFiltered].sellQty) >
//       parseFloat(script.sellQty)
//     ) {
//       script.sell_qty_status = 'DECREASE';
//     } else if (
//       parseFloat(state.scripts[indexOfFiltered].sellQty) <
//       parseFloat(script.sellQty)
//     ) {
//       script.sell_qty_status = 'INCREASE';
//     } else {
//       script.sell_qty_status =
//         state.scripts[indexOfFiltered].sell_qty_status;
//     }

//     if (
//       parseFloat(state.scripts[indexOfFiltered].buyQty) >
//       parseFloat(script.buyQty)
//     ) {
//       script.buy_qty_status = 'DECREASE';
//     } else if (
//       parseFloat(state.scripts[indexOfFiltered].buyQty) <
//       parseFloat(script.buyQty)
//     ) {
//       script.buy_qty_status = 'INCREASE';
//     } else {
//       script.buy_qty_status = state.scripts[indexOfFiltered].buy_qty_status;
//     }

//     if (
//       parseFloat(state.scripts[indexOfFiltered].buyPrice) >
//       parseFloat(script.buyPrice)
//     ) {
//       script.buy_price_status = 'DECREASE';
//     } else if (
//       parseFloat(state.scripts[indexOfFiltered].buyPrice) <
//       parseFloat(script.buyPrice)
//     ) {
//       script.buy_price_status = 'INCREASE';
//     } else {
//       // set the previous status
//       script.buy_price_status =
//         state.scripts[indexOfFiltered].buy_price_status;
//     }

//     if (
//       parseFloat(state.scripts[indexOfFiltered].sellPrice) >
//       parseFloat(script.sellPrice)
//     ) {
//       script.sell_price_status = 'DECREASE';
//     } else if (
//       parseFloat(state.scripts[indexOfFiltered].sellPrice) <
//       parseFloat(script.sellPrice)
//     ) {
//       script.sell_price_status = 'INCREASE';
//     } else {
//       script.sell_price_status =
//         state.scripts[indexOfFiltered].sell_price_status;
//     }

//     if (
//       parseFloat(state.scripts[indexOfFiltered].ltp) >
//       parseFloat(script.ltp)
//     ) {
//       script.ltp_status = 'DECREASE';
//     } else if (
//       parseFloat(state.scripts[indexOfFiltered].ltp) <
//       parseFloat(script.ltp)
//     ) {
//       script.ltp_status = 'INCREASE';
//     } else {
//       script.ltp_status = state.scripts[indexOfFiltered].ltp_status;
//     }

//     state.scripts[indexOfFiltered] = script;
//     state.scripts[indexOfFiltered].instrumentToken =
//       script.instrumentToken.toString();
//   }
//   return { scripts: [...state.scripts] };
//   // } else {
//   //   return { scripts: [...state.scripts] };
//   // }
// }),
