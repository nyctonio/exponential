import Table from './table';
import { useScripts } from '@/store/script';
import { useRef, useState, useEffect } from 'react';
import printSafe from '@/utils/common/print';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import initSocket from '@/lib/socket';
import { useUserStore } from '@/store/user';
import moment from 'moment';
import { useSearchScripts } from '@/store/script/script-search';
import TradeModal from '../trade-modal';
import { MarketIndex, useMarketIndex } from '@/store/script/market-index';

const Index = () => {
  const socketRef: any = useRef();
  const indexSocketRef: any = useRef();
  // const [hydrated, setHydrated] = useState(false);
  // const [firstLoad, setFirstLoad] = useState(true);
  const [scriptDbData, setScriptDbData] = useState<any[]>([]);
  const { scripts, updateScript, setScripts, selectScript, moveScript } =
    useScripts();
  // const instrumentIds = useRef<string[]>([]);
  const { apiCall } = useFetch();
  // const _scripts = useRef(scripts);
  const { watchlist } = useUserStore();
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [indexLoading, setIndexLoading] = useState(true);
  const { scriptAddCount } = useSearchScripts();
  const { indexes, setIndexes, updateIndexes } = useMarketIndex();

  const init = async () => {
    const socket = await initSocket();
    socketRef.current = socket;
    socketRef.current.on('connect', () => {
      printSafe(['connected']);
    });
    // connecting to room
    const activeWatchlist = watchlist.list.filter((i) => {
      return i.id == watchlist.active;
    })[0].keys;
    socketRef.current.emit('JOIN_ROOM', JSON.stringify(activeWatchlist));
    socketRef.current.on('TRADE_CHANGE', (t: any) => {
      const data = JSON.parse(t);
      updateScript(data);
    });
  };

  const marketInit = async () => {
    const socket = await initSocket();
    indexSocketRef.current = socket;
    indexSocketRef.current.on('connect', () => {
      printSafe(['connected']);
    });
    indexSocketRef.current.emit(
      'JOIN_ROOM',
      JSON.stringify(indexes.map((a) => `live:${a.instrumentToken}`))
    );
    // connecting to room
    indexSocketRef.current.on('TRADE_CHANGE', (t: any) => {
      const data = JSON.parse(t);
      // updateScript(data);
      updateIndexes(data);
    });
  };

  useEffect(() => {
    // fetch all scripts from db
    const getInitialData = async () => {
      const exchangedata = await apiCall(
        Routes.GET_WATCHLIST_EXCHANGE_DATA,
        {}
      );
      setScriptDbData(exchangedata.data);
      setScripts(
        exchangedata.data
          .filter((scriptData: any) =>
            watchlist.list
              .filter((i) => i.id == watchlist.active)[0]
              .keys.includes(
                scriptData.exchange + ':' + scriptData.tradingsymbol
              )
          )
          .map((scriptData: any) => {
            return {
              key: scriptData.instrument_token,
              instrumentToken: scriptData && scriptData.instrument_token,
              symbol: scriptData.tradingsymbol || '',
              exchange: scriptData.exchange,
              lotSize: scriptData.lot_size,
              expiry: moment(scriptData.expiry)
                .utcOffset('+05:30')
                .format('DD-MMM-YY'),
              buyQty: scriptData.buyQty,
              buyPrice: scriptData.buyPrice,
              sellPrice: scriptData.sellPrice,
              sellQty: scriptData.sellQty,
              ltp: scriptData.ltp,
              change: scriptData.change,
              open: scriptData.open,
              high: scriptData.high,
              low: scriptData.low,
              close: scriptData.close,
              isSelected: false,
              buy_price_status: 'CONSTANT',
              buy_qty_status: 'INCREASE',
              change_status: 'CONSTANT',
              ltp_status: 'CONSTANT',
              sell_price_status: 'CONSTANT',
              sell_qty_status: 'INCREASE',
              oi: scriptData.oi,
              tbq: scriptData.tbq,
              tsq: scriptData.tsq,
              volumeTraded: scriptData.volumeTraded,
            };
          })
      );
      // fetched all
      setWatchlistLoading(false);
    };
    if (watchlistLoading) {
      getInitialData();
    } else {
      setScripts(
        scriptDbData
          .filter((scriptData: any) =>
            watchlist.list
              .filter((i) => i.id == watchlist.active)[0]
              .keys.includes(
                scriptData.exchange + ':' + scriptData.tradingsymbol
              )
          )
          .map((scriptData: any) => {
            return {
              key: scriptData.instrument_token,
              instrumentToken: scriptData && scriptData.instrument_token,
              symbol: scriptData.tradingsymbol || '',
              exchange: scriptData.exchange,
              lotSize: scriptData.lot_size,
              expiry: moment(scriptData.expiry)
                .utcOffset('+05:30')
                .format('DD-MMM-YY'),
              buyQty: scriptData.buyQty,
              buyPrice: scriptData.buyPrice,
              sellPrice: scriptData.sellPrice,
              sellQty: scriptData.sellQty,
              ltp: scriptData.ltp,
              change: scriptData.change,
              open: scriptData.open,
              high: scriptData.high,
              low: scriptData.low,
              close: scriptData.close,
              isSelected: false,
              buy_price_status: 'CONSTANT',
              buy_qty_status: 'INCREASE',
              change_status: 'CONSTANT',
              ltp_status: 'CONSTANT',
              sell_price_status: 'CONSTANT',
              sell_qty_status: 'INCREASE',
              oi: scriptData.oi,
              tbq: scriptData.tbq,
              tsq: scriptData.tsq,
              volumeTraded: scriptData.volumeTraded,
            };
          })
      );
    }

    socketRef.current = null;
    init();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [watchlist.active, watchlistLoading]);

  useEffect(() => {
    setWatchlistLoading(true);
  }, [scriptAddCount]);

  useEffect(() => {
    const fetchMarketIndexData = async () => {
      const marketIndexData = await apiCall(Routes.GET_MARKET_INDEXES_DATA, {});
      let finalData: MarketIndex[] = [];
      if (marketIndexData.status) {
        marketIndexData.data.map((item: any) => {
          finalData.push({
            change: null,
            instrumentToken: item.instrumentToken,
            name: item.name,
            perChange: item.change,
            value: item.ltp,
            status: null,
          });
        });
        setIndexes(finalData);
        setIndexLoading(false);
      }
    };
    if (indexLoading) {
      fetchMarketIndexData();
    } else {
      indexSocketRef.current = null;
      marketInit();
    }
    return () => {
      indexSocketRef.current?.disconnect();
    };
  }, [indexLoading]);

  // useEffect(() => {
  //   console.log('scripts changed', scripts);
  // }, [scripts]);

  // const init = async () => {
  //   setLoading(true);
  //   const exchangedata = await apiCall(Routes.GET_WATCHLIST_EXCHANGE_DATA, {});
  //   const marketIndexData = await apiCall(Routes.GET_MARKET_INDEXES_DATA, {});
  //   let finalData: MarketIndex[] = [];
  //   if (marketIndexData.status) {
  //     marketIndexData.data.map((item: any) => {
  //       finalData.push({
  //         change: null,
  //         instrumentToken: item.instrumentToken,
  //         name: item.name,
  //         perChange: item.change,
  //         value: item.ltp,
  //         status: null,
  //       });
  //     });
  //     setIndexes(finalData);
  //   }
  //   // printSafe(['exchange data', exchangedata]);
  //   if (exchangedata.status) {
  //     setScriptDbData(exchangedata.data);
  //     setLoading(false);
  //     setHydrated(true);
  //   }
  //   // fetching all instrument ids
  //   const allInstrumentIds = [
  //     ...new Set(watchlist.list.map((_list) => _list.keys).flat()),
  //     ...finalData.map((a) => `live:${a.instrumentToken}`),
  //   ];

  //   console.log('all instrument ids are ', allInstrumentIds);
  //   const socket = await initSocket();
  //   socketRef.current = socket;
  //   socketRef.current.on('connect', () => {
  //     printSafe(['connected']);
  //   });
  //   // connecting to room
  //   socketRef.current.emit('JOIN_ROOM', JSON.stringify(allInstrumentIds));
  //   socketRef.current.on('TRADE_CHANGE', (t: any) => {
  //     try {
  //       let data = JSON.parse(t);
  //       data.instrumentToken.toString();
  //       let instrumentToken = data.instrumentToken;
  //       if (finalData.find((a) => a.instrumentToken == instrumentToken)) {
  //         // console.log('change in market index ', indexes);
  //         // currIndexes = currIndexes.map((a) => {
  //         //   if (a.instrumentToken == instrumentToken) {
  //         //     return {
  //         //       ...a,
  //         //       value: data.buyPrice,
  //         //       change: data.change,
  //         //     };
  //         //   }
  //         //   return a;
  //         // });
  //         // console.log('change to ', currIndexes);
  //         // console.log('temp indexes are ', tempIndexes);
  //         updateIndexes(data);
  //       } else {
  //         const _watchlist =
  //           instrumentIds.current.length > 0
  //             ? instrumentIds.current
  //             : watchlist.list.filter((i) => {
  //                 return i.id == watchlist.active;
  //               })[0].keys;
  //         console.log('watchlist is ', _watchlist);
  //         updateScript(data, _watchlist);
  //       }
  //     } catch (e) {
  //       printSafe([e, 'error']);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   console.log('changeeee');
  //   if (socketRef.current == null && scriptAddCount == 0) {
  //     init();
  //   } else {
  //     socketRef.current = null;
  //     init();
  //   }
  //   return () => {
  //     if (socketRef.current != null) {
  //       socketRef.current.disconnect();
  //     }
  //   };
  // }, [scriptAddCount]);

  // let onWatchlistChange = () => {
  //   let _tempscripts: any = [];
  //   if (!hydrated) return;
  //   let _activeWatchlist = watchlist.list.filter((i) => {
  //     return i.id == watchlist.active;
  //   });
  //   instrumentIds.current = _activeWatchlist[0].keys;
  //   if (_activeWatchlist.length == 0) return;
  //   let activeWatchlist = _activeWatchlist[0];
  //   (activeWatchlist.keys || []).map((id) => {
  //     let scriptData = scriptDbData.find((data) => {
  //       return (
  //         data.exchange == id.split(':')[0] &&
  //         data.tradingsymbol == id.split(':')[1]
  //       );
  //     });
  //     if (scriptData) {
  //       _tempscripts.push({
  //         instrumentToken: scriptData && scriptData.instrument_token,
  //         symbol: scriptData.tradingsymbol || '',
  //         exchange: scriptData.exchange,
  //         lotSize: scriptData.lot_size,
  //         expiry: moment(scriptData.expiry)
  //           .utcOffset('+05:30')
  //           .format('DD-MMM-YY'),
  //         buyQty: scriptData.buyQty,
  //         buyPrice: scriptData.buyPrice,
  //         sellPrice: scriptData.sellPrice,
  //         sellQty: scriptData.sellQty,
  //         ltp: scriptData.ltp,
  //         change: scriptData.change,
  //         open: scriptData.open,
  //         high: scriptData.high,
  //         low: scriptData.low,
  //         close: scriptData.close,
  //         isSelected: false,
  //         buy_price_status: 'CONSTANT',
  //         buy_qty_status: 'INCREASE',
  //         change_status: 'CONSTANT',
  //         ltp_status: 'CONSTANT',
  //         sell_price_status: 'CONSTANT',
  //         sell_qty_status: 'INCREASE',
  //         oi: scriptData.oi,
  //         tbq: scriptData.tbq,
  //         tsq: scriptData.tsq,
  //         volumeTraded: scriptData.volumeTraded,
  //       });
  //       return;
  //     }
  //   });
  //   setScripts(_tempscripts);
  // };

  // useEffect(() => {
  //   onWatchlistChange();
  //   console.log('watchlist changed');
  // }, [watchlist.active, hydrated, scriptDbData]);

  return (
    <>
      <Table loading={watchlistLoading || indexLoading} />
      <TradeModal />
    </>
  );
};

export default Index;
