import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { Layout, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import NotificationForm from './notification-form';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { PrimaryButton } from '@/components/inputs/button';
import Modal from 'antd/es/modal/Modal';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import {
  AdminNotificationType,
  useAdminNotifications,
} from '@/store/tools/adminnotificationlist';
import { ColumnsType } from 'antd/es/table';
const Index = () => {
  const { apiCall } = useFetch();
  const {
    loading,
    pagination,
    refreshCount,
    adminNotifications,
    setAdminNotifications,
    setLoading,
    setPagination,
    setRefreshCount,
  } = useAdminNotifications();
  const [openModal, setOpenModal] = useState<{
    open: boolean;
    row: AdminNotificationType | null;
  }>();

  let columns: ColumnsType<AdminNotificationType> = [
    {
      title: <p className="px-2">Id</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (data, row) => <p className="px-2">{row.id}</p>,
    },
    {
      title: <p className="px-2">Sent to heirarchy</p>,
      dataIndex: 'is_hierarchy',
      key: 'is_hierarchy',
      align: 'left',
      render: (data, row) => (
        <p className="px-2">{row.is_hierarchy ? 'True' : 'false'}</p>
      ),
    },
    {
      title: <p className="px-2">Title</p>,
      dataIndex: 'title',
      key: 'title',
      align: 'left',
      render: (data, row) => <p className="px-2">{row.title}</p>,
    },
    {
      title: <p className="px-2">Message</p>,
      dataIndex: 'message',
      key: 'message',
      align: 'left',
      width: 400,
      render: (data, row) => (
        <button
          className="ml-2"
          title="Click to see message"
          onClick={() => {
            setOpenModal({
              open: true,
              row: row,
            });
          }}
        >
          {row.message.slice(0, 40)}
          {row.message.length > 40 ? '...' : ''}
        </button>
      ),
    },
    {
      title: <p className="px-2">User Type</p>,
      dataIndex: 'userType',
      key: 'userType',
      align: 'left',
      render: (data, row) => (
        <p className="px-2">{row.userType?.prjSettConstant}</p>
      ),
    },
    {
      title: <p className="px-2">Users</p>,
      dataIndex: 'users',
      key: 'users',
      align: 'left',
      render: (data, row) => <p className="px-2">{row.users.join(', ')}</p>,
    },
  ];

  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  const handleModalOpen = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setOpenModal({
      open: false,
      row: null,
    });
  };

  const handleCancel = () => {
    setOpenModal({
      open: false,
      row: null,
    });
  };

  const dataFetcher = async () => {
    setLoading(true);
    let response = await apiCall(
      Routes.NOTIFICATION.GET_ADMIN_NOTIFICATION_LIST,
      {},
      false
    );
    if (response.status) {
      setAdminNotifications(response.data);
    } else {
      console.log('No data found');
    }
    setLoading(false);
  };

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Send Alert Notification</H1>
        <I text="Send alert message"></I>
      </div>

      <div className="overflow-x-scroll flex justify-between items-end mb-7 mt-3">
        <div className="searchMessage flex space-x-3 justify-between items-end"></div>
        <PrimaryButton className="h-10" onClick={handleModalOpen}>
          Send a notification
        </PrimaryButton>
      </div>
      <Table
        className="rounded-md"
        style={{ fontWeight: 100 }}
        scroll={{ x: '800' }}
        loading={loading}
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
        dataSource={adminNotifications}
      />
      <Modal
        title="Message"
        open={openModal?.open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <div className="space-x-2 mt-[40px]">
              <PrimaryButton onClick={() => handleCancel()}>
                Close
              </PrimaryButton>
            </div>
          </>
        )}
      >
        {openModal?.row?.message}
      </Modal>
      <Modal
        title="Enter notification data"
        open={open}
        onCancel={close}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        width={800}
      >
        <NotificationForm closeOnSubmit={close} />
      </Modal>
    </Layout>
  );
};

export default Index;
