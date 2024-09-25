import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { SelectStyled } from '@/components/inputs/select';
import { LabeledWrapper } from '@/components/inputs/text';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { useSettelmentIndexes } from '@/store/reports/settelmentIndexes';
import {
  SettelmentLogsType,
  useSettelmentLogs,
} from '@/store/reports/settelmentLogs';
import { useUserStore } from '@/store/user';
import TimeHandler from '@/utils/common/timeHandler';
import Routes from '@/utils/routes';
import { Card, Empty, Layout, Select, Spin, Statistic } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import Joi from 'joi';
import moment from 'moment';
import { useEffect, useState } from 'react';

const Index = () => {
  const { user } = useUserStore();
  const { apiCall } = useFetch();
  const { settlementIndexes, setSettelmentIndexes } = useSettelmentIndexes();
  const {
    loading,
    setLoading,
    pagination,
    setPagination,
    settlementLogs,
    setSettelmentLogs,
    refreshCount,
    setRefreshCount,
  } = useSettelmentLogs();
  const [username, setUsername] = useState('');

  const timePeriodOptions: { label: string; value: string }[] = [
    { label: 'This Week', value: 'this' },
    { label: 'Last Week', value: 'prev' },
  ];
  const [tileSelected, setTileSelected] = useState<string>(
    'Brokerage Collected'
  );

  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [associatedUsers, setAssociatedUsers] = useState<
    {
      label: string;
      value: number;
      userType: string;
    }[]
  >([]);

  const [userDetail, setUserDetail] = useState<{
    userId: number | null;
    period: string;
  }>({
    userId: user?.id || null,
    period: 'this',
  });

  const associatedUserFetcher = async () => {
    setUserSearchLoading(true);
    let res = await apiCall(
      {
        url: `${Routes.GET_ASSOCIATED_USERS.url}?username=${username}`,
        method: {
          type: 'GET',
          validation: Joi.any(),
        },
      },
      {}
    );
    if (res.status == true) {
      setAssociatedUsers(
        res.data.map((item: any) => {
          return {
            label: item.username,
            value: item.id,
            userType: item.userType,
          };
        })
      );
    }
    setUserSearchLoading(false);
  };

  const getSettlementIndexes = async () => {
    let res = await apiCall(
      Routes.USER.GET_SETTLEMENT_INDEXES,
      userDetail,
      false
    );
    if (res.status == true) {
      console.log(res.data, 'here=>>>>>>>>>.');
      setSettelmentIndexes(res.data);
    }
  };

  const getSettlementLogs = async () => {
    setLoading(true);
    setPagination({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    let res = await apiCall(
      Routes.USER.GET_SETTLEMENT_LOGS,
      { ...userDetail, pageNumber: pagination.pageNumber },
      false
    );
    if (res.status) {
      console.log(res.data, 'logss are here==>>>');
      let data = res.data;
      setSettelmentLogs(data.data);
      setPagination({
        ...pagination,
        total: res.data.count,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      associatedUserFetcher();
    }, 1000);
    return () => clearTimeout(delayInputTimeoutId);
  }, [username]);

  useEffect(() => {
    getSettlementIndexes();
    setTileSelected('Brokerage Collected');
  }, [userDetail]);

  useEffect(() => {
    getSettlementLogs();
  }, [userDetail, refreshCount]);

  let columns: ColumnsType<SettelmentLogsType> = [
    {
      title: <p className="px-2">Username</p>,
      dataIndex: 'username',
      key: 'username',
      align: 'left',
      width: 10,
      render: (data, row) => (
        <p
          className="px-2 underline text-blue-400 underline-offset-1 cursor-pointer"
          onClick={() => {
            setUserDetail({ ...userDetail, userId: row.userId });
            setUsername(row.username);
          }}
        >
          {row.username}
        </p>
      ),
    },

    {
      title: <p className="px-2">Upline</p>,
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 10,
      render: (data, row) => <p className="px-2">{row.upline}</p>,
    },

    {
      title: <p className="px-2">User Type</p>,
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 10,
      render: (data, row) => <p className="px-2">{row.userType}</p>,
    },
    {
      title: <p className="px-2">Amount</p>,
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 10,
      render: (data, row) => (
        <p className="px-2">
          {user?.userType.constant == 'Company'
            ? row.companyAmount
            : user?.userType.constant == 'Master'
              ? row.masterAmount
              : user?.userType.constant == 'Broker'
                ? row.brokerAmount
                : user?.userType.constant == 'Sub-Broker'
                  ? row.brokerAmount
                  : row.totalAmount}
        </p>
      ),
    },
    {
      title: <p className="px-2">Type</p>,
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 10,
      render: (data, row) => (
        <p className="px-2">{row.transactionParticular}</p>
      ),
    },
    {
      title: <p className="px-2">Start Date</p>,
      dataIndex: 'startDate',
      key: 'startDate',
      align: 'center',
      width: 10,
      render: (data, row) => (
        <p className="px-2">{TimeHandler.dateHandler(row.startDate)}</p>
      ),
    },
    {
      title: <p className="px-2">End Date</p>,
      dataIndex: 'endDate',
      key: 'endDate',
      align: 'center',
      width: 10,
      render: (data, row) => (
        <p className="px-2">{TimeHandler.dateHandler(row.endDate)}</p>
      ),
    },
  ];

  const filterOption = (
    input: string,
    option: { label: string; value: number }
  ) => {
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  };

  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Settelment Report</H1>
        <I text="Search User tooltop"></I>
      </div>

      <div className="flex w-fit items-end space-x-5">
        <LabeledWrapper label="Username" required>
          <Select
            className={
              'rounded-[4px] w-40 !py-[0.26rem] leading-8 border-[1.2px]  !border-[#D8DAE5] !bg-white !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)] h-10'
            }
            size="middle"
            loading={userSearchLoading}
            bordered={false}
            style={{ borderColor: '#D8DAE5', boxShadow: 'none' }}
            placeholder="Select User"
            onChange={(value) => {
              setUserDetail({
                ...userDetail,
                userId: Number(value),
              });
              const _username =
                associatedUsers.find((item) => item.value === Number(value))
                  ?.label ?? '';
              setUsername(_username);
              setPagination({
                ...pagination,
                pageNumber: 1,
              });
            }}
            value={username}
            onSearch={(value) => {
              setUsername(value);
            }}
            // @ts-ignore
            filterOption={filterOption}
            showSearch={true}
            notFoundContent={
              userSearchLoading == false ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div className="flex flex-row items-center justify-center py-14">
                  <Spin size="small" tip="Searching..."></Spin>
                </div>
              )
            }
            options={associatedUsers}
          />
        </LabeledWrapper>
        <LabeledWrapper label="Time Period">
          <SelectStyled
            className="h-[40px] bg-white w-32"
            onChange={(e) => {
              setUserDetail({
                ...userDetail,
                period: e.target.value,
              });
            }}
            value={userDetail.period}
          >
            {timePeriodOptions.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>
        </LabeledWrapper>

        <div
          className="hover:cursor-pointer text-[var(--primary-shade-b)] min-w-[110px] flex justify-center items-center space-x-1 mb-3"
          onClick={() => {
            setUsername('');
            setUserDetail({
              period: 'this',
              userId: null,
            });
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

      <div className="flex space-x-5 gap-2 mt-4">
        <Card
          bordered={false}
          className={`cursor-pointer h-fit w-60 ${tileSelected === 'Brokerage Collected' ? 'border-[1px] border-[#3f8600]' : ''}`}
          onClick={() => setTileSelected('Brokerage Collected')}
        >
          <Statistic
            title="Brokerage Collected"
            value={
              settlementIndexes.find(
                (a) => a.transactionParticular == 'Brokerage Collected'
              ) &&
              settlementIndexes.find(
                (a) => a.transactionParticular == 'Brokerage Collected'
              )![
                user?.userType.constant == 'Company'
                  ? 'companyAmount'
                  : user?.userType.constant == 'Master'
                    ? 'masterAmount'
                    : user?.userType.constant == 'Broker'
                      ? 'brokerAmount'
                      : user?.userType.constant == 'Sub-Broker'
                        ? 'subBrokerAmount'
                        : 'totalAmount'
              ]
            }
            precision={2}
            valueStyle={{
              color: '#3f8600',
              // : '#cf1322'}`,
              fontSize: '20px',
            }}
          />
        </Card>
        <Card
          bordered={false}
          className={`cursor-pointer h-fit w-60 ${tileSelected === 'Trade Profit' ? 'border-[1px] border-[#3f8600]' : ''}`}
          onClick={() => setTileSelected('Trade Profit')}
        >
          <Statistic
            title="Profit Received"
            value={
              settlementIndexes.find(
                (a) => a.transactionParticular == 'Trade Profit'
              ) &&
              settlementIndexes.find(
                (a) => a.transactionParticular == 'Trade Profit'
              )![
                user?.userType.constant == 'Company'
                  ? 'companyAmount'
                  : user?.userType.constant == 'Master'
                    ? 'masterAmount'
                    : user?.userType.constant == 'Broker'
                      ? 'brokerAmount'
                      : user?.userType.constant == 'Sub-Broker'
                        ? 'subBrokerAmount'
                        : 'totalAmount'
              ]
            }
            precision={2}
            valueStyle={{
              color: '#3f8600',
              fontSize: '20px',
            }}
          />
        </Card>
        <Card
          bordered={false}
          className={`cursor-pointer h-fit w-60 ${tileSelected === 'Trade Loss' ? 'border-[1px] border-[#cf1322]' : ''}`}
          onClick={() => setTileSelected('Trade Loss')}
        >
          <Statistic
            title="Loss Received"
            value={
              settlementIndexes.find(
                (a) => a.transactionParticular == 'Trade Loss'
              ) &&
              settlementIndexes.find(
                (a) => a.transactionParticular == 'Trade Loss'
              )![
                user?.userType.constant == 'Company'
                  ? 'companyAmount'
                  : user?.userType.constant == 'Master'
                    ? 'masterAmount'
                    : user?.userType.constant == 'Broker'
                      ? 'brokerAmount'
                      : user?.userType.constant == 'Sub-Broker'
                        ? 'subBrokerAmount'
                        : 'totalAmount'
              ]
            }
            precision={2}
            valueStyle={{
              color: '#cf1322',
              fontSize: '20px',
            }}
          />
        </Card>
      </div>

      <Table
        loading={loading}
        className="text-xs mt-10 "
        style={{
          fontSize: '10px',
        }}
        columns={columns}
        dataSource={settlementLogs.filter(
          (a: any) => a.transactionParticular == tileSelected
        )}
        pagination={{
          size: 'small',
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              pageNumber: page,
            });
            setRefreshCount(refreshCount + 1);
          },
        }}
        scroll={{ y: 800 }}
      />
    </Layout>
  );
};

export default Index;
