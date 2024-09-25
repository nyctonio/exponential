import { useEffect, useState } from 'react';
import { Layout, Watermark } from 'antd';

import { LabeledWrapper } from '@/components/inputs/text';
import { SelectAntdBorder } from '@/components/inputs/select';
import { PrimaryButton, BorderedButton } from '@/components/inputs/button';
import Loading from '@/components/layout/loading';
import WatchlistSetting from '@/components/trade/perform-trades/settings';

import { useUserStore } from '@/store/user';
import { useSearchScripts } from '@/store/script/script-search';

import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import useFetch from '@/hooks/useFetch';

import Search from './search';
import Niftybar from './niftybar';
import Table from './table';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { useConversionRate } from '@/store/conversion-rate/mcxconversionrate';
import { useStatement } from '@/store/user/statement';

const Page = () => {
  // TODO - get columns data from api and watchlist information and save it to the zustand store
  const [hydrated, setHydrated] = useState(false);
  const { apiCall } = useFetch();
  const {
    config,
    setUserConfig,
    exchange,
    setExchange,
    scriptQty,
    setScriptQty,
    setOpenOrders,
  } = useUserStore();
  const { watchlist, setWatchlist, allowedExchange, setAllowedExchange } =
    useUserStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    searchScript,
    setSearchScript,
    selectedScripts,
    increaseScriptAddCount,
    setSelectedScripts,
  } = useSearchScripts();

  const { setConversionScripts } = useConversionRate();
  const { setStatementData } = useStatement();

  const scriptAddHandler = async () => {
    let activeWatchlistKeys =
      watchlist.list.find((a) => a.id == watchlist.active)?.keys || [];
    if (activeWatchlistKeys.length + selectedScripts.length > 20) {
      new Toast('').error("Watchlist can't contain more than 20 scripts.");
      setSelectedScripts([]);
      return;
    }
    if (selectedScripts.length == 0) {
      new Toast('').error('Please select scripts before adding!!!');
      return;
    }
    let _toast = new Toast('Adding scripts to watchlist');
    let response = await apiCall(Routes.UPDATE_WATCHLIST, {
      watchlistId: watchlist.active,
      scripts: [...activeWatchlistKeys, ...selectedScripts],
    });
    if (response.status == true) {
      _toast.success('Scripts added to watchlist');
      setWatchlist({
        ...watchlist,
        list: watchlist.list.map((a) => {
          if (a.id == watchlist.active) {
            return {
              ...a,
              keys: [
                ...(watchlist.list.find((a) => a.id == watchlist.active)
                  ?.keys || []),
                ...selectedScripts,
              ],
            };
          } else {
            return a;
          }
        }),
      });
      setSelectedScripts([]);
      // for updating the watchlist count
      increaseScriptAddCount();
    } else {
      _toast.error('Error adding scripts to watchlist');
    }
  };

  const fetchInitialData = async () => {
    // fetching users watchlist
    const [
      watchlistdata,
      columndata,
      allowedexchangedata,
      pretradevalidationdata,
      openordersdata,
      mcxconversiondata,
      statementdata,
    ] = await Promise.all([
      apiCall(Routes.WATCHLIST_DATA, {}),
      apiCall(Routes.GET_COLUMN_DATA, {}),
      apiCall(Routes.GET_USER_ALLOWED_EXCHANGES, {}),
      apiCall(Routes.TRADE.PRE_TRADE_VALIDATION, {}),
      apiCall(Routes.TRADE.GET_OPEN_ORDERS, {}),
      apiCall(Routes.GET_PROJECT_SETTINGS_BY_KEY, { keys: ['MCXCVR'] }),
      apiCall(Routes.USER.GET_STATEMENT, {}, false),
      // setStatementData(data.data);
    ]);
    // fetching global column data for watchlist
    if (
      watchlistdata.status &&
      columndata.status &&
      allowedexchangedata.status &&
      pretradevalidationdata.status &&
      openordersdata.status &&
      mcxconversiondata.status &&
      statementdata.status
    ) {
      setAllowedExchange(allowedexchangedata.data);
      setSearchScript({
        exchange: allowedexchangedata.data[0] || '',
        searchValue: searchScript.searchValue,
      });
      let sortedWatchlist = watchlistdata.data.sort((a: any, b: any) => {
        return a.id - b.id;
      });
      setWatchlist({
        list: sortedWatchlist.map((watchlist: any) => {
          return {
            id: watchlist.id,
            name: watchlist.name,
            keys: watchlist.scripts,
            settings: {
              columns: watchlist.columns.map((col: any) => {
                const coldata = columndata.data.find(
                  (c: any) => c.id == col.id
                );
                return {
                  id: col.id,
                  name: coldata.name,
                  width: col.width,
                };
              }),
              fastTradeActive: watchlist.fastTradeActive,
              fastTradeLotSize: watchlist.fastTradeLotSize,
              orderBy: watchlist.filter,
              sortBy: watchlist.sort,
            },
          };
        }),
        columns: columndata.data.map((col: any) => {
          return {
            id: col.id,
            name: col.name,
            width: col.width,
          };
        }),
        active:
          watchlist.active == 0 ? watchlistdata.data[0].id : watchlist.active,
      });
      setUserConfig({
        ...config,
        isDemoId: pretradevalidationdata.data.user.isDemoId,
        isIntradayAllowed: pretradevalidationdata.data.user.isIntradayAllowed,
        tradeAllowedinQty: pretradevalidationdata.data.user.tradeAllowedinQty,
        autoCutSettings: {
          bidStopSettings:
            pretradevalidationdata.data.autoCutSettings.bidStopSettings.map(
              (a: any) => {
                return {
                  option: a.option,
                  outside: a.outside,
                  between: a.between,
                  cmp: a.cmp,
                };
              }
            ),
          mcxBidStopSettings:
            pretradevalidationdata.data.autoCutSettings.mcxBidStopSettings.map(
              (a: any) => {
                return {
                  instrumentName: a.instrumentName,
                  bidValue: a.bidValue,
                  stopLossValue: a.stopLossValue,
                };
              }
            ),
        },
      });
      setExchange(pretradevalidationdata.data.exchange);
      setScriptQty(pretradevalidationdata.data.scriptQuantity);
      setOpenOrders(openordersdata.data);
      setConversionScripts(
        mcxconversiondata.data.map((a: any) => {
          return {
            name: a.prjSettConstant,
            value: Number(a.prjSettDisplayName),
          };
        })
      );
      setStatementData(statementdata.data);
      setHydrated(true);
    } else {
      // TODO - handle error
      new Toast('Error fetching data').error('Error fetching data');
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (watchlist.list.length > 0 && watchlist.columns.length > 0) {
      setHydrated(true);
      return;
    } else {
      fetchInitialData();
    }
  }, []);

  if (!hydrated) {
    return <Loading />;
  }
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      {/* trade header */}
      <Niftybar />
      <div className="hidden mb-4 mt-1 overflow-x-scroll py-[2px] w-full pl-[2px]  flex-wrap md:flex justify-between">
        <div className="flex space-x-2 items-end">
          <LabeledWrapper label="Exchange Name">
            <SelectAntdBorder
              defaultValue={allowedExchange[0] || ''}
              options={allowedExchange.map((a) => {
                if (a == 'NSE') {
                  return { label: 'NSE', value: a };
                } else {
                  return { label: a, value: a };
                }
              })}
              className="!bg-white h-[40px]"
              value={searchScript.exchange}
              handleChange={(value) => {
                setSearchScript({
                  exchange: value,
                  searchValue: searchScript.searchValue,
                });
              }}
            />
          </LabeledWrapper>
          <LabeledWrapper label="Script Search">
            <Search />
          </LabeledWrapper>
          <PrimaryButton
            onClick={scriptAddHandler}
            className="flex justify-center h-[] items-center space-x-2 !w-[100px]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39747 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39747 5.39747 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39747 18.3332 9.99984ZM9.99984 6.0415C10.345 6.0415 10.6248 6.32133 10.6248 6.6665V9.37484H13.3332C13.6783 9.37484 13.9582 9.65466 13.9582 9.99984C13.9582 10.345 13.6783 10.6248 13.3332 10.6248H10.6248V13.3332C10.6248 13.6783 10.345 13.9582 9.99984 13.9582C9.65466 13.9582 9.37484 13.6783 9.37484 13.3332V10.6248H6.6665C6.32133 10.6248 6.0415 10.345 6.0415 9.99984C6.0415 9.65466 6.32133 9.37484 6.6665 9.37484H9.37484V6.6665C9.37484 6.32133 9.65466 6.0415 9.99984 6.0415Z"
                fill="var(--light)"
              />
            </svg>
            <span>Add</span>
          </PrimaryButton>
          <WatchlistSettingIcon
            className="flex justify-center items-center h-[40px] md:hidden"
            setSettingsOpen={setSettingsOpen}
          />
        </div>

        {/* watchlist header */}
        <div className="pt-[16px] cursor-pointer gap-x-2 md:space-x-2 flex items-end md:justify-center">
          <WatchlistSettingIcon
            className="hidden md:flex"
            setSettingsOpen={setSettingsOpen}
          />
          <WatchlistSetting
            close={() => {
              setSettingsOpen(false);
            }}
            open={settingsOpen}
          />

          {watchlist.list.map((_watchlist, index) => {
            return (
              <BorderedButton
                key={_watchlist.id}
                className={`${
                  watchlist.active == _watchlist.id
                    ? 'bg-[var(--primary-shade-b)] border-[var(--primary-shade-b)] text-[var(--light)]'
                    : ''
                }`}
                onClick={() =>
                  setWatchlist({ ...watchlist, active: _watchlist.id })
                }
              >
                {_watchlist.name}
              </BorderedButton>
            );
          })}
        </div>
      </div>

      <div className="md:hidden py-2 flex flex-col justify-center space-y-1">
        <div className="upper flex flex-row justify-between items-center">
          <div className="heading flex flex-row items-center space-x-1">
            <H1>Trades</H1>
            <I text=""></I>
          </div>

          <div className="watchlist flex flex-row justify-around space-x-2 items-center">
            <div className="dropdown">
              <SelectAntdBorder
                options={watchlist.list.map((item) => {
                  return { label: item.name, value: item.id.toString() };
                })}
                className="!bg-white h-[40px]"
                defaultValue={watchlist.active.toString()}
                value={watchlist.active.toString()}
                handleChange={(value) => {
                  setWatchlist({ ...watchlist, active: Number(value) });
                }}
              />
            </div>
            <div className="button">
              <WatchlistSettingIcon
                className=""
                setSettingsOpen={setSettingsOpen}
              />
              <WatchlistSetting
                close={() => {
                  setSettingsOpen(false);
                }}
                open={settingsOpen}
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 items-end">
          <LabeledWrapper label="Exch">
            <SelectAntdBorder
              defaultValue={allowedExchange[0] || ''}
              options={allowedExchange.map((a) => {
                if (a == 'NSE') {
                  return { label: 'NSE', value: a };
                } else {
                  return { label: a, value: a };
                }
              })}
              className="!bg-white h-[40px] !w-1/4"
              value={searchScript.exchange}
              handleChange={(value) => {
                setSearchScript({
                  exchange: value,
                  searchValue: searchScript.searchValue,
                });
              }}
            />
          </LabeledWrapper>
          <LabeledWrapper label="Script Search">
            <Search />
          </LabeledWrapper>
          <PrimaryButton
            onClick={scriptAddHandler}
            className="flex justify-center h-[] items-center space-x-2 !min-w-[80px] md:!w-[100px]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39747 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39747 5.39747 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39747 18.3332 9.99984ZM9.99984 6.0415C10.345 6.0415 10.6248 6.32133 10.6248 6.6665V9.37484H13.3332C13.6783 9.37484 13.9582 9.65466 13.9582 9.99984C13.9582 10.345 13.6783 10.6248 13.3332 10.6248H10.6248V13.3332C10.6248 13.6783 10.345 13.9582 9.99984 13.9582C9.65466 13.9582 9.37484 13.6783 9.37484 13.3332V10.6248H6.6665C6.32133 10.6248 6.0415 10.345 6.0415 9.99984C6.0415 9.65466 6.32133 9.37484 6.6665 9.37484H9.37484V6.6665C9.37484 6.32133 9.65466 6.0415 9.99984 6.0415Z"
                fill="var(--light)"
              />
            </svg>
            <span>Add</span>
          </PrimaryButton>
        </div>
      </div>

      {/* fast trade label */}
      {watchlist.list.find((a) => a.id == watchlist.active)?.settings
        .fastTradeActive && (
        <div className="h-[30px] mb-2 bg-amber-500 flex items-center justify-center text-xs font-semibold uppercase text-black">
          Fast Trade Is Active for this watchlist (Lot Size{' '}
          {
            watchlist.list.find((a) => a.id == watchlist.active)?.settings
              .fastTradeLotSize
          }
          )
        </div>
      )}
      {/* trade table  */}
      <Table />
    </Layout>
  );
};

const WatchlistSettingIcon = ({
  setSettingsOpen,
  className,
}: {
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}) => {
  return (
    <div
      onClick={() => {
        setSettingsOpen(true);
      }}
      className={`items-center h-full justify-center ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.7439 13.7206L18.1043 13.3289V13.3289L18.7439 13.7206ZM17.7894 15.2794L18.429 15.6711V15.6711L17.7894 15.2794ZM1.25609 6.27942L0.61648 5.88775H0.61648L1.25609 6.27942ZM2.21064 4.72057L2.85025 5.11223L2.21064 4.72057ZM4.81852 4.06172L5.1771 3.403L5.1771 3.403L4.81852 4.06172ZM1.95487 8.73826L1.59629 9.39699H1.59629L1.95487 8.73826ZM15.1815 15.9383L14.8229 16.597L14.8229 16.597L15.1815 15.9383ZM18.0451 11.2617L17.6866 11.9204V11.9205L18.0451 11.2617ZM2.21064 15.2794L1.57103 15.6711L1.57103 15.6711L2.21064 15.2794ZM1.25609 13.7206L1.8957 13.3289L1.8957 13.3289L1.25609 13.7206ZM17.7894 4.72058L18.429 4.32892V4.32892L17.7894 4.72058ZM18.7439 6.27943L18.1043 6.67109V6.67109L18.7439 6.27943ZM18.0451 8.73828L18.4037 9.397L18.0451 8.73828ZM15.1815 4.06174L15.5401 4.72046V4.72046L15.1815 4.06174ZM1.95487 11.2617L2.31345 11.9205H2.31345L1.95487 11.2617ZM4.81851 15.9383L4.45994 15.2795L4.45993 15.2795L4.81851 15.9383ZM15.08 4.11698L14.7214 3.45825L15.08 4.11698ZM4.92 4.11697L4.56142 4.77569L4.56142 4.77569L4.92 4.11697ZM15.08 15.883L15.4386 15.2243L15.4386 15.2243L15.08 15.883ZM4.92 15.883L5.27858 16.5418L5.27858 16.5418L4.92 15.883ZM9.04545 1.75H10.9545V0.25H9.04545V1.75ZM10.9545 18.25H9.04545V19.75H10.9545V18.25ZM9.04545 18.25C8.36311 18.25 7.88635 17.7389 7.88635 17.2H6.38635C6.38635 18.6493 7.61906 19.75 9.04545 19.75V18.25ZM12.1136 17.2C12.1136 17.7389 11.6369 18.25 10.9545 18.25V19.75C12.3809 19.75 13.6136 18.6493 13.6136 17.2H12.1136ZM10.9545 1.75C11.6369 1.75 12.1136 2.26107 12.1136 2.8H13.6136C13.6136 1.35071 12.3809 0.25 10.9545 0.25V1.75ZM9.04545 0.25C7.61906 0.25 6.38635 1.35071 6.38635 2.8H7.88635C7.88635 2.26107 8.36311 1.75 9.04545 1.75V0.25ZM18.1043 13.3289L17.1498 14.8878L18.429 15.6711L19.3835 14.1122L18.1043 13.3289ZM1.8957 6.67108L2.85025 5.11223L1.57103 4.32891L0.61648 5.88775L1.8957 6.67108ZM2.85025 5.11223C3.15889 4.6082 3.88055 4.40506 4.45993 4.72045L5.1771 3.403C3.93027 2.72428 2.31676 3.11109 1.57103 4.32891L2.85025 5.11223ZM2.31345 8.07954C1.75746 7.77688 1.6043 7.14696 1.8957 6.67108L0.61648 5.88775C-0.146482 7.13373 0.326062 8.70553 1.59629 9.39699L2.31345 8.07954ZM17.1498 14.8878C16.8411 15.3918 16.1195 15.5949 15.5401 15.2795L14.8229 16.597C16.0697 17.2757 17.6832 16.8889 18.429 15.6711L17.1498 14.8878ZM19.3835 14.1122C20.1465 12.8663 19.6739 11.2945 18.4037 10.603L17.6866 11.9205C18.2425 12.2231 18.3957 12.853 18.1043 13.3289L19.3835 14.1122ZM2.85025 14.8878L1.8957 13.3289L0.616479 14.1122L1.57103 15.6711L2.85025 14.8878ZM17.1498 5.11225L18.1043 6.67109L19.3835 5.88777L18.429 4.32892L17.1498 5.11225ZM18.1043 6.67109C18.3957 7.14697 18.2425 7.77689 17.6866 8.07955L18.4037 9.397C19.6739 8.70554 20.1465 7.13374 19.3835 5.88777L18.1043 6.67109ZM15.5401 4.72046C16.1195 4.40507 16.8411 4.60822 17.1498 5.11225L18.429 4.32892C17.6832 3.1111 16.0697 2.72429 14.8229 3.40301L15.5401 4.72046ZM1.8957 13.3289C1.6043 12.853 1.75746 12.2231 2.31345 11.9205L1.59629 10.603C0.32606 11.2945 -0.146483 12.8663 0.616479 14.1122L1.8957 13.3289ZM1.57103 15.6711C2.31675 16.8889 3.93027 17.2757 5.1771 16.597L4.45993 15.2795C3.88055 15.5949 3.15889 15.3918 2.85025 14.8878L1.57103 15.6711ZM15.4386 4.7757L15.5401 4.72046L14.8229 3.40301L14.7214 3.45825L15.4386 4.7757ZM4.45993 4.72045L4.56142 4.77569L5.27858 3.45824L5.1771 3.403L4.45993 4.72045ZM15.5401 15.2795L15.4386 15.2243L14.7214 16.5417L14.8229 16.597L15.5401 15.2795ZM4.56142 15.2243L4.45994 15.2795L5.17709 16.597L5.27858 16.5418L4.56142 15.2243ZM1.59629 9.39699C2.07404 9.65705 2.07404 10.3429 1.59629 10.603L2.31345 11.9205C3.83498 11.0922 3.83498 8.90779 2.31345 8.07954L1.59629 9.39699ZM5.27858 16.5418C5.77798 16.2699 6.38635 16.6314 6.38635 17.2H7.88635C7.88635 15.4934 6.06035 14.4084 4.56142 15.2243L5.27858 16.5418ZM13.6136 17.2C13.6136 16.6314 14.222 16.2699 14.7214 16.5417L15.4386 15.2243C13.9397 14.4083 12.1136 15.4934 12.1136 17.2H13.6136ZM18.4037 10.603C17.926 10.3429 17.926 9.65706 18.4037 9.397L17.6866 8.07955C16.165 8.9078 16.165 11.0922 17.6866 11.9204L18.4037 10.603ZM4.56142 4.77569C6.06035 5.59165 7.88635 4.50663 7.88635 2.8H6.38635C6.38635 3.3686 5.77798 3.7301 5.27858 3.45824L4.56142 4.77569ZM14.7214 3.45825C14.222 3.73011 13.6136 3.36861 13.6136 2.8H12.1136C12.1136 4.50663 13.9397 5.59166 15.4386 4.7757L14.7214 3.45825ZM12.25 10C12.25 11.2426 11.2426 12.25 10 12.25V13.75C12.0711 13.75 13.75 12.0711 13.75 10H12.25ZM10 12.25C8.75737 12.25 7.75001 11.2426 7.75001 10H6.25001C6.25001 12.0711 7.92894 13.75 10 13.75V12.25ZM7.75001 10C7.75001 8.75736 8.75737 7.75 10 7.75V6.25C7.92894 6.25 6.25001 7.92893 6.25001 10H7.75001ZM10 7.75C11.2426 7.75 12.25 8.75736 12.25 10H13.75C13.75 7.92893 12.0711 6.25 10 6.25V7.75Z"
          fill="#28303F"
        />
      </svg>
    </div>
  );
};

export default Page;
