import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { Layout, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import Contact from './contact-form';
import Reach from './reach-us';
import { useUserStore } from '@/store/user';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { ColumnsType } from 'antd/es/table';
import { ContactUsData, useContactUsStore } from '@/store/tools/contactus';
import { SelectStyled } from '@/components/inputs/select';
import Toast from '@/utils/common/toast';
import Joi from 'joi';

const Index = () => {
  const { user, setUser } = useUserStore();
  const {
    contactUsData,
    loading,
    pagination,
    refreshCount,
    setContactUsData,
    setLoading,
    setPagination,
    setRefreshCount,
  } = useContactUsStore();
  const { apiCall } = useFetch();

  const [contactStatus, setContactStatus] = useState('All');

  const dataFetcher = async () => {
    let res = await apiCall(
      {
        url: `${Routes.CONTACT_US.GET_CONTACT_LIST.url}?status=${contactStatus}`,
        method: {
          type: 'GET',
          validation: Joi.any(),
        },
      },
      {},
      false
    );
    if (res.status) {
      setContactUsData(res.data);
    } else {
      return;
    }
  };

  const handleStatusUpdate = async (id: number, statusToUpdate: string) => {
    const toast = new Toast('Updating Status..');
    let res = await apiCall(Routes.CONTACT_US.CHANGE_STATUS, {
      id: id,
      status: statusToUpdate,
    });
    if (res.status) {
      toast.success('Status updated');
      setContactUsData(
        contactUsData.map((c) => {
          if (c.id === id) {
            return { ...c, status: statusToUpdate };
          }
          return c;
        })
      );
    }
  };

  let columns: ColumnsType<ContactUsData> = [
    {
      title: <p className="px-2">Id</p>,
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.id}</p>,
    },
    {
      title: <p className="px-2">Name</p>,
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.name}</p>,
    },
    {
      title: <p className="px-2">email</p>,
      dataIndex: 'email',
      key: 'email',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.email}</p>,
    },
    {
      title: <p className="px-2">Subject</p>,
      dataIndex: 'subject',
      key: 'subject',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.subject}</p>,
    },
    {
      title: <p className="px-2">message</p>,
      dataIndex: 'message',
      key: 'message',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.message}</p>,
    },
    {
      title: <p className="px-2">phone</p>,
      dataIndex: 'phone',
      key: 'phone',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.phone}</p>,
    },
    {
      title: <p className="px-2">Status</p>,
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      width: 10,
      render: (data, row) => (
        <p
          className={`px-2 ${row.status === 'Pending' && 'text-orange-500'} ${row.status === 'Resolved' && 'text-green-500'} ${row.status === 'Rejected' && 'text-red-500'}`}
        >
          {row.status}
        </p>
      ),
    },
    {
      title: <p className="px-2">Update Status</p>,
      dataIndex: 'updateStatus',
      key: 'updateStatus',
      align: 'left',
      width: 10,
      render: (data, row) => (
        <>
          <SelectStyled
            onChange={(e) => {
              handleStatusUpdate(row.id, e.target.value);
            }}
            value={row.status === 'Pending' ? '' : row.status}
          >
            <option value="" disabled defaultChecked>
              -Select Status-
            </option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </SelectStyled>
        </>
      ),
    },
  ];

  useEffect(() => {
    dataFetcher();
  }, [refreshCount, contactStatus]);
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Connect With Us</H1>
        <I text="Search User tooltop"></I>
      </div>
      {user?.userType.constant === 'Client' && (
        <div
          className={` ${'w-[100%'} mb-4 overflow-x-scroll py-[2px] pl-[2px] flex `}
        >
          <p className="md:flex md:flex-col">
            We would love to respond to your queries and help you succeed.{' '}
            <span>Feel free to get in touch with us.</span>
          </p>
        </div>
      )}

      {user?.userType.constant === 'Client' ? (
        <div className="flex flex-col md:flex-row w-[100%]">
          <div className="md:w-[68%]">
            <Contact />
          </div>
          <div className="md:w-[30%]">
            <Reach />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-2  justify-end my-2">
            <span className="text-[var(--primary-shade-a)]">Status</span>
            <SelectStyled
              value={contactStatus}
              onChange={(e) => {
                setContactStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </SelectStyled>
            <div
              className="hover:cursor-pointer text-[var(--primary-shade-b)] min-w-[110px] flex justify-center items-center space-x-1 "
              onClick={() => {
                setContactStatus('');
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
          <Table
            loading={loading}
            className="rounded-md"
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
            dataSource={contactUsData}
          />
        </>
      )}
    </Layout>
  );
};

export default Index;
