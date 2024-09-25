import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { Modal } from 'antd';
import { Layout, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import BroadcastForm from './broadcast-form';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { PrimaryButton } from '@/components/inputs/button';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import {
  AdminBroadCastMessageType,
  useAdminBroadCastMessage,
} from '@/store/tools/adminmessage';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import Joi from 'joi';
const Index = () => {
  const { apiCall } = useFetch();
  const [open, setOpen] = useState(false);
  const [timeSlotModal, setTimeSlotModal] = useState<{
    open: boolean;
    row: AdminBroadCastMessageType | null;
  }>({
    open: false,
    row: null,
  });
  const [openModal, setOpenModal] = useState<{
    open: boolean;
    row: AdminBroadCastMessageType | null;
  }>();

  const [search, setSearch] = useState('');
  const [dataSearchLoading, setDataSearchLoading] = useState(false);
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
  const {
    adminMessages,
    loading,
    pagination,
    refreshCount,
    setAdminBroadCastMessages,
    setLoading,
    setPagination,
    setRefreshCount,
  } = useAdminBroadCastMessage();

  let columns: ColumnsType<AdminBroadCastMessageType> = [
    {
      title: <p className="px-2">Id</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      render: (data, row) => <p className="px-2">{row.id}</p>,
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
      title: <p className="px-2">Severity</p>,
      dataIndex: 'severity',
      key: 'severity',
      align: 'left',
      render: (data, row) => (
        <p
          className={`px-2 font-medium capitalize ${
            row.severity === 'high'
              ? 'text-red-600'
              : row.severity === 'medium'
                ? 'text-orange-600'
                : 'text-green-600'
          }`}
        >
          {row.severity ? row.severity : '-'}
        </p>
      ),
    },
    {
      title: <p className="px-2">Type</p>,
      dataIndex: 'type',
      key: 'type',
      align: 'left',
      render: (data, row) => <p className="px-2 capitalize">{row.type}</p>,
    },
    {
      title: <p className="px-2">Frequency</p>,
      dataIndex: 'frequency',
      key: 'frequency',
      align: 'center',
      render: (data, row) => (
        <p className="px-2 capitalize">{row.frequency ? row.frequency : '-'}</p>
      ),
    },
    {
      title: <p className="px-2">Time Slots</p>,
      dataIndex: 'scheduled_data',
      key: 'scheduled_data',
      align: 'center',
      render: (data, row) => (
        <div
          className="px-2 capitalize flex justify-center cursor-pointer"
          onClick={() => setTimeSlotModal({ open: true, row: row })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            id="Eye"
            height={20}
            width={20}
          >
            <path fill="none" d="M0 0h48v48H0z"></path>
            <path
              d="M24 9C14 9 5.46 15.22 2 24c3.46 8.78 12 15 22 15 10.01 0 18.54-6.22 22-15-3.46-8.78-11.99-15-22-15zm0 25c-5.52 0-10-4.48-10-10s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10zm0-16c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
              fill="#294a42"
              className="color000000 svgShape"
            ></path>
          </svg>
        </div>
      ),
    },

    {
      title: <p className="px-2">Valid For</p>,
      dataIndex: 'valid_for',
      key: 'valid_for',
      align: 'center',
      render: (data, row) => <p className="px-2">{row.valid_for}</p>,
    },
    {
      title: <p className="px-2">From Date</p>,
      dataIndex: 'from_date',
      key: 'from_date',
      align: 'left',
      render: (data, row) => (
        <p className="px-2">
          {row.from_date ? (
            <p className="space-x-2">
              <span>{moment(row.from_date).format('DD-MM-YYYY')}</span>
            </p>
          ) : (
            'Instant'
          )}
        </p>
      ),
    },
    {
      title: <p className="px-2">To Date</p>,
      dataIndex: 'to_date',
      key: 'to_date',
      align: 'left',
      render: (data, row) => (
        <p className="px-2">
          {row.to_date ? (
            <p className="space-x-2">
              <span>{moment(row.to_date).format('DD-MM-YYYY')}</span>
            </p>
          ) : (
            'Instant'
          )}
        </p>
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

  const dataFetcher = async () => {
    setDataSearchLoading(true);
    let response = await apiCall(
      {
        url: `${Routes.NOTIFICATION.GET_ADMIN_MESSAGE_LIST.url}?search=${search}`,
        method: {
          type: 'GET',
          validation: Joi.any(),
        },
      },
      {},
      false
    );
    if (response.status) {
      console.log(response.data);
      setAdminBroadCastMessages(response.data);
    } else {
      console.log('no data found');
    }
    setDataSearchLoading(false);
  };
  const close = () => {
    setOpen(false);
  };
  const handleModalOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      dataFetcher();
    }, 1000);
    return () => clearTimeout(delayInputTimeoutId);
  }, [search]);

  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Broadcast Message</H1>
        <I text="Search User tooltop"></I>
      </div>
      <div className="overflow-x-scroll flex justify-between items-end mb-7 mt-3">
        <div className="searchMessage flex space-x-3 justify-between items-end">
          <LabeledWrapper label="Search Title / Message">
            <BorderInput
              className="h-10 w-60"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </LabeledWrapper>
          <div
            className="hover:cursor-pointer text-[var(--primary-shade-b)] min-w-[110px] flex justify-center items-center space-x-1 mb-3"
            onClick={() => {
              if (search.length > 0) {
                setSearch('');
              }
            }}
          >
            <div>
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
                  d="M18.3337 9.99996C18.3337 14.6023 14.6027 18.3333 10.0003 18.3333C5.39795 18.3333 1.66699 14.6023 1.66699 9.99996C1.66699 5.39759 5.39795 1.66663 10.0003 1.66663C14.6027 1.66663 18.3337 5.39759 18.3337 9.99996ZM12.7993 12.7989C12.5552 13.043 12.1595 13.043 11.9154 12.7989L10.0003 10.8838L8.08524 12.7989C7.84116 13.043 7.44544 13.043 7.20136 12.7989C6.95728 12.5548 6.95728 12.1591 7.20136 11.915L9.11645 9.99991L7.20137 8.08483C6.95729 7.84075 6.95729 7.44502 7.20137 7.20095C7.44545 6.95687 7.84118 6.95687 8.08525 7.20095L10.0003 9.11602L11.9154 7.20095C12.1595 6.95688 12.5552 6.95688 12.7993 7.20095C13.0434 7.44503 13.0434 7.84076 12.7993 8.08484L10.8842 9.99991L12.7993 11.915C13.0434 12.1591 13.0434 12.5548 12.7993 12.7989Z"
                  fill="#47665A"
                />
              </svg>
            </div>
            <div className="underline underline-offset-1">Clear Filters</div>
          </div>
        </div>
        <PrimaryButton className="h-10" onClick={handleModalOpen}>
          Send a message
        </PrimaryButton>
      </div>
      <Modal
        title="Enter the message here"
        open={open}
        onCancel={close}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        width={800}
        style={{ marginTop: '-50px' }}
      >
        <BroadcastForm closeOnSubmit={close} />
      </Modal>
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
        open={timeSlotModal.open}
        title="Time Slots"
        onCancel={() => {
          setTimeSlotModal({
            open: false,
            row: null,
          });
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <div className="space-x-2 mt-[40px]">
              <PrimaryButton
                onClick={() => setTimeSlotModal({ open: false, row: null })}
              >
                Close
              </PrimaryButton>
            </div>
          </>
        )}
      >
        <div>
          {timeSlotModal.row?.scheduled_data?.length! > 0 ? (
            <div className="flex border-[1px] border-gray-200 rounded-md justify-evenly py-2 font-medium text-lg">
              <p>Time </p>
              <p>Status </p>
            </div>
          ) : (
            <p className="font-semibold">Instant Message</p>
          )}
          {timeSlotModal.row?.scheduled_data?.length! > 0 &&
            timeSlotModal?.row?.scheduled_data?.map((data, index) => {
              return (
                <div
                  key={index}
                  className="flex border-[1px] border-gray-200 rounded-md justify-evenly py-2 "
                >
                  <p>{data.time}</p>
                  <p>{data.executed ? 'Executed' : 'Pending'}</p>
                </div>
              );
            })}
        </div>
      </Modal>
      <Table
        className="rounded-md"
        style={{ fontWeight: 100 }}
        scroll={{ x: 1300 }}
        columns={columns}
        loading={dataSearchLoading}
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
        dataSource={adminMessages}
      />
    </Layout>
  );
};

export default Index;
