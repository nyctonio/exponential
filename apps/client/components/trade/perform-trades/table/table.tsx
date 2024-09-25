import React, { useEffect, useState } from 'react';
import Toast from '@/utils/common/toast';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useModal } from '@/store/trade/modal';

import {
  BuyPrice,
  BuyQty,
  Change,
  ChangePercentage,
  Close,
  Expiry,
  High,
  Ltp,
  Low,
  Open,
  SellPrice,
  SellQty,
  Symbol,
  Drag,
  Exch,
  LotSize,
  Oi,
  Tbq,
  Tsq,
  VolumTraded,
} from '../columns';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { useRef } from 'react';
import { useUserStore } from '@/store/user';
import type { ScriptType } from '@/store/script';
import { useScripts } from '@/store/script';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { useConversionRate } from '@/store/conversion-rate/mcxconversionrate';
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

// row for draggable
const Row = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 100 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <div
                ref={setActivatorNodeRef}
                className="flex justify-center"
                style={{ touchAction: 'none', cursor: 'move', width: '40px' }}
                {...listeners}
              >
                <img src="/assets/drag.svg" height={20} width={20} />
              </div>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const App = ({ loading }: { loading: boolean }) => {
  const { watchlist, setUser, setWatchlist } = useUserStore();
  const { scripts, setScripts, selectScript, removeSelection, moveScript } =
    useScripts();
  const { open, setOpen, setScript } = useModal();
  const { conversionScripts } = useConversionRate();

  const { apiCall } = useFetch();

  // columnsData for table

  let tableColumns: any = {
    exchange: {
      title: 'Exch',
      dataIndex: 'exchange',
      render: (exchange: any) => (
        <div className="flex min-w-[50px] justify-start">
          <Exch exch={exchange == 'NFO' ? 'NSE' : exchange} />
        </div>
      ),
      // width: '50px',
    },
    symbol: {
      title: 'Symbol',
      dataIndex: 'symbol',
      align: 'center',
      render: (symbol: string, record: any) => (
        <div className="flex min-w-[100px] justify-center">
          <Symbol symbol={symbol} ltp={record.ltp} close={record.close} />
        </div>
      ),
      // width: '100px',
    },
    expiry: {
      title: 'Expiry',
      dataIndex: 'expiry',
      align: 'center',
      render: (expiry: string) => (
        <div className="flex min-w-[100px] justify-center">
          <Expiry expiry={expiry} />
        </div>
      ),
      // width: '100px',
    },
    lotSize: {
      title: 'Lot Size',
      dataIndex: 'lotSize',
      align: 'center',
      render: (lotSize: number, row: any) => {
        let check =
          conversionScripts &&
          conversionScripts!.find(
            (a) => row.symbol.match(/^[A-Za-z]+/)[0] == a.name
          );
        return (
          <div className="flex min-w-[60px] justify-center">
            <LotSize
              lotSize={!check ? lotSize : Number(lotSize) / check.value}
            />
          </div>
        );
      },
      // width: '60px',
    },
    butQty: {
      title: 'Buy Qty',
      dataIndex: 'buyQty',
      align: 'center',
      render: (buyQty: string, data: any) => (
        <div className="flex min-w-[60px] justify-center">
          <BuyQty buy_qty_status={data.buy_qty_status} buy_qty={buyQty} />
        </div>
      ),
      // width: '60px',
    },
    buyPrice: {
      title: 'Buy Price',
      dataIndex: 'buyPrice',
      align: 'center',
      render: (buyPrice: string, data: any) => (
        <div
          onClick={() => {
            setScript(`${data.exchange}:${data.symbol}`);
            setOpen(true);
          }}
          className="flex min-w-[95px] justify-center"
        >
          <BuyPrice
            buy_price_status={data.buy_price_status}
            buy_price={buyPrice == '0.00' ? data.ltp : buyPrice}
          />
        </div>
      ),
    },
    sellPrice: {
      title: 'Sell Price',
      dataIndex: 'sellPrice',
      align: 'center',
      render: (sellPrice: string, data: any) => (
        <div
          onClick={() => {
            setScript(`${data.exchange}:${data.symbol}`);
            setOpen(true);
          }}
          className="flex w-full min-w-[95px] justify-center"
        >
          <SellPrice
            sell_price_status={data.sell_price_status}
            sell_price={sellPrice == '0.00' ? data.ltp : sellPrice}
          />
        </div>
      ),
    },
    sellQty: {
      title: 'Sell Qty',
      dataIndex: 'sellQty',
      align: 'center',
      render: (sellQty: string, data: any) => (
        <div className="flex min-w-[60px] justify-center">
          <SellQty sell_qty_status={data.sell_qty_status} sell_qty={sellQty} />
        </div>
      ),
      // width: '60px',
    },
    ltp: {
      title: 'LTP',
      dataIndex: 'ltp',
      align: 'center',
      render: (ltp: string, data: any) => (
        <div className="flex min-w-[85px] justify-center">
          <Ltp ltp={ltp} ltp_status={data.ltp_status} />
        </div>
      ),
      // width: '85px',
    },
    change: {
      title: 'Change',
      dataIndex: 'change',
      align: 'center',
      render: (change: string, data: any) => (
        <div className="flex min-w-[55px] justify-center">
          <Change close={data.close} ltp={data.ltp} />
        </div>
      ),
      // width: '55px',
    },
    perChange: {
      title: '% Change',
      dataIndex: 'change',
      align: 'center',
      render: (change: string, data: any) => (
        <div className="flex min-w-[50px] justify-center">
          <ChangePercentage change={change} />
        </div>
      ),
      // width: '50px',
    },
    open: {
      title: 'Open',
      dataIndex: 'open',
      align: 'center',
      render: (open: string) => (
        <div className="flex min-w-[50px] justify-center">
          <Open open={open} />
        </div>
      ),
      // width: '50px',
    },
    high: {
      title: 'High',
      dataIndex: 'high',
      align: 'center',
      render: (high: string) => (
        <div className="flex min-w-[50px] justify-center">
          <High high={high} />
        </div>
      ),
      // width: '50px',
    },
    low: {
      title: 'Low',
      dataIndex: 'low',
      align: 'center',
      render: (low: string) => (
        <div className="flex min-w-[50px] justify-center">
          <Low low={low} />
        </div>
      ),
      // width: '50px',
    },
    close: {
      title: 'Close',
      dataIndex: 'close',
      align: 'center',
      render: (close: string) => (
        <div className="flex min-w-[50px] justify-center">
          <Close close={close} />
        </div>
      ),
      // width: '50px',
    },
    oi: {
      title: 'OI',
      dataIndex: 'oi',
      align: 'center',
      render: (oi: number) => (
        <div className="flex min-w-[50px] justify-center">
          <Oi oi={oi} />
        </div>
      ),
      // width: '50px',
    },
    tbq: {
      title: 'TBQ',
      dataIndex: 'tbq',
      align: 'center',
      render: (tbq: number) => (
        <div className="flex min-w-[30px] justify-center">
          <Tbq tbq={tbq} />
        </div>
      ),
      // width: '30px',
    },
    tsq: {
      title: 'TSQ',
      dataIndex: 'tsq',
      align: 'center',
      render: (tsq: number) => (
        <div className="flex min-w-[30px] justify-center">
          <Tsq tsq={tsq} />
        </div>
      ),
      // width: '30px',
    },
    volume: {
      title: 'Volume Traded',
      dataIndex: 'volumeTraded',
      align: 'center',
      render: (volumeTraded: number) => (
        <div className="flex min-w-[100px] justify-center">
          <VolumTraded volumeTraded={volumeTraded} />
        </div>
      ),
      // width: '100px',
    },
  };

  let tableWidth = 0;

  const [columnsData, setColumnsData] = useState<ColumnsType<ScriptType>>(
    () => {
      // let _columnsData = watchlist.columns.filter((c) => {
      //   let _c = watchlist.list.filter((w) => w.id == watchlist.active)[0]
      //     .settings.columns;
      //   return _c.some((_s: { id: number; name: string; width: string }) => {
      //     return _s.id == c.id;
      //   });
      // });

      let _columnsData =
        watchlist.list.find((a) => a.id == watchlist.active)?.settings
          .columns || [];

      return _columnsData.map((c) => {
        if (c.id == 1) {
          return tableColumns.exchange;
        } else if (c.id == 2) {
          return tableColumns.symbol;
        } else if (c.id == 3) {
          return tableColumns.expiry;
        } else if (c.id == 4) {
          return tableColumns.lotSize;
        } else if (c.id == 5) {
          return tableColumns.butQty;
        } else if (c.id == 6) {
          return tableColumns.buyPrice;
        } else if (c.id == 7) {
          return tableColumns.sellPrice;
        } else if (c.id == 8) {
          return tableColumns.sellQty;
        } else if (c.id == 9) {
          return tableColumns.ltp;
        } else if (c.id == 10) {
          return tableColumns.change;
        } else if (c.id == 11) {
          return tableColumns.perChange;
        } else if (c.id == 12) {
          return tableColumns.open;
        } else if (c.id == 13) {
          return tableColumns.high;
        } else if (c.id == 14) {
          return tableColumns.low;
        } else if (c.id == 15) {
          return tableColumns.close;
        } else if (c.id == 16) {
          return tableColumns.oi;
        } else if (c.id == 17) {
          return tableColumns.tbq;
        } else if (c.id == 18) {
          return tableColumns.tsq;
        } else if (c.id == 19) {
          return tableColumns.volume;
        } else
          return {
            key: 'sort',
          };
      });
    }
  );
  // change of column on watchlist change
  useEffect(() => {
    setColumnsData(() => {
      // let _columnsData = watchlist.columns.filter((c) => {
      //   let _c = watchlist.list.filter((w) => w.id == watchlist.active)[0]
      //     .settings.columns;
      //   return _c.some((_s: { id: number; name: string; width: string }) => {
      //     return _s.id == c.id;
      //   });
      // });

      let _columnsData =
        watchlist.list.find((a) => a.id == watchlist.active)?.settings
          .columns || [];
      return _columnsData.map((c) => {
        if (c.id == 1) {
          return tableColumns.exchange;
        } else if (c.id == 2) {
          return tableColumns.symbol;
        } else if (c.id == 3) {
          return tableColumns.expiry;
        } else if (c.id == 4) {
          return tableColumns.lotSize;
        } else if (c.id == 5) {
          return tableColumns.butQty;
        } else if (c.id == 6) {
          return tableColumns.buyPrice;
        } else if (c.id == 7) {
          return tableColumns.sellPrice;
        } else if (c.id == 8) {
          return tableColumns.sellQty;
        } else if (c.id == 9) {
          return tableColumns.ltp;
        } else if (c.id == 10) {
          return tableColumns.change;
        } else if (c.id == 11) {
          return tableColumns.perChange;
        } else if (c.id == 12) {
          return tableColumns.open;
        } else if (c.id == 13) {
          return tableColumns.high;
        } else if (c.id == 14) {
          return tableColumns.low;
        } else if (c.id == 15) {
          return tableColumns.close;
        } else if (c.id == 16) {
          return tableColumns.oi;
        } else if (c.id == 17) {
          return tableColumns.tbq;
        } else if (c.id == 18) {
          return tableColumns.tsq;
        } else if (c.id == 19) {
          return tableColumns.volume;
        } else
          return {
            key: 'sort',
          };
      });
    });
  }, [watchlist]);

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = scripts.findIndex((i) => i.symbol === active.id);
      const overIndex = scripts.findIndex((i) => i.symbol === over?.id);
      console.log(active, over, activeIndex, overIndex);
      setScripts(arrayMove(scripts, activeIndex, overIndex));
      setWatchlist({
        ...watchlist,
        list: watchlist.list.map((l) => {
          if (l.id === watchlist.active) {
            return {
              ...l,
              keys: arrayMove(l.keys, activeIndex, overIndex),
            };
          }
          return l;
        }),
      });

      let data = await apiCall(Routes.UPDATE_WATCHLIST, {
        watchlistId: watchlist.active,
        scripts: arrayMove(
          watchlist.list.find((a) => a.id == watchlist.active)?.keys || [],
          activeIndex,
          overIndex
        ),
      });
    }
  };

  const handleKeyChange = (dir: string) => {
    return moveScript(dir);
  };

  const keyDown = async (event: any) => {
    let checkIndex = scripts.findIndex((a) => {
      return a.isSelected == true;
    });

    if (checkIndex != -1) {
      if (event.code == 'ArrowUp' && open == false) {
        return handleKeyChange('up');
      } else if (event.code == 'ArrowDown' && open == false) {
        return handleKeyChange('down');
      } else if (event.key == '-') {
        if (
          watchlist.list.find((a) => a.id == watchlist.active)?.settings
            .fastTradeActive
        ) {
          if (
            !watchlist.list.find((a) => a.id == watchlist.active)?.settings
              .fastTradeLotSize
          ) {
            new Toast('Fast Trade Lot Size Not Found').error(
              'Fast Trade Lot Size Not Found'
            );
          }
          const order = await apiCall(
            Routes.TRADE.CREATE_TRADE_ORDER,
            {
              type: 'S',
              orderType: 'market',
              quantity:
                scripts[checkIndex].lotSize *
                (watchlist.list.find((a) => a.id == watchlist.active)?.settings
                  .fastTradeLotSize || 0),
              price: 0,
              script: `${scripts[checkIndex].exchange}:${scripts[checkIndex].symbol}`,
            },
            false
          );
          if (order.status) {
            new Toast('Order placed successfully').success(
              'Order placed successfully'
            );
          } else {
            new Toast(order.message).error(order.message);
          }
          console.log('fast trade active');
          return;
        }
        setScript(
          `${scripts[checkIndex].exchange}:${scripts[checkIndex].symbol}`
        );
        setOpen(true);
        return;
      } else if (event.key == '+') {
        if (
          watchlist.list.find((a) => a.id == watchlist.active)?.settings
            .fastTradeActive
        ) {
          if (
            !watchlist.list.find((a) => a.id == watchlist.active)?.settings
              .fastTradeLotSize
          ) {
            new Toast('Fast Trade Lot Size Not Found').error(
              'Fast Trade Lot Size Not Found'
            );
          }
          const order = await apiCall(
            Routes.TRADE.CREATE_TRADE_ORDER,
            {
              type: 'B',
              orderType: 'market',
              quantity:
                scripts[checkIndex].lotSize *
                (watchlist.list.find((a) => a.id == watchlist.active)?.settings
                  .fastTradeLotSize || 0),
              price: 0,
              script: `${scripts[checkIndex].exchange}:${scripts[checkIndex].symbol}`,
            },
            false
          );
          if (order.status) {
            new Toast('Order placed successfully').success(
              'Order placed successfully'
            );
          } else {
            new Toast(order.message).error(order.message);
          }
          console.log('fast trade active');
          return;
        }
        setScript(
          `${scripts[checkIndex].exchange}:${scripts[checkIndex].symbol}`
        );
        setOpen(true);
        return;
      }
    }
  };

  const scriptRemover = async (tradingsymbol: string, exchange: string) => {
    let updatedWatchlist = watchlist.list.map((a) => {
      if (a.id == watchlist.active) {
        a.keys = a.keys.filter((b) => b != `${exchange}:${tradingsymbol}`);
      }
      return a;
    });

    setScripts(scripts.filter((a) => a.symbol != tradingsymbol));

    setWatchlist({
      active: watchlist.active,
      columns: watchlist.columns,
      list: updatedWatchlist,
    });

    let res = await apiCall(Routes.UPDATE_WATCHLIST, {
      watchlistId: watchlist.active,
      scripts: watchlist.list
        .find((a) => a.id == watchlist.active)
        ?.keys.filter((a) => a != `${exchange}:${tradingsymbol}`),
    });

    return;
  };

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    return () => {
      window.removeEventListener('keydown', keyDown);
    };
  });

  // function useOutsideAlerter(ref: any) {
  //   useEffect(() => {
  //     /**
  //      * Alert if clicked on outside of element
  //      */
  //     function handleClickOutside(event: any) {
  //       if (ref.current && !ref.current.contains(event.target)) {
  //         removeSelection();
  //       }
  //     }
  //     // Bind the event listener
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => {
  //       // Unbind the event listener on clean up
  //       document.removeEventListener('mousedown', handleClickOutside);
  //     };
  //   }, [ref]);
  // }

  // const wrapperRef = useRef(null);
  // useOutsideAlerter(wrapperRef);

  // useEffect(() => {
  //   console.log('table width is ', tableWidth);
  // }, [tableWidth]);

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={scripts.map((i) => i.symbol)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          className="trade-table"
          // ref={wrapperRef}
          rowClassName={(record, index) =>
            record.isSelected
              ? 'bg-blue-100 hover:!bg-blue-100'
              : index % 2 === 0
                ? 'bg-[var(--light)]'
                : 'bg-[var(--primary-shade-d)]'
          }
          components={{
            body: {
              row: Row,
            },
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                console.log('row click', record.instrumentToken);
                selectScript(record.symbol, record.exchange);
              }, // click row
            };
          }}
          scroll={{ x: tableWidth * 1.4 }}
          pagination={false}
          rowKey="symbol"
          columns={[
            {
              key: 'sort',
              // width: '30px',
            },
            ...columnsData,
            {
              key: 'delete',
              title: 'Delete',
              dataIndex: 'delete',
              align: 'center',
              // width: '30px',
              render: (data, record) => {
                return (
                  <div className="flex justify-center">
                    <img
                      onClick={() => {
                        scriptRemover(record.symbol, record.exchange);
                      }}
                      className="cursor-pointer text-[var(--dark)]]"
                      src="/assets/delete.svg"
                      height={15}
                      width={15}
                    />
                  </div>
                );
              },
            },
          ]}
          dataSource={scripts}
          loading={loading}
        />
      </SortableContext>
    </DndContext>
  );
};

export default App;
