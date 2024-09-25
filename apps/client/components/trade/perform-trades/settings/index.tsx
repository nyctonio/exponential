import { SelectAntdBorder } from '@/components/inputs/select';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { Divider, Modal } from 'antd';
import { Reorder } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Item } from './item';
import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { useUserStore } from '@/store/user';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import { useScripts } from '@/store/script';
import type { SettingsType } from '@/types/user';
import { ToggleAntd } from '@/components/inputs/toggle';

type Props = {
  open: boolean;
  close: () => void;
};

function Index({ close, open }: Props) {
  const { apiCall } = useFetch();
  const { watchlist, setWatchlist } = useUserStore();
  const { scripts, setScripts } = useScripts();
  const [watchlistName, setWatchlistName] = useState('');
  const [visible, setVisible] = useState<
    {
      id: number;
      name: string;
      width: string;
    }[]
  >(
    watchlist.list.filter((list) => list.id == watchlist.active)[0].settings
      .columns || []
  );
  const [hidden, setHidden] = useState(() => {
    return watchlist.columns.filter((item) => {
      return (
        watchlist.list
          .filter((list) => list.id == watchlist.active)[0]
          .settings.columns.filter(
            (col: { id: number; name: string; width: string }) =>
              col.id == item.id
          ).length == 0
      );
    });
  });
  const [sortBy, setSortBy] = useState(
    watchlist.list.filter((a) => a.id === watchlist.active)[0].settings.sortBy
  );
  const [orderBy, setOrderBy] = useState(
    watchlist.list.filter((a) => a.id === watchlist.active)[0].settings.orderBy
  );
  const [fastTrade, setFastTrade] = useState({
    fastTradeActive: watchlist.list.filter((a) => a.id === watchlist.active)[0]
      .settings.fastTradeActive,
    fastTradeLotSize: watchlist.list.filter((a) => a.id === watchlist.active)[0]
      .settings.fastTradeLotSize,
  });

  useEffect(() => {
    let _list = watchlist.list.filter((a) => a.id === watchlist.active)[0];
    setWatchlistName(_list.name);
    setVisible(_list.settings.columns);
    setHidden(() => {
      return watchlist.columns.filter((item) => {
        return (
          watchlist.list
            .filter((list) => list.id == watchlist.active)[0]
            .settings.columns.filter(
              (col: { id: number; name: string; width: string }) =>
                col.id == item.id
            ).length == 0
        );
      });
    });
    setFastTrade({
      fastTradeActive: _list.settings.fastTradeActive,
      fastTradeLotSize: _list.settings.fastTradeLotSize,
    });
  }, [watchlist.active]);

  const defaultHandler = () => {
    // check if selColList contains the id otherwise return else if (dir == 'default') {
    setVisible([...watchlist.columns.filter((item) => item.id < 16)]);
    setHidden([...watchlist.columns.filter((item) => item.id > 15)]);
  };

  const saveHandler = async () => {
    const toast = new Toast('Saving settings...');
    const _watchlist = watchlist.list.filter(
      (item) => item.id == watchlist.active
    )[0];
    if (_watchlist) {
      if (watchlistName.trim().length == 0) {
        toast.error("Watchlist name can't be empty");
        return;
      }
      let [updatewatchlistname, updatewatchlistcolumns, updatefasttrade] =
        await Promise.all([
          apiCall(Routes.UPDATE_WATCHLIST_NAME, {
            name: watchlistName,
            watchlistId: _watchlist.id,
          }),
          apiCall(Routes.UPDATE_WATCHLIST_COLUMN, {
            watchlistId: _watchlist.id,
            columns: visible,
          }),
          apiCall(Routes.UPDATE_FAST_TRADE, {
            watchlistId: _watchlist.id,
            fastTradeActive: fastTrade.fastTradeActive,
            fastTradeLotSize: fastTrade.fastTradeLotSize,
          }),
        ]);
      if (
        updatewatchlistname.status &&
        updatewatchlistcolumns.status &&
        updatefasttrade.status
      ) {
        toast.success('Settings saved');
        // sort by the field and order
        // sort the scripts
        const sortedScripts = scripts.sort((a, b) => {
          if (sortBy == 'symbol') {
            // printSafe([a.symbol, b.symbol, a.symbol.localeCompare(b.symbol));
            if (orderBy == 'asc') {
              console.log('sortinggg', a.symbol.localeCompare(b.symbol));
              return a.symbol.localeCompare(b.symbol) == 1 ? 1 : -1;
            } else {
              return b.symbol.localeCompare(a.symbol) == 1 ? 1 : -1;
            }
          } else if (sortBy == 'exchange') {
            if (orderBy == 'asc') {
              return a.exchange.localeCompare(b.exchange) == 1 ? 1 : -1;
            } else {
              return b.exchange.localeCompare(a.exchange) == 1 ? 1 : -1;
            }
          } else if (sortBy == 'ltp') {
            if (orderBy == 'asc') {
              return parseFloat(a.ltp) - parseFloat(b.ltp) > 0 ? 1 : -1;
            } else {
              return parseFloat(b.ltp) - parseFloat(a.ltp) > 0 ? 1 : -1;
            }
          } else if (sortBy == '%change') {
            if (orderBy == 'asc') {
              return parseFloat(a.change) - parseFloat(b.change) > 0 ? 1 : -1;
            } else {
              return parseFloat(b.change) - parseFloat(a.change) > 0 ? 1 : -1;
            }
          } else if (sortBy == 'expiry') {
            if (orderBy == 'asc') {
              // date fomat is dd-month-yyyy
              const date1 = new Date(a.expiry);
              const date2 = new Date(b.expiry);
              const diff: number =
                date1.getTime() - date2.getTime() > 0 ? 1 : -1;
              // printSafe([diff);
              return diff;
            } else {
              const date1 = new Date(a.expiry);
              const date2 = new Date(b.expiry);
              const diff: number = date2.getTime() - date1.getTime() ? 1 : -1;
              return diff;
            }
          } else {
            return 0;
          }
        });
        console.log('sorted scripts', sortBy, orderBy, sortedScripts);

        let sortedKeys = sortedScripts.map((item) =>
          String(item.exchange + ':' + item.symbol)
        );

        setScripts([...sortedScripts]);

        let userWatchlist = watchlist.list.map((item) => {
          if (item.id == watchlist.active) {
            item.settings = {
              columns: visible,
              sortBy: sortBy,
              orderBy: orderBy,
              fastTradeActive: fastTrade.fastTradeActive,
              fastTradeLotSize: fastTrade.fastTradeLotSize,
            };
            item.name = watchlistName;
            item.keys = sortedKeys;
          }
          return item;
        });
        // save the scripts acc to order in db
        let orderedScripts = await apiCall(Routes.UPDATE_WATCHLIST, {
          watchlistId: watchlist.active,
          scripts: sortedKeys,
        });
        if (orderedScripts.status) {
          setWatchlist({
            ...watchlist,
            list: [...userWatchlist],
          });
        } else {
          toast.error('Error saving settings');
        }
      } else {
        toast.error('Error saving settings');
      }
    }
  };

  return (
    <Modal
      title={<div className="font-[500] text-xl">Manage Watchlist</div>}
      className="!w-[100%] md:!w-[70%] lg:!w-[55%] xl:!w-[40%]"
      open={open}
      okButtonProps={{ className: 'hidden' }}
      cancelButtonProps={{ className: 'hidden' }}
      onOk={() => {}}
      centered={true}
      onCancel={close}
    >
      <div className="main flex flex-col space-y-4">
        <div className="settings grid grid-cols-3 gap-2">
          <LabeledWrapper label="Watchlist Name" key={'watchlist-name'}>
            <BorderInput
              value={watchlistName}
              onChange={(e) => setWatchlistName(e.target.value)}
            />
          </LabeledWrapper>
          <LabeledWrapper label="Sort By" key={'watchlist-sort'}>
            <SelectAntdBorder
              className="h-[35px]"
              options={[
                { label: 'Symbol', value: 'symbol' },
                { label: 'Exchange', value: 'exchange' },
                { label: 'Expiry', value: 'expiry' },
                { label: 'LTP', value: 'ltp' },
                { label: '%Change', value: '%change' },
              ]}
              defaultValue={sortBy ? sortBy : 'Select'}
              //@ts-ignore
              handleChange={(e) => setSortBy(String(e))}
              value={sortBy ? sortBy : 'Select'}
            />
          </LabeledWrapper>
          <LabeledWrapper label="Order" key={'watchlist-order'}>
            <SelectAntdBorder
              className="h-[35px]"
              options={[
                { label: 'Ascending', value: 'asc' },
                { label: 'Descending', value: 'desc' },
              ]}
              defaultValue={orderBy ? orderBy : 'Select'}
              //@ts-ignore
              handleChange={(e) => setOrderBy(String(e))}
              value={orderBy ? orderBy : 'Select'}
            />
          </LabeledWrapper>
        </div>

        <div className="settings grid grid-cols-2 gap-2">
          <LabeledWrapper label="Fast Trade Active">
            <ToggleAntd
              checked={fastTrade.fastTradeActive}
              onChange={(e) =>
                setFastTrade({ ...fastTrade, fastTradeActive: e })
              }
            />
          </LabeledWrapper>
          <LabeledWrapper label="Fast Trade Lot Size" key={'watchlist-sort'}>
            <BorderInput
              value={fastTrade.fastTradeLotSize}
              onChange={(e) => {
                if (Number(e.target.value) >= 0)
                  setFastTrade({
                    ...fastTrade,
                    fastTradeLotSize: Number(e.target.value),
                  });
              }}
            />
          </LabeledWrapper>
        </div>

        <div className="h-px bg-[var(--primary-shade-e)] w-full"></div>

        <div className="">
          <div className="text-[#696F8C] mb-[10px] text-xs font-[400]">
            Manage Columns
          </div>

          <div className="w-full space-x-2 flex justify-between ">
            <div className="menus w-1/2">
              <div className="left rounded-sm my-2 shadow ">
                <div className="px-3 py-3 text-[var(--primary-shade-c)] text-[9px]">
                  VISIBLE COLUMNS
                </div>
                <Reorder.Group
                  axis="y"
                  values={visible}
                  onReorder={setVisible}
                  layoutScroll
                  style={{ overflowY: 'scroll', height: '200px' }}
                >
                  {visible.map((item, index) => (
                    <Item
                      inside="visible"
                      visible={visible}
                      hidden={hidden}
                      setVisible={setVisible}
                      setHidden={setHidden}
                      key={item.id}
                      item={item}
                    />
                  ))}
                </Reorder.Group>
              </div>
            </div>

            {/* <div className="flex flex-col justify-center space-y-2 items-center">
              <BorderedButton className="!px-[10px] !py-0">R</BorderedButton>
              <BorderedButton className="!px-[10px] !py-0">L</BorderedButton>
            </div> */}

            <div className="menus w-1/2">
              <div className="left rounded-sm my-2 shadow ">
                <div className="px-3 py-3 text-[var(--primary-shade-c)] text-[9px]">
                  HIDDEN COLUMNS
                </div>
                <Reorder.Group
                  axis="y"
                  values={hidden}
                  onReorder={setHidden}
                  layoutScroll
                  style={{ overflowY: 'scroll', height: '200px' }}
                >
                  {hidden.map((item, index) => (
                    <Item
                      inside="hidden"
                      visible={visible}
                      hidden={hidden}
                      setVisible={setVisible}
                      setHidden={setHidden}
                      key={item.id}
                      item={item}
                    />
                  ))}
                </Reorder.Group>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <div></div>
          <div className="flex space-x-2">
            <BorderedButton onClick={defaultHandler}>Default</BorderedButton>
            <PrimaryButton onClick={saveHandler}>Save</PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default Index;
