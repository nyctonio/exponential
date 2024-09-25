import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { BorderInput } from '@/components/inputs/text';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { useBrokerageStore } from '@/store/advance-settings/brokerage-settings';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import BrokerageSettingsTable from './brokerage-table';
import { SelectAntdBorder } from '@/components/inputs/select';
import { CloseCircleOutlined } from '@ant-design/icons';
import CreateUserMenu from '@/components/admin/create-update-client/create-user-menu';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import validateUsername from '@/utils/common/validateUsername';

function Index() {
  const { apiCall } = useFetch();
  const [refreshCount, setRefreshCount] = useState(0);
  const param = useSearchParams();
  const isEdit = param.get('edit') == 'true' ? true : false;

  const {
    setTableData,
    tableData,
    setDropDownData,
    dropdownData,
    setFormActive,
    formActive,
    setUsername,
    username,
  } = useBrokerageStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const submitHandler = async () => {
    setTableData({ ...tableData, fetched: false });
    let toast = new Toast('Fetching Records!!!');
    if (searchParams.get('edit') == 'true' && username.length == 0) {
      return router.back();
    }
    if (!searchParams.get('edit')) {
      //to validate
      let validationResult = validateUsername(username);
      if (validationResult.status == false) {
        toast.error(validationResult.message);
        return;
      }
    }
    let response = await apiCall(
      {
        url: `${Routes.GET_ALLOWED_EXCHANGES.url}/${username}`,
        method: Routes.GET_ALLOWED_EXCHANGES.method,
      },
      {},
      false
    );
    if (response.status == true) {
      toast.success('User Found');
      setTableData({
        ...tableData,
        userId: response.data.userId,
        fetched: true,
        userType: response.data.userType,
        username: username.trim(),
      });
      setDropDownData(
        response.data.exchange.map((item: any) => {
          return {
            id: item.exchange.id,
            name: item.exchange.exchangeName,
            value: item.exchange.exchangeName,
          };
        })
      );
      setRefreshCount(refreshCount + 1);
      return;
    }
    setTableData({
      ...tableData,
      fetched: false,
      username: '',
      userId: null,
      userType: null,
    });
    toast.error(response.message);
    return;
  };

  const [updateLoading, setUpdateLoading] = useState(false);
  const updateHandler = async () => {
    setUpdateLoading(true);
    let toast = new Toast('Saving Changes!!!');
    let data: { userId: number; instruments: any } = {
      userId: tableData.userId || -1,
      instruments: [],
    };

    tableData.instrumentsData
      .filter((a) => a.user.edited == true)
      .map((item) => {
        let tempObj = {
          name: item.name,
          brokerage: {
            brokeragePerCroreAmt: item.user.perCrore,
            brokeragePerLotAmt: item.user.perLot,
            brokerageType: item.user.active,
          },
        };
        data.instruments.push(tempObj);
      });
    console.log('=>>>', data);
    let res = await apiCall(Routes.UPDATE_BROKERAGE_SETTINGS, data, false);
    setUpdateLoading(false);
    if (res.status == true) {
      toast.success('Saved Changes!!!');
      setRefreshCount(refreshCount + 1);
    } else {
      toast.error(res.message);
    }
    return;
  };

  useEffect(() => {
    if (isEdit) {
      submitHandler();
    }
    return;
  }, []);

  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Script Brokerage Settings</H1>
        {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
        <I text="Search User tooltip" />
      </div>
      <div
        className={`${
          searchParams.get('edit') == 'true' ? 'md:w-[75%] w-[100%]' : ''
        } mb-4 overflow-x-scroll py-[2px] pl-[2px] flex flex-col space-y-2 md:space-y-0 md:justify-between md:flex-row md:items-center`}
      >
        {tableData.fetched == false ? (
          <form
            className="flex space-x-3 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler();
            }}
          >
            <BorderInput
              required={true}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              className="!py-[0.22rem]"
              placeholder="Search User"
            />

            <PrimaryButton
              type="submit"
              className="!py-[0.47rem] !min-w-[20px]"
            >
              Search
            </PrimaryButton>
          </form>
        ) : (
          <div className="flex space-x-3 items-center">
            <SelectAntdBorder
              defaultValue=""
              className="md:!min-w-[80px] !w-[1/4] !bg-white !h-[41.5px] !py-[0.22rem]"
              handleChange={(value) => {
                setTableData({ ...tableData, exchange: value });
              }}
              options={[
                { label: 'All', value: '' },
                ...dropdownData.map((item) => {
                  return { value: item.value, label: item.name };
                }),
              ]}
              value={tableData.exchange}
            />
            <BorderInput
              required={true}
              className="!py-[0.22rem]"
              value={tableData.script}
              onChange={(e) => {
                setTableData({ ...tableData, script: e.target.value });
              }}
              placeholder="Search Script"
            />

            {searchParams.get('edit') == 'true' ? (
              <></>
            ) : (
              <div
                className="flex flex-row items-center space-x-1 cursor-pointer"
                onClick={() => {
                  setTableData({
                    ...tableData,
                    exchange: '',
                    fetched: false,
                    instrumentsData: [],
                    script: '',
                    username: '',
                    userType: '',
                    userId: -1,
                  });
                }}
              >
                <CloseCircleOutlined className=" text-[var(--primary-shade-b)]" />
                <span className="underline text-[var(--primary-shade-b)]">
                  Reset
                </span>
              </div>
            )}
          </div>
        )}

        {tableData.fetched && tableData.userId != -1 && (
          <div>
            Brokerage Settings for{' '}
            <span className="font-bold text-[var(--primary-shade-a)]">
              {tableData.username}
            </span>
          </div>
        )}
      </div>

      <div className="w-full flex flex-row">
        <div
          className={
            searchParams.get('edit') == 'true' ? 'w-[75%]' : 'w-[100%]'
          }
        >
          <BrokerageSettingsTable
            refreshCount={refreshCount}
            setRefreshCount={setRefreshCount}
          />
        </div>
        <div
          className={searchParams.get('edit') == 'true' ? 'w-[25%]' : 'hidden'}
        >
          {searchParams.get('edit') == 'true' && <CreateUserMenu />}
        </div>
      </div>
      <div
        className={`${
          searchParams.get('edit') == 'true' ? 'w-[75%]' : 'w-full'
        } justify-between flex mt-2 items-center`}
      >
        {/* <div className="left text-[var(--primary-shade-b)] underline underline-offset-1">
          Back to Basic Information
        </div> */}
        <div></div>
        <div className="right flex flex-row space-x-2 items-center">
          {formActive == true ? (
            <PrimaryButton
              onClick={() => {
                setFormActive(false);
              }}
              className="!bg-white text-[var(--primary-shade-b)]"
            >
              Cancel
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => {
                if (tableData.instrumentsData.length == 0) {
                  return;
                }
                setFormActive(true);
              }}
              className="!bg-white text-[var(--primary-shade-b)]"
            >
              Edit
            </PrimaryButton>
          )}
          <PrimaryButton onClick={updateHandler}>Save</PrimaryButton>
        </div>
      </div>
    </Layout>
  );
}

export default Index;
