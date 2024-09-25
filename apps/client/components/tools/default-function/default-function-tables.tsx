import React, { useEffect, useState } from 'react';
import printSafe from '@/utils/common/print';
import { userUserAccessStore } from '@/store/admin/useraccessmanagement';
import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import { ParsedUserAccessItem } from '@/types/user-access-management';
import useFetch from '@/hooks/useFetch';
import { PrimaryButton } from '@/components/inputs/button';
import { Collapse, Empty, Spin } from 'antd';
import {
  LabeledToggle,
  SwitchToggle,
  ToggleAntd,
} from '@/components/inputs/toggle';
import { useDefaultFunctionSettings } from '@/store/tools/defaultfunctionsettings';

function Toggle({
  selected,
  menuId,
  funcId,
}: {
  selected: boolean;
  menuId: number;
  funcId: number;
}) {
  const { formActive, updateData, data } = useDefaultFunctionSettings();
  const disabled = !formActive;
  let menuAccess = data.find((a) => a.menuId == menuId)?.isMenuAccess;
  return (
    // <div>
    //   <input
    //     className="hidden peer"
    //     type="checkbox"
    //     id={`toggle-${funcId}`}
    //     checked={selected}
    //     onChange={(e) => {
    //       updateData(menuId, funcId, e.target.checked);
    //     }}
    //     disabled={disabled || !menuAccess}
    //   />
    //   <label
    //     style={{ borderRadius: '4px' }}
    //     className={`flex items-center justify-start ${
    //       selected ? 'bg-[#0B2631]' : 'bg-[#8E8E8E]'
    //     }  h-[19px] w-[43px] py-[1px] px-[3px] border-white border-[1px]  ${
    //       disabled || !menuAccess ? 'cursor-not-allowed' : 'cursor-pointer'
    //     }`}
    //     htmlFor={`toggle-${funcId}`}
    //   >
    //     <span
    //       style={{ borderRadius: '4px' }}
    //       className={`w-[19px] h-[13.5px] ${
    //         selected ? 'bg-white' : 'bg-white'
    //       }  `}
    //     ></span>
    //   </label>
    // </div>

    <ToggleAntd
      checked={selected}
      onChange={(checked) => updateData(menuId, funcId, checked)}
      disabled={!formActive}
    ></ToggleAntd>
  );
}

function HeaderToggle({
  selected,
  menuId,
}: {
  selected: boolean;
  menuId: number;
}) {
  const { formActive, updateData, updateTableAccess } =
    useDefaultFunctionSettings();
  const disabled = !formActive;
  return (
    <ToggleAntd
      checked={selected}
      onChange={(checked) => updateTableAccess(menuId, checked)}
      disabled={!formActive}
    ></ToggleAntd>
  );
}

function AccessTable(data: ParsedUserAccessItem) {
  let allSelected = false;
  data.functions.map((item) => {
    if (item.isAccess == true) {
      allSelected = true;
    }
  });
  const { updateData, editedFunctions } = useDefaultFunctionSettings();

  return (
    <div className="flex w-full justify-center">
      <div className="w-full bg-white grid gap-2 place-items-center  rounded-b-xl grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-2">
        {data.functions
          .filter((a) => a.funLevel != 'Menu')
          .map((func) => {
            return (
              <div
                key={`toggle-container-${func.funcId}`}
                className="flex  justify-between w-full px-2"
              >
                <div className="font-[300]">{func.funName}</div>

                <Toggle
                  funcId={func.funcId}
                  menuId={data.menuId}
                  selected={func.isAccess}
                ></Toggle>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function UserAccessTables({
  activeKeys,
  setActiveKeys,
}: {
  activeKeys: string[];
  setActiveKeys: (keys: string[]) => void;
}) {
  const {
    data,
    loading,
    formActive,
    clearState,
    setFormActive,
    editedFunctions,
    setEditedFunctions,
  } = useDefaultFunctionSettings();
  const { apiCall } = useFetch();
  const submitHandler = async () => {
    let toast = new Toast('Saving Records!!!');
    if (editedFunctions.length == 0) {
      toast.error('Please edit a function before saving');
      return;
    }

    let res = await apiCall(
      Routes.UPDATE_DEFAULT_ACCESS_MANAGEMENT,
      { editedFunctions: editedFunctions },
      false
    );

    if (res.status == false) {
      toast.error(res.message);
      return;
    }

    setEditedFunctions([]);
    toast.success('Records Updated!!!');
    return;
  };

  useEffect(() => {
    console.log('active keys are', activeKeys);
  }, [activeKeys]);

  return (
    <div className={`h-full w-full`}>
      <div className="tables py-2 pb-4 flex flex-col justify-around space-y-4">
        <Collapse
          className="border-none bg-[var(--light-bg)] rounded-[5px]"
          rootClassName="rounded-[5px]"
          expandIconPosition="end"
          activeKey={activeKeys}
          onChange={(keys: any) => {
            console.log('key change ', keys);
            setActiveKeys(keys);
          }}
          items={data.map((item) => {
            return {
              key: item.menuId,
              style: {
                marginBottom: 24,
                background: 'white',
                borderRadius: '5px',
                border: `1px solid  ${
                  activeKeys.includes(item.menuId.toString())
                    ? 'var(--trade-green)'
                    : '#D6D6D6'
                }`,
                // color: 'black',
              },
              children: (
                <AccessTable
                  functions={item.functions}
                  isMenuActive={item.isMenuActive}
                  menuConstantText={item.menuConstantText}
                  menuId={item.menuId}
                  menuText={item.menuText}
                  key={`${item.menuId}-table`}
                />
              ),
              label: (
                <div className="!font-[300] text-[#404040] flex flex-row justify-between px-2">
                  <div
                    className={`${
                      activeKeys.includes(item.menuId.toString())
                        ? 'font-semibold'
                        : ''
                    }`}
                  >
                    {item.menuText}
                  </div>
                  <div className="flex flex-row space-x-2">
                    <span>Revoke All</span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <HeaderToggle
                        menuId={item.menuId}
                        selected={
                          item.functions.filter((a) => a.isAccess == false)
                            .length > 0
                            ? false
                            : true
                        }
                      />
                    </div>
                    <span>Grant All</span>
                  </div>
                </div>
              ),
            };
          })}
        />
      </div>

      {data.length == 0 && (
        <div className="bg-white py-10">
          {loading == false && (
            <Empty
              description={<span className="font-[300]">Search a User</span>}
            />
          )}
          {loading == true && (
            <div className="flex flex-row items-center justify-center py-16">
              <Spin />
            </div>
          )}
        </div>
      )}

      <div
        className={`right flex flex-row space-x-2 items-center justify-end ${
          data.length == 0 && 'hidden'
        }`}
      >
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
              if (data.length == 0) {
                return;
              }
              setFormActive(true);
            }}
            className="!bg-white text-[var(--primary-shade-b)]"
          >
            Edit
          </PrimaryButton>
        )}
        <PrimaryButton
          onClick={() => {
            submitHandler();
          }}
        >
          Save
        </PrimaryButton>
      </div>
    </div>
  );
}

export default UserAccessTables;
