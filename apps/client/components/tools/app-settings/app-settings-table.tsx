import Toast from '@/utils/common/toast';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, FormInstance, Input, InputRef, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Routes from '@/utils/routes';
import { useManageAppSettingsStore } from '@/store/tools/manageappsettings';
import useFetch from '@/hooks/useFetch';
import { ToggleAntd } from '@/components/inputs/toggle';
import CustomInput from './custom-input';
// import CustomInput from './custom-input';
interface DataType {
  key: string;
  id: number;
  prjSettName: string;
  prjSettKey: string;
  prjSettDisplayName: string;
  prjSettSortOrder: number;
  prjSettActive: boolean;
  prjSettConstant: string;
}
type DataIndex = keyof DataType;

function AppSettingsTable() {
  const { apiCall } = useFetch();
  const {
    sort,
    loading,
    setSort,
    setSortNull,
    updateData,
    setRefresh,
    refresh,
    total,
    paginationData,
    editMode,
    setPaginationData,
  } = useManageAppSettingsStore();

  const { data }: { data: any } = useManageAppSettingsStore();
  const sortProps = (key: string) => {
    if (sort) {
      if (sort.key == key) {
        return sort.value == 'ASC' ? 'ascend' : 'descend';
      }
    }
    return undefined;
  };

  const dataUpdater = async (
    id: number,
    displayValue: string,
    sortOrder: number,
    active: boolean
  ) => {
    let toast = new Toast('Updating App Setting');
    let response = await apiCall(
      Routes.UPDATE_PROJECT_SETTINGS_KEY,
      { id, displayValue, sortOrder, active },
      false
    );
    if (response.status == true) {
      toast.success('Updated Successfully');
      updateData(id, displayValue, sortOrder, active);
      return;
    } else {
      toast.error(response.message);
      setRefresh();
      //refreshing
      return;
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: () => (
        <div className="flex flex-row justify-start leading-none pl-2">
          Application Setting Key
        </div>
      ),
      dataIndex: 'prjSettKey',
      key: 'prjSettKey',
      width: '1.6%',
      align: 'left',
      sorter: true,
      sortOrder: sortProps('prjSettKey'),
      showSorterTooltip: false,
      render: (data, row) => <div className="pl-2">{data}</div>,
    },
    {
      title: () => (
        <div className="flex flex-row  leading-none">
          Application Setting Name
        </div>
      ),
      dataIndex: 'prjSettName',
      key: 'prjSettName',
      width: '1.6%',
      align: 'left',
      sorter: true,
      sortOrder: sortProps('prjSettName'),
      showSorterTooltip: false,
    },
    {
      title: () => (
        <div className="flex flex-row  leading-none">
          Application Setting Value
        </div>
      ),
      dataIndex: 'prjSettConstant',
      key: 'prjSettConstant',
      width: '1.6%',
      align: 'left',
      sorter: true,
      sortOrder: sortProps('prjSettConstant'),
      showSorterTooltip: false,
    },
    {
      title: () => (
        <div className="flex flex-row leading-none">Display Value</div>
      ),
      dataIndex: 'prjSettDisplayName',
      key: 'prjSettDisplayName',
      width: '2%',
      align: 'left',
      sorter: true,
      sortOrder: sortProps('prjSettDisplayName'),
      showSorterTooltip: false,
      render: (value, row) => (
        <div className="flex flex-row justify-start">
          <CustomInput
            type="text"
            key={`display-name-input-${row.prjSettConstant}`}
            id={`display-name-input-${row.prjSettConstant}`}
            value={row.prjSettDisplayName}
            setValue={(value: string) => {
              //   updateData(row.id, value, row.prjSettSortOrder);
            }}
            onSave={(inputValue: string) => {
              dataUpdater(
                row.id,
                inputValue,
                row.prjSettSortOrder,
                row.prjSettActive
              );
            }}
            placeholder="Display Value"
          ></CustomInput>
        </div>
      ),
    },
    {
      title: 'Sort Order',
      dataIndex: 'prjSettSortOrder',
      key: 'prjSettSortOrder',
      width: '1%',
      align: 'left',
      render: (value, row) => (
        <div className="flex  flex-row justify-start">
          <CustomInput
            type="number"
            key={`sort-order-input-${row.prjSettConstant}`}
            id={`sort-order-input-${row.prjSettConstant}`}
            value={row.prjSettSortOrder.toString()}
            setValue={(value: number) => {}}
            onSave={(value: number) => {
              dataUpdater(
                row.id,
                row.prjSettDisplayName,
                value,
                row.prjSettActive
              );
            }}
            placeholder="Sort Order"
          ></CustomInput>
        </div>
      ),
    },
    {
      title: () => {
        return (
          <div className="flex flex-row justify-center leading-none">
            Active
          </div>
        );
      },
      dataIndex: 'prjSettActive',
      key: 'prjSettActive',
      width: '1%',
      align: 'center',
      render: (item, row) => {
        return (
          <div className="flex flex-row justify-center">
            <ToggleAntd
              key={`${row.id}-active`}
              checked={row.prjSettActive}
              onChange={(value: boolean) => {
                dataUpdater(
                  row.id,
                  row.prjSettDisplayName,
                  row.prjSettSortOrder,
                  value
                );
              }}
              disabled={!editMode}
            />
          </div>
        );
      },
    },
  ];

  const onTableChange = (pagination: any, filter: any, sorter: any) => {
    if (sorter) {
      let order = '';

      if (!sorter.order) {
        order = 'NONE';
        setSortNull();
        setRefresh();
      }
      if (sorter.order && sorter.order == 'ascend') {
        order = 'ASC';
      }

      if (sorter && sorter.order == 'descend') {
        order = 'DESC';
      }
      if (order == 'ASC' || order == 'DESC') {
        setSort(sorter.columnKey, order);
        setRefresh();
      }
    }
    if (pagination) {
      console.log('pagination is ', pagination);
      setPaginationData(pagination.current, pagination.pageSize);
      setRefresh();
    }
  };

  return (
    <Table
      loading={loading}
      rowClassName={(record, index) =>
        index % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
      }
      style={{ fontWeight: 100 }}
      scroll={{ x: 1160, y: 460 }}
      columns={columns}
      onChange={onTableChange}
      dataSource={data}
      pagination={{ size: 'small', total }}
    />
  );
}

export default AppSettingsTable;
