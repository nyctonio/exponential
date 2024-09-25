import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { BorderInput, TextInput } from '@/components/inputs/text';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { useBrokerageStore } from '@/store/advance-settings/brokerage-settings';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { Button, Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { SelectAntdBorder } from '@/components/inputs/select';
import { CloseCircleOutlined } from '@ant-design/icons';
import CuttingSettingsTable from './cutting-settings-table';
import BidStopLossCmp from './bid-stop-loss-cmp';
import BidStopLoss from './bid-stop-loss';
import { useAutoCutSettingsStore } from '@/store/advance-settings/trade-auto-cut-settings';
import { UserCuttingSetting } from '@/types/advance-settings/auto-cut-settings';
import CreateUserMenu from '@/components/admin/create-update-client/create-user-menu';
import { useSearchParams } from 'next/navigation';

function Index() {
  const { apiCall } = useFetch();
  const searchParams = useSearchParams();
  const {
    setBidSettings,
    setCuttingSettings,
    setMcxBidSettings,
    setSelectedUser,
    setEditMode,
    editMode,
    clearStore,
    setLoading,
    loading,
    username,
    setUsername,
    selectedUser,
    bidSettings,
    mcxBidSettings,
    cuttingSettings,
  } = useAutoCutSettingsStore();
  const submitHandler = async () => {
    setLoading(true);
    let res = await apiCall(
      {
        url: `${Routes.GET_AUTO_CUT_SETTINGS.url}/${username}`,
        method: Routes.GET_AUTO_CUT_SETTINGS.method,
      },
      {},
      false
    );

    if (res.status == true) {
      setSelectedUser(username, res.data.userId);
      setBidSettings(
        res.data.bidStopSettings.map((item: any) => {
          return {
            ...item,
            isUpdated: false,
            outsideHL: item.outside,
            betweenHL: item.between,
            lastUpdated: item.updatedAt,
          };
        })
      );
      setMcxBidSettings(
        res.data.mcxBidStopSettings.map((item: any) => {
          return {
            ...item,
            isUpdated: false,
          };
        })
      );
      setCuttingSettings(
        res.data.cuttingSettings.map((item: any): UserCuttingSetting => {
          return {
            ...item,
            isUpdated: false,
            constant: item.option.prjSettName,
            option: item.option.prjSettDisplayName,
          };
        })
      );
    } else {
      new Toast('').error(res.message);
    }
    setLoading(false);

    return;
  };
  useEffect(() => {
    if (searchParams.get('edit') == 'true') {
      console.log('running fetch');
      submitHandler();
    }
  }, [searchParams.get('edit')]);

  const updateHandler = async () => {
    let toast = new Toast('Updating Settings!!!');

    let data = {
      userId: selectedUser?.id,
      bidStopSettings: bidSettings
        .filter((a) => a.isUpdated == true)
        .map((a) => {
          return {
            id: a.id,
            option: a.option,
            outside: a.outsideHL,
            between: a.betweenHL,
            cmp: a.cmp,
          };
        }),
      mcxBidStopSettings: mcxBidSettings
        .filter((a) => a.isUpdated == true)
        .map((a) => {
          return {
            id: a.id,
            bidValue: a.bidValue,
            stopLossValue: a.stopLossValue,
          };
        }),
      cuttingSettings: cuttingSettings
        .filter((a) => a.isUpdated == true)
        .map((a) => {
          return {
            id: a.id,
            value: a.value,
            name: a.option,
          };
        }),
    };

    let res = await apiCall(Routes.UPDATE_AUTO_SETTINGS, data, false);
    if (res.status == true) {
      toast.success('Updated Successfully');
      setBidSettings(
        bidSettings.map((a) => {
          return { ...a, isUpdated: false };
        })
      );
      setCuttingSettings(
        cuttingSettings.map((a) => {
          return { ...a, isUpdated: false };
        })
      );
      setMcxBidSettings(
        mcxBidSettings.map((a) => {
          return { ...a, isUpdated: false };
        })
      );
    } else {
      toast.error(res.message);
    }

    return;
  };

  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <span className="text-xl md:text-2xl font-bold">
          Auto Cut/ Bid/ Stop Loss Settings
        </span>
        {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
        <I text="Search User tooltip" />
      </div>
      <div className="mb-4 overflow-x-scroll py-[2px] pl-[2px] flex justify-between items-center">
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

          <PrimaryButton type="submit" className="!py-[0.47rem] !min-w-[20px]">
            Search
          </PrimaryButton>
        </form>
      </div>

      <div className="w-full flex flex-row">
        <div
          className={
            searchParams.get('edit') == 'true' ? 'md:w-[75%]' : 'w-[100%]'
          }
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-2 justify-between">
              <div className="cuttingSettings w-[100%] md:w-[50%]">
                <CuttingSettingsTable />
              </div>
              <div className="w-[100%] md:w-[50%]">
                <BidStopLossCmp />
              </div>
            </div>

            <div className="w-[100%]">
              <BidStopLoss />
            </div>
          </div>
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
        <div className="w-29"></div>
        <div className="right flex flex-row space-x-2 items-center">
          {editMode == true ? (
            <PrimaryButton
              onClick={() => {
                setEditMode(false);
              }}
              className="!bg-white text-[var(--primary-shade-b)]"
            >
              Cancel
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => {
                if (selectedUser == null) {
                  return;
                }
                setEditMode(true);
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
