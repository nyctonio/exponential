import React from 'react';
import { Table } from 'antd';
import { useState, useRef, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { InstrumentType } from '@/types/advance-settings/brokerage-settings';
import moment from 'moment';
import { useBrokerageStore } from '@/store/advance-settings/brokerage-settings';
import TimeHandler from '@/utils/common/timeHandler';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { BorderInput, TextInput } from '@/components/inputs/text';
import { SelectAntdBorder, SelectStyled } from '@/components/inputs/select';
import { useSearchParams } from 'next/navigation';

const BrokerageSettingsTable = ({
  refreshCount,
  setRefreshCount,
}: {
  refreshCount: number;
  setRefreshCount: (count: number) => void;
}) => {
  const { tableData, setTableData, formActive, brokerageTypeDropdown } =
    useBrokerageStore();

  const [instruments, setInstruments] = useState(tableData.instrumentsData);
  const [valid, setValid] = useState({
    error: false,
    message: '',
    id: -1,
    key: '',
  });

  //   useEffect(() => {
  //     let validate = brokerageSettingsValidation.validate(
  //       tableData.instrumentsData
  //     );
  //     console.log(validate);
  //     if (validate.error) {
  //       setValid({
  //         error: true,
  //         message: validate.error.message,
  //         id: parseInt(validate.error.details[0].path[0].toString()),
  //         key: validate.error.details[0].path[1].toString(),
  //       });
  //     } else {
  //       setValid({
  //         error: false,
  //         message: '',
  //         id: -1,
  //         key: '',
  //       });
  //     }
  //   }, [tableData.instrumentsData]);

  const { apiCall } = useFetch();
  const brokerageSettingsFetcher = async () => {
    setTableData({ ...tableData, loading: true });
    let response = await apiCall(
      {
        url: `${Routes.GET_BROKERAGE_SETTINGS.url}/${tableData.userId}`,
        method: Routes.GET_BROKERAGE_SETTINGS.method,
      },
      {}
    );

    if (response.status == true) {
      let finalInstrumentsData: InstrumentType[] = [];

      response.data.instrumentData.map((item: any) => {
        let tempObj: InstrumentType = {
          exchange: item.exchange,
          name: item.name,
          upline: {
            default: item.uplineBrokerage ? false : true,
            edited: false,
            perCrore: item.uplineBrokerage
              ? item.uplineBrokerage.brokeragePerCroreAmt
              : response.data.uplineDefaultBrokerage.find((a: any) =>
                  a.exchange.exchangeName == 'NSE'
                    ? item.exchange == 'NFO'
                    : a.exchange.exchangeName == item.exchange
                ).brokeragePerCroreAmt,
            perLot: item.uplineBrokerage
              ? item.uplineBrokerage.brokeragePerLotAmt
              : response.data.uplineDefaultBrokerage.find((a: any) =>
                  a.exchange.exchangeName == 'NSE'
                    ? item.exchange == 'NFO'
                    : a.exchange.exchangeName == item.exchange
                ).brokeragePerLotAmt,
          },
          user: {
            default: item.selfBrokerage ? false : true,
            edited: false,
            active: item.selfBrokerage
              ? item.selfBrokerage.brokerageType
              : response.data.selfDefaultBrokerage.find((a: any) =>
                  a.exchange.exchangeName == 'NSE'
                    ? item.exchange == 'NFO'
                    : a.exchange.exchangeName == item.exchange
                ).brokerageType,
            perCrore: item.selfBrokerage
              ? item.selfBrokerage.brokeragePerCroreAmt
              : response.data.selfDefaultBrokerage.find((a: any) =>
                  a.exchange.exchangeName == 'NSE'
                    ? item.exchange == 'NFO'
                    : a.exchange.exchangeName == item.exchange
                ).brokeragePerCroreAmt,
            perLot: item.selfBrokerage
              ? item.selfBrokerage.brokeragePerLotAmt
              : response.data.selfDefaultBrokerage.find((a: any) =>
                  a.exchange.exchangeName == 'NSE'
                    ? item.exchange == 'NFO'
                    : a.exchange.exchangeName == item.exchange
                ).brokeragePerLotAmt,
          },
          updatedAt: item.selfBrokerage
            ? TimeHandler.dateTimeHandler(item.selfBrokerage.updatedAt)
            : TimeHandler.dateTimeHandler(
                response.data.selfDefaultBrokerage.find((a: any) =>
                  a.exchange.exchangeName == 'NSE'
                    ? item.exchange == 'NFO'
                    : a.exchange.exchangeName == item.exchange
                ).updatedAt
              ),
        };

        finalInstrumentsData.push(tempObj);
      });

      setTableData({
        ...tableData,
        loading: false,
        instrumentsData: finalInstrumentsData,
      });
    }
  };

  let userBrokerageClildren: any = [];

  if (tableData.userType == 'Client') {
    userBrokerageClildren.push({
      title: 'Per Crore',
      dataIndex: 'userBrokerage',
      key: 'max-qty-shot-value-per-crore',
      align: 'center',
      render: (data: any, row: any) => {
        let textClass = row.user.edited
          ? 'text-blue-500'
          : row.user.default
            ? 'text-black'
            : 'text-green-500';

        return (
          <div className="flex justify-center">
            <BorderInput
              value={row.user.perCrore}
              onChange={(e) => {
                let instruments = tableData.instrumentsData;
                instruments = instruments.map((a): InstrumentType => {
                  if (a.name == row.name) {
                    let tempObj: any = {};
                    tempObj['perCrore'] = Number(e.target.value);
                    return {
                      ...a,
                      user: {
                        ...a.user,
                        edited: true,
                        ...tempObj,
                      },
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
              className={` ${textClass} outline-none w-[90%] pl-2 border-[1px] rounded-sm`}
              type="number"
            />
          </div>
        );
      },
      width: 130,
      // sorter: (a: any, b: any) => {
      //   return a.user.perCrore - b.userBrokerage;
      // },
    });
    userBrokerageClildren.push({
      title: 'Per Lot',
      dataIndex: 'userBrokerage',
      key: 'max-qty-shot-value-per-lot',
      align: 'center',
      render: (data: any, row: any) => {
        let textClass = row.user.edited
          ? 'text-blue-500'
          : row.user.default
            ? 'text-black'
            : 'text-green-500';

        return (
          <div className="flex justify-center">
            <BorderInput
              value={row.user.perLot}
              onChange={(e) => {
                let instruments = tableData.instrumentsData;
                instruments = instruments.map((a): InstrumentType => {
                  if (a.name == row.name) {
                    let tempObj: any = {};
                    tempObj['perLot'] = Number(e.target.value);
                    return {
                      ...a,
                      user: {
                        ...a.user,
                        edited: true,
                        ...tempObj,
                      },
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
              className={` ${textClass} outline-none w-[90%] pl-2 border-[1px] rounded-sm`}
              type="number"
            />
          </div>
        );
      },
      width: 130,
      // sorter: (a: any, b: any) => {
      //   return a.user.perCrore - b.userBrokerage;
      // },
    });
    userBrokerageClildren.push({
      title: 'Type',
      dataIndex: 'userBrokerage',
      key: 'brokerage-type-user',
      align: 'center',
      render: (data: any, row: any) => {
        let textClass =
          formActive == false
            ? '!text-[#8F95B2]'
            : row.user.edited
              ? '!text-blue-500'
              : row.user.default
                ? '!text-black'
                : '!text-green-500';

        //   let value = '';
        //   if (row.user.active == 'lot') {
        //     value = `${row.user.perLot || ''}`;
        //   } else {
        //     value = `${row.user.perCrore || ''}`;
        //   }
        return (
          <div className="flex justify-center">
            <SelectStyled
              value={row.user.active}
              onChange={(e: any) => {
                let instruments = tableData.instrumentsData;
                instruments = instruments.map((a): InstrumentType => {
                  if (a.name == row.name) {
                    return {
                      ...a,
                      user: {
                        ...a.user,
                        edited: true,
                        active: e.target.value,
                      },
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
      width: 130,
    });
  } else {
    userBrokerageClildren.push(
      {
        title: 'Per Crore',
        dataIndex: 'userBrokerage',
        key: 'max-qty-shot-value',
        align: 'center',
        render: (data: any, row: any) => {
          let textClass = row.user.edited
            ? 'text-blue-500'
            : row.user.default
              ? 'text-black'
              : 'text-green-500';
          return (
            <div className="flex justify-center">
              <BorderInput
                value={row.user.perCrore}
                onChange={(e) => {
                  let instruments = tableData.instrumentsData;
                  instruments = instruments.map((a): InstrumentType => {
                    if (a.name == row.name) {
                      return {
                        ...a,
                        user: {
                          ...a.user,
                          edited: true,
                          perCrore: Number(e.target.value),
                        },
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
                className={` ${textClass} outline-none w-[70%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                type="number"
              />
            </div>
          );
        },
        width: 150,
        //   sorter: (a: any, b: any) => {
        //     return a.user.perCrore - b.userBrokerage;
        //   },
      },
      {
        title: 'Per Lot',
        dataIndex: 'userBrokerage',
        key: 'max-qty-shot-value',
        align: 'center',
        render: (data: any, row: any) => {
          let textClass = row.user.edited
            ? 'text-blue-500'
            : row.user.default
              ? 'text-black'
              : 'text-green-500';

          return (
            <div className="flex justify-center">
              <BorderInput
                value={row.user.perLot}
                onChange={(e) => {
                  let instruments = tableData.instrumentsData;
                  instruments = instruments.map((a): InstrumentType => {
                    if (a.name == row.name) {
                      return {
                        ...a,
                        user: {
                          ...a.user,
                          edited: true,
                          perLot: Number(e.target.value),
                        },
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
                className={` ${textClass} outline-none w-[70%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                type="number"
              />
            </div>
          );
        },
        width: 150,
        //   sorter: (a:any, b:any) => {
        //     return a.userBrokerage - b.userBrokerage;
        //   },
      }
    );
  }

  const columns: ColumnsType<InstrumentType> = [
    {
      title: <div className="px-2">Script</div>,
      align: 'left',
      fixed: 'left',
      children: [
        {
          title: <div className="px-2">Name</div>,
          key: 'name',
          dataIndex: 'name',
          width: 150,
          fixed: 'left',
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
          width: 100,
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
      title: 'Upline Brokerage',
      align: 'center',
      children: [
        {
          title: 'Per Crore',
          dataIndex: 'uplineBrokerage',
          key: 'max-qty',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass = row.upline.default
              ? 'text-black'
              : row.upline.edited
                ? 'text-blue-500'
                : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.upline.perCrore}</p>
              </>
            );
          },
          sorter: (a, b) => {
            return a.upline.perCrore - b.upline.perLot;
          },
        },
        {
          title: 'Per Lot',
          dataIndex: 'uplineBrokerage',
          key: 'max-qty-shot',
          align: 'center',
          render: (data, row) => {
            let textClass = row.upline.default
              ? 'text-black'
              : row.upline.edited
                ? 'text-blue-500'
                : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.upline.perLot}</p>
              </>
            );
          },
          width: 100,
          sorter: (a, b) => {
            return a.upline.perLot - b.upline.perLot;
          },
        },
      ],
    },
    {
      title: 'User Brokerage',
      align: 'center',
      width: 100,
      children:
        userBrokerageClildren.length > 0
          ? userBrokerageClildren
          : [
              { title: 'Per Crore', align: 'center', width: 150 },
              { title: 'Per Lot', align: 'center', width: 150 },
            ],
    },
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

  const searchParams = useSearchParams();
  // const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    if (tableData.userId && tableData.userId != -1) {
      brokerageSettingsFetcher();
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

export default BrokerageSettingsTable;
