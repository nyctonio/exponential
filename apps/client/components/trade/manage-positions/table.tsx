import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { TradeOrder, useManagePositions } from '@/store/trade/managepositions';
import TimeHandler from '@/utils/common/timeHandler';
import initSocket from '@/lib/socket';
import { PrimaryButton, BorderedButton } from '@/components/inputs/button';
import Toast from '@/utils/common/toast';
import { useConversionRate } from '@/store/conversion-rate/mcxconversionrate';
import { useUserStore } from '@/store/user';
import ConversionModal from './conversion-modal';
import { useManageTrades } from '@/store/trade/managetrades';
function SearchClientTable() {
  const { apiCall } = useFetch();
  const { user, config } = useUserStore();
  const [liveData, setLiveData] = useState<{
    [key: string]: {
      buyPrice: number;
      sellPrice: number;
    };
  }>({});
  const [modalOpen, setModalOpen] = useState<{
    open: boolean;
    row: TradeOrder | null;
  }>({
    open: false,
    row: null,
  });

  const [conversionModal, setConversionModalData] = useState({
    text: '',
    open: false,
    script: '',
    isIntraday: false,
  });

  const { conversionScripts, setConversionScripts } = useConversionRate();

  const socketRef: any = useRef();
  const {
    filter,
    pagination,
    setPagination,
    setOrders,
    orders,
    loading,
    setLoading,
    refreshCount,
    setRefreshCount,
  } = useManagePositions();

  const {
    setFilter,
    filter: manageTradesFilter,
    setRefreshCount: setManageTradeRefreshCount,
    refreshCount: manageTradeRefreshCount,
  } = useManageTrades();

  const squareOffScript = async (row: TradeOrder | null) => {
    if (!row) return;
    const toast = new Toast('Square Off Initiated');
    let res = await apiCall(Routes.TRADE.SQUARE_OFF_TRADES, {
      userId: row.userid,
      tradingSymbol: row.scriptName,
      isIntraday: row.isIntraday,
    });
    if (res.status == true) {
      toast.success('Square Off Successfull');
      setModalOpen({ open: false, row: null });
      setOrders([
        ...orders.filter(
          (order) =>
            !(
              order.scriptName == row.scriptName &&
              order.isIntraday == row.isIntraday
            )
        ),
      ]);
      // setRefreshCount(refreshCount + 1);
    } else {
      toast.error('Square Off Failed');
    }
  };

  let columns: ColumnsType<TradeOrder> = [
    {
      title: <div className="flex justify-start pl-2">Script</div>,
      dataIndex: 'script',
      key: 'script',
      align: 'left',
      width: 200,
      render: (data, row) => (
        <div className="flex flex-row justify-start pl-2">{row.scriptName}</div>
      ),
    },
    {
      title: <div className="flex justify-start pl-2">Intraday</div>,
      dataIndex: 'isIntraday',
      key: 'isIntraday',
      align: 'left',
      width: 80,
      render: (data, row) => (
        <div
          className={`flex flex-row justify-start pl-2 font-bold ${
            data ? 'Yes' && 'text-[#429775]' : 'text-red-600'
          }`}
        >
          {data ? 'Yes' : 'No'}
        </div>
      ),
    },
    {
      title: () => (
        <div className="flex flex-row justify-left leading-none">User Name</div>
      ),
      dataIndex: 'user',
      key: 'username',
      align: 'left',
      showSorterTooltip: false,
      render: (data, row) => <>{row.username}</>,
    },
    {
      title: 'Upline',
      dataIndex: 'upline',
      key: 'upline',
      align: 'left',
      // showSorterTooltip: false,
      render: (data, row) => <>{row.upline}</>,
    },

    {
      title: 'Exec Date',
      dataIndex: 'orderExecDate',
      key: 'orderExecDate',
      align: 'left',
      width: 140,
      // showSorterTooltip: false,
      render: (data, row) => (
        <>
          {row.latesttransactiondate
            ? TimeHandler.dateTimeHandler(row.latesttransactiondate, true)
            : '-'}
        </>
      ),
    },
    {
      title: 'Exch',
      dataIndex: 'exchange',
      key: 'exchange',
      align: 'left',
      render: (data, row) => <>{row.exchange}</>,
    },
    {
      title: 'Trade Type',
      dataIndex: 'tradeType',
      key: 'tradeType',
      align: 'left',
      render: (data, row) => <>{row.tradeType == 'B' ? 'Buy' : 'Sell'}</>,
    },
    // {
    //   title: 'Trade Status',
    //   dataIndex: 'tradeStatus',
    //   key: 'tradeStatus',
    //   align: 'left',
    //   render: (data, row) => <>open</>,
    // },
    {
      title: 'Buy Price',
      dataIndex: 'tradePrice',
      key: 'buyPrice',
      align: 'center',
      className: 'text-[#429775]',
      render: (data, row) => (
        <>{(row.buyPriceAvg && Number(row.buyPriceAvg).toFixed(2)) || '-'}</>
      ),
    },
    {
      title: 'Sell Price',
      dataIndex: 'tradePrice',
      key: 'sellPrice',
      align: 'center',
      className: 'text-[#D14343]',
      render: (data, row) => (
        <>{(row.sellPriceAvg && Number(row.sellPriceAvg).toFixed(2)) || '-'}</>
      ),
    },
    {
      title: 'UnRel P/L',
      dataIndex: 'tradePrice',
      key: 'pl',
      align: 'center',
      render: (data, row) => {
        // console.log(
        //   row.currentBuyPrice,
        //   row.sellPriceAvg,
        //   Number(row.sellPriceAvg) - Number(row.currentBuyPrice),
        //   Number(
        //     liveData[
        //       `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
        //         row.scriptName
        //       }`
        //     ]?.buyPrice
        //   ),

        //   row.quantityLeft
        // );
        const liveBuyPrice = Number(
          liveData[
            `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${row.scriptName}`
          ]?.buyPrice
        );
        const liveSellPrice = Number(
          liveData[
            `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${row.scriptName}`
          ]?.sellPrice
        );
        const _pl: number =
          row.tradeType == 'B'
            ? ((liveBuyPrice ? liveBuyPrice : Number(row.currentBuyPrice)) -
                Number(row.buyPriceAvg)) *
              Number(row.quantityLeft)
            : (Number(row.sellPriceAvg) -
                (liveSellPrice
                  ? liveSellPrice
                  : Number(row.currentSellPrice))) *
              Number(row.quantityLeft);
        return (
          <div className={_pl > 0 ? 'text-[#429775]' : 'text-[#D14343]'}>
            {_pl.toFixed(2)}
          </div>
        );
      },
    },
    {
      title: 'Cr. Buy Price',
      dataIndex: 'currtradePrice',
      key: 'currbuyPrice',
      align: 'center',
      className: 'text-[#429775]',
      render: (data, row) => (
        <>
          {Number(
            liveData[
              `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
                row.scriptName
              }`
            ]?.buyPrice
          ) ||
            Number(row.currentBuyPrice).toFixed(2) ||
            '-'}
        </>
      ),
    },
    {
      title: 'Cr. Sell Price',
      dataIndex: 'tradePrice',
      key: 'currsellPrice',
      align: 'center',
      className: 'text-[#D14343]',
      render: (data, row) => (
        <>
          {Number(
            liveData[
              `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
                row.scriptName
              }`
            ]?.sellPrice
          ) ||
            Number(row.currentSellPrice).toFixed(2) ||
            '-'}
        </>
      ),
    },

    {
      title: 'Buy Lots',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      render: (data, row) => (
        <>
          {row.tradeType == 'B'
            ? (Number(row.quantity) / row.lotSize).toFixed(2)
            : (
                Number(row.quantity) / row.lotSize -
                Number(row.quantityLeft) / row.lotSize
              ).toFixed(2)}
        </>
      ),
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },
    {
      title: 'Sell Lots',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      render: (data, row) => (
        <>
          {row.tradeType == 'S'
            ? (Number(row.quantity) / row.lotSize).toFixed(2)
            : (
                Number(row.quantity) / row.lotSize -
                Number(row.quantityLeft) / row.lotSize
              ).toFixed(2)}
        </>
      ),
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },
    {
      title: 'Bal Lot',
      dataIndex: 'tradeQty',
      key: 'tradeQtyLeft',
      align: 'left',
      render: (data, row) => (
        <>{(Number(row.quantityLeft) / row.lotSize).toFixed(2)}</>
      ),
      sorter: (a, b) => {
        return Number(a.quantityLeft) - Number(b.quantityLeft);
      },
    },

    {
      title: 'Buy Qty',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      render: (data, row) => {
        let check =
          conversionScripts &&
          conversionScripts!.find(
            (a) => row.scriptName.match(/^[A-Za-z]+/)![0] == a.name
          );
        return (
          <>
            {row.tradeType == 'B'
              ? check
                ? Number(row.quantity) / check.value
                : row.quantity
              : check
                ? (Number(row.quantity) - Number(row.quantityLeft)) /
                  check.value
                : Number(row.quantity) - Number(row.quantityLeft)}
          </>
        );
      },
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },

    {
      title: 'Sell Qty',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      render: (data, row) => {
        let check =
          conversionScripts &&
          conversionScripts!.find(
            (a) => row.scriptName.match(/^[A-Za-z]+/)![0] == a.name
          );
        return (
          <>
            {row.tradeType == 'S'
              ? check
                ? Number(row.quantity) / check.value
                : row.quantity
              : check
                ? (Number(row.quantity) - Number(row.quantityLeft)) /
                  check.value
                : Number(row.quantity) - Number(row.quantityLeft)}
          </>
        );
      },
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },

    {
      title: 'Bal Qty',
      dataIndex: 'tradeQty',
      key: 'tradeQtyLeft',
      align: 'left',
      render: (data, row) => {
        let check =
          conversionScripts &&
          conversionScripts!.find(
            (a) => row.scriptName.match(/^[A-Za-z]+/)![0] == a.name
          );
        return (
          <>
            {check ? Number(row.quantityLeft) / check.value : row.quantityLeft}
          </>
        );
      },
      sorter: (a, b) => {
        return Number(a.quantityLeft) - Number(b.quantityLeft);
      },
    },
    {
      title: 'Trade Amt',
      dataIndex: 'tradeAmt',
      key: 'tradeAmt',
      align: 'left',
      width: 100,
      render: (data, row) => (
        <>
          {(
            Number(row.quantity) *
            Number(row.tradeType == 'B' ? row.buyPriceAvg : row.sellPriceAvg)
          ).toFixed(2)}
        </>
      ),
    },
    {
      title: () => (
        <div className="flex flex-row justify-center leading-none ">
          Square Off
        </div>
      ),
      dataIndex: 'id',
      key: 'tradeQtyLeft',
      align: 'left',
      fixed: 'right',
      width: 85,
      render: (data, row) => {
        return (
          <button
            onClick={() => setModalOpen({ open: true, row: row })}
            className="flex justify-center cursor-pointer items-center w-full"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="2"
                width="10"
                height="8"
                rx="2"
                stroke="#28303F"
                strokeWidth="1.5"
              />
              <rect
                x="12"
                y="14"
                width="10"
                height="8"
                rx="2"
                stroke="#28303F"
                strokeWidth="1.5"
              />
              <path
                d="M20.4142 4L21.7071 5.29289C22.0976 5.68342 22.0976 6.31658 21.7071 6.70711L20.4142 8M16 6L21.4142 6"
                stroke="#28303F"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M3.58579 16L2.29289 17.2929C1.90237 17.6834 1.90237 18.3166 2.29289 18.7071L3.58579 20M8 18L2.58579 18"
                stroke="#28303F"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        );
      },
      // showSorterTooltip: false,
    },
    {
      title: () => (
        <div className="flex flex-row justify-center leading-none ">
          Convert
        </div>
      ),
      dataIndex: 'id',
      key: 'convert',
      align: 'left',
      fixed: 'right',
      width: 75,
      render: (data, row) => {
        return (
          <div className="flex flex-row justify-center">
            <Tooltip
              title={`Convert to ${row.isIntraday ? 'Normal' : 'Intraday'}`}
            >
              <svg
                className={'cursor-pointer'}
                onClick={() => {
                  // onvertHandler(row.id);
                  setFilter({
                    ...manageTradesFilter,
                    username: '',
                    exchange: row.exchange,
                    script: row.scriptName,
                  });
                  setConversionModalData({
                    open: true,
                    text: `Convert to ${
                      row.isIntraday ? 'Normal' : 'Intraday'
                    }`,
                    isIntraday: row.isIntraday,
                    script: row.scriptName,
                  });
                  setManageTradeRefreshCount(manageTradeRefreshCount + 1);
                }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 13V12C4 9.23858 6.23858 7 9 7H20L17 4"
                  stroke={'#000000'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 11V12C20 14.7614 17.7614 17 15 17H4L7 20"
                  stroke={'#000000'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Tooltip>
          </div>
        );
      },
      // showSorterTooltip: false,
    },
  ];

  if (user?.userType.constant == 'Client') {
    columns = columns.filter((a) => a.key != 'upline' && a.key != 'username');
  }
  if (config.isIntradayAllowed == false) {
    columns = columns.filter((a) => a.key != 'convert');
  }
  const dataFetcher = async () => {
    setLoading(true);
    let res = await apiCall(Routes.TRADE.GET_TRADE_ORDER, {
      username: filter.username,
      script: filter.script,
      exchange: filter.exchange,
      pageNumber: pagination?.pageNumber,
      pageSize: pagination?.pageSize,
      transactionStatus: 'open',
      tradeDateFrom:
        filter.tradeDateFrom == undefined ? null : filter.tradeDateFrom,
      tradeDateTo: filter.tradeDateTo == undefined ? null : filter.tradeDateTo,
      groupByScript: true,
    });

    if (res.status == true) {
      setOrders(res.data.orders);
      console.log('orders data => ', res.data.orders);
      setPagination({ ...pagination, totalCount: res.data.count || 0 });
    }
    setLoading(false);
  };

  const init = async () => {
    // fetching all instrument ids
    const instrumentIds: string[] = orders.map((order: TradeOrder) => {
      return `${order.exchange == 'NSE' ? 'NFO' : order.exchange}:${
        order.scriptName
      }`;
    });
    const uniqueInstrumentIds = [...new Set(instrumentIds)];
    console.log('instrumentIds', uniqueInstrumentIds);
    const socket = await initSocket();
    socketRef.current = socket;
    socketRef.current.on('connect', () => {
      console.log('connected');
    });
    // connecting to room
    socketRef.current.emit('JOIN_ROOM', JSON.stringify(uniqueInstrumentIds));
    socketRef.current.on('TRADE_CHANGE', (t: any) => {
      try {
        let data = JSON.parse(t);
        setLiveData((prevData) => {
          return {
            ...prevData,
            [`${data.exchange == 'NSE' ? 'NFO' : data.exchange}:${
              data.symbol
            }`]: {
              buyPrice: data.buyPrice,
              sellPrice: data.sellPrice,
            },
          };
        });
      } catch (e) {
        console.log('error', e);
      }
    });
  };

  const conversionScriptsFetcher = async () => {
    let res = await apiCall(Routes.GET_PROJECT_SETTINGS_BY_KEY, {
      keys: ['MCXCVR'],
    });
    if (res.status) {
      setConversionScripts(
        res.data.map((a: any) => {
          return {
            name: a.prjSettConstant,
            value: Number(a.prjSettDisplayName),
          };
        })
      );
    }
    return;
  };

  useEffect(() => {
    socketRef.current = null;
    init();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [orders]);

  useEffect(() => {
    console.log('liveData', liveData);
  }, [liveData]);

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);

  useEffect(() => {
    if (!conversionScripts) {
      conversionScriptsFetcher();
    }
  });

  return (
    <div>
      <Modal
        open={modalOpen.open}
        title="Are you sure you want to square off"
        onOk={() => squareOffScript(modalOpen.row)}
        onCancel={() =>
          setModalOpen({
            open: false,
            row: null,
          })
        }
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            {/* <Button>Custom Button</Button> */}
            <div className="space-x-2 mt-[40px]">
              <BorderedButton
                onClick={() => setModalOpen({ open: false, row: null })}
              >
                Cancel
              </BorderedButton>
              <PrimaryButton onClick={() => squareOffScript(modalOpen.row)}>
                Square Off
              </PrimaryButton>
            </div>
          </>
        )}
      ></Modal>
      <Table
        rowClassName={(record, index) => {
          return record.isIntraday ? 'bg-[var(--primary-shade-d)]' : 'bg-white';
        }}
        loading={loading}
        className="rounded-md"
        style={{ fontWeight: 100 }}
        scroll={{ x: user?.userType.constant != 'Client' ? 2100 : 1800 }}
        columns={columns}
        pagination={{
          size: 'small',
          pageSize: pagination.pageSize,
          total: pagination.totalCount,
          onChange: (page, pageSize) => {
            setPagination({
              pageNumber: page,
              pageSize: pagination.pageSize,
              totalCount: pagination.totalCount,
            });
            setRefreshCount(refreshCount + 1);
          },
        }}
        dataSource={orders}
      />
      <ConversionModal
        open={conversionModal.open}
        close={() => {
          setConversionModalData({
            open: false,
            text: '',
            script: '',
            isIntraday: false,
          });
        }}
        script={conversionModal.script}
        title={conversionModal.text}
        intraday={conversionModal.isIntraday}
      />
    </div>
  );
}

export default SearchClientTable;
