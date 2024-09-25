import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal, Dropdown, Skeleton } from 'antd';
import { ColumnsType } from 'antd/es/table';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import TimeHandler from '@/utils/common/timeHandler';
import initSocket from '@/lib/socket';
import { useManageOrders, TradeOrder } from '@/store/trade/manageorders';
import Toast from '@/utils/common/toast';
import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { useConversionRate } from '@/store/conversion-rate/mcxconversionrate';
import { EllipsisOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { useUserStore } from '@/store/user';

function SearchClientTable() {
  const { apiCall } = useFetch();
  const [liveData, setLiveData] = useState<{
    [key: string]: {
      buyPrice: number;
      sellPrice: number;
    };
  }>({});
  const { config } = useUserStore();
  const { conversionScripts, setConversionScripts } = useConversionRate();
  const [modalOpen, setModalOpen] = useState<{
    open: boolean;
    row: TradeOrder | null;
  }>({
    open: false,
    row: null,
  });
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
  } = useManageOrders();

  const cancelOrder = async (row: TradeOrder | null) => {
    if (!row) return;
    const toast = new Toast('Cancelling Order');
    let res = await apiCall(Routes.TRADE.ORDER_CANCEL, {
      orderId: row.id,
    });
    if (res.status == true) {
      toast.success('Order Cancelled Successfully');
      setModalOpen({ open: false, row: null });
      setRefreshCount(refreshCount + 1);
    } else {
      toast.error('Order Cancel Failed');
    }
  };

  const actionsHandler = (row: TradeOrder) => {
    return [
      {
        key: '1',
        disabled: row.transactionStatus != 'pending',
        label: (
          <div className={`flex flex-row items-center space-x-1`}>
            <button
              className={`${
                row.transactionStatus != 'pending'
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              onClick={() =>
                row.transactionStatus == 'pending' &&
                setEditModalData({
                  open: true,
                  row: row,
                  price: Number(row.buyPrice || row.sellPrice),
                  quantity: row.quantity,
                  tradeAllowedInQty: config.tradeAllowedinQty,
                })
              }
            >
              Edit
            </button>
          </div>
        ),
      },
      {
        key: '2',
        disabled: row.transactionStatus != 'pending',
        label: (
          <div className={`flex flex-row items-center space-x-1 `}>
            <button
              className={`${
                row.transactionStatus != 'pending'
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              onClick={() =>
                row.transactionStatus == 'pending' &&
                setModalOpen({
                  open: true,
                  row: row,
                })
              }
            >
              Cancel
            </button>
          </div>
        ),
      },
    ];
  };

  const editTrade = async () => {
    let toast = new Toast('Editing Trade!!!');
    console.log(editModalData, 'here is the modal data');
    let res = await apiCall(
      Routes.TRADE.EDIT_PENDING_ORDER,
      {
        userId: editModalData.row?.user.id,
        orderId: editModalData.row?.id,
        price: editModalData.price,
        quantity: editModalData.quantity,
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

  const columns: ColumnsType<TradeOrder> = [
    {
      title: () => (
        <div className="flex flex-row justify-start leading-none pl-2">
          Trade Id
        </div>
      ),
      dataIndex: 'id',
      key: 'tradeId',
      width: 80,
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
      width: 200,
      render: (data, row) => <>{row.scriptName}</>,
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
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      align: 'left',
      width: 150,
      // showSorterTooltip: false,
      render: (data, row) => (
        <>{TimeHandler.dateTimeHandler(row.orderCreationDate, true)}</>
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

    {
      title: 'Trade Status',
      dataIndex: 'tradeStatus',
      key: 'tradeStatus',
      align: 'left',
      render: (data, row) => <>{row.transactionStatus}</>,
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
      render: (data, row) => <>{row.sellPrice || '-'}</>,
    },
    {
      title: 'Buy Lots',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
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
      title: 'Buy Quantity',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      width: 120,
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
      title: 'Sell Lots',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      render: (data, row) => (
        <>
          {row.tradeType == 'S' ? (row.quantity / row.lotSize).toFixed(2) : '-'}
        </>
      ),
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },
    {
      title: 'Sell Quantity',
      dataIndex: 'tradeQty',
      key: 'tradeQty',
      align: 'left',
      width: 120,
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
              : '-'}
          </>
        );
      },
      sorter: (a, b) => {
        return Number(a.quantity) - Number(b.quantity);
      },
    },
    {
      title: 'Trade Amount',
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
      title: ' ',
      dataIndex: 'cancel',
      key: 'cancel',
      width: 60,
      align: 'center',
      fixed: 'right',
      render: (data, row) => (
        <>
          <div className="flex flex-row items-center justify-center space-x-6 px-2">
            {/* triple dot dropdown */}
            <Dropdown
              menu={{ items: actionsHandler(row) }}
              className={`cursor-pointer hover:text-[var(--primary-shade-a)] ${
                row.transactionStatus != 'pending' && '!cursor-not-allowed'
              }`}
              placement="bottomLeft"
              arrow
              trigger={['click']}
              disabled={row.transactionStatus != 'pending'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 6.25C10 5.55964 10.5596 5 11.25 5C11.9404 5 12.5 5.55964 12.5 6.25C12.5 6.94036 11.9404 7.5 11.25 7.5C10.5596 7.5 10 6.94036 10 6.25ZM10 11.25C10 10.5596 10.5596 10 11.25 10C11.9404 10 12.5 10.5596 12.5 11.25C12.5 11.9404 11.9404 12.5 11.25 12.5C10.5596 12.5 10 11.9404 10 11.25ZM11.25 15C10.5596 15 10 15.5596 10 16.25C10 16.9404 10.5596 17.5 11.25 17.5C11.9404 17.5 12.5 16.9404 12.5 16.25C12.5 15.5596 11.9404 15 11.25 15Z"
                  fill="#28303F"
                />
              </svg>
            </Dropdown>
          </div>

          {/* {row.transactionStatus == 'pending' ? (
            <button
              onClick={() =>
                setModalOpen({
                  open: true,
                  row: row,
                })
              }
              className="rounded-md flex justify-center items-center w-full cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.3588 15.3587C15.0659 15.6516 14.591 15.6516 14.2981 15.3587L12 13.0606L9.7019 15.3587C9.40901 15.6516 8.93413 15.6516 8.64124 15.3587C8.34835 15.0658 8.34835 14.5909 8.64124 14.298L10.9393 11.9999L8.64125 9.70184C8.34836 9.40895 8.34836 8.93408 8.64125 8.64118C8.93415 8.34829 9.40902 8.34829 9.70191 8.64118L12 10.9393L14.2981 8.64119C14.591 8.3483 15.0659 8.3483 15.3588 8.64119C15.6516 8.93409 15.6516 9.40896 15.3588 9.70185L13.0607 11.9999L15.3588 14.298C15.6517 14.5909 15.6517 15.0658 15.3588 15.3587Z"
                  fill="var(--primary-shade-b)"
                />
              </svg>
            </button>
          ) : (
            <button className="rounded-md flex justify-center items-center w-full cursor-not-allowed">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.3588 15.3587C15.0659 15.6516 14.591 15.6516 14.2981 15.3587L12 13.0606L9.7019 15.3587C9.40901 15.6516 8.93413 15.6516 8.64124 15.3587C8.34835 15.0658 8.34835 14.5909 8.64124 14.298L10.9393 11.9999L8.64125 9.70184C8.34836 9.40895 8.34836 8.93408 8.64125 8.64118C8.93415 8.34829 9.40902 8.34829 9.70191 8.64118L12 10.9393L14.2981 8.64119C14.591 8.3483 15.0659 8.3483 15.3588 8.64119C15.6516 8.93409 15.6516 9.40896 15.3588 9.70185L13.0607 11.9999L15.3588 14.298C15.6517 14.5909 15.6517 15.0658 15.3588 15.3587Z"
                  fill="var(--primary-shade-c)"
                />
              </svg>
            </button>
          )} */}
        </>
      ),
    },
  ];

  const dataFetcher = async () => {
    setLoading(true);
    let res = await apiCall(Routes.TRADE.GET_TRADE_ORDER, {
      username: filter.username,
      script: filter.script,
      exchange: filter.exchange,
      pageNumber: pagination?.pageNumber,
      pageSize: pagination?.pageSize,
      transactionStatus: 'pending,executed',
      tradeDateFrom:
        filter.tradeDateFrom == undefined ? null : filter.tradeDateFrom,
      tradeDateTo: filter.tradeDateTo == undefined ? null : filter.tradeDateTo,
    });

    if (res.status == true) {
      setOrders(res.data.orders);
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
        title="Are you sure you want cancel this order?"
        onOk={() => cancelOrder(modalOpen.row)}
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
              <PrimaryButton onClick={() => cancelOrder(modalOpen.row)}>
                Cancel Order
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
                onClick={() =>
                  setEditModalData({
                    open: false,
                    row: null,
                    price: undefined,
                    quantity: undefined,
                    tradeAllowedInQty: null,
                  })
                }
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
                  value={
                    editModalData.row?.exchange == 'NSE' &&
                    editModalData.tradeAllowedInQty
                      ? editModalData.quantity
                      : editModalData.quantity! / editModalData.row?.lotSize!
                  }
                  onChange={(e) => {
                    setEditModalData({
                      ...editModalData,
                      quantity: Number(
                        editModalData.row?.exchange == 'NSE' &&
                          editModalData.tradeAllowedInQty
                          ? Number(e.target.value)
                          : Number(e.target.value) * editModalData.row?.lotSize!
                      ),
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
        scroll={{ x: 1800 }}
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
    </div>
  );
}

export default SearchClientTable;
