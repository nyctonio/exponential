import React, { useEffect, useState, useRef } from 'react';
import { Table, Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { useUserStore } from '@/store/user';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import {
  SetSuspiciousTrades,
  useSetSuspiciousTrades,
} from '@/store/risk-management/setupsuspicioustrades';
import { BorderInput } from '@/components/inputs/text';
import { InlineLabeledToggle, ToggleAntd } from '@/components/inputs/toggle';
import { SelectStyled } from '@/components/inputs/select';
import Joi from 'joi';
import Toast from '@/utils/common/toast';
import { PrimaryButton } from '@/components/inputs/button';

const SetSuspiciousTable = () => {
  const { apiCall } = useFetch();

  const {
    pagination,
    suspiciousTrades,
    refreshCount,
    loading,
    setPagination,
    setSuspiciousTrades,
    setRefreshCount,
    setLoading,
  } = useSetSuspiciousTrades();
  const { user, config } = useUserStore();

  const handleStatusChange = async (id: string, statusToUpdate: string) => {
    const toast = new Toast('Updating Status..');
    const res = await apiCall(Routes.TRADE.UPDATE_RULE_STATUS, {
      _id: id,
      status: statusToUpdate === 'Active' ? 'Inactive' : 'Active',
    });

    if (res.status) {
      toast.success('Successfully updated');
      setSuspiciousTrades(
        suspiciousTrades.map((s) => {
          if (s._id === id) {
            if (s.status === 'Active') {
              return { ...s, status: 'Inactive' };
            } else if (s.status === 'Inactive') {
              return { ...s, status: 'Active' };
            }
          }
          return s;
        })
      );
    }
  };

  const handleUpdate = async () => {
    const toast = new Toast('Updating Rules..');
    const res = await apiCall(Routes.TRADE.UPDATE_SUSPICIOUS_RULES, {
      records: suspiciousTrades,
    });
    if (res.status) {
      toast.success('Rules updated successfully');
      setRefreshCount(refreshCount + 1);
    } else {
      toast.error('Error while updating rules');
    }
  };

  let columns: ColumnsType<SetSuspiciousTrades> = [
    {
      title: <p className="px-2">Condition</p>,
      dataIndex: 'condition',
      key: 'condition',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.condition}</p>,
    },
    {
      title: <p className="px-2">Level</p>,
      dataIndex: 'level',
      key: 'level',
      align: 'left',
      width: 10,
      render: (data, row) => (
        <>
          <SelectStyled
            value={row.level}
            onChange={(e) => {
              setSuspiciousTrades(
                suspiciousTrades.map((s) => {
                  if (s._id === row._id) {
                    return { ...s, level: e.target.value };
                  }
                  return s;
                })
              );
            }}
          >
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </SelectStyled>
        </>
      ),
    },
    {
      title: <p className="px-2">Points</p>,
      dataIndex: 'points',
      key: 'points',
      align: 'left',
      width: 30,
      render: (data, row) => (
        <BorderInput
          className="w-14 text-center pr-3"
          value={row.points}
          onChange={(e) => {
            let trades = suspiciousTrades;
            const newPoints = e.target.value ? parseInt(e.target.value) : 0;
            trades = trades.map((t) => {
              if (t.condition === row.condition) {
                return {
                  ...t,
                  points: newPoints,
                };
              }
              return t;
            });
            setSuspiciousTrades(trades);
          }}
        />
      ),
    },
    {
      title: <p className="px-2">Priority</p>,
      dataIndex: 'priority',
      key: 'priority',
      align: 'left',
      width: 30,
      render: (data, row) => (
        <BorderInput
          className="w-14 text-center pr-3"
          value={row.priority}
          onChange={(e) => {
            let trades = suspiciousTrades;
            const newP = e.target.value ? parseInt(e.target.value) : 0;
            const tradeWithNewPriority = trades.find(
              (t) => t.priority === newP && t !== row
            );
            if (tradeWithNewPriority) {
              trades = trades.map((t) => {
                if (t === row) {
                  return { ...t, priority: newP };
                }
                if (t === tradeWithNewPriority) {
                  return { ...t, priority: row.priority };
                }
                return t;
              });
            }
            trades = trades.map((t) => {
              if (t === row) {
                return { ...t, priority: newP };
              }
              return t;
            });
            setSuspiciousTrades(trades);
          }}
        />
      ),
    },
    {
      title: <p className="px-2">Status</p>,
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      width: 20,
      render: (data, row) => (
        <ToggleAntd
          checked={row.status == 'Active' ? true : false}
          onChange={(e) => {
            handleStatusChange(row._id, row.status);
          }}
        />
      ),
    },
  ];

  const dataFetcher = async () => {
    setLoading(true);
    let res = await apiCall(Routes.TRADE.GET_SUSPICIOUS_RULES, {
      pageNumber: pagination?.pageNumber,
      pageSize: pagination?.pageSize,
    });
    console.log(res, 'response is here');
    if (res.status) {
      setSuspiciousTrades(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);

  return (
    <>
      <div className="flex items-center space-x-2">
        <H1>Set Suspicious Trade</H1>
        <Tooltip placement="top" title={'This is tooltip'}>
          <I text=""></I>
        </Tooltip>
      </div>
      <p className="text-lg mt-2 font-medium">Edit Rules</p>
      <div className="mt-2 ">
        <Table
          loading={loading}
          className="rounded-md"
          style={{ fontWeight: 100 }}
          scroll={{ x: '800' }}
          columns={columns}
          pagination={false}
          dataSource={suspiciousTrades}
        />
      </div>
      <div className="flex flex-row-reverse mt-2">
        <PrimaryButton onClick={handleUpdate}>Update</PrimaryButton>
      </div>
    </>
  );
};

export default SetSuspiciousTable;
