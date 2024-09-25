'use client';
import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { Layout, Modal, Table } from 'antd';
import { useEffect, useState } from 'react';
import ReconciliationForm from './reconciliation-form';
import useFetch from '@/hooks/useFetch';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import {
  ReconciliationsActionsType,
  useManualReconciliations,
} from '@/store/trade/manual-reconciliations';
import { ColumnsType } from 'antd/es/table';

const ManualReconciliations = () => {
  const { apiCall } = useFetch();
  const {
    loading,
    pagination,
    reconciliations,
    refreshCount,
    setLoading,
    setManualReconciliations,
    setPagination,
    setRefreshCount,
  } = useManualReconciliations();

  const dataFetcher = async () => {
    setLoading(true);
    let res = await apiCall(
      Routes.TRADE.GET_RECONCILIATIONS_ACTIONS,
      {},
      false
    );

    if (res.status) {
      console.log(res.data);
      setManualReconciliations(res.data);
    }
    setLoading(false);
  };

  let columns: ColumnsType<ReconciliationsActionsType> = [
    {
      title: <p className="px-2">Id</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (data, row) => <p className="px-2">{row.id}</p>,
    },
    {
      title: <p className="px-2">Script Name</p>,
      dataIndex: 'instrumentName',
      key: 'instrumentName',
      align: 'left',
      render: (data, row) => <p className="px-2">{row.instrumentName}</p>,
    },
    {
      title: <p className="px-2">Action Date</p>,
      dataIndex: 'actionDate',
      key: 'actionDate',
      align: 'left',
      render: (data, row) => (
        <p className="px-2">{row.actionDate.slice(0, 10)}</p>
      ),
    },
    {
      title: <p className="px-2">Affected Orders</p>,
      dataIndex: 'affectedOrders',
      key: 'affectedOrders',
      align: 'center',
      render: (data, row) => (
        <p className="px-2">{row.affectedOrders.length}</p>
      ),
    },
    {
      title: <p className="px-2">Action Type</p>,
      dataIndex: 'actionType',
      key: 'actionType',
      align: 'left',
      render: (data, row) => (
        <p className="px-2 capitalize">{row.actionType}</p>
      ),
    },
    {
      title: <p className="px-2">Action Status</p>,
      dataIndex: 'actionStatus',
      key: 'actionStatus',
      align: 'center',
      render: (data, row) => <p className="px-2">{row.actionStatus}</p>,
    },
    {
      title: <p className="px-2">Dividend Amount</p>,
      dataIndex: 'divident',
      key: 'divident',
      align: 'center',
      render: (data, row) => (
        <p className="px-2">
          {row.actionData.dividend != null
            ? row.actionData.dividend.amount
            : '-'}
        </p>
      ),
    },
    {
      title: <p className="px-2">Bonus Ratio</p>,
      dataIndex: 'bonusRatio',
      key: 'bonusRatio',
      align: 'center',
      render: (data, row) => (
        <p className="px-2">
          {row.actionData.bonus != null
            ? row.actionData.bonus.r1 + ' : ' + row.actionData.bonus.r2
            : '-'}
        </p>
      ),
    },
    {
      title: <p className="px-2">Split Ratio</p>,
      dataIndex: 'bonusRatio',
      key: 'bonusRatio',
      align: 'center',
      render: (data, row) => (
        <p className="px-2">
          {row.actionData.split != null
            ? row.actionData.split.r1 + ' : ' + row.actionData.split.r2
            : '-'}
        </p>
      ),
    },
    {
      title: <p className="px-2">Delete</p>,
      dataIndex: 'delete',
      key: 'delete',
      align: 'center',
      render: (data, row) => (
        <p className="flex justify-center">
          {row.actionStatus === 'pending' ? (
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.40627 0.890599C5.7772 0.334202 6.40166 0 7.07037 0H8.92963C9.59834 0 10.2228 0.334202 10.5937 0.8906L11.5 2.25H15.25C15.6642 2.25 16 2.58579 16 3C16 3.41421 15.6642 3.75 15.25 3.75H0.75C0.335786 3.75 0 3.41421 0 3C0 2.58579 0.335786 2.25 0.75 2.25H4.5L5.40627 0.890599ZM11 20H5C2.79086 20 1 18.2091 1 16V5H15V16C15 18.2091 13.2091 20 11 20ZM6 8.25C6.41421 8.25 6.75 8.58579 6.75 9V16C6.75 16.4142 6.41421 16.75 6 16.75C5.58579 16.75 5.25 16.4142 5.25 16L5.25 9C5.25 8.58579 5.58579 8.25 6 8.25ZM10 8.25C10.4142 8.25 10.75 8.58579 10.75 9V16C10.75 16.4142 10.4142 16.75 10 16.75C9.58579 16.75 9.25 16.4142 9.25 16V9C9.25 8.58579 9.58579 8.25 10 8.25Z"
                fill="#28303F"
              />
            </svg>
          ) : (
            '-'
          )}
        </p>
      ),
    },
  ];

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);
  const [open, setOpen] = useState(false);
  const handleModalOpen = () => {
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-3 flex items-center space-x-3">
        <H1>Reconciliations</H1>
        <I text="Reconciliations tooltip"></I>
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleModalOpen}>Add Action</PrimaryButton>
        <Modal
          title="Add Action"
          open={open}
          onCancel={close}
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          width={600}
        >
          <ReconciliationForm closeModal={close} />
        </Modal>
      </div>

      <Table
        loading={loading}
        className="rounded-md mt-4"
        style={{ fontWeight: 100 }}
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
        dataSource={reconciliations}
      />
    </Layout>
  );
};

export default ManualReconciliations;
