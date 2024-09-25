import { PrimaryButton } from '@/components/inputs/button';
import useFetch from '@/hooks/useFetch';
import { useUserCreateStore } from '@/store/create-update-user';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import React from 'react';
import useRules from '../rules';
import { labels as basicDetails } from '../basic-details';
import { labels as exchangeSettings } from '../exchange-info';
import { labels as brokerageSettings } from '../brokerage-settings';
import { labels as marginSettings } from '../margin-settings';

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
  const { errors, setErrors, user, copyUserId, updatedUser } =
    useUserCreateStore();
  const { validate } = useRules();
  const { apiCall } = useFetch();

  const updateHandler = async () => {
    const _valid = validate(true);
    let _error: any = {};
    if (_valid) {
      // set only those keys which are in labels
      Object.keys(_valid).forEach((key) => {
        // @ts-ignore
        _error[key] = _valid[key];
      });
      console.log(_valid, _error);
      // if keys contains in exchangeSettings then set errors in exchangeSettings
      for (const e in _error) {
        if (Object.keys(exchangeSettings).includes(e)) {
          setErrors('exchangeSettings', {
            ...errors.exchangeSettings,
            e,
          });
        } else if (Object.keys(brokerageSettings).includes(e)) {
          setErrors('brokerageSettings', {
            ...errors.brokerageSettings,
            e,
          });
        } else if (Object.keys(marginSettings).includes(e)) {
          setErrors('marginSettings', {
            ...errors.marginSettings,
            e,
          });
        }
      }
    }
    if (Object.keys(_error).length != 0) {
      new Toast('Please fill all the required fields!!!').error(
        'Please fill all the required fields!!!'
      );
      return;
    }

    let updatedBody: any = {
      userId: updatedUser.id,
      tradeAllowedInQuantityNSE: user.tradeAllowedInQuantityNSE,
      shortMarginSquareOff: user.shortMarginSquareOff,
      maximumLossPercentageCap: user.maximumLossPercentageCap,
      m2mSquareOff: user.m2mSquareOff,
      m2mSquareOffLimit: user.m2mSquareOffValue,
      isIntradayAllowed: user.intradayTrade,
    };

    if (user.exchangeAllowedNSE) {
      updatedBody['NSE'] = {
        exchangeAllowed: user.exchangeAllowedNSE,
        exchangeMaxLotSize: user.exchangeMaxLotSizeNSE,
        scriptMaxLotSize: user.scriptMaxLotSizeNSE,
        tradeMaxLotSize: user.tradeMaxLotSizeNSE,
        brokerageType: user.activeBrokerageTypeNSE,
        brokeragePerCroreAmt: user.brokeragePerCroreNSE,
        brokeragePerLotAmt: user.brokeragePerLotNSE,
        plShare: user.plShareNSE,
        marginType: user.activeMarginTypeNSE,
        marginPerCrore: user.tradeMarginPerCroreNSE,
        marginPerLot: user.tradeMarginPerLotNSE,
      };
      if (user.intradayTrade) {
        updatedBody['NSE'] = {
          ...updatedBody['NSE'],
          intraday: {
            marginPerCrore: user.intradayMarginPerCroreNSE,
            marginPerLot: user.intradayMarginPerLotNSE,
          },
        };
      }
    }

    if (user.exchangeAllowedMCX) {
      updatedBody['MCX'] = {
        exchangeAllowed: user.exchangeAllowedMCX,
        exchangeMaxLotSize: user.exchangeMaxLotSizeMCX,
        scriptMaxLotSize: user.scriptMaxLotSizeMCX,
        tradeMaxLotSize: user.tradeMaxLotSizeMCX,
        brokerageType: user.activeBrokerageTypeMCX,
        brokeragePerCroreAmt: user.brokeragePerCroreMCX,
        brokeragePerLotAmt: user.brokeragePerLotMCX,
        plShare: user.plShareMCX,
        marginType: user.activeMarginTypeMCX,
        marginPerCrore: user.tradeMarginPerCroreMCX,
        marginPerLot: user.tradeMarginPerLotMCX,
      };
      if (user.intradayTrade) {
        updatedBody['MCX'] = {
          ...updatedBody['MCX'],
          intraday: {
            marginPerCrore: user.intradayMarginPerCroreMCX,
            marginPerLot: user.intradayMarginPerLotMCX,
          },
        };
      }
    }

    if (user.exchangeAllowedFX) {
      updatedBody['FX'] = {
        exchangeAllowed: user.exchangeAllowedFX,
        exchangeMaxLotSize: user.exchangeMaxLotSizeFX,
        scriptMaxLotSize: user.scriptMaxLotSizeFX,
        tradeMaxLotSize: user.tradeMaxLotSizeFX,
        brokerageType: user.activeBrokerageTypeFX,
        brokeragePerCroreAmt: user.brokeragePerCroreFX,
        brokeragePerLotAmt: user.brokeragePerLotFX,
        plShare: user.plShareFX,
        marginType: user.activeMarginTypeFX,
        marginPerCrore: user.tradeMarginPerCroreFX,
        marginPerLot: user.tradeMarginPerLotFX,
      };
      if (user.intradayTrade) {
        updatedBody['FX'] = {
          ...updatedBody['FX'],
          intraday: {
            marginPerCrore: user.intradayMarginPerCroreFX,
            marginPerLot: user.intradayMarginPerLotFX,
          },
        };
      }
    }

    if (user.exchangeAllowedOptions) {
      updatedBody['Options'] = {
        exchangeAllowed: user.exchangeAllowedOptions,
        exchangeMaxLotSize: user.exchangeMaxLotSizeOptions,
        scriptMaxLotSize: user.scriptMaxLotSizeOptions,
        tradeMaxLotSize: user.tradeMaxLotSizeOptions,
        brokerageType: user.activeBrokerageTypeOptions,
        brokeragePerCroreAmt: user.brokeragePerCroreOptions,
        brokeragePerLotAmt: user.brokeragePerLotOptions,
        plShare: user.plShareOptions,
        marginType: user.activeMarginTypeOptions,
        marginPerCrore: user.tradeMarginPerCroreOptions,
        marginPerLot: user.tradeMarginPerLotOptions,
      };
      if (user.intradayTrade) {
        updatedBody['Options'] = {
          ...updatedBody['Options'],
          intraday: {
            marginPerCrore: user.intradayMarginPerCroreOptions,
            marginPerLot: user.intradayMarginPerLotOptions,
          },
        };
      }
    }

    let toast = new Toast('Updating Details!!!');
    let response = await apiCall(
      Routes.UPDATE_USER_TRADE_INFO,
      updatedBody,
      false
    );
    console.log(response);
    if (response.status == true) {
      toast.success('Updated Details!!!');
    } else {
      toast.error(response.message);
    }
    return;
  };
  return (
    <PrimaryButton onClick={updateHandler} className="w-full">
      Update&nbsp;User
    </PrimaryButton>
  );
}

export default Index;
