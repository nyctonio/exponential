import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { LogsInfo, useLogsInfo } from '@/store/tools/watchlogs';
import Routes from '@/utils/routes';
import { Modal, Tooltip } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const LogsTable = () => {
  const { apiCall } = useFetch();
  const [openModal, setOpenModal] = useState<{
    open: boolean;
    row: LogsInfo | null;
  }>();
  const handleOk = () => {
    setOpenModal({
      open: false,
      row: null,
    });
  };

  const handleCancel = () => {
    setOpenModal({
      open: false,
      row: null,
    });
  };
  const {
    loading,
    logsInfo,
    pagination,
    refreshCount,
    setLoading,
    setLogsInfo,
    setPagination,
    setRefreshCount,
  } = useLogsInfo();

  let columns: ColumnsType<LogsInfo> = [
    {
      title: <p className="px-2">Type</p>,
      dataIndex: 'type',
      key: 'type',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.type}</p>,
    },
    {
      title: <p className="px-2">Operation</p>,
      dataIndex: 'operation',
      key: 'operation',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.operation}</p>,
    },
    {
      title: <p className="px-2">Description</p>,
      dataIndex: 'description',
      key: 'description',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.description}</p>,
    },
    {
      title: <p className="px-2">Action Done By</p>,
      dataIndex: 'actionDoneBy',
      key: 'actionDoneBy',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.actionDoneBy}</p>,
    },
    {
      title: <p className="px-2">Logged in User</p>,
      dataIndex: 'loggedInUser',
      key: 'loggedInUser',
      align: 'left',
      width: 10,
      render: (data, row) => <p className="px-2">{row.loggedInUser}</p>,
    },
    {
      title: <p className="px-2">Targetted Users</p>,
      dataIndex: 'targetUsers',
      key: 'targetUsers',
      align: 'left',
      width: 10,
      render: (data, row) => (
        <p className="px-2">
          {row.targetUsers.map((_t, i) => {
            return <span key={i}>{`${_t}`} </span>;
          })}
        </p>
      ),
    },
    {
      title: <p className="px-2">Meta Data</p>,
      dataIndex: 'metaData',
      key: 'metaData',
      align: 'left',
      width: 20,
      render: (data, row) => (
        <button
          className="ml-5"
          onClick={() => {
            setOpenModal({
              open: true,
              row: row,
            });
          }}
          title="Click to see metadata"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            id="Eye"
            height={20}
            width={20}
          >
            <path fill="none" d="M0 0h48v48H0z"></path>
            <path
              d="M24 9C14 9 5.46 15.22 2 24c3.46 8.78 12 15 22 15 10.01 0 18.54-6.22 22-15-3.46-8.78-11.99-15-22-15zm0 25c-5.52 0-10-4.48-10-10s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10zm0-16c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
              fill="#294a42"
              className="color000000 svgShape"
            ></path>
          </svg>
        </button>
      ),
    },
  ];

  const dataFetch = async () => {
    setLoading(true);
    let res = await apiCall(Routes.TOOLS.GET_WATCH_LOGS, {}, false);
    if (res.status) {
      console.log(res.data, 'data is here');
      setLogsInfo(res.data);
      setPagination({ ...pagination, totalCount: res.data.count || 0 });
    }
    setLoading(false);
  };

  useEffect(() => {
    dataFetch();
  }, [refreshCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      dataFetch();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <H1>Watch Logs</H1>
        <Tooltip placement="top" title={'This is tooltip'}>
          <I text=""></I>
        </Tooltip>
      </div>
      <Modal
        title="Meta Data"
        open={openModal?.open}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <div className="space-x-2 mt-[40px]">
              <PrimaryButton onClick={() => handleCancel()}>
                Close
              </PrimaryButton>
            </div>
          </>
        )}
      >
        meta data
      </Modal>
      <Table
        loading={loading}
        className="rounded-md"
        style={{ fontWeight: 100 }}
        columns={columns}
        pagination={false}
        dataSource={logsInfo}
      />
    </>
  );
};

export default LogsTable;
