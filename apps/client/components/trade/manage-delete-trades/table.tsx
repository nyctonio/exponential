import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Skeleton, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { TradeOrder, useManageTrades } from '@/store/trade/managetrades';
import TimeHandler from '@/utils/common/timeHandler';
import initSocket from '@/lib/socket';
import { useUserStore } from '@/store/user';
import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import Toast from '@/utils/common/toast';
import {
  BorderInput,
  LabeledWrapper,
  TextInput,
} from '@/components/inputs/text';
import { useConversionRate } from '@/store/conversion-rate/mcxconversionrate';

function ManageDeleteTradesTable({
  partial = true,
  intraday,
  script,
}: {
  partial?: boolean;
  intraday?: boolean;
  script?: string;
}) {
  const { apiCall } = useFetch();
  const [liveData, setLiveData] = useState<{
    [key: string]: {
      buyPrice: number;
      sellPrice: number;
    };
  }>({});
  const { user } = useUserStore();

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
    sort,
    setSort,
  } = useManageTrades();

  const { conversionScripts, setConversionScripts } = useConversionRate();

  const [modalData, setModalData] = useState<{
    open: boolean;
    row: TradeOrder | null;
  }>({ open: false, row: null });

  const [editModalData, setEditModalData] = useState<{
    open: boolean;
    row: TradeOrder | null;
    price: number | undefined;
    quantity: number | undefined;
    tradeAllowedInQty: null | boolean;
  }>({
    open: false,
    row: null,
    price: undefined,
    quantity: undefined,
    tradeAllowedInQty: null,
  });

  let columns: ColumnsType<TradeOrder> = [
    {
      title: () => (
        <div className="flex flex-row justify-start leading-none pl-2">
          Trade Id
        </div>
      ),
      dataIndex: 'id',
      key: 'tradeId',
      align: 'left',
      render: (data, row) => {
        return <div className="flex flex-row justify-start pl-2">{row.id}</div>;
      },
      // showSorterTooltip: false,
    },
    {
      title: 'Script',
      dataIndex: 'script',
      key: 'script',
      align: 'left',
      render: (data, row) => <>{row.scriptName}</>,
    },
    {
      title: 'Intraday',
      dataIndex: 'isIntraday',
      key: 'isIntraday',
      align: 'left',
      render: (data, row) => (
        <>
          {row.isIntraday == true ? (
            <span className="text-[#429775] font-bold">Yes</span>
          ) : (
            <span className="text-red-600 font-bold">No</span>
          )}
        </>
      ),
    },
    {
      title: () => (
        <div className="flex flex-row justify-left leading-none">User Name</div>
      ),
      dataIndex: 'user',
      key: 'username',
      align: 'left',
      sorter: true,
      showSorterTooltip: false,
      render: (data, row) => <>{row.user.username}</>,
    },
    {
      title: 'Upline',
      dataIndex: 'upline',
      key: 'upline',
      align: 'left',
      // showSorterTooltip: false,
      render: (data, row) => <>{row.user.createdByUser?.username}</>,
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      align: 'left',
      showSorterTooltip: false,
      render: (data, row) => (
        <>{TimeHandler.dateTimeHandler(row.orderCreationDate, true)}</>
      ),
      sorter: true,
    },
    {
      title: 'Order Exec Date',
      dataIndex: 'orderExecDate',
      key: 'orderExecDate',
      align: 'left',
      showSorterTooltip: false,
      render: (data, row) => (
        <>
          {row.orderExecutionDate
            ? TimeHandler.dateTimeHandler(row.orderExecutionDate, true)
            : '-'}
        </>
      ),
      sorter: true,
    },
    {
      title: 'Exch',
      dataIndex: 'exchange',
      key: 'exchange',
      align: 'left',
      render: (data, row) => <>{row.exchange}</>,
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: 'Order Type',
      dataIndex: 'orderType',
      key: 'orderType',
      align: 'left',
      render: (data, row) => <>{row.orderType}</>,
    },
    {
      title: 'Trade Type',
      dataIndex: 'tradeType',
      key: 'tradeType',
      align: 'left',
      render: (data, row) => <>{row.tradeType == 'B' ? 'Buy' : 'Sell'}</>,
    },
    {
      title: 'Trade Status',
      dataIndex: 'tradeStatus',
      key: 'tradeStatus',
      align: 'left',
      render: (data, row) => <>{row.transactionStatus}</>,
    },
    {
      title: 'Buy Price',
      dataIndex: 'tradePrice',
      key: 'buyPrice',
      align: 'center',
      className: 'text-[#429775]',
      render: (data, row) => <>{row.buyPrice || '-'}</>,
    },
    {
      title: 'Sell Price',
      dataIndex: 'tradePrice',
      key: 'sellPrice',
      align: 'center',
      className: 'text-[#D14343]',
      render: (data, row) => <>{Number(row.sellPrice).toFixed(2) || '-'}</>,
    },
    {
      title: 'Buy Lots',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'center',
      render: (data, row) => (
        <>
          {row.tradeType == 'B'
            ? (row.quantity / row.lotSize).toFixed(2)
            : (
                row.quantity / row.lotSize -
                row.quantityLeft / row.lotSize
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
      align: 'center',
      render: (data, row) => (
        <>
          {row.tradeType == 'S'
            ? (row.quantity / row.lotSize).toFixed(2)
            : (
                row.quantity / row.lotSize -
                row.quantityLeft / row.lotSize
              ).toFixed(2)}
        </>
      ),
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },
    {
      title: 'Bal Lots',
      dataIndex: 'tradeQty',
      key: 'balLots',
      align: 'center',
      render: (data, row) => <>{(row.quantityLeft / row.lotSize).toFixed(2)}</>,
      sorter: (a, b) => {
        return Number(a.quantityLeft) - Number(b.quantityLeft);
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
      title: 'Rel/Un P/L',
      dataIndex: 'tradePrice',
      key: 'pl',
      align: 'center',
      render: (data, row) => {
        const _pl: number =
          row.tradeType == 'B'
            ? ((Number(
                liveData[
                  `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
                    row.scriptName
                  }`
                ]?.buyPrice
              )
                ? Number(
                    liveData[
                      `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
                        row.scriptName
                      }`
                    ]?.buyPrice
                  )
                : Number(row.currentBuyPrice)) -
                Number(row.buyPrice)) *
              row.quantityLeft
            : (Number(row.sellPrice) -
                (Number(
                  liveData[
                    `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
                      row.scriptName
                    }`
                  ]?.sellPrice
                )
                  ? Number(
                      liveData[
                        `${row.exchange == 'NSE' ? 'NFO' : row.exchange}:${
                          row.scriptName
                        }`
                      ]?.sellPrice
                    )
                  : Number(row.currentSellPrice))) *
              row.quantityLeft;
        console.log(
          row.tradeType,
          Number(row.buyPrice),
          Number(row.sellPrice),
          Number(row.quantity)
        );
        const quantity = Number(row.quantity);
        const buyPrice = Number(row.buyPrice);
        const sellPrice = Number(row.sellPrice);
        let rpl = 0;
        if (buyPrice != 0 && sellPrice != 0) {
          rpl =
            row.tradeType == 'B'
              ? (sellPrice - buyPrice) * quantity
              : (buyPrice - sellPrice) * quantity;
        }
        console.log(buyPrice, sellPrice);
        return (
          <div
            className={
              row.transactionStatus == 'closed'
                ? rpl > 0
                  ? 'text-[#429775]'
                  : 'text-[#D14343]'
                : _pl > 0
                  ? 'text-[#429775]'
                  : 'text-[#D14343]'
            }
          >
            {row.transactionStatus == 'closed'
              ? rpl.toFixed(2) == '0.00'
                ? '-'
                : rpl.toFixed(2)
              : _pl.toFixed(2)}
          </div>
        );
      },
    },
    {
      title: 'Brokerage',
      dataIndex: 'brokerage',
      key: 'brokerage',
      align: 'center',
      className: 'text-[#429775]',
      render: (data, row) => (
        <>{(row.brokerage && Number(row.brokerage).toFixed(2)) || '-'}</>
      ),
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: 'Margin',
      dataIndex: 'margin',
      key: 'margin',
      align: 'center',
      className: 'text-[#429775]',
      render: (data, row) => (
        <>{(row.margin && Number(row.margin).toFixed(2)) || '-'}</>
      ),
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
                ? row.quantity / check.value
                : row.quantity
              : check
                ? (row.quantity - row.quantityLeft) / check.value
                : row.quantity - row.quantityLeft}
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
                ? row.quantity / check.value
                : row.quantity
              : check
                ? (row.quantity - row.quantityLeft) / check.value
                : row.quantity - row.quantityLeft}
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
        return <>{check ? row.quantityLeft / check.value : row.quantityLeft}</>;
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
      render: (data, row) => (
        <>
          {(
            row.quantity *
            Number(row.tradeType == 'B' ? row.buyPrice : row.sellPrice)
          ).toFixed(2)}
        </>
      ),
    },
    {
      title: '  ',
      dataIndex: 'opr',
      key: 'opr',
      align: 'left',
      render: (data, row) => (
        <div className="flex flex-row items-center justify-center space-x-2">
          <svg
            className={
              row.transactionStatus == 'open' &&
              row.quantityLeft == row.quantity
                ? 'cursor-pointer'
                : 'cursor-not-allowed'
            }
            onClick={() => {
              row.transactionStatus == 'open' &&
                row.quantityLeft == row.quantity &&
                setModalData({ open: true, row: row });
            }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.1082 4.69635H0.872932C0.609403 4.69635 0.402344 4.90341 0.402344 5.16693C0.402344 5.43046 0.609403 5.63752 0.872932 5.63752H1.34352V15.0493C1.34352 15.5669 1.76705 15.9905 2.2847 15.9905H11.6965C12.2141 15.9905 12.6376 15.5669 12.6376 15.0493V5.63752H13.1082C13.3718 5.63752 13.5788 5.43046 13.5788 5.16693C13.5788 4.90341 13.3718 4.69635 13.1082 4.69635ZM5.10823 13.1669C5.10823 13.6846 4.6847 14.1081 4.16705 14.1081C3.6494 14.1081 3.22587 13.6846 3.22587 13.1669V7.51988C3.22587 7.00223 3.6494 6.5787 4.16705 6.5787C4.6847 6.5787 5.10823 7.00223 5.10823 7.51988V13.1669ZM7.93176 13.1669C7.93176 13.6846 7.50823 14.1081 6.99058 14.1081C6.47293 14.1081 6.0494 13.6846 6.0494 13.1669V7.51988C6.0494 7.00223 6.47293 6.5787 6.99058 6.5787C7.50823 6.5787 7.93176 7.00223 7.93176 7.51988V13.1669ZM10.7553 13.1669C10.7553 13.6846 10.3318 14.1081 9.81411 14.1081C9.29646 14.1081 8.87293 13.6846 8.87293 13.1669V7.51988C8.87293 7.00223 9.29646 6.5787 9.81411 6.5787C10.3318 6.5787 10.7553 7.00223 10.7553 7.51988V13.1669ZM12.6376 1.87282H8.87293C8.87293 1.35517 8.4494 0.931641 7.93176 0.931641H6.0494C5.53176 0.931641 5.10823 1.35517 5.10823 1.87282H1.34352C0.825873 1.87282 0.402344 2.29635 0.402344 2.81399V3.75517H13.5788V2.81399C13.5788 2.29635 13.1553 1.87282 12.6376 1.87282Z"
              fill={
                row.transactionStatus == 'open' &&
                row.quantityLeft == row.quantity
                  ? '#000000'
                  : '#8F95B2'
              }
            />
          </svg>

          <svg
            className={
              row.transactionStatus == 'open' &&
              row.quantityLeft == row.quantity
                ? 'cursor-pointer'
                : 'cursor-not-allowed'
            }
            onClick={() => {
              row.transactionStatus == 'open' &&
                row.quantityLeft == row.quantity &&
                setEditModalData({
                  ...editModalData,
                  open: true,
                  row: row,
                  price:
                    row.tradeType == 'B'
                      ? Number(row.buyPrice)
                      : Number(row.sellPrice),
                  quantity: 0,
                });
            }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.24999 10.2602L5.71999 12.7302L12.41 6.04023L9.94999 3.56023L3.24999 10.2602ZM0.98999 14.9902L4.84999 13.6002L2.38999 11.1602L0.98999 14.9902ZM13.24 0.990234C12.76 0.990234 12.32 1.19023 12 1.50023L10.56 2.94023L13.03 5.41023L14.47 3.97023C14.79 3.65023 14.98 3.22023 14.98 2.73023C14.99 1.78023 14.21 0.990234 13.24 0.990234Z"
              fill={
                row.transactionStatus == 'open' &&
                row.quantityLeft == row.quantity
                  ? '#000000'
                  : '#8F95B2'
              }
            />
          </svg>
        </div>
      ),
    },
    {
      title: '  ',
      dataIndex: 'Cvt',
      key: 'cvt',
      align: 'left',
      render: (data, row) => (
        <>
          <Tooltip
            title={`Convert to ${row.isIntraday ? 'Normal' : 'Intraday'}`}
          >
            <svg
              className={
                row.transactionStatus == 'open'
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }
              onClick={() => {
                row.transactionStatus == 'open' && convertHandler(row.id);
              }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 13V12C4 9.23858 6.23858 7 9 7H20L17 4"
                stroke={row.transactionStatus == 'open' ? '#000000' : '#8F95B2'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 11V12C20 14.7614 17.7614 17 15 17H4L7 20"
                stroke={row.transactionStatus == 'open' ? '#000000' : '#8F95B2'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Tooltip>
        </>
      ),
    },
  ];

  // do not show brokerage and margin for client
  if (user?.userType.constant == 'Client') {
    columns = columns.filter(
      (col) =>
        col.key != 'brokerage' &&
        col.key != 'margin' &&
        col.key != 'opr' &&
        col.key != 'username' &&
        col.key != 'upline'
    );
  }

  if (partial == true) {
    columns = columns.filter(
      (col) =>
        col.key == 'tradeId' ||
        col.key == 'orderType' ||
        col.key == 'buyPrice' ||
        col.key == 'sellPrice' ||
        col.key == 'balLots' ||
        col.key == 'cvt'
    );
  }

  const dataFetcher = async () => {
    setLoading(true);
    let res = await apiCall(Routes.TRADE.GET_TRADE_ORDER, {
      username: filter.username,
      script: partial ? script : filter.script,
      exchange: partial ? '' : filter.exchange,
      pageNumber: pagination?.pageNumber,
      pageSize: pagination?.pageSize,
      transactionStatus: partial ? 'open' : 'open,closed',
      tradeDateFrom: partial
        ? null
        : filter.tradeDateFrom == undefined
          ? null
          : filter.tradeDateFrom,
      tradeDateTo: partial
        ? null
        : filter.tradeDateTo == undefined
          ? null
          : filter.tradeDateTo,
    });

    if (res.status == true) {
      setOrders(
        partial
          ? res.data.orders.filter((a: any) => a.isIntraday == intraday)
          : res.data.orders
      );
      setPagination({ ...pagination, totalCount: res.data.count || 0 });
    }
    setLoading(false);
  };

  const deleteTrade = async () => {
    let toast = new Toast('Deleting Trade');
    let res = await apiCall(
      Routes.TRADE.ORDER_DELETE,
      {
        orderId: modalData.row?.id,
        userId: modalData.row?.user.id,
      },
      false
    );

    if (res.status == true) {
      toast.success('Successfully deleted trade');
      setModalData({ open: false, row: null });
      setRefreshCount(refreshCount + 1);
    } else {
      toast.error(res.message);
    }
    return;
  };

  const editTrade = async () => {
    let toast = new Toast('Editing Trade!!!');
    let res = await apiCall(
      Routes.TRADE.ORDER_EDIT,
      {
        userId: editModalData.row?.user.id,
        orderId: editModalData.row?.id,
        price: editModalData.price,
        quantity:
          editModalData.row?.exchange == 'MCX'
            ? editModalData.quantity! * editModalData.row.lotSize
            : editModalData.tradeAllowedInQty == true
              ? editModalData.quantity
              : editModalData.quantity! * editModalData.row!.lotSize,
      },
      false
    );

    if (res.status == true) {
      toast.success('Trade Edited!!!');
      setRefreshCount(refreshCount + 1);
      setEditModalData({
        ...editModalData,
        open: false,
        price: undefined,
        quantity: undefined,
        row: null,
      });
    } else {
      toast.error(res.message);
    }

    return;
  };

  const convertHandler = async (orderId: number) => {
    let toast = new Toast('Converting Trade!!!');
    let res = await apiCall(Routes.TRADE.CONVERT_ORDER, { orderId }, false);

    if (res.status == true) {
      toast.success('Converted Trade!!!');
      setRefreshCount(refreshCount + 1);
      return;
    } else {
      toast.error(res.message);
      return;
    }
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

  const userDataFetcher = async () => {
    let res = await apiCall(
      {
        url:
          Routes.TRADE.PRE_TRADE_VALIDATION.url +
          `?userId=${editModalData.row?.user.id}`,
        method: Routes.TRADE.PRE_TRADE_VALIDATION.method,
      },
      {},
      false
    );

    if (res.status == true) {
      setEditModalData({
        ...editModalData,
        tradeAllowedInQty: res.data.user.tradeAllowedinQty,
      });
      console.log('edit modal data ', editModalData);
    }
    return;
  };

  useEffect(() => {
    if (editModalData.row && editModalData.row.user) {
      userDataFetcher();
    }
  }, [editModalData.row]);

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
    conversionScriptsFetcher();
  }, [refreshCount]);

  const onTableChange = (pagination: any, filter: any, sorter: any) => {
    if (sorter) {
      let sortingObj: any = {};
      let order = '';

      if (!sorter.order) {
        order = 'NONE';
      }
      if (sorter.order && sorter.order == 'ascend') {
        order = 'ASC';
      }
      if (sorter && sorter.order == 'descend') {
        order = 'DESC';
      }
      sortingObj[`${sorter.columnKey}`] = order;
      setSort({ ...sortingObj });
    }
  };

  return (
    <>
      <Modal
        open={modalData.open}
        title="Are you sure you want to delete this Trade?"
        onOk={() => {
          deleteTrade();
        }}
        onCancel={() =>
          setModalData({
            open: false,
            row: null,
          })
        }
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            {/* <Button>Custom Button</Button> */}
            <div className="space-x-2 mt-[40px]">
              <BorderedButton
                onClick={() => setModalData({ open: false, row: null })}
              >
                Cancel
              </BorderedButton>
              <PrimaryButton
                className="!bg-[var(--trade-red)] !border-[var(--trade-red)]"
                onClick={() => {
                  deleteTrade();
                }}
              >
                Delete
              </PrimaryButton>
            </div>
          </>
        )}
      ></Modal>

      <Modal
        open={editModalData.open}
        title="Fill the details to edit this Trade?"
        onOk={() => {
          // deleteTrade();
          editTrade();
        }}
        onCancel={() =>
          setEditModalData({
            open: false,
            row: null,
            price: undefined,
            quantity: undefined,
            tradeAllowedInQty: null,
          })
        }
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            {/* <Button>Custom Button</Button> */}
            <div className="space-x-2 mt-[40px]">
              <BorderedButton
                onClick={() => setModalData({ open: false, row: null })}
              >
                Cancel
              </BorderedButton>
              <PrimaryButton
                onClick={() => {
                  editTrade();
                }}
              >
                Edit
              </PrimaryButton>
            </div>
          </>
        )}
      >
        <div className="flex flex-row space-x-5 pt-4">
          <div className="w-[50%]">
            <LabeledWrapper label="Price">
              <BorderInput
                value={editModalData.price}
                onChange={(e) => {
                  setEditModalData({
                    ...editModalData,
                    price: Number(e.target.value),
                  });
                }}
                min={0}
                type={'number'}
                className="!pl-1.5"
                placeholder="15.00"
              />
            </LabeledWrapper>
          </div>

          {editModalData.tradeAllowedInQty == null && (
            <div className="w-[50%] flex flex-row items-center pt-5">
              <Skeleton.Input active={true} className="!w-full" />
            </div>
          )}

          {editModalData.tradeAllowedInQty != null && (
            <div className="w-[50%]">
              <LabeledWrapper
                label={
                  editModalData.row?.exchange == 'MCX'
                    ? 'Lot'
                    : editModalData.tradeAllowedInQty == true
                      ? 'Quantity'
                      : 'Lot'
                }
              >
                <BorderInput
                  value={editModalData.quantity}
                  onChange={(e) => {
                    setEditModalData({
                      ...editModalData,
                      quantity: Number(Number(e.target.value).toFixed(0)),
                    });
                  }}
                  className="!pl-1.5 !w-full"
                  min={1}
                  type={'number'}
                  placeholder="12"
                />
              </LabeledWrapper>
            </div>
          )}
        </div>
      </Modal>

      <Table
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
        }
        loading={loading}
        className="rounded-md"
        style={{ fontWeight: 100 }}
        scroll={{ x: partial == false ? 2250 : 200 }}
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
        onChange={onTableChange}
      />
    </>
  );
}

export default ManageDeleteTradesTable;
