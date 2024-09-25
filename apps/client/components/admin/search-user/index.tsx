'use client';
import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { BorderInput, TextInput } from '@/components/inputs/text';
import { AsyncButtonAntd, PrimaryButton } from '@/components/inputs/button';
import { userSearchUserStore } from '@/store/admin/searchuser';
import SearchUserTable from '@/components/admin/search-user/search-user-table';
import PasswordChangeModal from '@/components/admin/search-user/change-password';
import UpdateStatusModal from '@/components/admin/search-user/update-user-status';
import PenaltyModal from '@/components/admin/search-user/penalty';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import TransactionModal from '@/components/admin/search-user/transaction-modal';
import LoginHistory from '@/components/admin/search-user/login-history';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import {
  SelectAntd,
  SelectAntdBorder,
  SelectStyled,
} from '@/components/inputs/select';
import { useUserStore } from '@/store/user';
import Link from 'next/link';

const Index = () => {
  const {
    username,
    userType,
    setUserType,
    setUsername,
    incRefresh,
    loading,
    setLoading,
    upline,
    pagination,
    sort,
    setUsers,
    setPagination,
  } = userSearchUserStore();
  const { user } = useUserStore();

  const { apiCall } = useFetch();

  const [userTypeDropdownOptions, setUserTypeDropdownOptions] = useState<
    {
      value: string;
      label: string;
      disabled?: any;
    }[]
  >([]);
  const [userTypeLoading, setUserTypeLoading] = useState(false);
  const userTypeFetcher = async () => {
    setUserTypeDropdownOptions([]);
    setUserTypeLoading(true);
    let response = await apiCall(Routes.GET_PROJECT_SETTINGS_BY_KEY, {
      keys: ['USRTYP'],
    });
    if (response.status) {
      let master = response.data.find(
        (a: any) => a.prjSettConstant == 'Master'
      );
      let broker = response.data.find(
        (a: any) => a.prjSettConstant == 'Broker'
      );
      let subBroker = response.data.find(
        (a: any) => a.prjSettConstant == 'Sub-Broker'
      );
      let client = response.data.find(
        (a: any) => a.prjSettConstant == 'Client'
      );

      switch (user?.userType.constant) {
        case 'Company':
          setUserTypeDropdownOptions([
            {
              label: 'All',
              value: 'all',
            },
            {
              label: master.prjSettDisplayName,
              value: master.prjSettConstant,
            },
            { label: broker.prjSettDisplayName, value: broker.prjSettConstant },
            {
              label: subBroker.prjSettDisplayName,
              value: subBroker.prjSettConstant,
            },
            { label: client.prjSettDisplayName, value: client.prjSettConstant },
          ]);
          break;

        case 'Master':
          setUserTypeDropdownOptions([
            {
              label: 'All',
              value: 'all',
            },
            { label: broker.prjSettDisplayName, value: broker.prjSettConstant },
            {
              label: subBroker.prjSettDisplayName,
              value: subBroker.prjSettConstant,
            },
            { label: client.prjSettDisplayName, value: client.prjSettConstant },
          ]);
          break;

        case 'Broker':
          setUserTypeDropdownOptions([
            {
              label: 'All',
              value: 'all',
            },
            {
              label: subBroker.prjSettDisplayName,
              value: subBroker.prjSettConstant,
            },
            { label: client.prjSettDisplayName, value: client.prjSettConstant },
          ]);
          break;

        case 'Sub-Broker':
          setUserTypeDropdownOptions([
            {
              label: 'All',
              value: 'all',
            },
            { label: client.prjSettDisplayName, value: client.prjSettConstant },
          ]);
          break;
      }

      // console.log('user type dropdown ', userTypeDropdownOptions);
    }
    setUserTypeLoading(false);
    return;
  };

  const [debouncedInputValue, setDebouncedInputValue] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedInputValue(username);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [username, 500]);

  useEffect(() => {
    setPagination({ ...pagination, pageNumber: 1, pageSize: 15 });
    incRefresh();
  }, [debouncedInputValue]);

  useEffect(() => {
    userTypeFetcher();
  }, []);
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Search User</H1>
        {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
        <I text="Search User tooltip" />
      </div>
      <div className="mb-4 hidden overflow-x-scroll py-[2px] pl-[2px] md:flex justify-between">
        <div className="flex space-x-3 flex-row justify-between items-center">
          <BorderInput
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            placeholder="Search User"
            className="h-[40px] !flex-[0.7] !min-w-3/5"
          />
          <SelectStyled
            onChange={(e) => {
              setPagination({ ...pagination, pageNumber: 1, pageSize: 15 });
              setUserType(e.target.value);
              incRefresh();
            }}
            className="md:!w-[117px] !flex-[0.3]  h-[40px] bg-white"
            value={userType}
          >
            {userTypeDropdownOptions.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>

          <div
            onClick={() => {
              if (username.length > 0) {
                setPagination({ ...pagination, pageNumber: 1 });
                setUsername('');
                setUserType('all');
              } else {
                setPagination({ ...pagination, pageNumber: 1 });
                setUserType('all');
                incRefresh();
              }
            }}
            className="hover:cursor-pointer text-[var(--primary-shade-b)] min-w-[110px] flex justify-center items-center space-x-1"
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
        <div className="flex h-space-x-4">
          <Link href={'/admin/create-update-client'}>
            <PrimaryButton>Create User</PrimaryButton>
          </Link>
        </div>
      </div>

      <div className="mb-4 overflow-x-scroll py-[2px] pl-[2px] flex flex-col justify-center space-y-2 md:hidden">
        <div className="flex space-x-3 items-center w-full">
          <BorderInput
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            placeholder="Search User"
            className="h-[40px] w-full"
          />
          <SelectStyled
            onChange={(e) => {
              setPagination({ ...pagination, pageNumber: 1, pageSize: 15 });
              setUserType(e.target.value);
              incRefresh();
            }}
            className="md:!w-[117px] !w-[45%] h-[40px] bg-white"
            value={userType}
          >
            {userTypeDropdownOptions.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>
        </div>
        <div
          onClick={() => {
            if (username.length > 0) {
              setPagination({ ...pagination, pageNumber: 1 });
              setUsername('');
              setUserType('all');
            } else {
              setPagination({ ...pagination, pageNumber: 1 });
              setUserType('all');
              incRefresh();
            }
          }}
          className="hover:cursor-pointer flex h-space-x-4 w-full justify-between"
        >
          <div className="text-[var(--primary-shade-b)] min-w-[90px] flex justify-center items-center space-x-1">
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
          <Link href={'/admin/create-update-client'}>
            <PrimaryButton>Create User</PrimaryButton>
          </Link>
        </div>
      </div>

      <SearchUserTable />

      {/* modals */}
      <PasswordChangeModal />
      <UpdateStatusModal />
      <TransactionModal />
      <LoginHistory />
      <PenaltyModal />
    </Layout>
  );
};

export default Index;
