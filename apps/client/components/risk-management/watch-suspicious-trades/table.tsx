import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { TradeOrder } from '@/store/trade/managepositions';
import TimeHandler from '@/utils/common/timeHandler';
import { useUserStore } from '@/store/user';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import {
  SuspiciousTrades,
  useSuspiciousTrades,
} from '@/store/risk-management/watchsuspicioustrades';

const SuspiciousTable = () => {
  const { apiCall } = useFetch();
  const { user, config } = useUserStore();

  const socketRef: any = useRef();
  const {
    pagination,
    setPagination,
    setSuspiciousTrades,
    suspiciousTrades,
    loading,
    setLoading,
    refreshCount,
    setRefreshCount,
  } = useSuspiciousTrades();

  let columns: ColumnsType<SuspiciousTrades> = [
    {
      title: <p className="px-2">User Id</p>,
      dataIndex: 'userId',
      key: 'userId',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.userId}</p>,
    },
    {
      title: <p className="px-2">Parent Id</p>,
      dataIndex: 'parentId',
      key: 'parentId',
      align: 'center',
      width: 10,
      render: (data, row) => <>{row.parentId}</>,
    },
    {
      title: 'Script',
      dataIndex: 'script',
      key: 'script',
      align: 'left',
      width: 30,
      render: (data, row) => <>{row.scriptName}</>,
    },
    {
      title: 'Intraday',
      dataIndex: 'isIntraday',
      key: 'isIntraday',
      align: 'left',
      width: 40,
      render: (data, row) => (
        <div
          className={`font-bold ${
            data ? 'Yes' && 'text-[#429775]' : 'text-red-600'
          }`}
        >
          {data ? 'Yes' : 'No'}
        </div>
      ),
    },
    {
      title: 'Exec Date',
      dataIndex: 'orderExecDate',
      key: 'orderExecDate',
      align: 'left',
      width: 100,
      // showSorterTooltip: false,
      render: (data, row) => (
        <>
          {row.orderExecutionDate
            ? TimeHandler.dateTimeHandler(row.orderExecutionDate, true)
            : '-'}
        </>
      ),
    },

    {
      title: 'Exch',
      dataIndex: 'exchange',
      key: 'exchange',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.exchange}</>,
    },
    {
      title: 'Trade Type',
      dataIndex: 'tradeType',
      key: 'tradeType',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.tradeType == 'B' ? 'Buy' : 'Sell'}</>,
    },
    {
      title: 'Buy Price',
      dataIndex: 'buyPrice',
      key: 'buyPrice',
      align: 'left',
      width: 60,
      render: (data, row) => (
        <p className="text-[#429775] text-center">
          {!row.buyPrice ? '-' : row.buyPrice}
        </p>
      ),
    },
    {
      title: 'Sell Price',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      align: 'left',
      width: 60,
      render: (data, row) => <p className="text-red-600">{row.sellPrice}</p>,
    },
    {
      title: 'Transaction Status',
      dataIndex: 'transactionStatus',
      key: 'transactionStatus',
      align: 'left',
      width: 80,
      render: (data, row) => <>{row.transactionStatus}</>,
    },
    {
      title: 'Lot Size',
      dataIndex: 'lotSize',
      key: 'lotSize',
      align: 'left',
      width: 40,
      render: (data, row) => <>{row.lotSize}</>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'left',
      width: 40,
      render: (data, row) => <>{row.quantity}</>,
    },
    {
      title: 'Margin',
      dataIndex: 'margin',
      key: 'margin',
      align: 'left',
      width: 40,
      render: (data, row) => <>{row.margin}</>,
    },
    {
      title: 'Margin Type',
      dataIndex: 'marginChargedType',
      key: 'marginChargedType',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.marginChargedType}</>,
    },
    {
      title: 'Margin Rate',
      dataIndex: 'marginChargedRate',
      key: 'marginChargedRate',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.marginChargedRate}</>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align: 'left',
      width: 30,
      render: (data, row) => <>{row.location}</>,
    },
    {
      title: 'Device Id',
      dataIndex: 'deviceId',
      key: 'deviceId',
      align: 'left',
      width: 20,
      render: (data, row) => <>{row.deviceId}</>,
    },
    {
      title: 'Device Type',
      dataIndex: 'deviceType',
      key: 'deviceType',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.deviceType}</>,
    },
    {
      title: 'IP address',
      dataIndex: 'ipAddr',
      key: 'ipAddr',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.ipAddr}</>,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      align: 'left',
      width: 20,
      render: (data, row) => <>{row.score}</>,
    },
    {
      title: 'Flag',
      dataIndex: 'flag',
      key: 'flag',
      align: 'left',
      width: 20,
      render: (data, row) => <>{row.flag}</>,
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
      align: 'left',
      width: 60,
      render: (data, row) => <>{row.remark}</>,
    },
  ];
  const dataFetcher = async () => {
    setLoading(true);
    let res = await apiCall(Routes.TRADE.GET_SUSPICIOUS_TRADES, {
      pageNumber: pagination?.pageNumber,
      pageSize: pagination?.pageSize,
      transactionStatus: 'open',
      groupByScript: true,
    });
    console.log(res, 'response is here ');
    if (res.status == true) {
      setSuspiciousTrades(res.data);
      console.log('orders data => ', res.data);
      setPagination({ ...pagination, totalCount: res.data.count || 0 });
    }
    setLoading(false);
  };

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);

  return (
    <>
      <div className="flex items-center space-x-2">
        <H1>Suspicious Trade</H1>
        <Tooltip placement="top" title={'This is tooltip'}>
          <I text=""></I>
        </Tooltip>
      </div>
      <div className="mt-5">
        <Table
          rowClassName={(record, index) => {
            return record.isIntraday
              ? 'bg-[var(--primary-shade-d)]'
              : 'bg-white';
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
          dataSource={suspiciousTrades}
        />
      </div>
    </>
  );
};

export default SuspiciousTable;
