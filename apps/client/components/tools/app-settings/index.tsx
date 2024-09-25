import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { useManageAppSettingsStore } from '@/store/tools/manageappsettings';
import { Layout, Modal } from 'antd';
import AppSettingsTable from './app-settings-table';
import { SelectAntdBorder } from '@/components/inputs/select';
import { BorderInput } from '@/components/inputs/text';
import { CloseCircleOutlined } from '@ant-design/icons';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import { useEffect, useState } from 'react';
import AppSettingsForm from './create-settings-form';

const Index = () => {
  const {
    loading,
    paginationData,
    setPaginationData,
    data,
    total,
    setRefresh,
    refresh,
    keyOptions,
    setKeyOptions,
    setLoading,
    filterData,
    sort,
    setData,
    setTotal,
    setStoreCondition,
    setFilterData,
    createFormData,
    setEditMode,
    editMode,
    setCreateFormData,
  } = useManageAppSettingsStore();
  const { apiCall } = useFetch();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Create App Setting');
  const distinctKeysFetcher = async () => {
    let response = await apiCall(
      Routes.GET_DISTINCT_PROJECT_SETTINGS_KEY,
      {},
      false
    );

    if (response.status) {
      let options = response.data.map((a: any) => {
        return a.prjSettKey;
      });
      setKeyOptions(options);
    }
    return;
  };

  const settingsDataFetcher = async () => {
    setLoading(true);
    let response = await apiCall(
      Routes.GET_PROJECT_SETTINGS,
      {
        pageSize: paginationData.pageSize,
        pageNumber: paginationData.pageNumber,
        ...filterData,
        sort,
      },
      false
    );

    if (response.status == true) {
      setData(response.data.projectSettingsData);
      setTotal(response.data.count);
      setLoading(false);
      setStoreCondition(false);
    } else {
      setLoading(false);
      new Toast('').error(response.message);
    }
    return;
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setModalText('Creating App Setting!!');
    setConfirmLoading(true);

    let response = await apiCall(
      Routes.CREATE_NEW_PROJECT_SETTING,
      { ...createFormData },
      false
    );

    if (response.status == false) {
      new Toast('').error(response.message);
      setConfirmLoading(false);
      //   setOpen(false);
      setModalText('Create App Setting');
      return;
    }

    new Toast('').success('Created Successfully!!');
    setModalText('Created App Setting!!!');
    setTimeout(() => {
      setModalText('Create App Setting');
    });
    setConfirmLoading(false);
    setOpen(false);
    setCreateFormData('', '', '', '', 0);
    setRefresh();
    return;
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    settingsDataFetcher();
  }, [refresh]);
  useEffect(() => {
    distinctKeysFetcher();
  }, []);
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Manage App Settings</H1>
        {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
        <I text="Search User tooltip" />
      </div>

      <div
        className={`${' w-[100%] '} mb-4 overflow-x-scroll py-[2px] pl-[2px] flex flex-col space-y-2 md:space-y-0 md:justify-between md:flex-row md:items-center`}
      >
        <form
          className="flex space-x-3 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            //   submitHandler();
            setPaginationData(1, 10);
            setRefresh();
          }}
        >
          <div className="flex space-x-3 items-center">
            <SelectAntdBorder
              defaultValue=""
              className="md:!min-w-[130px]  !bg-white !h-[41.5px] !py-[0.22rem]"
              handleChange={(value) => {
                // setTableData({ ...tableData, exchange: value });
                setFilterData(value, filterData.prjSettName);
              }}
              options={[
                { label: 'All', value: '' },
                ...keyOptions.map((a) => {
                  return { label: a, value: a };
                }),
              ]}
              value={filterData.prjSettKey}
            />
            <BorderInput
              className="!py-[0.22rem]"
              value={filterData.prjSettName}
              onChange={(e) => {
                // setTableData({ ...tableData, script: e.target.value });
                setFilterData(filterData.prjSettKey, e.target.value);
              }}
              placeholder="Search App Setting"
            />

            <PrimaryButton type="submit">Search</PrimaryButton>

            <CloseCircleOutlined className=" text-[var(--primary-shade-b)]" />
            <span className="underline text-[var(--primary-shade-b)]">
              Reset
            </span>
          </div>
        </form>

        <PrimaryButton
          onClick={() => {
            setOpen(true);
          }}
        >
          Create
        </PrimaryButton>
      </div>

      <div className="w-full flex flex-row">
        <div className={'w-[100%]'}>
          <AppSettingsTable />
        </div>
      </div>
      <div className={`${'w-full'} justify-between flex mt-2 items-center`}>
        {/* <div className="left text-[var(--primary-shade-b)] underline underline-offset-1">
          Back to Basic Information
        </div> */}
        <div></div>
        <div className="right flex flex-row space-x-2 items-center">
          <PrimaryButton
            onClick={() => {
              //   setFormActive(!formActive);
              setEditMode(!editMode);
            }}
            className="!bg-white text-[var(--primary-shade-b)]"
          >
            Edit
          </PrimaryButton>
          {/* <PrimaryButton onClick={() => {}}>Save</PrimaryButton> */}
        </div>
      </div>

      <Modal
        title={modalText}
        open={open}
        centered={true}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        cancelButtonProps={{ style: { borderColor: 'red', color: 'red' } }}
        okButtonProps={{ style: { backgroundColor: '#0B2631' } }}
      >
        <AppSettingsForm />
      </Modal>
    </Layout>
  );
};

export default Index;
