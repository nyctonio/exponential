import { AsyncButtonAntd } from '@/components/inputs/button';
import { SelectAntd, SelectAntdBorder } from '@/components/inputs/select';
import { BorderInput } from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { userSearchUserStore } from '@/store/admin/searchuser';
import TimeHandler from '@/utils/common/timeHandler';
import Routes from '@/utils/routes';
import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

function Index() {
  const { modalStatus, setModalStatus } = userSearchUserStore();

  const { apiCall } = useFetch();

  let columns: ColumnsType<any> = [
    {
      title: () => <div className="px-1">Login Time</div>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '27%',

      render: (data, row) => {
        return (
          <div className="px-1">
            {TimeHandler.dateTimeHandler(row.createdAt)}
          </div>
        );
      },
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: '30%',
    },
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
      width: '20%',
      align: 'center',
      render: () => {
        return <>Web</>;
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: '20%',
    },
  ];

  const [tableData, setTableData] = useState({
    data: [],
    pageNumber: 1,
    totalCount: 0,
    loading: false,
  });

  const loginDataFetcher = async () => {
    setTableData({ ...tableData, loading: true });
    let data = await apiCall(Routes.ADMIN.GET_LOGIN_HISTORY, {
      pageNumber: tableData.pageNumber,
      userId: modalStatus.userId,
    });
    if (data.status == true) {
      setTableData({
        ...tableData,
        data: data.data.history,
        totalCount: data.data.count,
        loading: false,
      });
    } else {
      setTableData({ ...tableData, loading: false });
    }
    return;
  };

  useEffect(() => {
    if (modalStatus.userId != -1) {
      loginDataFetcher();
    }
  }, [tableData.pageNumber, modalStatus.userId]);

  return (
    <Modal
      title={<div className="font-[500] text-xl">Login History</div>}
      open={modalStatus.loginHistory}
      className="!w-[85%] md:!w-[60%] lg:!w-[60%] xl:!w-[40%]"
      onOk={() => {}}
      destroyOnClose={true}
      confirmLoading={true}
      centered={true}
      okButtonProps={{ hidden: true }}
      cancelButtonProps={{ hidden: true }}
      onCancel={() => {
        setModalStatus({ ...modalStatus, loginHistory: false });
      }}
    >
      <Table
        loading={tableData.loading}
        className="text-xs"
        style={{
          fontSize: '10px',
        }}
        columns={columns}
        dataSource={tableData.data}
        pagination={{
          size: 'small',
          defaultPageSize: 5,
          current: tableData.pageNumber,
          showTotal: () => {
            return <></>;
          },
          onChange: (page, pageSize) => {
            setTableData({ ...tableData, pageNumber: page });
          },
          total: tableData.totalCount,
        }}
        scroll={{ y: 200 }}
      />
    </Modal>
  );
}

export default Index;
