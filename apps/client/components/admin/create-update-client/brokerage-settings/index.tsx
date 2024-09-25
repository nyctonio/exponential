import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { SwitchToggle } from '@/components/inputs/toggle';
import { H4, MediumText } from '@/components/inputs/heading';
import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { useUserCreateStore } from '@/store/create-update-user';
import { useState, useEffect } from 'react';
import { CreateUserType } from '@/store/create-update-user';
import useRules from '../rules';
import { SwitchSelect } from '@/components/inputs/radio';

export const labels = {
  activeBrokerageTypeNSE: 'activeBrokerageTypeNSE',
  activeBrokerageTypeMCX: 'activeBrokerageTypeMCX',
  activeBrokerageTypeFX: 'activeBrokerageTypeFX',
  activeBrokerageTypeOptions: 'activeBrokerageTypeOptions',
  brokeragePerCroreNSE: 'brokeragePerCroreNSE',
  brokeragePerCroreMCX: 'brokeragePerCroreMCX',
  brokeragePerCroreFX: 'brokeragePerCroreFX',
  brokeragePerCroreOptions: 'brokeragePerCroreOptions',
  brokeragePerLotNSE: 'brokeragePerLotNSE',
  brokeragePerLotMCX: 'brokeragePerLotMCX',
  brokeragePerLotFX: 'brokeragePerLotFX',
  brokeragePerLotOptions: 'brokeragePerLotOptions',
  plShareNSE: 'plShareNSE',
  plShareMCX: 'plShareMCX',
  plShareFX: 'plShareFX',
  plShareOptions: 'plShareOptions',
};

const Page = () => {
  const {
    dropdowns,
    errors,
    setErrors,
    sectionId,
    setSectionId,
    user,
    parent,
    setUser,
  } = useUserCreateStore();
  const [firstLoad, setFirstLoad] = useState(true);
  const { validate, disableHandler } = useRules();
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      return;
    }
    const _valid = validate();
    if (_valid) {
      let _error: any = {};
      Object.keys(_valid).forEach((key) => {
        // @ts-ignore
        if (labels[key]) {
          _error[key] = _valid[key];
        }
      });
      setErrors('brokerageSettings', _error);
    }
  }, [user]);

  const errorHandle = (label: string) => {
    let _error = errors.brokerageSettings
      ? errors.brokerageSettings[label]
      : '';
    return _error;
  };

  const nextHandler = () => {
    if (Object.keys(errors.brokerageSettings).length != 0) {
      return;
    } else {
      setSectionId(sectionId + 1);
    }
  };

  const valueSetter = (label: string, value: string) => {
    if (value == '') {
      setUser({
        ...user,
        [label]: null,
      });
    } else {
      setUser({
        ...user,
        [label]: Number(value),
      });
    }
  };

  const valueHandler = (label: string) => {
    // @ts-ignore
    if (user[label] == null) {
      return '';
    } else {
      // @ts-ignore
      return user[label];
    }
  };

  const showHandler = (label: string, parent: any, user: CreateUserType) => {
    let _isclient = dropdowns.userTypeOptions.options.filter(
      (item) => Number(item.value) == user.userType
    );
    if (_isclient.length > 0) {
      if (_isclient[0].constant == 'Client') {
        return '';
      }
    }
    return 'hidden';
  };

  return (
    <div className="rounded-md py-[15px] w-full bg-[var(--light)] px-[25px] sm:px-[35px]">
      <H4 className="mb-4">Brokerage Settings</H4>
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-[5%] gap-y-4 items-center">
          <MediumText className="hidden md:block">Exchange</MediumText>
          <MediumText className="hidden md:block">NSE</MediumText>
          <MediumText className="hidden md:block">MCX</MediumText>
          <MediumText className="hidden md:block">FX</MediumText>
          <MediumText className="hidden md:block">Options</MediumText>
          <MediumText
            className={showHandler(labels.activeBrokerageTypeNSE, parent, user)}
          >
            Active Brokerage type
          </MediumText>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeBrokerageTypeNSE,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              NSE
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeBrokerageTypeNSE)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeBrokerageTypeNSE)}
                value={
                  user.activeBrokerageTypeNSE == null
                    ? ''
                    : user.activeBrokerageTypeNSE
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeBrokerageTypeNSE: e.target.value,
                  });
                }}
              ></SwitchSelect>
            </LabeledWrapper>
          </div>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeBrokerageTypeNSE,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              MCX
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeBrokerageTypeMCX)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeBrokerageTypeMCX)}
                value={
                  user.activeBrokerageTypeMCX == null
                    ? ''
                    : user.activeBrokerageTypeMCX
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeBrokerageTypeMCX: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeBrokerageTypeNSE,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              FX
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeBrokerageTypeFX)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeBrokerageTypeFX)}
                value={
                  user.activeBrokerageTypeFX == null
                    ? ''
                    : user.activeBrokerageTypeFX
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeBrokerageTypeFX: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeBrokerageTypeNSE,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              Options
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeBrokerageTypeOptions)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeBrokerageTypeOptions)}
                value={
                  user.activeBrokerageTypeOptions == null
                    ? ''
                    : user.activeBrokerageTypeOptions
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeBrokerageTypeOptions: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <MediumText>Brokerage Amount/Crore</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerCroreNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.brokeragePerCroreNSE)}
                  disabled={disableHandler(labels.brokeragePerCroreNSE)}
                  onChange={(e) =>
                    valueSetter(labels.brokeragePerCroreNSE, e.target.value)
                  }
                  className={`w-full md:${
                    !user.brokeragePerCroreNSE ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.brokeragePerCroreNSE && (
                  <p className="text-xs text-green-600">
                    {((user.brokeragePerCroreNSE / 10000000) * 100).toFixed(
                      user.brokeragePerCroreNSE > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerCroreMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.brokeragePerCroreMCX)}
                  disabled={disableHandler(labels.brokeragePerCroreMCX)}
                  onChange={(e) =>
                    valueSetter(labels.brokeragePerCroreMCX, e.target.value)
                  }
                  className={`w-full md:${
                    !user.brokeragePerCroreMCX ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.brokeragePerCroreMCX && (
                  <p className="text-xs text-green-600">
                    {((user.brokeragePerCroreMCX / 10000000) * 100).toFixed(
                      user.brokeragePerCroreMCX > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerCroreFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.brokeragePerCroreFX)}
                  disabled={disableHandler(labels.brokeragePerCroreFX)}
                  onChange={(e) =>
                    valueSetter(labels.brokeragePerCroreFX, e.target.value)
                  }
                  className={`w-full md:${
                    !user.brokeragePerCroreFX ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.brokeragePerCroreFX && (
                  <p className="text-xs text-green-600">
                    {((user.brokeragePerCroreFX / 10000000) * 100).toFixed(
                      user.brokeragePerCroreFX > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerCroreOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.brokeragePerCroreOptions)}
                  disabled={disableHandler(labels.brokeragePerCroreOptions)}
                  onChange={(e) =>
                    valueSetter(labels.brokeragePerCroreOptions, e.target.value)
                  }
                  className={`w-full md:${
                    !user.brokeragePerCroreOptions ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.brokeragePerCroreOptions && (
                  <p className="text-xs text-green-600">
                    {((user.brokeragePerCroreOptions / 10000000) * 100).toFixed(
                      user.brokeragePerCroreOptions > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <MediumText>Brokerage Amount/Lot</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerLotNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>
              <BorderInput
                value={valueHandler(labels.brokeragePerLotNSE)}
                disabled={disableHandler(labels.brokeragePerLotNSE)}
                onChange={(e) =>
                  valueSetter(labels.brokeragePerLotNSE, e.target.value)
                }
                type="number"
                className="w-2/3 md:w-full"
                placeholder="Amt / Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerLotMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <BorderInput
                value={valueHandler(labels.brokeragePerLotMCX)}
                disabled={disableHandler(labels.brokeragePerLotMCX)}
                onChange={(e) =>
                  valueSetter(labels.brokeragePerLotMCX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="Amt / Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerLotFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <BorderInput
                disabled={disableHandler(labels.brokeragePerLotFX)}
                value={valueHandler(labels.brokeragePerLotFX)}
                onChange={(e) =>
                  valueSetter(labels.brokeragePerLotFX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="Amt / Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.brokeragePerLotOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <BorderInput
                disabled={disableHandler(labels.brokeragePerLotOptions)}
                value={valueHandler(labels.brokeragePerLotOptions)}
                onChange={(e) =>
                  valueSetter(labels.brokeragePerLotOptions, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="Amt / Lot"
              />
            </div>
          </LabeledWrapper>
        </div>
      </div>

      <div className="h-[1.5px] w-full bg-[var(--primary-shade-e)] my-8"></div>
      <H4>PL Percentage</H4>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-x-[5%] gap-y-4 items-center">
        <MediumText>PL Share</MediumText>
        <LabeledWrapper error={errorHandle(labels.plShareNSE)} label="">
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              NSE
            </label>
            <BorderInput
              value={valueHandler(labels.plShareNSE)}
              disabled={disableHandler(labels.plShareNSE)}
              onChange={(e) => valueSetter(labels.plShareNSE, e.target.value)}
              type="number"
              className="w-2/3 md:w-full"
              placeholder="Percentage"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper error={errorHandle(labels.plShareMCX)} label="">
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              MCX
            </label>
            <BorderInput
              value={valueHandler(labels.plShareMCX)}
              disabled={disableHandler(labels.plShareMCX)}
              onChange={(e) => valueSetter(labels.plShareMCX, e.target.value)}
              type="number"
              className="w-2/3 md:w-full"
              placeholder="Percentage"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper error={errorHandle(labels.plShareFX)} label="">
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              FX
            </label>
            <BorderInput
              value={valueHandler(labels.plShareFX)}
              disabled={disableHandler(labels.plShareFX)}
              onChange={(e) => valueSetter(labels.plShareFX, e.target.value)}
              type="number"
              className="w-2/3 md:w-full"
              placeholder="Percentage"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper error={errorHandle(labels.plShareOptions)} label="">
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              Options
            </label>
            <BorderInput
              value={valueHandler(labels.plShareOptions)}
              disabled={disableHandler(labels.plShareOptions)}
              onChange={(e) =>
                valueSetter(labels.plShareOptions, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Percentage"
            />
          </div>
        </LabeledWrapper>
      </div>
      <div className="flex my-4 w-full justify-between">
        <div className="hidden md:block"></div>
        <div className="mt-4 flex justify-between w-full md:w-auto space-x-2">
          <BorderedButton
            onClick={() => {
              setSectionId(sectionId - 1);
            }}
            className="w-full"
          >
            Prev
          </BorderedButton>
          <PrimaryButton className="w-full" onClick={nextHandler}>
            Next
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default Page;
