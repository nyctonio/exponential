import { FloatButton } from 'antd';
import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { useStatement } from '@/store/user/statement';

const Statement = () => {
  const [showStatement, setShowStatement] = useState(false);
  const { apiCall } = useFetch();

  const { statementData, setStatementData } = useStatement();

  useEffect(() => {
    if (!showStatement) return;
    const interval = setInterval(async () => {
      const data = await apiCall(Routes.USER.GET_STATEMENT, {}, false);
      console.log(data);
      if (data.status == true) {
        setStatementData(data.data);
      }
    }, 4000);
    return () => {
      // console.log('clearing interval');
      clearInterval(interval);
    };
  }, [showStatement]);

  return (
    <FloatButton.Group
      open={showStatement}
      trigger="click"
      onClick={() => setShowStatement(!showStatement)}
      style={{ right: 24 }}
      shape="circle"
      icon={
        <img src="/assets/icons/notes.svg" height={20} width={40} alt="img" />
      }
    >
      <div className="h-[330px] shadow-2xl rounded-md -ml-[210px] p-4 bg-white w-[250px]">
        <h1 className="text-[var(--dark)] text-[18px] mb-2 text-md">
          Account Statement
        </h1>
        <div className="h-[0.05px] mt-3 mb-4 bg-gray-400" />
        <div className="flex text-xs mb-2 justify-between">
          <p>Opening Balance</p>
          <p className="text-[var(--trade-green)]">
            {statementData.openingBalance.toFixed(2)}
          </p>
        </div>
        <div className="flex text-xs mb-2 justify-between">
          <p>Normal Unrealised P/L</p>
          <p
            className={`text-[var(${
              statementData.normalUnrealizedPL > 0
                ? '--trade-green'
                : '--trade-red'
            })]`}
          >
            {statementData.normalUnrealizedPL.toFixed(2)}
          </p>
        </div>
        <div className="flex text-xs mb-2 justify-between">
          <p>Intraday Unrealised P/L</p>
          <p
            className={`text-[var(${
              statementData.intradayUnrealizedPL > 0
                ? '--trade-green'
                : '--trade-red'
            })]`}
          >
            {statementData.intradayUnrealizedPL.toFixed(2)}
          </p>
        </div>
        <div className="flex text-xs mb-2 justify-between">
          <p>Realised P/L</p>
          <p
            className={`text-[var(${
              statementData.realizedPL > 0 ? '--trade-green' : '--trade-red'
            })]`}
          >
            {statementData.realizedPL.toFixed(2)}
          </p>
        </div>
        <div className="flex text-xs mb-2 justify-between">
          <p>Margin Available</p>
          <p
            className={`text-[var(${
              statementData.marginAvailable > 0
                ? '--trade-green'
                : '--trade-red'
            })]`}
          >
            {statementData.marginAvailable.toFixed(2)}
          </p>
        </div>
        <div className="flex text-xs mb-2 justify-between">
          <p>M2M</p>
          <p
            className={`text-[var(${
              statementData.m2m > 0 ? '--trade-green' : '--trade-red'
            })]`}
          >
            {statementData.m2m.toFixed(2)}
          </p>
        </div>
        <div className="flex text-xs mb-2 justify-between">
          <p>Margin Hold(Normal)</p>
          <p>{statementData.normalMarginHold.toFixed(2)}</p>
        </div>

        <div className="flex text-xs mb-2 justify-between">
          <p>Margin Hold(Intraday)</p>
          <p>{statementData.intradayMarginHold.toFixed(2)}</p>
        </div>

        <div className="flex text-xs mb-2 justify-between">
          <p>Deposit</p>
          <p className={`text-[var(--trade-green)]`}>{statementData.deposit}</p>
        </div>

        <div className="flex text-xs mb-2 justify-between">
          <p>Withdrawal</p>
          <p className={`text-[var(--trade-red)]`}>
            {statementData.withdrawal}
          </p>
        </div>
      </div>
    </FloatButton.Group>
  );
};

export default Statement;
