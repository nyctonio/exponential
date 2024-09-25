import React from 'react';
import { Table } from 'antd';
import { useState, useRef, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { plSharingValidation } from '@/utils/validation/advance-settings/pl-brokerage-sharing';
import {
  PlSharingType,
  RentSharingType,
} from '@/store/advance-settings/pl-brokerage-sharing';
import { usePlBrokerageSharingStore } from '@/store/advance-settings/pl-brokerage-sharing';
import printSafe from '../../../utils/common/print';
import TimeHandler from '@/utils/common/timeHandler';
import { useUserStore } from '@/store/user';
import { BorderInput } from '@/components/inputs/text';

const ScriptTable = () => {
  const { tableData, setTableData, formActive, setFormActive } =
    usePlBrokerageSharingStore();

  const checkDisabled = (label: string, id: number | string) => {
    if (!formActive) {
      return true;
    } else {
      let check = true;
      //@ts-ignore
      if (tableData.rentSharing && tableData.rentSharing[`${label}`] != null) {
        return false;
      }
      return check;
    }
  };

  const columns: ColumnsType<RentSharingType> = [
    {
      title: <div className="pl-2">Total</div>,
      align: 'left',
      dataIndex: 'total',
      className: 'pl-2',
      render: (data, row) => {
        return <div className="pl-2">{data}</div>;
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
                  rentSharing: {
                    ...tableData.rentSharing,
                    self: Number(e.target.value),
                  },
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
                  rentSharing: {
                    ...tableData.rentSharing,
                    master: Number(e.target.value),
                  },
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
                  rentSharing: {
                    ...tableData.rentSharing,
                    broker: Number(e.target.value),
                  },
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
                  rentSharing: {
                    ...tableData.rentSharing,
                    self: Number(e.target.value),
                  },
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
                  rentSharing: {
                    ...tableData.rentSharing,
                    thirdparty: Number(e.target.value),
                  },
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
                  rentSharing: {
                    ...tableData.rentSharing,
                    thirdpartyremarks: e.target.value,
                  },
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
          if (tableData.rentSharing?.thirdparty) {
            return true;
          } else {
            return false;
          }
        }
        return true;
      })}
      dataSource={tableData.rentSharing ? [tableData.rentSharing] : []}
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
