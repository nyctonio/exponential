'use client';
import useFetch from '@/hooks/useFetch';
import { SearchedUser, userSearchUserStore } from '@/store/admin/searchuser';
import Routes from '@/utils/routes';
import { UnorderedListOutlined } from '@ant-design/icons';
import { Button, Dropdown, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/store/user';
import { ToggleAntd } from '@/components/inputs/toggle';
import TimeHandler from '@/utils/common/timeHandler';
import Toast from '@/utils/common/toast';
import { useUserCreateStore } from '@/store/create-update-user';
import { useRouter } from 'next/navigation';
import useParentFetch from '../create-update-client/useParentFetch';
import Joi from 'joi';

function Index() {
  const {
    incRefresh,
    pagination,
    refreshCount,
    setPagination,
    setSort,
    setUpline,
    setUserType,
    setUsername,
    setUsers,
    sort,
    upline,
    userType,
    username,
    users,
    setLoading,
    loading,
    setStoreEmpty,
    storeEmpty,
    brokersData,
    setBrokersData,
    setSubBrokersData,
    subBrokersData,
    modalStatus,
    setModalStatus,
    setConstants,
    constants,
  } = userSearchUserStore();

  const { setUpdatedUser } = useUserCreateStore();
  const { fetchData, setUserDetails } = useParentFetch();

  const { apiCall } = useFetch();

  const actionsHandler = (userId: number) => {
    return [
      {
        key: '1',
        label: (
          <button
            onClick={() => {
              setModalStatus({
                loginHistory: false,
                updateStatus: true,
                password: false,
                userId: userId,
                transaction: false,
                penalty: false,
              });
            }}
          >
            Update Status
          </button>
        ),
      },
      {
        key: '2',
        label: (
          <button
            onClick={() => {
              setModalStatus({
                loginHistory: false,
                updateStatus: false,
                password: true,
                userId: userId,
                transaction: false,
                penalty: false,
              });
            }}
          >
            Update Password
          </button>
        ),
      },
      {
        key: '3',
        label: (
          <button
            onClick={() => {
              setModalStatus({
                loginHistory: true,
                updateStatus: false,
                password: false,
                userId: userId,
                transaction: false,
                penalty: false,
              });
            }}
          >
            Login History
          </button>
        ),
      },
      {
        key: '4',
        label: (
          <button
            onClick={() => {
              setModalStatus({
                loginHistory: false,
                updateStatus: false,
                password: false,
                userId: userId,
                transaction: false,
                penalty: true,
              });
            }}
          >
            Penalty
          </button>
        ),
      },
    ];
  };

  const [updateLoading, setUpdateLoading] = useState({
    onlySquareOff: false,
    smSquareOff: false,
    m2mSquareOff: false,
  });

  const onlySquareOffHandler = async (userId: number, value: boolean) => {
    setUpdateLoading({ ...updateLoading, onlySquareOff: true });
    let toast = new Toast(
      value == true ? 'Enabling Only Square Off' : 'Disabling Only Square Off'
    );
    let res = await apiCall(
      {
        url: `${Routes.UPDATE_USER_ONLY_SQUARE_OFF.url}/${userId}`,
        method: Routes.UPDATE_USER_ONLY_SQUARE_OFF.method,
      },
      { userId, onlySquareOff: value },
      false
    );

    if (res.status == true) {
      toast.success(
        value == true ? 'Enabled Only Square Off' : 'Disabled Only Square Off'
      );
      setUsers(
        users.map((a) => {
          if (a.id == userId) {
            return { ...a, onlySquareOff: value };
          }
          return a;
        })
      );
    } else {
      toast.error(res.message);
    }
    setUpdateLoading({ ...updateLoading, onlySquareOff: false });

    return;
  };

  const smSquareOffHandler = async (userId: number, value: boolean) => {
    setUpdateLoading({ ...updateLoading, smSquareOff: true });
    let toast = new Toast(
      value == true
        ? 'Enabling Short Margin Square Off'
        : 'Disabling Short Margin Square Off'
    );
    let res = await apiCall(
      {
        url: `${Routes.UPDATE_USER_SM_OFF.url}/${userId}`,
        method: Routes.UPDATE_USER_SM_OFF.method,
      },
      { userId, smSquareOff: value },
      false
    );

    if (res.status == true) {
      toast.success(
        value == true
          ? 'Enabled Short Margin Square Off'
          : 'Disabled Short Margin Square Off'
      );
      setUsers(
        users.map((a) => {
          if (a.id == userId) {
            return { ...a, smSquareOff: value };
          }
          return a;
        })
      );
    } else {
      toast.error(res.message);
    }
    setUpdateLoading({ ...updateLoading, smSquareOff: false });
    return;
  };

  const m2mSquareOffHandler = async (userId: number, value: boolean) => {
    setUpdateLoading({ ...updateLoading, m2mSquareOff: false });
    let toast = new Toast(
      value == true ? 'Enabling M2M Square Off' : 'Disabling M2M Square Off'
    );
    let res = await apiCall(
      {
        url: `${Routes.UPDATE_USER_M2M_OFF.url}/${userId}`,
        method: Routes.UPDATE_USER_M2M_OFF.method,
      },
      { userId, m2mSquareOff: value },
      false
    );

    if (res.status == true) {
      toast.success(
        value == true ? 'Enabled M2M Square Off' : 'Disabled M2M Square Off'
      );
      setUsers(
        users.map((a) => {
          if (a.id == userId) {
            return { ...a, m2mSquareOff: value };
          }
          return a;
        })
      );
    } else {
      toast.error(res.message);
    }
    setUpdateLoading({ ...updateLoading, m2mSquareOff: false });

    return;
  };

  const { user } = useUserStore();
  const router = useRouter();

  const columns: ColumnsType<SearchedUser> = [
    {
      title: () => (
        <div className="flex flex-row justify-start leading-none px-2">
          User Name
        </div>
      ),
      dataIndex: 'username',
      key: 'username',
      fixed: 'left',
      align: 'left',
      render: (data, row) => {
        return (
          <div
            className={`flex flex-row ${
              row.userStatus.prjSettConstant == 'Active'
                ? 'cursor-pointer'
                : 'cursor-not-allowed'
            } justify-start px-2`}
            onClick={async () => {
              if (row.userStatus.prjSettConstant == 'Active') {
                let toast = new Toast('Fetching Records!!!');
                const parentUserId = await apiCall(
                  {
                    url: `${Routes.GET_PARENT_USERID.url}?userId=${row.id}`,
                    method: {
                      type: 'GET',
                      validation: Joi.any(),
                    },
                  },
                  {},
                  false
                );
                if (parentUserId.status == false) {
                  new Toast(parentUserId.message).error(parentUserId.message);
                  return;
                }
                // fetching parent data
                await fetchData(parentUserId.data, false);
                // setting user details
                await setUserDetails(row.id);
                setUpdatedUser({
                  username: row.username,
                  id: row.id,
                  type: 'update',
                });
                toast.success('Redirecting!!!');
                router.push('/admin/create-update-client?edit=true');
              }
            }}
          >
            <div
              className={`${
                row.userStatus.prjSettConstant == 'Active'
                  ? 'text-blue-600'
                  : 'text-red-600'
              } underline `}
            >
              {data}
            </div>
          </div>
        );
      },
      sorter: true,
      showSorterTooltip: false,
    },
    {
      title: () => (
        <div className="flex flex-row justify-start leading-none">
          User Type
        </div>
      ),
      dataIndex: 'userType',
      key: 'userType',
      //   width: '3.5%',
      align: 'left',

      sorter: true,
      showSorterTooltip: false,
      render: (data, row) => <>{row.userType.prjSettDisplayName}</>,
    },
    {
      title: 'Upline',
      dataIndex: 'createdByUser',
      key: 'upline',
      //   width: '0.1%',
      align: 'left',
      sorter: true,
      showSorterTooltip: false,
      render: (data) => <>{data.username}</>,
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      //   width: '5%',
      align: 'left',
      sorter: true,
      ellipsis: true,
      showSorterTooltip: false,
      render: (item, row) => (
        <>{row.firstName + ' ' + (row.lastName == null ? '' : row.lastName)}</>
      ),
    },
    {
      title: () => (
        <Tooltip title="Short Margin Square Off" arrow={true}>
          <div className="flex flex-row justify-center leading-none">
            SM Square Off
          </div>
        </Tooltip>
      ),
      dataIndex: 'smSquareOff',
      key: 'smSquareOff',
      //   width: '4%',
      align: 'center',
      render: (data, row) => {
        return (
          <ToggleAntd
            checked={row.smSquareOff}
            onChange={(checked, e) => {
              smSquareOffHandler(row.id, checked);
            }}
            loading={updateLoading.smSquareOff}
            key={`smsquareoff-${row.id}`}
          />
        );
      },
    },
    {
      title: () => (
        <div className="flex flex-row justify-center leading-none">
          M2M Square Off
        </div>
      ),
      dataIndex: 'm2mSquareOff',
      key: 'm2mSqaureOff',
      //   width: '4%',
      align: 'center',
      render: (data, row) => {
        return (
          <ToggleAntd
            checked={row.m2mSquareOff}
            onChange={(checked, e) => {
              m2mSquareOffHandler(row.id, checked);
            }}
            loading={updateLoading.m2mSquareOff}
            key={`m2msquareoff-${row.id}`}
          />
        );
      },
    },

    {
      title: () => (
        <div className="flex flex-row justify-center leading-none">
          Only Square Off
        </div>
      ),
      dataIndex: 'onlySquareOff',
      key: 'only-square-off',
      //   width: '4%',
      align: 'center',
      render: (data, row) => {
        return (
          <ToggleAntd
            checked={row.onlySquareOff}
            onChange={(checked, e) => {
              onlySquareOffHandler(row.id, checked);
            }}
            loading={updateLoading.onlySquareOff}
            key={`onlysquareoff-${row.id}`}
          />
        );
      },
    },

    {
      title: 'Status',
      dataIndex: 'userStatus',
      key: 'userStatus',
      //   width: '0.01%',
      align: 'left',
      render: (data, row) => <>{row.userStatus.prjSettDisplayName}</>,
      //   sorter: true,
    },

    {
      title: 'Opening Balance',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      //   width: '0.01%',
      align: 'left',
      render: (row, data) => <>{data.openingBalance}</>,
      //   sorter: true,
    },
    {
      title: () => {
        return (
          <div className="flex flex-row justify-start leading-none">
            Date Added
          </div>
        );
      },
      dataIndex: 'createdAt',
      key: 'createdDate',
      sorter: true,
      showSorterTooltip: false,
      //   width: '6%',
      align: 'left',
      //   sorter: true,
      render: (data) => {
        return <>{TimeHandler.dateHandler(data)}</>;
      },
    },
    {
      title: () => <div className="px-2">Actions</div>,
      dataIndex: 'id',
      key: 'id',
      showSorterTooltip: false,
      //   width: '2%',
      align: 'center',

      //   sorter: true,
      render: (data, row) => {
        return (
          <div className="flex flex-row items-center justify-center space-x-6 px-2">
            <div className="left flex flex-row items-center justify-start space-x-2">
              {/* <WalletFilled /> */}
              {/* icon 1 */}
              <div
                className={`${
                  row.userStatus.prjSettConstant == 'Active'
                    ? 'hover:cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                onClick={() => {
                  if (row.userStatus.prjSettConstant == 'Active') {
                    setModalStatus({
                      ...modalStatus,
                      userId: row.id,
                      transaction: true,
                    });
                  }
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.3334 0.666656C15.5426 0.666656 17.3334 2.45752 17.3334 4.66666V9.66666C17.3334 10.2189 16.8857 10.6667 16.3334 10.6667H14.6667C12.4576 10.6667 10.6667 12.4575 10.6667 14.6667C10.6667 15.2189 10.219 15.6667 9.66675 15.6667H4.66675C2.45761 15.6667 0.666748 13.8758 0.666748 11.6667V11.0833H4.00008C5.61091 11.0833 6.91675 9.77749 6.91675 8.16666C6.91675 6.55583 5.61091 5.24999 4.00008 5.24999H0.666748V4.66666C0.666748 2.45752 2.45761 0.666656 4.66675 0.666656H13.3334ZM5.66675 8.16666C5.66675 7.24618 4.92056 6.49999 4.00008 6.49999H0.666748V9.83332H4.00008C4.92056 9.83332 5.66675 9.08713 5.66675 8.16666ZM13.6087 14.0968L14.2084 13.497V16.5C14.2084 16.8452 14.4882 17.125 14.8334 17.125C15.1786 17.125 15.4584 16.8452 15.4584 16.5V13.497L16.0581 14.0968C16.3022 14.3408 16.6979 14.3408 16.942 14.0968C17.1861 13.8527 17.1861 13.4569 16.942 13.2129L15.8646 12.1355C15.2951 11.5659 14.3717 11.5659 13.8022 12.1355L12.7248 13.2129C12.4807 13.4569 12.4807 13.8527 12.7248 14.0968C12.9689 14.3408 13.3646 14.3408 13.6087 14.0968Z"
                    fill="#757575"
                  />
                </svg>
              </div>
            </div>

            {/* triple dot dropdown */}
            <Dropdown
              menu={{ items: actionsHandler(row.id) }}
              className="cursor-pointer hover:text-[var(--primary-shade-a)]"
              placement="bottomLeft"
              arrow
              trigger={['click']}
            >
              <UnorderedListOutlined />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const dataFetcher = async () => {
    setLoading(true);
    let data = await apiCall(Routes.ADMIN.SEARCH_USER, {
      username,
      userType,
      upline,
      pageSize: pagination.pageSize,
      pageNumber: pagination.pageNumber,
      sort,
    });

    if (data.status == true) {
      setUsers(data.data.users);
      setPagination({ ...pagination, total: data.data.count });
    }
    setLoading(false);
    return;
  };

  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    console.log('in use effect');
    if (storeEmpty || firstLoad == false) {
      console.log('running 1');
      dataFetcher();
      setStoreEmpty(false);
    }
    if (firstLoad) {
      console.log('running 2');
      setFirstLoad(false);
    }
  }, [refreshCount]);

  console.log(refreshCount, 'fgfg');

  const constantDataFetcher = async () => {
    let data = await apiCall(Routes.TOOLS.GET_APP_SETTINGS_BY_KEY, {
      keys: ['USRTYP', 'USRSTAT'],
    });

    if (data.status == true) {
      setConstants({
        userStatus: data.data.filter((a: any) => a.prjSettKey == 'USRSTAT'),
        userType: data.data.filter((a: any) => a.prjSettKey == 'USRTYP'),
      });
    }
    return;
  };

  useEffect(() => {
    if (storeEmpty) {
      constantDataFetcher();
    }
  }, []);

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
      incRefresh();
    }
  };

  return (
    <Table
      loading={loading}
      rowClassName={(record, index) =>
        index % 2 === 0 ? 'bg-[var(--light)]' : 'bg-[var(--primary-shade-d)]'
      }
      pagination={{
        size: 'small',
        pageSize: 12,
      }}
      rowKey={() => Math.random().toString(36).slice(2, 7)}
      // className="rounded-lg"
      scroll={{ x: 1150 }}
      dataSource={users}
      columns={columns}
      onChange={onTableChange}
    />
  );
}

export default Index;
