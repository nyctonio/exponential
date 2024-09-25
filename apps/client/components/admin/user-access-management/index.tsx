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
import UserAccessTables from './user-access-management-tables';
import { useState } from 'react';

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
  formattedDefaultFunctionData: ParsedUserAccessItem[],
  userFunctionData: GetUserAccessFunction[]
) {
  formattedDefaultFunctionData.map((item, index) => {
    item.functions.map((defaultFunction, i) => {
      let checkUserFunction = userFunctionData.find((a) => {
        return a.func.id == defaultFunction.funcId;
      });
      if (checkUserFunction) {
        item.functions[i] = {
          funcId: checkUserFunction.id,
          isAccess: checkUserFunction.isAccess,
          funLevel: checkUserFunction.func.funLevel,
          funName: checkUserFunction.func.funName,
          isFunActive: checkUserFunction.func.isFunActive,
        };
      }
      if (checkUserFunction && checkUserFunction.func.funLevel == 'Menu') {
        item.isMenuAccess = checkUserFunction.isAccess;
        item.menuFuncId = checkUserFunction.id;
      }
    });
    formattedDefaultFunctionData[index] = item;
  });

  return formattedDefaultFunctionData;
}

function dataHandler(data: GetUserAccessData) {
  let formattedDefaultFunctionData = defaultFunctionFormatter(
    data.defaultFunctions
  );

  let finalDefaultFunctionData = defaultUserFunctionMapper(
    formattedDefaultFunctionData,
    data.userFunctions
  );

  return finalDefaultFunctionData;
}

const Index = () => {
  const {
    username,
    setUsername,
    loading,
    setLoading,
    data,
    setSelectedUser,
    selectedUser,
    setData,
    setEditedFunctions,
    clearState,
  } = userUserAccessStore();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const { apiCall } = useFetch();
  const formSubmitHandler = async () => {
    setLoading(true);
    setEditedFunctions([]);
    let toast = new Toast('Fetching Data!!!');
    if (username.length == 0) {
      toast.error('Please enter username');
      return;
    }
    let res = await apiCall(
      {
        url: `${Routes.GET_USER_ACCESS_MANAGEMENT.url}/${username}`,
        method: Routes.GET_USER_ACCESS_MANAGEMENT.method,
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
    setSelectedUser({ id: 1, username });
    setData(formattedData);
    return;
  };
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>User Access Management</H1>
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
