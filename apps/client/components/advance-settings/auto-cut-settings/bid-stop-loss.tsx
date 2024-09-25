import { BorderInput } from '@/components/inputs/text';
import { ToggleAntd } from '@/components/inputs/toggle';
import { useAutoCutSettingsStore } from '@/store/advance-settings/trade-auto-cut-settings';
import {
  TableBidStopLossSetting,
  UserCuttingSetting,
} from '@/types/advance-settings/auto-cut-settings';
import TimeHandler from '@/utils/common/timeHandler';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';

function BidStopLoss() {
  const { bidSettings, setBidSettings, loading, editMode } =
    useAutoCutSettingsStore();

  const columns: ColumnsType<TableBidStopLossSetting> = [
    {
      title: () => <div className="px-2">Option</div>,
      align: 'left',
      dataIndex: 'value',
      render: (data, row) => <div className="px-2">{row.option}</div>,
    },
    {
      title: 'Outside H/L',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => (
        <>
          <div className="flex justify-center">
            <ToggleAntd
              checked={row.outsideHL}
              onChange={(checked) => {
                let settings = bidSettings;
                settings = settings.map((a) => {
                  if (a.id == row.id) {
                    return {
                      ...a,
                      isUpdated: true,
                      outsideHL: checked,
                    };
                  }
                  return a;
                });
                setBidSettings(settings);
              }}
              disabled={!editMode}
            />
          </div>
        </>
      ),
    },
    {
      title: 'Between H/L',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => (
        <>
          {' '}
          <div className="flex justify-center">
            <ToggleAntd
              checked={row.betweenHL}
              onChange={(checked) => {
                let settings = bidSettings;
                settings = settings.map((a) => {
                  if (a.id == row.id) {
                    return {
                      ...a,
                      isUpdated: true,
                      betweenHL: checked,
                    };
                  }
                  return a;
                });
                setBidSettings(settings);
              }}
              disabled={!editMode}
            />
          </div>
        </>
      ),
    },
    {
      title: 'Bid/SL - Away CMP',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => (
        <>
          <BorderInput
            value={row.cmp}
            onChange={(e) => {
              let settings = bidSettings;
              settings = settings.map((a) => {
                if (a.id == row.id) {
                  return {
                    ...a,
                    isUpdated: true,
                    cmp: Number(e.target.value),
                  };
                }
                return a;
              });
              setBidSettings(settings);
            }}
            disabled={!editMode}
            className={`${
              row.isUpdated ? 'text-blue-600' : ''
            } outline-none w-[70%] pl-2 border-[1px] rounded-sm !py-[0px] !h-[30px]`}
            type="number"
          />
        </>
      ),
    },
    {
      title: 'Last Updated',
      align: 'center',
      dataIndex: 'value',
      render: (data, row) => <>{TimeHandler.dateHandler(row.lastUpdated)}</>,
    },
  ];
  return (
    <div className="flex flex-col space-y-2">
      <div className="font-semibold">Bid/Stop Loss Settings</div>
      <Table
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'bg-[var(--light)]' : 'bg-[var(--primary-shade-d)]'
        }
        loading={loading}
        // @ts-ignore
        columns={columns}
        scroll={{ y: 450, x: 450 }}
        dataSource={bidSettings}
        // bordered
        pagination={false}
      />
    </div>
  );
}

export default BidStopLoss;
