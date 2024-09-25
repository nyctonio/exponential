import React from 'react';
import { Table } from 'antd';
import { useState, useRef, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Tooltip } from 'antd';
import { InstrumentType } from '@/types/advance-settings/trade-margin-settings';
import moment from 'moment';
import TimeHandler from '@/utils/common/timeHandler';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { BorderInput, TextInput } from '@/components/inputs/text';
import { SelectAntdBorder, SelectStyled } from '@/components/inputs/select';
import { useTradeMarginStore } from '@/store/advance-settings/trade-margin-settings';
import { useSearchParams } from 'next/navigation';

const MarginSettingsTable = ({ refreshCount }: { refreshCount: number }) => {
  const { tableData, setTableData, formActive, setFormActive } =
    useTradeMarginStore();
  const searchParams = useSearchParams();

  const [instruments, setInstruments] = useState(tableData.instrumentsData);
  const [valid, setValid] = useState({
    error: false,
    message: '',
    id: -1,
    key: '',
  });

  const { apiCall } = useFetch();
  const marginSettingsFetcher = async () => {
    setTableData({ ...tableData, loading: true });
    let response = await apiCall(
      {
        url: `${Routes.GET_TRADE_MARGIN_SETTINGS.url}/${tableData.userId}`,
        method: Routes.GET_TRADE_MARGIN_SETTINGS.method,
      },
      {}
    );

    if (response.status == true) {
      let finalInstrumentsData: InstrumentType[] = [];
      let intradayAllowed = response.data.intradayAllowed;
      response.data.instruments.map((item: any) => {
        let uplineDefaultNormalMargin =
          response.data.uplineDefaultMarginData.normalMargin.find((a: any) =>
            item.exchange == 'NFO'
              ? a.exchange.exchangeName == 'NSE'
              : item.exchange == a.exchange.exchangeName
          );
        let userDefaultNormalMargin =
          response.data.userDefaultMarginData.normalMargin.find((a: any) =>
            item.exchange == 'NFO'
              ? a.exchange.exchangeName == 'NSE'
              : item.exchange == a.exchange.exchangeName
          );

        let uplineDefaultIntradayMargin =
          response.data.uplineDefaultMarginData.intradayMargin.find((a: any) =>
            item.exchange == 'NFO'
              ? a.exchange.exchangeName == 'NSE'
              : item.exchange == a.exchange.exchangeName
          );
        let userDefaultIntradayMargin =
          response.data.userDefaultMarginData.intradayMargin.find((a: any) =>
            item.exchange == 'NFO'
              ? a.exchange.exchangeName == 'NSE'
              : item.exchange == a.exchange.exchangeName
          );
        let tempObj: any = {
          exchange: item.exchange,
          name: item.name,
          marginType: item.userScriptMargin.normalMargin
            ? item.userScriptMargin.normalMargin.marginType
            : userDefaultNormalMargin.marginType,
          userNormalMarginCrore: item.userScriptMargin.normalMargin
            ? item.userScriptMargin.normalMargin.marginPerCrore
            : userDefaultNormalMargin.marginPerCrore,
          uplineNormalMarginCrore: item.uplineScriptMargin.normalMargin
            ? item.uplineScriptMargin.normalMargin.marginPerCrore
            : uplineDefaultNormalMargin.marginPerCrore,
          userNormalMarginLot: item.userScriptMargin.normalMargin
            ? item.userScriptMargin.normalMargin.marginPerLot
            : userDefaultNormalMargin.marginPerLot,
          uplineNormalMarginLot: item.uplineScriptMargin.normalMargin
            ? item.uplineScriptMargin.normalMargin.marginPerLot
            : uplineDefaultNormalMargin.marginPerLot,
          marginTypeUpdated: false,
          userIntradayMarginUpdated: false,
          userNormalMarginUpdated: false,
          uplineIntraDayMarginType: item.uplineScriptMargin.intradayMargin
            ? 'SCRIPT'
            : 'EXCH',
          userIntraDayMarginType: item.userScriptMargin.intradayMargin
            ? 'SCRIPT'
            : 'EXCH',
          userNormalMarginType: item.userScriptMargin.normalMargin
            ? 'SCRIPT'
            : 'EXCH',
          uplineNormalMarginType: item.uplineScriptMargin.normalMargin
            ? 'SCRIPT'
            : 'EXCH',
          updatedAt: TimeHandler.dateTimeHandler(
            item.userScriptMargin.normalMargin
              ? item.userScriptMargin.normalMargin.updatedAt
              : userDefaultNormalMargin.updatedAt
          ),
        };

        if (intradayAllowed) {
          tempObj = {
            ...tempObj,
            userIntradayMarginCrore: item.userScriptMargin.intradayMargin
              ? item.userScriptMargin.intradayMargin.marginPerCrore
              : userDefaultIntradayMargin.marginPerCrore,
            uplineIntradayMarginCrore: item.uplineScriptMargin.intradayMargin
              ? item.userScriptMargin.intradayMargin.marginPerCrore
              : uplineDefaultIntradayMargin.marginPerCrore,
            userIntradayMarginLot: item.userScriptMargin.intradayMargin
              ? item.userScriptMargin.intradayMargin.marginPerLot
              : userDefaultIntradayMargin.marginPerLot,
            uplineIntradayMarginLot: item.uplineScriptMargin.intradayMargin
              ? item.userScriptMargin.intradayMargin.marginPerLot
              : uplineDefaultIntradayMargin.marginPerLot,
          };
        }

        finalInstrumentsData.push(tempObj);
      });

      setTableData({
        ...tableData,
        loading: false,
        intraDayAllowed: response.data.intradayAllowed,
        instrumentsData: finalInstrumentsData,
        userType: response.data.userType,
      });
    }
  };

  let intradayMarginColumn: {
    upline: ColumnsType<InstrumentType>;
    user: ColumnsType<InstrumentType>;
  } = {
    upline: [],
    user: [],
  };

  if (tableData.intraDayAllowed) {
    intradayMarginColumn.upline.push({
      title: 'Upline Intraday Margin',
      align: 'center',
      children: [
        {
          title: 'Per Crore',
          dataIndex: 'uplineBrokerage',
          key: 'upline-intraday-margin-cr',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass =
              row.uplineIntraDayMarginType == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.uplineIntradayMarginCrore}</p>
              </>
            );
          },
          sorter: (a, b) => {
            return a.uplineIntradayMarginCrore - b.uplineIntradayMarginCrore;
          },
        },
        {
          title: 'Per Lot',
          dataIndex: 'uplineBrokerage',
          key: 'upline-intraday-margin-lot',
          align: 'center',
          render: (data, row) => {
            let textClass =
              row.uplineIntraDayMarginType == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.uplineIntradayMarginLot}</p>
              </>
            );
          },
          width: 100,
          sorter: (a, b) => {
            return a.uplineIntradayMarginLot - b.uplineIntradayMarginLot;
          },
        },
      ],
    });

    intradayMarginColumn.user.push({
      title: 'User Intraday Margin',
      align: 'center',
      children: [
        {
          title: 'Per Crore',
          dataIndex: 'userBrokerage',
          key: 'cr-intraday-margin-user',
          align: 'center',
          render: (data: any, row: InstrumentType) => {
            let textClass =
              row.userIntradayMarginUpdated || row.marginTypeUpdated
                ? 'text-blue-500'
                : row.userIntraDayMarginType == 'EXCH'
                  ? 'text-black'
                  : 'text-green-500';
            return (
              <div className="flex justify-center">
                <BorderInput
                  value={row.userIntradayMarginCrore}
                  onChange={(e) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map((a): InstrumentType => {
                      if (a.name == row.name) {
                        return {
                          ...a,
                          userIntradayMarginCrore: Number(e.target.value),
                          userIntradayMarginUpdated: true,
                        };
                      }
                      return a;
                    });
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  disabled={!formActive}
                  className={` ${textClass} outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                  type="number"
                />
              </div>
            );
          },
          width: 120,
          sorter: (a: any, b: any) => {
            return a.userIntradayMarginCrore - b.userIntradayMarginCrore;
          },
        },
        {
          title: 'Per Lot',
          dataIndex: 'userBrokerage',
          key: 'user-intraday-lot-margin',
          align: 'center',
          render: (data: any, row: InstrumentType) => {
            let textClass =
              row.userIntradayMarginUpdated || row.marginTypeUpdated
                ? 'text-blue-500'
                : row.userIntraDayMarginType == 'EXCH'
                  ? 'text-black'
                  : 'text-green-500';

            return (
              <div className="flex justify-center">
                <BorderInput
                  value={row.userIntradayMarginLot}
                  onChange={(e) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map((a): InstrumentType => {
                      if (a.name == row.name) {
                        return {
                          ...a,
                          userIntradayMarginUpdated: true,
                          userIntradayMarginLot: Number(e.target.value),
                        };
                      }
                      return a;
                    });
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  disabled={!formActive}
                  className={` ${textClass} outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                  type="number"
                />
              </div>
            );
          },
          width: 120,
          sorter: (a: any, b: any) => {
            return a.userIntradayMarginLot - b.userIntradayMarginLot;
          },
        },
      ],
    });
  }

  let marginTypeCol: ColumnsType<InstrumentType> = [];

  if (tableData.userType == 'Client') {
    marginTypeCol.push({
      title: 'Margin Type',
      dataIndex: '',
      key: 'margin-type-user',
      align: 'center',
      children: [
        {
          title: 'Active',
          align: 'center',
          render: (data: any, row) => {
            let textClass =
              formActive == false
                ? '!text-[#8F95B2]'
                : row.marginTypeUpdated
                  ? '!text-blue-500'
                  : row.userNormalMarginType == 'SCRIPT'
                    ? '!text-green-500'
                    : '!text-black';

            //   let value = '';
            //   if (row.user.active == 'lot') {
            //     value = `${row.user.perLot || ''}`;
            //   } else {
            //     value = `${row.user.perCrore || ''}`;
            //   }
            return (
              <div className="flex justify-center">
                <SelectStyled
                  value={row.marginType}
                  onChange={(e: any) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map((a): InstrumentType => {
                      if (a.name == row.name) {
                        return {
                          ...a,
                          marginType: e.target.value,
                          marginTypeUpdated: true,
                        };
                      }
                      return a;
                    });
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  disabled={!formActive}
                  className={`${
                    formActive
                      ? ' !bg-[#ffffff]'
                      : '!border-[#D8DAE5] !bg-[#F9F9F9] '
                  } ${textClass} outline-none !w-[90%] pl-2 text-center !font-light !border-[1.2px]  rounded-sm`}
                >
                  <option value={'lot'}>Lot</option>
                  <option value={'crore'}>Crore</option>
                </SelectStyled>
              </div>
            );
          },
          width: 100,
        },
      ],
    });
  }

  let fixedProps: any = {};
  if (searchParams.get('edit') == 'true') {
    fixedProps['fixed'] = 'left';
  }
  const columns: ColumnsType<InstrumentType> = [
    {
      title: <div className="px-2">Script</div>,
      align: 'left',
      fixed: 'left',
      children: [
        {
          ...fixedProps,
          title: <div className="px-2">Name</div>,
          key: 'name',
          dataIndex: 'name',
          fixed: 'left',
          width: 150,
          render: (data) => {
            return <div className="px-2">{data}</div>;
          },
          sorter: (a, b) => {
            return a.name.localeCompare(b.name);
          },
        },
      ],
    },
    {
      title: 'Exch',
      align: 'left',
      className: 'pl-2',
      children: [
        {
          title: 'Type',
          key: 'exchange',
          dataIndex: 'exchange',
          width: 80,
          render: (data) => {
            return <>{data == 'NFO' ? 'NSE' : data}</>;
          },
          sorter: (a, b) => {
            return a.exchange.localeCompare(b.exchange);
          },
        },
      ],
    },
    {
      title: 'Upline Normal Margin',
      align: 'center',
      children: [
        {
          title: 'Per Crore',
          dataIndex: 'uplineBrokerage',
          key: 'upline-normal-margin-cr',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass =
              row.uplineNormalMarginType == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.uplineNormalMarginCrore}</p>
              </>
            );
          },
          sorter: (a, b) => {
            return a.uplineNormalMarginCrore - b.uplineNormalMarginCrore;
          },
        },
        {
          title: 'Per Lot',
          dataIndex: 'uplineBrokerage',
          key: 'upline-normal-margin-lot',
          align: 'center',
          render: (data, row) => {
            let textClass =
              row.uplineNormalMarginType == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.uplineNormalMarginLot}</p>
              </>
            );
          },
          width: 100,
          sorter: (a, b) => {
            return a.uplineNormalMarginLot - b.uplineNormalMarginLot;
          },
        },
      ],
    },
    ...intradayMarginColumn.upline,
    {
      title: 'User Normal Margin',
      align: 'center',
      children: [
        {
          title: 'Per Crore',
          dataIndex: 'userBrokerage',
          key: 'cr-normal-margin-user',
          align: 'center',
          render: (data: any, row: InstrumentType) => {
            let textClass =
              row.userNormalMarginUpdated || row.marginTypeUpdated
                ? 'text-blue-500'
                : row.userNormalMarginType == 'EXCH'
                  ? 'text-black'
                  : 'text-green-500';
            return (
              <div className="flex justify-center">
                <BorderInput
                  value={row.userNormalMarginCrore}
                  onChange={(e) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map((a): InstrumentType => {
                      if (a.name == row.name) {
                        return {
                          ...a,
                          userNormalMarginCrore: Number(e.target.value),
                          userNormalMarginUpdated: true,
                        };
                      }
                      return a;
                    });
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  disabled={!formActive}
                  className={` ${textClass} outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                  type="number"
                />
              </div>
            );
          },
          width: 120,
          sorter: (a: any, b: any) => {
            return a.userNormalMarginCrore - b.userNormalMarginCrore;
          },
        },
        {
          title: 'Per Lot',
          dataIndex: 'userBrokerage',
          key: 'user-normal-lot-margin',
          align: 'center',
          render: (data: any, row: InstrumentType) => {
            let textClass =
              row.userNormalMarginUpdated || row.marginTypeUpdated
                ? 'text-blue-500'
                : row.userNormalMarginType == 'EXCH'
                  ? 'text-black'
                  : 'text-green-500';

            return (
              <div className="flex justify-center">
                <BorderInput
                  value={row.userNormalMarginLot}
                  onChange={(e) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map((a): InstrumentType => {
                      if (a.name == row.name) {
                        return {
                          ...a,
                          userNormalMarginUpdated: true,
                          userNormalMarginLot: Number(e.target.value),
                        };
                      }
                      return a;
                    });
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  disabled={!formActive}
                  className={` ${textClass} outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                  type="number"
                />
              </div>
            );
          },
          width: 120,
          sorter: (a: any, b: any) => {
            return a.userNormalMarginLot - b.userNormalMarginLot;
          },
        },
      ],
    },
    ...intradayMarginColumn.user,
    ...marginTypeCol,
    {
      title: 'Last Updated',
      align: 'center',
      children: [
        {
          title: 'Date/Time',
          dataIndex: 'updatedAt',
          key: 'date-time',
          width: 150,
          align: 'center',
          render: (data, row) => {
            return <>{data}</>;
          },
          sorter: (a, b) => {
            let date1 = a.updatedAt;
            let date2 = b.updatedAt;
            // @ts-ignore
            let diff = moment(date1).diff(moment(date2), 'days');
            return diff > 0 ? 1 : -1;
          },
        },
      ],
    },
  ];

  const exchangeFilterHandler = () => {
    if (tableData.exchange == '') {
      setInstruments(
        tableData.instrumentsData.filter((a) =>
          a.name.toLowerCase().includes(tableData.script.toLowerCase())
        )
      );
      return;
    }
    if (tableData.exchange == 'NSE') {
      setInstruments(
        tableData.instrumentsData.filter(
          (a) =>
            a.exchange == 'NFO' &&
            a.name.toLowerCase().includes(tableData.script.toLowerCase())
        )
      );
      return;
    }
    setInstruments(
      tableData.instrumentsData.filter(
        (a) =>
          a.exchange == tableData.exchange &&
          a.name.toLowerCase().includes(tableData.script.toLowerCase())
      )
    );
    return;
  };
  useEffect(() => {
    if (tableData.userId && tableData.userId != -1) {
      marginSettingsFetcher();
    }
  }, [refreshCount]);

  const [filteredInstruments, setFilteredInstruments] = useState(
    tableData.instrumentsData
  );

  useEffect(() => {
    setFilteredInstruments(
      tableData.exchange == ''
        ? tableData.instrumentsData.filter((a) =>
            a.name.toLowerCase().includes(tableData.script.toLowerCase())
          )
        : tableData.exchange == 'NSE'
          ? tableData.instrumentsData.filter(
              (a) =>
                a.exchange == 'NFO' &&
                a.name.toLowerCase().includes(tableData.script.toLowerCase())
            )
          : tableData.instrumentsData.filter(
              (a) =>
                a.exchange == tableData.exchange &&
                a.name.toLowerCase().includes(tableData.script.toLowerCase())
            )
    );
  }, [tableData.exchange, tableData.script]);

  useEffect(() => {
    setFilteredInstruments(
      tableData.exchange == ''
        ? tableData.instrumentsData.filter((a) =>
            a.name.toLowerCase().includes(tableData.script.toLowerCase())
          )
        : tableData.exchange == 'NSE'
          ? tableData.instrumentsData.filter(
              (a) =>
                a.exchange == 'NFO' &&
                a.name.toLowerCase().includes(tableData.script.toLowerCase())
            )
          : tableData.instrumentsData.filter(
              (a) =>
                a.exchange == tableData.exchange &&
                a.name.toLowerCase().includes(tableData.script.toLowerCase())
            )
    );
  }, [tableData.instrumentsData]);
  return (
    <Table
      key={'margin-settings-table'}
      rowKey={`${Math.random() * 1000}`}
      rowClassName={(record, index) =>
        index % 2 === 0 ? 'bg-[var(--light)]' : 'bg-[var(--primary-shade-d)]'
      }
      loading={tableData.loading}
      // @ts-ignore
      columns={columns}
      scroll={{ y: 450 }}
      dataSource={filteredInstruments}
      // bordered
      // pagination={false}
      pagination={{
        size: 'small',
        position: ['bottomRight'],
        className: 'pl-2',
        rootClassName: 'sticky bottom-0 py-4',
        // showSizeChanger: false,
      }}
    />
  );
};

export default MarginSettingsTable;
