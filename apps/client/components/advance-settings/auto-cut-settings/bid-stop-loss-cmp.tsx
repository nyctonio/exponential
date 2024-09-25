import { BorderInput } from '@/components/inputs/text';
import { useAutoCutSettingsStore } from '@/store/advance-settings/trade-auto-cut-settings';
import {
  McxBidStopLossSetting,
  UserCuttingSetting,
} from '@/types/advance-settings/auto-cut-settings';
import TimeHandler from '@/utils/common/timeHandler';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';

function BidStopLossCmp() {
  const { mcxBidSettings, loading, setMcxBidSettings, editMode } =
    useAutoCutSettingsStore();

  const columns: ColumnsType<McxBidStopLossSetting> = [
    {
      title: () => <div className="px-2">Script</div>,
      align: 'left',
      dataIndex: 'value',
      render: (data, row) => <div className="pl-2">{row.instrumentName}</div>,
    },
    {
      title: 'Bid',
      align: 'center',
      dataIndex: 'value',

      render: (data, row) => (
        <>
          <div className="flex justify-center">
            <BorderInput
              value={row.bidValue}
              onChange={(e) => {
                let settings = mcxBidSettings;
                settings = settings.map((a) => {
                  if (a.id == row.id) {
                    return {
                      ...a,
                      bidValue: Number(e.target.value),
                      isUpdated: true,
                    };
                  }
                  return a;
                });
                setMcxBidSettings(settings);
              }}
              disabled={!editMode}
              className={`${
                row.isUpdated ? 'text-blue-600' : ''
              } outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
              type="number"
            />
          </div>
        </>
      ),
    },
    {
      title: 'Stop Loss',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => (
        <>
          <BorderInput
            value={row.stopLossValue}
            onChange={(e) => {
              let settings = mcxBidSettings;
              settings = settings.map((a) => {
                if (a.id == row.id) {
                  return {
                    ...a,
                    isUpdated: true,
                    stopLossValue: Number(e.target.value),
                  };
                }
                return a;
              });
              setMcxBidSettings(settings);
            }}
            disabled={!editMode}
            className={`${
              row.isUpdated ? 'text-blue-600' : ''
            } outline-none w-[90%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
            type="number"
          />
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
      <div className="font-semibold">Bid/Stop Loss - Away CMP</div>
      <Table
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'bg-[var(--light)]' : 'bg-[var(--primary-shade-d)]'
        }
        loading={loading}
        // @ts-ignore
        columns={columns}
        scroll={{ y: 179 }}
        dataSource={mcxBidSettings}
        // bordered
        pagination={false}
      />
    </div>
  );
}

export default BidStopLossCmp;
