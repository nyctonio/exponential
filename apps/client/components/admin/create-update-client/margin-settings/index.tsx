import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { SwitchToggle, InlineLabeledToggle } from '@/components/inputs/toggle';
import { H4, MediumText } from '@/components/inputs/heading';
import { BorderedButton } from '@/components/inputs/button';
import { useUserCreateStore } from '@/store/create-update-user';
import { useState, useEffect } from 'react';
import useRules from '../rules';
import useFetch from '@/hooks/useFetch';
import Submit from '../submit-button/index';
import Update from '../update-button';
import { CreateUserType } from '@/store/create-update-user';
import { SwitchSelect } from '@/components/inputs/radio';

export const labels = {
  activeMarginTypeNSE: 'activeMarginTypeNSE',
  activeMarginTypeMCX: 'activeMarginTypeMCX',
  activeMarginTypeFX: 'activeMarginTypeFX',
  activeMarginTypeOptions: 'activeMarginTypeOptions',
  tradeMarginPerCroreNSE: 'tradeMarginPerCroreNSE',
  tradeMarginPerCroreMCX: 'tradeMarginPerCroreMCX',
  tradeMarginPerCroreFX: 'tradeMarginPerCroreFX',
  tradeMarginPerCroreOptions: 'tradeMarginPerCroreOptions',
  tradeMarginPerLotNSE: 'tradeMarginPerLotNSE',
  tradeMarginPerLotMCX: 'tradeMarginPerLotMCX',
  tradeMarginPerLotFX: 'tradeMarginPerLotFX',
  tradeMarginPerLotOptions: 'tradeMarginPerLotOptions',
  intradayTrade: 'intradayTrade',
  intradayMarginPerCroreNSE: 'intradayMarginPerCroreNSE',
  intradayMarginPerCroreMCX: 'intradayMarginPerCroreMCX',
  intradayMarginPerCroreFX: 'intradayMarginPerCroreFX',
  intradayMarginPerCroreOptions: 'intradayMarginPerCroreOptions',
  intradayMarginPerLotNSE: 'intradayMarginPerLotNSE',
  intradayMarginPerLotMCX: 'intradayMarginPerLotMCX',
  intradayMarginPerLotFX: 'intradayMarginPerLotFX',
  intradayMarginPerLotOptions: 'intradayMarginPerLotOptions',
};

const Page = () => {
  const {
    errors,
    setErrors,
    sectionId,
    setSectionId,
    user,
    copyUserId,
    setUser,
    parent,
    dropdowns,
    updatedUser,
  } = useUserCreateStore();
  const { validate, disableHandler } = useRules();
  const [firstLoad, setFirstLoad] = useState(true);
  const { apiCall } = useFetch();

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
      setErrors('marginSettings', _error);
    }
  }, [user]);

  const errorHandle = (label: string) => {
    let _error = errors.marginSettings ? errors.marginSettings[label] : '';
    return _error;
  };

  const nextHandler = () => {
    if (Object.keys(errors.marginSettings).length != 0) {
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
      <H4 className="mb-4">Margin Settings</H4>
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-[5%] gap-y-4 items-center">
          <MediumText className="hidden md:block">Exchange</MediumText>
          <MediumText className="hidden md:block">NSE</MediumText>
          <MediumText className="hidden md:block">MCX</MediumText>
          <MediumText className="hidden md:block">FX</MediumText>
          <MediumText className="hidden md:block">Options</MediumText>
          <MediumText
            className={showHandler(
              labels.activeMarginTypeOptions,
              parent,
              user
            )}
          >
            Active Margin type
          </MediumText>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeMarginTypeOptions,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              NSE
            </label>
            <LabeledWrapper
              error={errorHandle(labels.activeMarginTypeNSE)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeMarginTypeNSE)}
                value={
                  user.activeMarginTypeNSE == null
                    ? ''
                    : user.activeMarginTypeNSE
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeMarginTypeNSE: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeMarginTypeOptions,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              MCX
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeMarginTypeMCX)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeMarginTypeMCX)}
                value={
                  user.activeMarginTypeMCX == null
                    ? ''
                    : user.activeMarginTypeMCX
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeMarginTypeMCX: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeMarginTypeOptions,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              FX
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeMarginTypeFX)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeMarginTypeFX)}
                value={
                  user.activeMarginTypeFX == null ? '' : user.activeMarginTypeFX
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeMarginTypeFX: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <div
            className={`flex justify-between md:space-x-0 ${showHandler(
              labels.activeMarginTypeOptions,
              parent,
              user
            )}`}
          >
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              Options
            </label>

            <LabeledWrapper
              error={errorHandle(labels.activeMarginTypeOptions)}
              label=""
              className="w-1/2 items-end md:items-start"
            >
              <SwitchSelect
                disabled={disableHandler(labels.activeMarginTypeOptions)}
                value={
                  user.activeMarginTypeOptions == null
                    ? ''
                    : user.activeMarginTypeOptions
                }
                onChange={(e) => {
                  setUser({
                    ...user,
                    activeMarginTypeOptions: e.target.value,
                  });
                }}
              />
            </LabeledWrapper>
          </div>
          <MediumText>Margin Amount/Crore</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerCroreNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>

              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.tradeMarginPerCroreNSE)}
                  disabled={disableHandler(labels.tradeMarginPerCroreNSE)}
                  onChange={(e) =>
                    valueSetter(labels.tradeMarginPerCroreNSE, e.target.value)
                  }
                  type="number"
                  className={`w-full md:${
                    !user.tradeMarginPerCroreNSE ? 'w-full' : 'w-3/4'
                  }`}
                  placeholder="Amt / Crore"
                />
                {user.tradeMarginPerCroreNSE && (
                  <p className="text-xs text-green-600">
                    {((user.tradeMarginPerCroreNSE / 10000000) * 100).toFixed(
                      user.tradeMarginPerCroreNSE > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerCroreMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.tradeMarginPerCroreMCX)}
                  disabled={disableHandler(labels.tradeMarginPerCroreMCX)}
                  onChange={(e) =>
                    valueSetter(labels.tradeMarginPerCroreMCX, e.target.value)
                  }
                  className={`w-full md:${
                    !user.tradeMarginPerCroreMCX ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.tradeMarginPerCroreMCX && (
                  <p className="text-xs text-green-600">
                    {((user.tradeMarginPerCroreMCX / 10000000) * 100).toFixed(
                      user.tradeMarginPerCroreMCX > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerCroreFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.tradeMarginPerCroreFX)}
                  disabled={disableHandler(labels.tradeMarginPerCroreFX)}
                  onChange={(e) =>
                    valueSetter(labels.tradeMarginPerCroreFX, e.target.value)
                  }
                  className={`w-full md:${
                    !user.tradeMarginPerCroreFX ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.tradeMarginPerCroreFX && (
                  <p className="text-xs text-green-600">
                    {((user.tradeMarginPerCroreFX / 10000000) * 100).toFixed(
                      user.tradeMarginPerCroreFX > 100000 ? 1 : 3
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerCroreOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <div className="flex w-2/3 md:w-full justify-end md:justify-normal items-center space-x-2">
                <BorderInput
                  value={valueHandler(labels.tradeMarginPerCroreOptions)}
                  disabled={disableHandler(labels.tradeMarginPerCroreOptions)}
                  onChange={(e) =>
                    valueSetter(
                      labels.tradeMarginPerCroreOptions,
                      e.target.value
                    )
                  }
                  className={`w-full md:${
                    !user.tradeMarginPerCroreOptions ? 'w-full' : 'w-3/4'
                  }`}
                  type="number"
                  placeholder="Amt / Crore"
                />
                {user.tradeMarginPerCroreOptions && (
                  <p className="text-xs text-green-600">
                    {(
                      (user.tradeMarginPerCroreOptions / 10000000) *
                      100
                    ).toFixed(user.tradeMarginPerCroreOptions > 100000 ? 1 : 3)}
                    %
                  </p>
                )}
              </div>
            </div>
          </LabeledWrapper>
          <MediumText>Margin Amount/Lot</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerLotNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMarginPerLotNSE)}
                value={valueHandler(labels.tradeMarginPerLotNSE)}
                onChange={(e) =>
                  valueSetter(labels.tradeMarginPerLotNSE, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="Amt / Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerLotMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMarginPerLotMCX)}
                value={valueHandler(labels.tradeMarginPerLotMCX)}
                onChange={(e) =>
                  valueSetter(labels.tradeMarginPerLotMCX, e.target.value)
                }
                type="number"
                placeholder="Amt / Lot"
                className="w-2/3 md:w-full"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerLotFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMarginPerLotFX)}
                value={valueHandler(labels.tradeMarginPerLotFX)}
                onChange={(e) =>
                  valueSetter(labels.tradeMarginPerLotFX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="Amt / Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMarginPerLotOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMarginPerLotOptions)}
                value={valueHandler(labels.tradeMarginPerLotOptions)}
                onChange={(e) =>
                  valueSetter(labels.tradeMarginPerLotOptions, e.target.value)
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
      <H4 className="mb-4">Intraday Margin Settings</H4>
      <InlineLabeledToggle
        label="Intraday Trade"
        disabled={disableHandler(labels.intradayTrade)}
        checked={user.intradayTrade}
        onChange={(e) => {
          setUser({
            ...user,
            intradayTrade: e,
          });
        }}
      />
      <div className="grid mt-4 grid-cols-1 md:grid-cols-5 gap-x-[5%] gap-y-4 items-center">
        <MediumText>Intraday Margin Amount/Crore</MediumText>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerCroreNSE)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              NSE
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerCroreNSE)}
              value={valueHandler(labels.intradayMarginPerCroreNSE)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerCroreNSE, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Crore"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerCroreMCX)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              MCX
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerCroreMCX)}
              value={valueHandler(labels.intradayMarginPerCroreMCX)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerCroreMCX, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Crore"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerCroreFX)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              FX
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerCroreFX)}
              value={valueHandler(labels.intradayMarginPerCroreFX)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerCroreFX, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Crore"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerCroreOptions)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              Options
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerCroreOptions)}
              value={valueHandler(labels.intradayMarginPerCroreOptions)}
              onChange={(e) =>
                valueSetter(
                  labels.intradayMarginPerCroreOptions,
                  e.target.value
                )
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Crore"
            />
          </div>
        </LabeledWrapper>
        <MediumText>Intraday Margin Amount/Lot</MediumText>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerLotNSE)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              NSE
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerLotNSE)}
              value={valueHandler(labels.intradayMarginPerLotNSE)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerLotNSE, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Lot"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerLotMCX)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              MCX
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerLotMCX)}
              value={valueHandler(labels.intradayMarginPerLotMCX)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerLotMCX, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Lot"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerLotFX)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              FX
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerLotFX)}
              value={valueHandler(labels.intradayMarginPerLotFX)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerLotFX, e.target.value)
              }
              className="w-2/3 md:w-full"
              type="number"
              placeholder="Amt / Lot"
            />
          </div>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.intradayMarginPerLotOptions)}
          label=""
        >
          <div className="flex justify-between md:space-x-0">
            <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
              Options
            </label>
            <BorderInput
              disabled={disableHandler(labels.intradayMarginPerLotOptions)}
              value={valueHandler(labels.intradayMarginPerLotOptions)}
              onChange={(e) =>
                valueSetter(labels.intradayMarginPerLotOptions, e.target.value)
              }
              type="number"
              className="w-2/3 md:w-full"
              placeholder="Amt / Lot"
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
            className="w-full "
          >
            Prev
          </BorderedButton>
          {updatedUser.username != '' && updatedUser.type == 'update' ? (
            <Update />
          ) : (
            <Submit />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
