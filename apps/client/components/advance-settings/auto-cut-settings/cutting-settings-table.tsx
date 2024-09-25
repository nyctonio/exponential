import { SelectAntdBorder } from '@/components/inputs/select';
import { BorderInput } from '@/components/inputs/text';
import { useAutoCutSettingsStore } from '@/store/advance-settings/trade-auto-cut-settings';
import { UserCuttingSetting } from '@/types/advance-settings/auto-cut-settings';
import TimeHandler from '@/utils/common/timeHandler';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';

function CuttingSettingsTable() {
  const { cuttingSettings, setCuttingSettings, loading, editMode } =
    useAutoCutSettingsStore();

  const columns: ColumnsType<UserCuttingSetting> = [
    {
      title: () => <div className="px-2">Option</div>,
      align: 'left',
      dataIndex: 'value',
      width: '42%',
      ellipsis: true,
      render: (data, row) => <div className="px-2">{row.option}</div>,
    },
    {
      title: 'Value',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => (
        <>
          {row.constant == 'Lot Cutting' && (
            <SelectAntdBorder
              defaultValue={row.value}
              handleChange={(e) => {}}
              options={[
                { label: 'LIFO', value: 'LIFO' },
                { label: 'FIFO', value: 'FIFO' },
              ]}
              value={row.value}
              disabled={!editMode}
              className="outline-none !w-[91%] md:!w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]"
            />
          )}

          {row.constant == 'Trade Square Off' && (
            <SelectAntdBorder
              defaultValue={row.value}
              handleChange={(e) => {}}
              options={[
                { label: 'Closing Price', value: 'Closing Price' },
                { label: 'LTP', value: 'LTP' },
              ]}
              value={row.value}
              disabled={!editMode}
              className="outline-none !w-[91%] md:!w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]"
            />
          )}

          {row.constant != 'Lot Cutting' &&
            row.constant != 'Trade Square Off' && (
              <BorderInput
                value={row.value}
                onChange={(e) => {
                  let settings = cuttingSettings;
                  settings = settings.map((a) => {
                    if (a.id == row.id) {
                      return {
                        ...a,
                        isUpdated: true,
                        value: e.target.value,
                      };
                    }
                    return a;
                  });
                  setCuttingSettings(settings);
                }}
                disabled={!editMode}
                className={`${
                  row.isUpdated ? 'text-blue-600' : ''
                } outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
                type="number"
              />
            )}
        </>
      ),
    },
    {
      title: 'Last Updated',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => <>{TimeHandler.dateHandler(row.updatedAt)}</>,
    },
  ];
  return (
    <div className="flex flex-col space-y-2">
      <div className="font-semibold">Cutting/Non Cutting Settings</div>
      <Table
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'bg-[var(--light)]' : 'bg-[var(--primary-shade-d)]'
        }
        loading={loading}
        // @ts-ignore
        columns={columns}
        scroll={{ y: 450, x: 400 }}
        dataSource={cuttingSettings}
        // bordered
        pagination={false}
      />
    </div>
  );
}

export default CuttingSettingsTable;
