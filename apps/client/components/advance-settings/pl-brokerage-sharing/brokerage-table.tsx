import React from 'react';
import { Table } from 'antd';
import { useState, useRef, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { plSharingValidation } from '@/utils/validation/advance-settings/pl-brokerage-sharing';
import {
  PlSharingType,
  BrokerageSharingType,
} from '@/store/advance-settings/pl-brokerage-sharing';
import { usePlBrokerageSharingStore } from '@/store/advance-settings/pl-brokerage-sharing';
import printSafe from '../../../utils/common/print';
import TimeHandler from '@/utils/common/timeHandler';
import { useUserStore } from '@/store/user';
import { BorderInput } from '@/components/inputs/text';

const ScriptTable = () => {
  const { tableData, setTableData, formActive, setFormActive } =
    usePlBrokerageSharingStore();
  const { user } = useUserStore();
  const [valid, setValid] = useState({
    error: false,
    message: '',
    id: -1,
    key: '',
  });

  const checkDisabled = (label: string, id: number | string) => {
    if (!formActive) {
      return true;
    } else {
      let check = false;
      tableData.brokerageSharing.forEach((element) => {
        if (element.id == id) {
          // @ts-ignore
          if (element[label] == null) {
            check = true;
          }
        }
      });
      return check;
    }
  };

  // useEffect(() => {
  //   let validate = plSharingValidation.validate(tableData.plSharing);
  //   console.log(validate);
  //   if (validate.error) {
  //     setValid({
  //       error: true,
  //       message: '',
  //       id: 1,
  //       key: '',
  //     });
  //   } else {
  //     setValid({
  //       error: false,
  //       message: '',
  //       id: -1,
  //       key: '',
  //     });
  //   }
  // }, [tableData.plSharing]);

  const columns: ColumnsType<BrokerageSharingType> = [
    {
      title: <div className="px-2">Exchange</div>,
      align: 'left',
      width: 300,
      dataIndex: 'exchange',
      className: 'pl-2',
      render: (data, row) => {
        return (
          <div className="px-2">
            {data} : {row.brokerageType}
          </div>
        );
      },
    },
    {
      title: <div className="px-2">Total&nbsp;Brokerage</div>,
      align: 'left',
      width: 300,
      dataIndex: 'total',
      className: 'pl-2',
      render: (data, row) => {
        return <div className="px-2">{data}</div>;
      },
    },
    {
      title: 'Upline',
      align: 'left',
      dataIndex: 'upline',
      className: 'pl-2',
      render: (data, row) => {
        return (
          <div className="px-2">
            <BorderInput disabled={true} value={data == null ? '' : data} />
          </div>
        );
      },
    },
    {
      title: 'Self',
      align: 'left',
      dataIndex: 'self',
      className: 'pl-2',
      render: (data, row) => {
        const disabled = checkDisabled('self', row.id);
        return (
          <div className="px-2">
            <BorderInput
              type="number"
              disabled={disabled}
              onChange={(e) => {
                setTableData({
                  ...tableData,
                  brokerageSharing: tableData.brokerageSharing.map((item) => {
                    if (item.id == row.id) {
                      return {
                        ...item,
                        self: Number(e.target.value),
                        isUpdated: true,
                      };
                    }
                    return item;
                  }),
                });
              }}
              value={data == null ? '' : data}
            />
          </div>
        );
      },
    },
    {
      title: 'Master',
      align: 'left',
      dataIndex: 'master',
      className: 'pl-2',
      render: (data, row) => {
        const disabled = checkDisabled('master', row.id);
        return (
          <div className="px-2">
            <BorderInput
              disabled={disabled}
              type="number"
              onChange={(e) => {
                setTableData({
                  ...tableData,
                  brokerageSharing: tableData.brokerageSharing.map((item) => {
                    if (item.id == row.id) {
                      return {
                        ...item,
                        master: Number(e.target.value),
                        isUpdated: true,
                      };
                    }
                    return item;
                  }),
                });
              }}
              value={data == null ? '' : data}
            />
          </div>
        );
      },
    },
    {
      title: 'Broker',
      align: 'left',
      dataIndex: 'broker',
      className: 'pl-2',
      render: (data, row) => {
        const disabled = checkDisabled('broker', row.id);
        return (
          <div className="px-2">
            <BorderInput
              disabled={disabled}
              type="number"
              onChange={(e) => {
                setTableData({
                  ...tableData,
                  brokerageSharing: tableData.brokerageSharing.map((item) => {
                    if (item.id == row.id) {
                      return {
                        ...item,
                        broker: Number(e.target.value),
                        isUpdated: true,
                      };
                    }
                    return item;
                  }),
                });
              }}
              value={data == null ? '' : data}
            />
          </div>
        );
      },
    },
    {
      title: 'Sub Broker',
      align: 'left',
      dataIndex: 'subbroker',
      className: 'pl-2',
      render: (data, row) => {
        const disabled = checkDisabled('subbroker', row.id);
        return (
          <div className="px-2">
            <BorderInput
              type="number"
              disabled={disabled}
              onChange={(e) => {
                setTableData({
                  ...tableData,
                  brokerageSharing: tableData.brokerageSharing.map((item) => {
                    if (item.id == row.id) {
                      return {
                        ...item,
                        subbroker: Number(e.target.value),
                        isUpdated: true,
                      };
                    }
                    return item;
                  }),
                });
              }}
              value={data == null ? '' : data}
            />
          </div>
        );
      },
    },
    {
      title: 'Third Party',
      align: 'left',
      dataIndex: 'thirdparty',
      className: 'pl-2',
      render: (data, row) => {
        const disabled = checkDisabled('thirdparty', row.id);
        return (
          <div className="px-2">
            <BorderInput
              disabled={disabled}
              type="number"
              onChange={(e) => {
                setTableData({
                  ...tableData,
                  brokerageSharing: tableData.brokerageSharing.map((item) => {
                    if (item.id == row.id) {
                      return {
                        ...item,
                        thirdparty: Number(e.target.value),
                        isUpdated: true,
                      };
                    }
                    return item;
                  }),
                });
              }}
              value={data == null ? '' : data}
            />
          </div>
        );
      },
    },
    {
      title: 'Third Party Remarks',
      align: 'left',
      dataIndex: 'thirdpartyremarks',
      className: 'pl-2',
      render: (data, row) => {
        const disabled = checkDisabled('thirdpartyremarks', row.id);
        return (
          <div className="px-2">
            <BorderInput
              type="text"
              disabled={disabled}
              onChange={(e) => {
                setTableData({
                  ...tableData,
                  brokerageSharing: tableData.brokerageSharing.map((item) => {
                    if (item.id == row.id) {
                      return {
                        ...item,
                        thirdpartyremarks: e.target.value,
                        isUpdated: true,
                      };
                    }
                    return item;
                  }),
                });
              }}
              value={data == null ? '' : data}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Table
      loading={tableData.loading}
      columns={columns.filter((column) => {
        if (
          column.title == 'Third Party Remarks' ||
          column.title == 'Third Party'
        ) {
          if (tableData.brokerageSharing.length != 0) {
            if (tableData.brokerageSharing[0].thirdparty == null) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        }
        return true;
      })}
      dataSource={tableData.brokerageSharing}
      rowClassName={(data, index) => {
        if (index % 2 == 0) {
          return 'bg-[var(--primary-shade-d)]';
        }
        return '';
      }}
      className=""
      pagination={false}
    />
  );
};

export default ScriptTable;
