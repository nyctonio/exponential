import { LabeledWrapper, BorderInput } from '@/components/inputs/text';
import { LabeledToggle, InlineLabeledToggle } from '@/components/inputs/toggle';
import { H4, MediumText } from '@/components/inputs/heading';
import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { useUserCreateStore } from '@/store/create-update-user';
import { useState, useEffect } from 'react';
import useRules from '../rules';

export const labels = {
  exchangeAllowedNSE: 'exchangeAllowedNSE',
  exchangeAllowedMCX: 'exchangeAllowedMCX',
  exchangeAllowedFX: 'exchangeAllowedFX',
  exchangeAllowedOptions: 'exchangeAllowedOptions',
  exchangeMaxLotSizeNSE: 'exchangeMaxLotSizeNSE',
  exchangeMaxLotSizeMCX: 'exchangeMaxLotSizeMCX',
  exchangeMaxLotSizeFX: 'exchangeMaxLotSizeFX',
  exchangeMaxLotSizeOptions: 'exchangeMaxLotSizeOptions',
  scriptMaxLotSizeNSE: 'scriptMaxLotSizeNSE',
  scriptMaxLotSizeMCX: 'scriptMaxLotSizeMCX',
  scriptMaxLotSizeFX: 'scriptMaxLotSizeFX',
  scriptMaxLotSizeOptions: 'scriptMaxLotSizeOptions',
  tradeMaxLotSizeNSE: 'tradeMaxLotSizeNSE',
  tradeMaxLotSizeMCX: 'tradeMaxLotSizeMCX',
  tradeMaxLotSizeFX: 'tradeMaxLotSizeFX',
  tradeMaxLotSizeOptions: 'tradeMaxLotSizeOptions',
  m2mSquareOff: 'm2mSquareOff',
  m2mSquareOffValue: 'm2mSquareOffValue',
  shortMarginSquareOff: 'shortMarginSquareOff',
  maximumLossPercentageCap: 'maximumLossPercentageCap',
};

const Page = () => {
  const { errors, setErrors, sectionId, setSectionId, user, setUser, parent } =
    useUserCreateStore();
  const { validate, disableHandler } = useRules();
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      return;
    }
    const _valid = validate();
    if (_valid) {
      // set only those keys which are in labels
      let _error: any = {};
      Object.keys(_valid).forEach((key) => {
        // @ts-ignore
        if (labels[key]) {
          _error[key] = _valid[key];
        }
      });
      setErrors('exchangeSettings', _error);
    }
  }, [user]);

  const errorHandle = (label: string) => {
    let _error = errors.exchangeSettings ? errors.exchangeSettings[label] : '';
    return _error;
  };

  const nextHandler = () => {
    if (Object.keys(errors.exchangeSettings).length != 0) {
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

  return (
    <div className="rounded-md py-[15px] w-full bg-[var(--light)] px-[20px] sm:px-[35px]">
      <H4 className="mb-4">Exchange / Script Quantity Settings</H4>
      <div className="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-[5%] gap-y-4 items-center">
          <MediumText>Exchange Allowed</MediumText>
          <InlineLabeledToggle
            label="NSE"
            checked={user.exchangeAllowedNSE}
            disabled={disableHandler(labels.exchangeAllowedNSE)}
            onChange={(e) => {
              setUser({
                ...user,
                exchangeAllowedNSE: e,
              });
            }}
            mobile={true}
          />
          <InlineLabeledToggle
            label="MCX"
            checked={user.exchangeAllowedMCX}
            disabled={disableHandler(labels.exchangeAllowedMCX)}
            onChange={(e) => {
              setUser({
                ...user,
                exchangeAllowedMCX: e,
              });
            }}
            mobile={true}
          />
          <InlineLabeledToggle
            label="FX"
            checked={user.exchangeAllowedFX}
            disabled={disableHandler(labels.exchangeAllowedFX)}
            onChange={(e) => {
              setUser({
                ...user,
                exchangeAllowedFX: e,
              });
            }}
            mobile={true}
          />
          <InlineLabeledToggle
            label="Options"
            checked={user.exchangeAllowedOptions}
            disabled={disableHandler(labels.exchangeAllowedOptions)}
            onChange={(e) => {
              setUser({
                ...user,
                exchangeAllowedOptions: e,
              });
            }}
            mobile={true}
          />
          <MediumText>Max Qty/Exch</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.exchangeMaxLotSizeNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>
              <BorderInput
                value={valueHandler(labels.exchangeMaxLotSizeNSE)}
                disabled={disableHandler(labels.exchangeMaxLotSizeNSE)}
                onChange={(e) =>
                  valueSetter(labels.exchangeMaxLotSizeNSE, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.exchangeMaxLotSizeMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <BorderInput
                value={valueHandler(labels.exchangeMaxLotSizeMCX)}
                disabled={disableHandler(labels.exchangeMaxLotSizeMCX)}
                onChange={(e) =>
                  valueSetter(labels.exchangeMaxLotSizeMCX, e.target.value)
                }
                type="number"
                className="w-2/3 md:w-full"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.exchangeMaxLotSizeFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <BorderInput
                value={valueHandler(labels.exchangeMaxLotSizeFX)}
                disabled={disableHandler(labels.exchangeMaxLotSizeFX)}
                onChange={(e) =>
                  valueSetter(labels.exchangeMaxLotSizeFX, e.target.value)
                }
                type="number"
                className="w-2/3 md:w-full"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.exchangeMaxLotSizeOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <BorderInput
                value={valueHandler(labels.exchangeMaxLotSizeOptions)}
                disabled={disableHandler(labels.exchangeMaxLotSizeOptions)}
                onChange={(e) =>
                  valueSetter(labels.exchangeMaxLotSizeOptions, e.target.value)
                }
                type="number"
                className="w-2/3 md:w-full"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <MediumText>Max Qty/Script</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.scriptMaxLotSizeNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>
              <BorderInput
                value={valueHandler(labels.scriptMaxLotSizeNSE)}
                disabled={disableHandler(labels.scriptMaxLotSizeNSE)}
                onChange={(e) =>
                  valueSetter(labels.scriptMaxLotSizeNSE, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.scriptMaxLotSizeMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <BorderInput
                value={valueHandler(labels.scriptMaxLotSizeMCX)}
                disabled={disableHandler(labels.scriptMaxLotSizeMCX)}
                onChange={(e) =>
                  valueSetter(labels.scriptMaxLotSizeMCX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.scriptMaxLotSizeFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <BorderInput
                value={valueHandler(labels.scriptMaxLotSizeFX)}
                disabled={disableHandler(labels.scriptMaxLotSizeFX)}
                onChange={(e) =>
                  valueSetter(labels.scriptMaxLotSizeFX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.scriptMaxLotSizeOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <BorderInput
                disabled={disableHandler(labels.scriptMaxLotSizeOptions)}
                value={valueHandler(labels.scriptMaxLotSizeOptions)}
                onChange={(e) =>
                  valueSetter(labels.scriptMaxLotSizeOptions, e.target.value)
                }
                type="number"
                className="w-2/3 md:w-full"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <MediumText>Max Qty/Trade</MediumText>
          <LabeledWrapper
            error={errorHandle(labels.tradeMaxLotSizeNSE)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                NSE
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMaxLotSizeNSE)}
                value={valueHandler(labels.tradeMaxLotSizeNSE)}
                onChange={(e) =>
                  valueSetter(labels.tradeMaxLotSizeNSE, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMaxLotSizeMCX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                MCX
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMaxLotSizeMCX)}
                value={valueHandler(labels.tradeMaxLotSizeMCX)}
                onChange={(e) =>
                  valueSetter(labels.tradeMaxLotSizeMCX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMaxLotSizeFX)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                FX
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMaxLotSizeFX)}
                value={valueHandler(labels.tradeMaxLotSizeFX)}
                onChange={(e) =>
                  valueSetter(labels.tradeMaxLotSizeFX, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <LabeledWrapper
            error={errorHandle(labels.tradeMaxLotSizeOptions)}
            label=""
          >
            <div className="flex justify-between md:space-x-0">
              <label className="text-[#696F8C] flex md:hidden justify-center items-center text-xs font-[400]">
                Options
              </label>
              <BorderInput
                disabled={disableHandler(labels.tradeMaxLotSizeOptions)}
                value={valueHandler(labels.tradeMaxLotSizeOptions)}
                onChange={(e) =>
                  valueSetter(labels.tradeMaxLotSizeOptions, e.target.value)
                }
                className="w-2/3 md:w-full"
                type="number"
                placeholder="No of Lot"
              />
            </div>
          </LabeledWrapper>
          <MediumText>Trade allowed in Qty NSE</MediumText>
          <InlineLabeledToggle
            label=""
            checked={user.tradeAllowedInQuantityNSE}
            onChange={(e) => {
              setUser({
                ...user,
                tradeAllowedInQuantityNSE: e,
              });
            }}
          />
        </div>
      </div>

      <div className="h-[1.5px] w-full bg-[var(--primary-shade-e)] my-6"></div>
      <H4>Square Off Settings</H4>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-[5%] gap-y-4">
        <LabeledToggle
          label="Short Margin Square off"
          checked={user.shortMarginSquareOff}
          disabled={disableHandler(labels.shortMarginSquareOff)}
          onChange={(e) => {
            setUser({
              ...user,
              shortMarginSquareOff: e,
            });
          }}
        />
        <LabeledWrapper
          error={errorHandle(labels.maximumLossPercentageCap)}
          label="Maximum Loss Percentage Cap"
          required={true}
        >
          <BorderInput
            value={valueHandler(labels.maximumLossPercentageCap)}
            disabled={disableHandler(labels.maximumLossPercentageCap)}
            onChange={(e) =>
              valueSetter(labels.maximumLossPercentageCap, e.target.value)
            }
            type="number"
            placeholder="Enter Value"
          />
        </LabeledWrapper>
      </div>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-[5%] gap-y-4">
        <LabeledToggle
          label="M2M Square off"
          checked={user.m2mSquareOff}
          disabled={disableHandler(labels.m2mSquareOff)}
          onChange={(e) => {
            setUser({
              ...user,
              m2mSquareOff: e,
            });
          }}
        />
        <LabeledWrapper
          error={errorHandle(labels.m2mSquareOffValue)}
          label="M2M Square Off Value"
          required={true}
        >
          <BorderInput
            disabled={disableHandler(labels.m2mSquareOffValue)}
            value={valueHandler(labels.m2mSquareOffValue)}
            onChange={(e) =>
              valueSetter(labels.m2mSquareOffValue, e.target.value)
            }
            type="number"
            placeholder="Enter Value"
          />
        </LabeledWrapper>
      </div>
      <div className="flex w-full justify-between">
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
