import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { Layout, Modal, Table } from 'antd';
import { useEffect, useState } from 'react';
import ManualForm from './manual-form';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import Joi from 'joi';
import { UserManualType, useUserManualStore } from '@/store/tools/usermanual';
import { ColumnsType } from 'antd/es/table';
import { ToggleAntd } from '@/components/inputs/toggle';
import Toast from '@/utils/common/toast';
import { BorderInput } from '@/components/inputs/text';

const Index = () => {
  const { apiCall } = useFetch();
  const {
    loading,
    pagination,
    refreshCount,
    userManuals,
    setLoading,
    setPagination,
    setRefreshCount,
    setUserManuals,
  } = useUserManualStore();

  const [open, setOpen] = useState(false);
  const [disabledEdit, setDisabledEdit] = useState(true);
  const handleStatusChange = async (id: number, statusToUpdate: boolean) => {
    const toast = new Toast('Updating Status..');
    const res = await apiCall(Routes.TERMSANDCONDITIONS.UPDATE_MANUAL_STATUS, {
      id: id,
      status: !statusToUpdate,
    });
    if (res.status) {
      toast.success('Successfully updated');
      setUserManuals(
        userManuals.map((u) => {
          if (u.id === id) {
            return { ...u, status: !statusToUpdate };
          }
          return u;
        })
      );
    }
  };

  let columns: ColumnsType<UserManualType> = [
    {
      title: <p className="px-2">Manual Name</p>,
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (data, row) => <p className="font-semibold ">{row.name}</p>,
    },
    {
      title: <p className="px-2">Manual Text</p>,
      dataIndex: 'text',
      key: 'text',
      align: 'center',
      render: (data, row) => (
        <textarea
          className={`rounded-[4px] placeholder:align-middle placeholder:text-[#8F95B2] placeholder:font-[300] placeholder:text-[12px] pl-2 md:pl-4 border-[1.2px]  border-[#D8DAE5] outline-none  focus:border-[var(--primary-shade-c)] disabled:text-[#8F95B2] w-[70rem] leading-6 min-h-20 h-20 max-h-40`}
          value={row.text}
          disabled={disabledEdit}
          rows={10}
          onChange={(e) => {
            setUserManuals(
              userManuals.map((u) => {
                if (u.id === row.id) {
                  return { ...u, text: e.target.value };
                }
                return u;
              })
            );
          }}
        >
          {row.text}
        </textarea>
      ),
    },
    {
      title: <p className="px-2">Status</p>,
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      render: (data, row) => (
        <div className="pr-5">
          <ToggleAntd
            checked={row.status ? true : false}
            onChange={(e) => {
              handleStatusChange(row.id, row.status);
            }}
          />
        </div>
      ),
    },
  ];

  const close = () => {
    setOpen(false);
  };
  const handleModalOpen = () => {
    setOpen(true);
  };

  const dataFetcher = async () => {
    let res = await apiCall(
      {
        url: `${Routes.TERMSANDCONDITIONS.GET_USER_MANUAL_LIST.url}?contentType=user_manual`,
        method: {
          type: 'GET',
          validation: Joi.any(),
        },
      },
      {},
      false
    );
    if (res.status) {
      console.log(res.data);
      setUserManuals(res.data);
    } else {
      return;
    }
  };
  const updateUserManual = async () => {
    const toast = new Toast('Updating user manual..');
    if (disabledEdit) {
      toast.error('Please edit the user manual');
      return;
    }
    console.log({ data: userManuals });
    let res = await apiCall(
      Routes.TERMSANDCONDITIONS.UPDATE_MANUAL,
      {
        data: userManuals,
      },
      false
    );
    if (res.status) {
      toast.success('User Manual Successfully updated');
      setRefreshCount(refreshCount + 1);
      setDisabledEdit(!disabledEdit);
    } else {
      toast.error('Error updating user manual');
      return;
    }
  };

  useEffect(() => {
    dataFetcher();
  }, [refreshCount]);

  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex justify-between space-x-3">
        <div className="flex items-center space-x-2">
          <H1>User Manual </H1>
          <I text="User Manual tooltop"></I>
        </div>
        <PrimaryButton className="h-10" onClick={handleModalOpen}>
          Add User Manual
        </PrimaryButton>
      </div>

      <Table
        className="rounded-md"
        style={{ fontWeight: 100 }}
        scroll={{ x: '800' }}
        loading={loading}
        columns={columns}
        pagination={{
          size: 'small',
          pageSize: pagination.pageSize,
          total: pagination.totalCount,
          onChange: (page, pageSize) => {
            setPagination({
              pageNumber: page,
              pageSize: pagination.pageSize,
              totalCount: pagination.totalCount,
            });
            setRefreshCount(refreshCount + 1);
          },
        }}
        dataSource={userManuals}
      />
      <div className="flex justify-end my-3 space-x-2">
        <BorderedButton
          onClick={() => {
            setDisabledEdit(!disabledEdit);
          }}
        >
          {disabledEdit ? 'Edit' : 'Cancel'}
        </BorderedButton>
        <PrimaryButton onClick={updateUserManual}>Save</PrimaryButton>
      </div>

      <Modal
        title="Enter User Manual Data"
        open={open}
        onCancel={close}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        width={800}
      >
        <ManualForm />
      </Modal>
    </Layout>
  );
};

export default Index;
