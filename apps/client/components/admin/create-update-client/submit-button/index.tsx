import { PrimaryButton } from '@/components/inputs/button';
import useFetch from '@/hooks/useFetch';
import useRules from '../rules';
import { useUserCreateStore } from '@/store/create-update-user';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import React from 'react';
import { labels as basicDetails } from '../basic-details';
import { labels as exchangeSettings } from '../exchange-info';
import { labels as brokerageSettings } from '../brokerage-settings';
import { labels as marginSettings } from '../margin-settings';
import useParentFetch from '../useParentFetch';

export type CreateUserExchangeSettings = {
  NSE?: {
    exchangeMaxLotSize: number | null;
    scriptMaxLotSize: number | null;
    tradeMaxLotSize: number | null;
  };
  MCX?: {
    exchangeMaxLotSize: number | null;
    scriptMaxLotSize: number | null;
    tradeMaxLotSize: number | null;
  };
  FX?: {
    exchangeMaxLotSize: number | null;
    scriptMaxLotSize: number | null;
    tradeMaxLotSize: number | null;
  };
  Options?: {
    exchangeMaxLotSize: number | null;
    scriptMaxLotSize: number | null;
    tradeMaxLotSize: number | null;
  };
};

export type CreateUserBrokerageSettings = {
  NSE?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number | null;
    brokeragePerCroreAmt: number | null;
  };
  MCX?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number | null;
    brokeragePerCroreAmt: number | null;
  };
  FX?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number | null;
    brokeragePerCroreAmt: number | null;
  };
  Options?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number | null;
    brokeragePerCroreAmt: number | null;
  };
};

export type CreateUserTradeMarginSettings = {
  NSE?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
  MCX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
  FX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
  Options?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
};

export type CreateUserIntradayTradeMarginSettings = {
  NSE?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
  MCX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
  FX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
  Options?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number | null;
    marginPerCrore: number | null;
  };
};

export type CreateUserPLShare = {
  NSE?: number | null;
  MCX?: number | null;
  FX?: number | null;
  Options?: number | null;
};

export type CreateUserBody = {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  remarks: string;
  mobileNumber: string;
  cityId: number | null;
  isCopyUser: boolean;
  copyUserId?: number | null;
  userTypeId: number | null;
  transactionLedger: {
    amount: number | null;
    remarks: string;
  };
  validTillDate: string;
  isDemoId: boolean;
  tradeSquareOffLimit: number | null;
  isIntradayAllowed: boolean;
  m2mSquareOff: boolean;
  shortMarginSquareOff: boolean;
  m2mSquareOffLimit: number | null;
  tradeAllowedInQty: boolean;
  marginType: string;
  exchangeSettings: CreateUserExchangeSettings;
  brokerageSettings: CreateUserBrokerageSettings;
  tradeMarginSettings: CreateUserTradeMarginSettings;
  intradayTradeMarginSettings: CreateUserIntradayTradeMarginSettings;
  plShare: CreateUserPLShare;
  createdOnBehalf: number | null;
};

function Index() {
  const { setErrors, user, updatedUser, copyUserId, setUpdatedUser, setMode } =
    useUserCreateStore();
  const { fetchData, setUserDetails } = useParentFetch();

  const { validate } = useRules();
  const { apiCall } = useFetch();

  const submitHandler = async () => {
    const _valid = validate(true);
    let _error: any = {};
    if (_valid) {
      console.log(_valid);
      // set only those keys which are in labels
      Object.keys(_valid).forEach((key) => {
        // @ts-ignore
        _error[key] = _valid[key];
      });
      // if keys contains in basicDetails then set errors in basicDetails
      if (Object.keys(basicDetails).includes(Object.keys(_error)[0])) {
        setErrors('basicDetails', _error);
      }
      // if keys contains in exchangeSettings then set errors in exchangeSettings
      else if (Object.keys(exchangeSettings).includes(Object.keys(_error)[0])) {
        setErrors('exchangeSettings', _error);
      }
      // if keys contains in brokerageSettings then set errors in brokerageSettings
      else if (
        Object.keys(brokerageSettings).includes(Object.keys(_error)[0])
      ) {
        setErrors('brokerageSettings', _error);
      }
      // if keys contains in marginSettings then set errors in marginSettings
      else if (Object.keys(marginSettings).includes(Object.keys(_error)[0])) {
        setErrors('marginSettings', _error);
      }
    }
    if (Object.keys(_error).length != 0) {
      console.log('-->', _error);
      new Toast('Please fill all the required fields!!!').error(
        'Please fill all the required fields!!!'
      );
      return;
    }
    let userBody: any = {
      username: user.userName,
      firstName: user.firstName,
      password: user.password,
      cityId: user.city,
      isCopyUser: copyUserId != -1 ? true : false,
      isDemoId: user.demoId,
      brokerCount: user.brokerCount,
      subBrokerCount: user.subBrokerCount,
      clientCount: user.clientCount,
      userTypeId: user.userType,
      tradeAllowedInQty: user.tradeAllowedInQuantityNSE,
      tradeSquareOffLimit: user.tradeSquareOffLimit,
      isIntradayAllowed: user.intradayTrade,
      transactionLedger: {
        amount: user.creditBalance,
        remarks: user.creditRemarks,
      },
      createdOnBehalf: updatedUser.type == 'behalf' ? updatedUser.id : null,
      exchangeSettings: {},
      brokerageSettings: {},
      tradeMarginSettings: {},
      intradayTradeMarginSettings: {},
      m2mSquareOff: user.m2mSquareOff,
      m2mSquareOffLimit: user.m2mSquareOffValue,
      shortMarginSquareOff: user.shortMarginSquareOff,
      maxLossCap: user.maximumLossPercentageCap,
      plShare: {},
    };
    if (copyUserId != -1) {
      userBody.copyUserId = copyUserId || -1;
    }
    if (user.validTill != '') {
      userBody.validTillDate = user.validTill;
    }
    if (user.lastName != '') {
      userBody.lastName = user.lastName;
    }
    if (user.remarks != '') {
      userBody.remarks = user.remarks;
    }
    if (user.email != '') {
      userBody.email = user.email;
    }
    if (user.mobile != '') {
      userBody.mobileNumber = user.mobile;
    }
    if (user.exchangeAllowedNSE) {
      userBody.exchangeSettings = {
        ...userBody.exchangeSettings,
        NSE: {
          exchangeMaxLotSize: user.exchangeMaxLotSizeNSE,
          scriptMaxLotSize: user.scriptMaxLotSizeNSE,
          tradeMaxLotSize: user.tradeMaxLotSizeNSE,
        },
      };
      userBody.brokerageSettings = {
        ...userBody.brokerageSettings,
        NSE: {
          brokeragePerCroreAmt: user.brokeragePerCroreNSE,
          brokeragePerLotAmt: user.brokeragePerLotNSE,
          brokerageType: user.activeBrokerageTypeNSE,
        },
      };
      userBody.tradeMarginSettings = {
        ...userBody.tradeMarginSettings,
        NSE: {
          marginPerCrore: user.tradeMarginPerCroreNSE,
          marginPerLot: user.tradeMarginPerLotNSE,
          marginType: user.activeMarginTypeNSE,
        },
      };
      if (user.intradayTrade) {
        userBody.intradayTradeMarginSettings = {
          ...userBody.intradayTradeMarginSettings,
          NSE: {
            marginPerCrore: user.intradayMarginPerCroreNSE,
            marginPerLot: user.intradayMarginPerLotNSE,
            marginType: user.activeMarginTypeNSE,
          },
        };
      }
      userBody.plShare = { ...userBody.plShare, NSE: user.plShareNSE };
    }

    if (user.exchangeAllowedMCX) {
      userBody.exchangeSettings = {
        ...userBody.exchangeSettings,
        MCX: {
          exchangeMaxLotSize: user.exchangeMaxLotSizeMCX,
          scriptMaxLotSize: user.scriptMaxLotSizeMCX,
          tradeMaxLotSize: user.tradeMaxLotSizeMCX,
        },
      };
      userBody.brokerageSettings = {
        ...userBody.brokerageSettings,
        MCX: {
          brokeragePerCroreAmt: user.brokeragePerCroreMCX,
          brokeragePerLotAmt: user.brokeragePerLotMCX,
          brokerageType: user.activeBrokerageTypeMCX,
        },
      };
      userBody.tradeMarginSettings = {
        ...userBody.tradeMarginSettings,
        MCX: {
          marginPerCrore: user.tradeMarginPerCroreMCX,
          marginPerLot: user.tradeMarginPerLotMCX,
          marginType: user.activeMarginTypeMCX,
        },
      };
      if (user.intradayTrade) {
        userBody.intradayTradeMarginSettings = {
          ...userBody.intradayTradeMarginSettings,
          MCX: {
            marginPerCrore: user.intradayMarginPerCroreMCX,
            marginPerLot: user.intradayMarginPerLotMCX,
            marginType: user.activeMarginTypeMCX,
          },
        };
      }
      userBody.plShare = { ...userBody.plShare, MCX: user.plShareMCX };
    }

    if (user.exchangeAllowedFX) {
      userBody.exchangeSettings = {
        ...userBody.exchangeSettings,
        FX: {
          exchangeMaxLotSize: user.exchangeMaxLotSizeFX,
          scriptMaxLotSize: user.scriptMaxLotSizeFX,
          tradeMaxLotSize: user.tradeMaxLotSizeFX,
        },
      };
      userBody.brokerageSettings = {
        ...userBody.brokerageSettings,
        FX: {
          brokeragePerCroreAmt: user.brokeragePerCroreFX,
          brokeragePerLotAmt: user.brokeragePerLotFX,
          brokerageType: user.activeBrokerageTypeFX,
        },
      };
      userBody.tradeMarginSettings = {
        ...userBody.tradeMarginSettings,
        FX: {
          marginPerCrore: user.tradeMarginPerCroreFX,
          marginPerLot: user.tradeMarginPerLotFX,
          marginType: user.activeMarginTypeFX,
        },
      };
      if (user.intradayTrade) {
        userBody.intradayTradeMarginSettings = {
          ...userBody.intradayTradeMarginSettings,
          FX: {
            marginPerCrore: user.intradayMarginPerCroreFX,
            marginPerLot: user.intradayMarginPerLotFX,
            marginType: user.activeMarginTypeFX,
          },
        };
      }
      userBody.plShare = { ...userBody.plShare, FX: user.plShareFX };
    }

    if (user.exchangeAllowedOptions) {
      userBody.exchangeSettings = {
        ...userBody.exchangeSettings,
        Options: {
          exchangeMaxLotSize: user.exchangeMaxLotSizeOptions,
          scriptMaxLotSize: user.scriptMaxLotSizeOptions,
          tradeMaxLotSize: user.tradeMaxLotSizeOptions,
        },
      };
      userBody.brokerageSettings = {
        ...userBody.brokerageSettings,
        Options: {
          brokeragePerCroreAmt: user.brokeragePerCroreOptions,
          brokeragePerLotAmt: user.brokeragePerLotOptions,
          brokerageType: user.activeBrokerageTypeOptions,
        },
      };
      userBody.tradeMarginSettings = {
        ...userBody.tradeMarginSettings,
        Options: {
          marginPerCrore: user.tradeMarginPerCroreOptions,
          marginPerLot: user.tradeMarginPerLotOptions,
          marginType: user.activeMarginTypeOptions,
        },
      };
      if (user.intradayTrade) {
        userBody.intradayTradeMarginSettings = {
          ...userBody.intradayTradeMarginSettings,
          FX: {
            marginPerCrore: user.intradayMarginPerCroreOptions,
            marginPerLot: user.intradayMarginPerLotOptions,
            marginType: user.activeMarginTypeOptions,
          },
        };
      }
      userBody.plShare = { ...userBody.plShare, Options: user.plShareOptions };
    }
    let toast = new Toast('Creating User!!!');
    let response = await apiCall(Routes.CREATE_USER, userBody, false);
    console.log(response);
    if (response.status == true) {
      // await setUserDetails(response.data);
      setUpdatedUser({
        username: user.userName,
        id: response.data,
        type: 'update',
      });
      setMode('update');
      toast.success(response.message);
    } else {
      toast.error(
        (response.data && response.data[0]?.message) || response.message
      );
    }
    return;
  };
  return (
    <PrimaryButton onClick={submitHandler} className="w-full">
      Create&nbsp;User
    </PrimaryButton>
  );
}

export default Index;
