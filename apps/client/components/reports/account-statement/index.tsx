import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { useStatement } from '@/store/user/statement';
import Routes from '@/utils/routes';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Card, Statistic } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import AccountStatement from './account';
import { useUserStore } from '@/store/user';
import {
  TransactionLedger,
  useTransactionLedger,
} from '@/store/reports/transactionledger';
import Table, { ColumnsType } from 'antd/es/table';
import TimeHandler from '@/utils/common/timeHandler';
import { BorderInput } from '@/components/inputs/text';
import { PrimaryButton } from '@/components/inputs/button';

const Statement = () => {
  const { apiCall } = useFetch();
  const { user } = useUserStore();
  const {
    loading,
    pagination,
    refreshCount,
    setLoading,
    setPagination,
    setRefreshCount,
    transactionLedger,
    setTransactionLedger,
  } = useTransactionLedger();
  const [username, setUsername] = useState('');

  let columns: ColumnsType<TransactionLedger> = [
    {
      title: <p className="px-2">Trxn Id</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.id}</p>,
    },
    {
      title: <p className="px-2">Username</p>,
      dataIndex: 'username',
      key: 'username',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.user.username}</p>,
    },
    {
      title: <p className="px-2">Trxn Amt.</p>,
      dataIndex: 'transactionAmount',
      key: 'transactionAmount',
      align: 'left',
      width: 10,
      render: (data, row) => (
        <p
          className={`px-2 ${
            row.transactionParticular.prjSettConstant === 'Credit'
              ? 'text-green-500'
              : ''
          }`}
        >
          {parseFloat(row.transactionAmount).toFixed(2)}
        </p>
      ),
    },
    {
      title: <p className="px-2">Trxn Date</p>,
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      align: 'center',
      width: 10,
      ellipsis: true,
      render: (data, row) => (
        <p className="px-2">
          {TimeHandler.dateTimeHandler(row.transactionDate)}
        </p>
      ),
    },
    {
      title: <p className="px-2">Trxn Type</p>,
      dataIndex: 'trxntyp',
      key: 'trxntyp',
      align: 'center',
      width: 10,
      ellipsis: true,
      render: (data, row) => (
        <p
          className={`px-2 ${
            row.transactionType.prjSettConstant == 'Credit'
              ? 'text-[var(--primary-shade-a)]'
              : 'text-red-600'
          }`}
        >
          {row.transactionType.prjSettConstant}
        </p>
      ),
    },
    {
      title: <p className="px-2">Trxn Prt</p>,
      dataIndex: 'prjSettConstant',
      key: 'prjSettConstant',
      align: 'left',
      width: 10,
      ellipsis: true,
      render: (data, row) => (
        <p className="px-2">{row.transactionParticular.prjSettConstant}</p>
      ),
    },
    {
      title: <p className="px-2">Trxn Remarks</p>,
      dataIndex: 'transactionRemarks',
      key: 'transactionRemarks',
      align: 'center',
      width: 10,
      ellipsis: true,
      render: (data, row) => <p className="px-2">{row.transactionRemarks}</p>,
    },
    {
      title: <p className="px-2">Order Id</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 10,
      render: (data, row) => (
        <p className="px-2">{row.order == null ? '-' : row.order.id}</p>
      ),
    },
    {
      title: <p className="px-2">Order Qty</p>,
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 10,
      render: (data, row) => (
        <p className="px-2">{row.order == null ? '-' : row.order.quantity}</p>
      ),
    },
    {
      title: <p className="px-2">Order Script</p>,
      dataIndex: 'scriptName',
      key: 'scriptName',
      align: 'left',
      width: 10,
      ellipsis: true,
      render: (data, row) => (
        <p className="px-2">{row.order == null ? '-' : row.order.scriptName}</p>
      ),
    },
  ];

  const transactionsFetcher = async () => {
    setLoading(true);
    let res = await apiCall(
      {
        url: Routes.USER.GET_TRANSACTIONS.url + `?username=${username}`,
        method: Routes.USER.GET_TRANSACTIONS.method,
      },
      { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize },
      false
    );
    if (res.status) {
      console.log(res.data.transactions, 'hello');
      setTransactionLedger(res.data.transactions);
      setLoading(false);
      setPagination({ ...pagination, totalCount: res.data.count || 0 });
    }
    return;
  };

  useEffect(() => {
    transactionsFetcher();
  }, [refreshCount]);

  return (
    <>
      {user?.userType.name === 'Client' ? (
        <AccountStatement />
      ) : (
        <div className="w-full h-full px-4 ">
          <div className="flex items-center space-x-2">
            <H1>Transactions Table</H1>
            <Tooltip placement="top" title={'This is tooltip'}>
              <I text=""></I>
            </Tooltip>
          </div>

          <div className="mb-4 overflow-x-scroll mt-4 py-[2px] pl-[2px] flex justify-between items-center">
            <form
              className="flex space-x-3 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                transactionsFetcher();
              }}
            >
              <BorderInput
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className="!py-[0.22rem]"
                placeholder="Search User"
              />

              <PrimaryButton
                type="submit"
                className="!py-[0.47rem] !min-w-[20px]"
              >
                Search
              </PrimaryButton>
            </form>
          </div>

          <div className="mt-5">
            <Table
              loading={loading}
              className="rounded-md"
              style={{ fontWeight: 100 }}
              scroll={{ x: 1500 }}
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
              dataSource={transactionLedger}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Statement;
