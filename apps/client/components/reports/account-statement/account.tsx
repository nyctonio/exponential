import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { useStatement } from '@/store/user/statement';
import Routes from '@/utils/routes';
import { Tooltip } from 'antd';
import { useEffect } from 'react';
import { Card, Statistic } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useUserStore } from '@/store/user';

const AccountStatement = () => {
  const { apiCall } = useFetch();
  const { statementData, setStatementData } = useStatement();

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await apiCall(Routes.USER.GET_STATEMENT, {}, false);
      if (data.status == true) {
        setStatementData(data.data);
      }
    }, 4000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="w-full h-full px-4 ">
      <div className="flex items-center space-x-2">
        <H1>Account Statement</H1>
        <Tooltip placement="top" title={'This is tooltip'}>
          <I text=""></I>
        </Tooltip>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5  place-items-center gap-2 mt-4">
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="Opening Balance"
              value={statementData.openingBalance.toFixed(2)}
              precision={2}
              valueStyle={{
                color: `${
                  statementData.openingBalance >= 0 ? '#3f8600' : '#cf1322'
                }`,
                fontSize: '20px',
              }}
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="Normal Unrealised P/L"
              value={statementData.normalUnrealizedPL.toFixed(2)}
              precision={2}
              valueStyle={{
                color: `${
                  statementData.normalUnrealizedPL > 0 ? '#3f8600' : '#cf1322'
                }`,
                fontSize: '20px',
              }}
              prefix={
                statementData.normalUnrealizedPL != 0 ? (
                  statementData.normalUnrealizedPL > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                ) : (
                  ''
                )
              }
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="Intraday Unrealised P/L"
              value={statementData.intradayUnrealizedPL.toFixed(2)}
              precision={2}
              valueStyle={{
                color: `${
                  statementData.intradayUnrealizedPL > 0 ? '#3f8600' : '#cf1322'
                }`,
                fontSize: '20px',
              }}
              prefix={
                statementData.intradayUnrealizedPL != 0 ? (
                  statementData.intradayUnrealizedPL > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                ) : (
                  ''
                )
              }
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="Realised P/L"
              value={statementData.realizedPL.toFixed(2)}
              precision={2}
              valueStyle={{
                color: `${
                  statementData.realizedPL > 0 ? '#3f8600' : '#cf1322'
                }`,
                fontSize: '20px',
              }}
              prefix={
                statementData.realizedPL != 0 ? (
                  statementData.realizedPL > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                ) : (
                  ''
                )
              }
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="Margin Available"
              value={statementData.marginAvailable.toFixed(2)}
              precision={2}
              valueStyle={{
                color: `${
                  statementData.marginAvailable > 0 ? '#3f8600' : '#cf1322'
                }`,
                fontSize: '20px',
              }}
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="M2M"
              value={statementData.m2m.toFixed(2)}
              precision={2}
              valueStyle={{
                color: `${statementData.m2m > 0 ? '#3f8600' : '#cf1322'}`,
                fontSize: '20px',
              }}
              prefix={
                statementData.m2m != 0 ? (
                  statementData.m2m > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                ) : (
                  ''
                )
              }
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false} className="h-fit">
            <Statistic
              title="Margin Hold(normal)"
              value={statementData.normalMarginHold.toFixed(2)}
              valueStyle={{
                fontSize: '20px',
              }}
              precision={2}
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false}>
            <Statistic
              title="Margin Hold(Intraday)"
              value={statementData.intradayMarginHold.toFixed(2)}
              valueStyle={{
                fontSize: '20px',
              }}
              precision={2}
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false}>
            <Statistic
              title="Deposit"
              value={statementData.deposit}
              valueStyle={{
                fontSize: '20px',
                color: '#3f8600',
              }}
              precision={2}
            />
          </Card>
        </div>
        <div className="w-full">
          <Card bordered={false}>
            <Statistic
              title="Withdrawal"
              value={statementData.withdrawal}
              valueStyle={{
                fontSize: '20px',
                color: '#cf1322',
              }}
              precision={2}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountStatement;
