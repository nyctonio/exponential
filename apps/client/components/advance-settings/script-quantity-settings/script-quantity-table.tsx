import React from 'react';
import { Modal, Popconfirm, Table } from 'antd';
import { useState, useRef, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Tooltip } from 'antd';
import { InstrumentType } from '@/types/advance-settings/brokerage-settings';
import moment from 'moment';
import TimeHandler from '@/utils/common/timeHandler';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { BorderInput, TextInput } from '@/components/inputs/text';
import { SelectAntdBorder } from '@/components/inputs/select';
import { useScriptQuantity } from '@/store/advance-settings/script-quantity-settings';
import { ScriptQuantityInstrument } from '@/types/advance-settings/script-quantity-settings';
import { SwitchToggle, ToggleAntd } from '@/components/inputs/toggle';
import { useSearchParams } from 'next/navigation';
import { CopyFilled } from '@ant-design/icons';
import { H1 } from '@/components/inputs/heading';
import { AsyncButtonAntd } from '@/components/inputs/button';
import { brokerageSettingsValidation } from '@/utils/validation/advance-settings/brokerage-settings';

const ScriptQuantitySettingsTable = ({
  refreshCount,
}: {
  refreshCount: number;
}) => {
  const { tableData, setTableData, userId, formActive } = useScriptQuantity();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tradeMaxLotSize: '-1',
    scriptMaxLotSize: '-1',
    tradeMinLotSize: '-1',
  });

  const { apiCall } = useFetch();
  const scriptQuantitySettingsFetcher = async () => {
    setTableData({ ...tableData, loading: true });
    let response = await apiCall(
      {
        url: `${Routes.GET_SCRIPT_QTY_DATA.url}/${userId}`,
        method: Routes.GET_SCRIPT_QTY_DATA.method,
      },
      {}
    );

    if (response.status == true) {
      let finalInstrumentsData: ScriptQuantityInstrument[] = [];

      response.data.instruments.map((item: any) => {
        let uplineDefault = response.data.parentDefaultQuantitySettings.find(
          (a: any) =>
            item.exchange == 'NFO'
              ? a.exchange.exchangeName == 'NSE'
              : a.exchange.exchangeName == item.exchange
        );
        let userDefault = response.data.userDefaultQuantitySettings.find(
          (a: any) =>
            item.exchange == 'NFO'
              ? a.exchange.exchangeName == 'NSE'
              : a.exchange.exchangeName == item.exchange
        );
        let tempObj: ScriptQuantityInstrument = {
          exchange: item.exchange,
          name: item.name,
          active: item.userScriptSetting ? item.userScriptSetting.active : true,
          upline: item.parentScriptSetting ? 'SCRIPT' : 'EXCH',
          user: item.userScriptSetting ? 'SCRIPT' : 'EXCH',
          updatedAt: TimeHandler.dateTimeHandler(
            item.userScriptSetting
              ? item.userScriptSetting.updatedAt
              : userDefault.updatedAt
          ),
          uplineScriptMaxLotSize: item.parentScriptSetting
            ? item.parentScriptSetting.scriptMaxLotSize
            : uplineDefault.scriptMaxLotSize,
          uplineTradeMaxLotSize: item.parentScriptSetting
            ? item.parentScriptSetting.tradeMaxLotSize
            : uplineDefault.tradeMaxLotSize,
          userScriptMaxLotSize: item.userScriptSetting
            ? item.userScriptSetting.scriptMaxLotSize
            : userDefault.scriptMaxLotSize,
          userTradeMaxLotSize: item.userScriptSetting
            ? item.userScriptSetting.tradeMaxLotSize
            : userDefault.tradeMaxLotSize,
          userTradeMinLotSize: item.userScriptSetting
            ? item.userScriptSetting.tradeMinLotSize
            : 0,
          valuesUpdated: false,
        };

        finalInstrumentsData.push(tempObj);
      });

      setTableData({
        ...tableData,
        loading: false,
        instrumentsData: finalInstrumentsData,
      });
      return;
    }

    setTableData({ ...tableData, loading: false });
    return;
  };

  let childCol: ColumnsType<ScriptQuantityInstrument> = [];
  if (tableData.userType == 'Client') {
    childCol.push({
      title: 'Trade Min Lot Size',
      dataIndex: '',
      key: 'user-trade-min-lot-size',
      width: 100,
      align: 'center',
      render: (data: any, row: ScriptQuantityInstrument) => {
        let textClass = row.valuesUpdated
          ? 'text-blue-500'
          : row.user == 'EXCH'
            ? 'text-black'
            : 'text-green-500';
        return (
          <div className="flex justify-center">
            <BorderInput
              value={row.userTradeMinLotSize}
              onChange={(e) => {
                let instruments = tableData.instrumentsData;
                instruments = instruments.map((a): ScriptQuantityInstrument => {
                  if (a.name == row.name) {
                    return {
                      ...a,
                      valuesUpdated: true,
                      userTradeMinLotSize: Number(e.target.value),
                    };
                  }
                  return a;
                });
                setTableData({
                  ...tableData,
                  instrumentsData: instruments,
                });
              }}
              min={0}
              disabled={!formActive}
              className={` ${textClass} outline-none w-[70%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
              type="number"
            />
          </div>
        );
      },
      sorter: (a: ScriptQuantityInstrument, b: ScriptQuantityInstrument) => {
        return a.userTradeMinLotSize - b.userTradeMinLotSize;
      },
    });
  }

  const modalOkHandler = async () => {
    setTableData({
      ...tableData,
      instrumentsData: tableData.instrumentsData.map((a) => {
        return {
          ...a,
          userScriptMaxLotSize:
            formData.scriptMaxLotSize != '-1'
              ? Number(formData.scriptMaxLotSize)
              : a.userScriptMaxLotSize,
          userTradeMaxLotSize:
            formData.tradeMaxLotSize != '-1'
              ? Number(formData.tradeMaxLotSize)
              : a.userTradeMaxLotSize,
          userTradeMinLotSize:
            formData.tradeMinLotSize != '-1'
              ? Number(formData.tradeMinLotSize)
              : a.userTradeMinLotSize,
          valuesUpdated: true,
        };
      }),
    });
    setModalOpen(false);
    return;
  };

  const columns: ColumnsType<ScriptQuantityInstrument> = [
    {
      title: <div className="px-2">Script</div>,
      align: 'left',
      fixed: 'left',
      children: [
        {
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
      title: 'Upline Settings',
      align: 'center',
      children: [
        {
          title: 'Trade Max Lot Size',
          dataIndex: '',
          key: 'upline-trade-max-lot-size',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass =
              row.upline == 'EXCH' ? 'text-black' : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.uplineTradeMaxLotSize}</p>
              </>
            );
          },
          sorter: (a, b) => {
            return a.uplineTradeMaxLotSize - b.uplineTradeMaxLotSize;
          },
        },
        {
          title: 'Script Max Lot Size',
          dataIndex: '',
          key: 'upline-script-max-lot-size',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass =
              row.upline == 'EXCH' ? 'text-black' : 'text-green-500';
            return (
              <>
                <p className={textClass}>{row.uplineScriptMaxLotSize}</p>
              </>
            );
          },
          sorter: (a, b) => {
            return a.uplineScriptMaxLotSize - b.uplineScriptMaxLotSize;
          },
        },
      ],
    },
    {
      title: () => (
        <div className="text-center flex flex-row items-center justify-center space-x-2">
          <div>User Settings</div>
          <div
            className="cursor-pointer"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 8V6C8 3.79086 9.79086 2 12 2L18 2C20.2091 2 22 3.79086 22 6V12C22 14.2091 20.2091 16 18 16H16M8 8H6C3.79086 8 2 9.79086 2 12V18C2 20.2091 3.79086 22 6 22H12C14.2091 22 16 20.2091 16 18V16M8 8H12C14.2091 8 16 9.79086 16 12V16"
                stroke="#28303F"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="white"
              />
            </svg>
          </div>
        </div>
      ),
      align: 'center',
      children: [
        {
          title: 'Trade Max Lot Size',
          dataIndex: '',
          key: 'user-trade-max-lot-size',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass = row.valuesUpdated
              ? 'text-blue-500'
              : row.user == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <div className="flex justify-center">
                <BorderInput
                  value={row.userTradeMaxLotSize}
                  onChange={(e) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map(
                      (a): ScriptQuantityInstrument => {
                        if (a.name == row.name) {
                          return {
                            ...a,
                            valuesUpdated: true,
                            userTradeMaxLotSize: Number(e.target.value),
                          };
                        }
                        return a;
                      }
                    );
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  min={0}
                  disabled={!formActive}
                  className={` ${textClass} outline-none w-[70%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                  type="number"
                />
              </div>
            );
          },
          sorter: (a, b) => {
            return a.userTradeMaxLotSize - b.userTradeMaxLotSize;
          },
        },
        {
          title: 'Script Max Lot Size',
          dataIndex: '',
          key: 'user-script-max-lot-size',
          width: 100,
          align: 'center',
          render: (data, row) => {
            let textClass = row.valuesUpdated
              ? 'text-blue-500'
              : row.user == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <div className="flex justify-center">
                <BorderInput
                  value={row.userScriptMaxLotSize}
                  onChange={(e) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map(
                      (a): ScriptQuantityInstrument => {
                        if (a.name == row.name) {
                          return {
                            ...a,
                            valuesUpdated: true,
                            userScriptMaxLotSize: Number(e.target.value),
                          };
                        }
                        return a;
                      }
                    );
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  min={0}
                  disabled={!formActive}
                  className={` ${textClass} outline-none w-[70%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                  type="number"
                />
              </div>
            );
          },
          sorter: (a, b) => {
            return a.userScriptMaxLotSize - b.userScriptMaxLotSize;
          },
        },
        ...childCol,
        {
          title: 'Active',
          dataIndex: '',
          key: 'user-script-active',
          width: 60,
          align: 'center',
          render: (data, row) => {
            let textClass = row.valuesUpdated
              ? 'text-blue-500'
              : row.user == 'EXCH'
                ? 'text-black'
                : 'text-green-500';
            return (
              <div className="flex justify-center">
                <ToggleAntd
                  checked={row.active}
                  onChange={(checked) => {
                    let instruments = tableData.instrumentsData;
                    instruments = instruments.map(
                      (a): ScriptQuantityInstrument => {
                        if (a.name == row.name) {
                          return {
                            ...a,
                            valuesUpdated: true,
                            active: checked,
                          };
                        }
                        return a;
                      }
                    );
                    setTableData({
                      ...tableData,
                      instrumentsData: instruments,
                    });
                  }}
                  disabled={!formActive}
                />
              </div>
            );
          },
          sorter: (a, b) => {
            return a.userScriptMaxLotSize - b.userScriptMaxLotSize;
          },
        },
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

  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    if (userId && userId != -1) {
      console.log('runnning');
      scriptQuantitySettingsFetcher();
    }
  }, [userId, refreshCount]);

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
    <>
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
      <Modal
        title={'Copy Settings to all scripts'}
        open={modalOpen}
        centered={true}
        onOk={() => {
          modalOkHandler();
        }}
        confirmLoading={false}
        onCancel={() => {
          setModalOpen(false);
        }}
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
        okButtonProps={{
          style: {
            display: 'none',
          },
        }}
      >
        <div
          style={{
            fontWeight: 300,
          }}
          className="w-full flex flex-col items-center justify-center py-4 space-y-3"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              //   submitHandler();
            }}
            className="grid grid-cols-2 gap-2 w-[80%] place-items-left items-center"
          >
            <H1 className="text-sm text-left font-light text-black">
              Trade Max Lot Size <span className="text-red-800">*</span>
            </H1>
            <BorderInput
              value={Number(formData.tradeMaxLotSize)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  tradeMaxLotSize: e.target.value.toString(),
                });
              }}
              type="number"
              style={{ width: '100%' }}
            />

            <H1 className="text-sm text-left font-light text-black">
              Script Max Lot Size <span className="text-red-800">*</span>
            </H1>
            <BorderInput
              value={Number(formData.scriptMaxLotSize)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  scriptMaxLotSize: e.target.value.toString(),
                });
              }}
              type="number"
              style={{ width: '100%' }}
            />

            <H1
              className={`text-sm text-left font-light text-black ${
                tableData.userType != 'Client' && 'hidden'
              }`}
            >
              Trade Min Lot Size <span className="text-red-800">*</span>
            </H1>
            <BorderInput
              className={`${tableData.userType != 'Client' && '!hidden'}`}
              value={Number(formData.tradeMinLotSize)}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  tradeMinLotSize: e.target.value.toString(),
                });
              }}
              type="number"
              style={{ width: '100%' }}
            />
          </form>
          <div className="w-[80%]">
            Please leave values as -1 if not to change.
          </div>

          <div className="buttons flex flex-row space-x-2 w-[80%] justify-end">
            <AsyncButtonAntd
              type="button"
              title="Cancel"
              onClick={() => {
                setModalOpen(false);
              }}
              isCancel={true}
              loading={false}
            />

            <Popconfirm
              title="Are you sure?"
              description="Submitting this form will lead to updating all the script settings"
              cancelButtonProps={{
                className: 'hover:!text-[var(--primary-shade-b)]',
                style: {
                  background: 'white',
                  color: 'var(--primary-shade-b)',
                  borderColor: 'var(--primary-shade-b)',
                },
              }}
              onConfirm={modalOkHandler}
              okButtonProps={{
                style: {
                  color: 'white',
                  backgroundColor: 'var(--primary-shade-b)',
                },
              }}
            >
              <AsyncButtonAntd
                type="button"
                onClick={() => {}}
                title="Save"
                isCancel={false}
                loading={false}
              />
            </Popconfirm>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ScriptQuantitySettingsTable;
