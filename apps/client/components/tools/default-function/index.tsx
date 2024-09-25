'use client';

import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { userUserAccessStore } from '@/store/admin/useraccessmanagement';
import {
  GetUserAccessData,
  GetUserAccessFunction,
  ParsedUserAccessItem,
} from '@/types/user-access-management';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { Layout } from 'antd';
import UserAccessTables from './default-function-tables';
import { useState } from 'react';
import { SelectAntdBorder } from '@/components/inputs/select';
import { useDefaultFunctionSettings } from '@/store/tools/defaultfunctionsettings';

function defaultFunctionFormatter(data: GetUserAccessFunction[]) {
  let finalData: ParsedUserAccessItem[] = [];
  data.map((item) => {
    let subMenu = item.func.subMenu;

    let checkIndex = finalData.findIndex((a: any) => {
      return a.menuId == subMenu.menu.id;
    });

    if (checkIndex != -1) {
      finalData[checkIndex].functions.push({
        funcId: item.func.id,
        funName: item.func.funName,
        isFunActive: item.func.isFunActive,
        funLevel: item.func.funLevel,
        isAccess: item.isAccess,
      });
    } else {
      finalData.push({
        menuId: subMenu.menu.id,
        isMenuActive: subMenu.menu.isMenuActive,
        menuConstantText: subMenu.menu.menuConstantText,
        menuText: subMenu.menu.menuText,
        functions: [
          {
            funName: item.func.funName,
            funcId: item.func.id,
            isFunActive: item.func.isFunActive,
            isAccess: item.isAccess,
            funLevel: item.func.funLevel,
          },
        ],
      });
    }
  });
  return finalData;
}

function defaultUserFunctionMapper(
  formattedDefaultFunctionData: ParsedUserAccessItem[]
) {
  formattedDefaultFunctionData.map((item, index) => {
    item.functions.map((defaultFunction, i) => {
      if (item.functions[i].funLevel == 'Menu') {
        item.isMenuAccess = item.functions[i].isAccess;
        item.menuFuncId = item.functions[i].funcId;
      }
    });
    item.functions = item.functions.filter((a) => a.funLevel != 'Menu');
    formattedDefaultFunctionData[index] = item;
  });

  return formattedDefaultFunctionData;
}

function dataHandler(defaultFunctions: GetUserAccessFunction[]) {
  let formattedDefaultFunctionData = defaultFunctionFormatter(defaultFunctions);
  let finalDefaultFunctionData = defaultUserFunctionMapper(
    formattedDefaultFunctionData
  );
  return finalDefaultFunctionData;
}

const Index = () => {
  const {
    loading,
    userType,
    setUserType,
    setLoading,
    data,
    setData,
    setEditedFunctions,
    clearState,
  } = useDefaultFunctionSettings();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const { apiCall } = useFetch();
  const formSubmitHandler = async () => {
    setLoading(true);
    setEditedFunctions([]);
    setData([]);
    let toast = new Toast('Fetching Data!!!');
    let res = await apiCall(
      {
        url: `${Routes.GET_DEFAULT_ACCESS_MANAGEMENT.url}/${userType}`,
        method: Routes.GET_DEFAULT_ACCESS_MANAGEMENT.method,
      },
      {},
      false
    );

    if (res.status == false) {
      setLoading(false);
      toast.error(res.message);
      return;
    }

    toast.success('fetched data');
    let formattedData = dataHandler(res.data);
    setLoading(false);
    setData(formattedData);
    return;
  };
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Default Function Settings</H1>
        <I text="Search User tooltip" />
      </div>

      <div className="flex flex-col md:flex-row justify-between">
        <div className="md:mb-4 overflow-x-scroll py-[2px] flex justify-between items-center">
          <form
            className="flex space-x-3 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              formSubmitHandler();
            }}
          >
            <SelectAntdBorder
              defaultValue={'Master'}
              options={[
                { label: 'Master', value: 'Master' },
                { label: 'Broker', value: 'Broker' },
                { label: 'Sub-Broker', value: 'Sub-Broker' },
                { label: 'Client', value: 'Client' },
              ]}
              className="md:!min-w-[120px]  !bg-white !h-[41.5px] !py-[0.22rem]"
              value={userType}
              handleChange={(value, option) => {
                setUserType(value);
              }}
            />

            <PrimaryButton
              type="submit"
              className="!py-[0.47rem] !min-w-[80px]"
            >
              Search
            </PrimaryButton>
          </form>
        </div>

        <div className="flex my-2 md:my-0 ml-2 md:ml-0 flex-row items-center space-x-2">
          <span
            onClick={() => {
              setActiveKeys(data.map((a) => a.menuId.toString()));
            }}
            className={`${
              activeKeys.length != data.length
                ? 'font-[500] cursor-pointer'
                : 'font-[300] cursor-not-allowed'
            } `}
          >
            Expand All
          </span>
          <span> | </span>
          <span
            className={`${
              activeKeys.length != 0
                ? 'font-[500] cursor-pointer'
                : 'font-[300] cursor-not-allowed'
            } `}
            onClick={() => {
              setActiveKeys([]);
            }}
          >
            Collapse All
          </span>
        </div>
      </div>

      <UserAccessTables
        activeKeys={activeKeys}
        setActiveKeys={(keys) => setActiveKeys(keys)}
      />
    </Layout>
  );
};

export default Index;
