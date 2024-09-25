// create a custom hook to fetch data

import { useEffect, useState } from 'react';
import { useUserCreateStore, defaultUser } from '@/store/create-update-user';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';

const useParentFetch = () => {
  const {
    parent,
    setParent,
    dropdowns,
    setDropdowns,
    mode,
    user,
    setUser,
    setMode,
    updatedUser,
    setUpdatedUser,
    parentFetch,
    setParentFetch,
    setCopyUserId,
  } = useUserCreateStore();
  const { apiCall } = useFetch();
  const [loading, setLoading] = useState(true);
  let setUserDetails = async (userId: number, copyUser = false) => {
    let res = await apiCall(
      {
        url: userId
          ? `${Routes.USER_DETAILS.url}?userId=${userId}`
          : Routes.USER_DETAILS.url,
        method: Routes.USER_DETAILS.method,
      },
      {}
    );
    if (res.status) {
      if (copyUser) {
        setCopyUserId(userId);
        setUser({
          ...defaultUser,
          userType: res.data.userData.userType.id,
          city: res.data.userData.city.id,
          remarks: res.data.userData.remarks,
          tradeSquareOffLimit: res.data.userData.tradeSquareOffLimit.id,
          shortMarginSquareOff: res.data.userData.shortMarginSquareOff,
          maximumLossPercentageCap: res.data.userData.maxLossCap,
          m2mSquareOff: res.data.userData.m2mSquareOff,
          m2mSquareOffValue: res.data.userData.m2mSquareOffLimit,
          validTill:
            res.data.userData.validTillDate == null
              ? ''
              : res.data.userData.validTillDate,
          demoId: res.data.userData.isDemoId,
          creditBalance: res.data.creditDetails.transactionAmount,
          creditRemarks: res.data.creditDetails.transactionRemarks,
          activeBrokerageTypeNSE:
            res.data.brokerageSettings.NSE?.brokerageType || null,
          activeBrokerageTypeMCX:
            res.data.brokerageSettings.MCX?.brokerageType || null,
          activeBrokerageTypeFX:
            res.data.brokerageSettings.FX?.brokerageType || null,
          activeBrokerageTypeOptions:
            res.data.brokerageSettings.Options?.brokerageType || null,
          brokeragePerCroreNSE:
            res.data.brokerageSettings.NSE?.brokeragePerCroreAmt || null,
          brokeragePerCroreMCX:
            res.data.brokerageSettings.MCX?.brokeragePerCroreAmt || null,
          brokeragePerCroreFX:
            res.data.brokerageSettings.FX?.brokeragePerCroreAmt || null,
          brokeragePerCroreOptions:
            res.data.brokerageSettings.Options?.brokeragePerCroreAmt || null,
          brokeragePerLotFX:
            res.data.brokerageSettings.FX?.brokeragePerLotAmt || null,
          brokeragePerLotMCX:
            res.data.brokerageSettings.MCX?.brokeragePerLotAmt || null,
          brokeragePerLotNSE:
            res.data.brokerageSettings.NSE?.brokeragePerLotAmt || null,
          brokeragePerLotOptions:
            res.data.brokerageSettings.Options?.brokeragePerLotAmt || null,
          plShareNSE: res.data.plShareSettings.NSE || null,
          plShareMCX: res.data.plShareSettings.MCX || null,
          plShareFX: res.data.plShareSettings.FX || null,
          plShareOptions: res.data.plShareSettings.Options || null,
          exchangeAllowedFX:
            res.data.exchangeSettings.FX?.isExchangeActive || false,
          exchangeAllowedMCX:
            res.data.exchangeSettings.MCX?.isExchangeActive || false,
          exchangeAllowedNSE:
            res.data.exchangeSettings.NSE?.isExchangeActive || false,
          exchangeAllowedOptions:
            res.data.exchangeSettings.Options?.isExchangeActive || false,
          exchangeMaxLotSizeFX:
            res.data.exchangeSettings.FX?.exchangeMaxLotSize || null,
          exchangeMaxLotSizeMCX:
            res.data.exchangeSettings.MCX?.exchangeMaxLotSize || null,
          exchangeMaxLotSizeNSE:
            res.data.exchangeSettings.NSE?.exchangeMaxLotSize || null,
          exchangeMaxLotSizeOptions:
            res.data.exchangeSettings.Options?.exchangeMaxLotSize || null,
          scriptMaxLotSizeFX:
            res.data.exchangeSettings.FX?.scriptMaxLotSize || null,
          scriptMaxLotSizeMCX:
            res.data.exchangeSettings.MCX?.scriptMaxLotSize || null,
          scriptMaxLotSizeNSE:
            res.data.exchangeSettings.NSE?.scriptMaxLotSize || null,
          scriptMaxLotSizeOptions:
            res.data.exchangeSettings.Options?.scriptMaxLotSize || null,
          tradeMaxLotSizeFX:
            res.data.exchangeSettings.FX?.tradeMaxLotSize || null,
          tradeMaxLotSizeMCX:
            res.data.exchangeSettings.MCX?.tradeMaxLotSize || null,
          tradeMaxLotSizeNSE:
            res.data.exchangeSettings.NSE?.tradeMaxLotSize || null,
          tradeMaxLotSizeOptions:
            res.data.exchangeSettings.Options?.tradeMaxLotSize || null,
          intradayMarginPerCroreFX:
            res.data.intradayMarginSettings.FX?.marginPerCrore || null,
          intradayMarginPerCroreMCX:
            res.data.intradayMarginSettings.MCX?.marginPerCrore || null,
          intradayMarginPerCroreNSE:
            res.data.intradayMarginSettings.NSE?.marginPerCrore || null,
          intradayMarginPerCroreOptions:
            res.data.intradayMarginSettings.Options?.marginPerCrore || null,
          intradayMarginPerLotFX:
            res.data.intradayMarginSettings.FX?.marginPerLot || null,
          intradayMarginPerLotMCX:
            res.data.intradayMarginSettings.MCX?.marginPerLot || null,
          intradayMarginPerLotNSE:
            res.data.intradayMarginSettings.NSE?.marginPerLot || null,
          intradayMarginPerLotOptions:
            res.data.intradayMarginSettings.Options?.marginPerLot || null,
          intradayTrade: res.data.userData.isIntradayAllowed,
          tradeAllowedInQuantityNSE: res.data.userData.tradeAllowedinQty,
          activeMarginTypeNSE:
            res.data.tradeMarginSettings.NSE?.marginType || null,
          activeMarginTypeMCX:
            res.data.tradeMarginSettings.MCX?.marginType || null,
          activeMarginTypeFX:
            res.data.tradeMarginSettings.FX?.marginType || null,
          activeMarginTypeOptions:
            res.data.tradeMarginSettings.Options?.marginType || null,
          tradeMarginPerCroreFX:
            res.data.tradeMarginSettings.FX?.marginPerCrore || null,
          tradeMarginPerCroreMCX:
            res.data.tradeMarginSettings.MCX?.marginPerCrore || null,
          tradeMarginPerCroreNSE:
            res.data.tradeMarginSettings.NSE?.marginPerCrore || null,
          tradeMarginPerCroreOptions:
            res.data.tradeMarginSettings.Options?.marginPerCrore || null,
          tradeMarginPerLotFX:
            res.data.tradeMarginSettings.FX?.marginPerLot || null,
          tradeMarginPerLotMCX:
            res.data.tradeMarginSettings.MCX?.marginPerLot || null,
          tradeMarginPerLotNSE:
            res.data.tradeMarginSettings.NSE?.marginPerLot || null,
          tradeMarginPerLotOptions:
            res.data.tradeMarginSettings.Options?.marginPerLot || null,
        });
      } else {
        setUser({
          ...user,
          userName: res.data.userData.username,
          userType: res.data.userData.userType.id,
          firstName: res.data.userData.firstName,
          lastName: res.data.userData.lastName,
          password: '##garbage##',
          retypePassword: '##garbage##',
          email: res.data.userData.email,
          mobile: res.data.userData.mobileNumber,
          city: res.data.userData.city.id,
          remarks: res.data.userData.remarks,
          tradeSquareOffLimit: res.data.userData.tradeSquareOffLimit.id,
          shortMarginSquareOff: res.data.userData.shortMarginSquareOff,
          maximumLossPercentageCap: res.data.userData.maxLossCap,
          m2mSquareOff: res.data.userData.m2mSquareOff,
          m2mSquareOffValue: res.data.userData.m2mSquareOffLimit,
          validTill:
            res.data.userData.validTillDate == null
              ? ''
              : res.data.userData.validTillDate,
          demoId: res.data.userData.isDemoId,
          creditBalance: res.data.creditDetails.transactionAmount,
          creditRemarks: res.data.creditDetails.transactionRemarks,
          activeBrokerageTypeNSE:
            res.data.brokerageSettings.NSE?.brokerageType || null,
          activeBrokerageTypeMCX:
            res.data.brokerageSettings.MCX?.brokerageType || null,
          activeBrokerageTypeFX:
            res.data.brokerageSettings.FX?.brokerageType || null,
          activeBrokerageTypeOptions:
            res.data.brokerageSettings.Options?.brokerageType || null,
          brokeragePerCroreNSE:
            res.data.brokerageSettings.NSE?.brokeragePerCroreAmt || null,
          brokeragePerCroreMCX:
            res.data.brokerageSettings.MCX?.brokeragePerCroreAmt || null,
          brokeragePerCroreFX:
            res.data.brokerageSettings.FX?.brokeragePerCroreAmt || null,
          brokeragePerCroreOptions:
            res.data.brokerageSettings.Options?.brokeragePerCroreAmt || null,
          brokeragePerLotFX:
            res.data.brokerageSettings.FX?.brokeragePerLotAmt || null,
          brokeragePerLotMCX:
            res.data.brokerageSettings.MCX?.brokeragePerLotAmt || null,
          brokeragePerLotNSE:
            res.data.brokerageSettings.NSE?.brokeragePerLotAmt || null,
          brokeragePerLotOptions:
            res.data.brokerageSettings.Options?.brokeragePerLotAmt || null,
          plShareNSE: res.data.plShareSettings.NSE || null,
          plShareMCX: res.data.plShareSettings.MCX || null,
          plShareFX: res.data.plShareSettings.FX || null,
          plShareOptions: res.data.plShareSettings.Options || null,
          exchangeAllowedFX:
            res.data.exchangeSettings.FX?.isExchangeActive || false,
          exchangeAllowedMCX:
            res.data.exchangeSettings.MCX?.isExchangeActive || false,
          exchangeAllowedNSE:
            res.data.exchangeSettings.NSE?.isExchangeActive || false,
          exchangeAllowedOptions:
            res.data.exchangeSettings.Options?.isExchangeActive || false,
          exchangeMaxLotSizeFX:
            res.data.exchangeSettings.FX?.exchangeMaxLotSize || null,
          exchangeMaxLotSizeMCX:
            res.data.exchangeSettings.MCX?.exchangeMaxLotSize || null,
          exchangeMaxLotSizeNSE:
            res.data.exchangeSettings.NSE?.exchangeMaxLotSize || null,
          exchangeMaxLotSizeOptions:
            res.data.exchangeSettings.Options?.exchangeMaxLotSize || null,
          scriptMaxLotSizeFX:
            res.data.exchangeSettings.FX?.scriptMaxLotSize || null,
          scriptMaxLotSizeMCX:
            res.data.exchangeSettings.MCX?.scriptMaxLotSize || null,
          scriptMaxLotSizeNSE:
            res.data.exchangeSettings.NSE?.scriptMaxLotSize || null,
          scriptMaxLotSizeOptions:
            res.data.exchangeSettings.Options?.scriptMaxLotSize || null,
          tradeMaxLotSizeFX:
            res.data.exchangeSettings.FX?.tradeMaxLotSize || null,
          tradeMaxLotSizeMCX:
            res.data.exchangeSettings.MCX?.tradeMaxLotSize || null,
          tradeMaxLotSizeNSE:
            res.data.exchangeSettings.NSE?.tradeMaxLotSize || null,
          tradeMaxLotSizeOptions:
            res.data.exchangeSettings.Options?.tradeMaxLotSize || null,
          intradayMarginPerCroreFX:
            res.data.intradayMarginSettings.FX?.marginPerCrore || null,
          intradayMarginPerCroreMCX:
            res.data.intradayMarginSettings.MCX?.marginPerCrore || null,
          intradayMarginPerCroreNSE:
            res.data.intradayMarginSettings.NSE?.marginPerCrore || null,
          intradayMarginPerCroreOptions:
            res.data.intradayMarginSettings.Options?.marginPerCrore || null,
          intradayMarginPerLotFX:
            res.data.intradayMarginSettings.FX?.marginPerLot || null,
          intradayMarginPerLotMCX:
            res.data.intradayMarginSettings.MCX?.marginPerLot || null,
          intradayMarginPerLotNSE:
            res.data.intradayMarginSettings.NSE?.marginPerLot || null,
          intradayMarginPerLotOptions:
            res.data.intradayMarginSettings.Options?.marginPerLot || null,
          intradayTrade: res.data.userData.isIntradayAllowed,
          tradeAllowedInQuantityNSE: res.data.userData.tradeAllowedinQty,
          activeMarginTypeNSE:
            res.data.tradeMarginSettings.NSE?.marginType || null,
          activeMarginTypeMCX:
            res.data.tradeMarginSettings.MCX?.marginType || null,
          activeMarginTypeFX:
            res.data.tradeMarginSettings.FX?.marginType || null,
          activeMarginTypeOptions:
            res.data.tradeMarginSettings.Options?.marginType || null,
          tradeMarginPerCroreFX:
            res.data.tradeMarginSettings.FX?.marginPerCrore || null,
          tradeMarginPerCroreMCX:
            res.data.tradeMarginSettings.MCX?.marginPerCrore || null,
          tradeMarginPerCroreNSE:
            res.data.tradeMarginSettings.NSE?.marginPerCrore || null,
          tradeMarginPerCroreOptions:
            res.data.tradeMarginSettings.Options?.marginPerCrore || null,
          tradeMarginPerLotFX:
            res.data.tradeMarginSettings.FX?.marginPerLot || null,
          tradeMarginPerLotMCX:
            res.data.tradeMarginSettings.MCX?.marginPerLot || null,
          tradeMarginPerLotNSE:
            res.data.tradeMarginSettings.NSE?.marginPerLot || null,
          tradeMarginPerLotOptions:
            res.data.tradeMarginSettings.Options?.marginPerLot || null,
        });
      }
      return res.data.userData.createdByUser.id;
    } else {
      return null;
    }
  };

  let fetchData = async (userId?: number, setDropDowns = true) => {
    let res = await apiCall(
      {
        url: userId
          ? `${Routes.USER_DETAILS.url}?userId=${userId}`
          : Routes.USER_DETAILS.url,
        method: Routes.USER_DETAILS.method,
      },
      {}
    );
    if (res.status) {
      setParent({
        brokeragePerCroreNSE:
          res.data.brokerageSettings.NSE?.brokeragePerCroreAmt || 0,
        brokeragePerCroreMCX:
          res.data.brokerageSettings.MCX?.brokeragePerCroreAmt || 0,
        brokeragePerCroreFX:
          res.data.brokerageSettings.FX?.brokeragePerCroreAmt || 0,
        brokeragePerCroreOptions:
          res.data.brokerageSettings.Options?.brokeragePerCroreAmt || 0,
        brokeragePerLotFX:
          res.data.brokerageSettings.FX?.brokeragePerLotAmt || 0,
        brokeragePerLotMCX:
          res.data.brokerageSettings.MCX?.brokeragePerLotAmt || 0,
        brokeragePerLotNSE:
          res.data.brokerageSettings.NSE?.brokeragePerLotAmt || 0,
        brokeragePerLotOptions:
          res.data.brokerageSettings.Options?.brokeragePerLotAmt || 0,
        demoId: res.data.userData.isDemoId,
        exchangeAllowedFX:
          res.data.exchangeSettings.FX?.isExchangeActive || false,
        exchangeAllowedMCX:
          res.data.exchangeSettings.MCX?.isExchangeActive || false,
        exchangeAllowedNSE:
          res.data.exchangeSettings.NSE?.isExchangeActive || false,
        exchangeAllowedOptions:
          res.data.exchangeSettings.Options?.isExchangeActive || false,
        exchangeMaxLotSizeFX:
          res.data.exchangeSettings.FX?.exchangeMaxLotSize || 0,
        exchangeMaxLotSizeMCX:
          res.data.exchangeSettings.MCX?.exchangeMaxLotSize || 0,
        exchangeMaxLotSizeNSE:
          res.data.exchangeSettings.NSE?.exchangeMaxLotSize || 0,
        exchangeMaxLotSizeOptions:
          res.data.exchangeSettings.Options?.exchangeMaxLotSize || 0,
        scriptMaxLotSizeFX: res.data.exchangeSettings.FX?.scriptMaxLotSize || 0,
        scriptMaxLotSizeMCX:
          res.data.exchangeSettings.MCX?.scriptMaxLotSize || 0,
        scriptMaxLotSizeNSE:
          res.data.exchangeSettings.NSE?.scriptMaxLotSize || 0,
        scriptMaxLotSizeOptions:
          res.data.exchangeSettings.Options?.scriptMaxLotSize || 0,
        tradeMaxLotSizeFX: res.data.exchangeSettings.FX?.tradeMaxLotSize || 0,
        tradeMaxLotSizeMCX: res.data.exchangeSettings.MCX?.tradeMaxLotSize || 0,
        tradeMaxLotSizeNSE: res.data.exchangeSettings.NSE?.tradeMaxLotSize || 0,
        tradeMaxLotSizeOptions:
          res.data.exchangeSettings.Options?.tradeMaxLotSize || 0,
        intradayMarginPerCroreFX:
          res.data.intradayMarginSettings.FX?.marginPerCrore || 0,
        intradayMarginPerCroreMCX:
          res.data.intradayMarginSettings.MCX?.marginPerCrore || 0,
        intradayMarginPerCroreNSE:
          res.data.intradayMarginSettings.NSE?.marginPerCrore || 0,
        intradayMarginPerCroreOptions:
          res.data.intradayMarginSettings.Options?.marginPerCrore || 0,
        intradayMarginPerLotFX:
          res.data.intradayMarginSettings.FX?.marginPerLot || 0,
        intradayMarginPerLotMCX:
          res.data.intradayMarginSettings.MCX?.marginPerLot || 0,
        intradayMarginPerLotNSE:
          res.data.intradayMarginSettings.NSE?.marginPerLot || 0,
        intradayMarginPerLotOptions:
          res.data.intradayMarginSettings.Options?.marginPerLot || 0,
        intradayTrade: res.data.userData.isIntradayAllowed,
        tradeAllowedInQuantityNSE: res.data.userData.tradeAllowedinQty,
        tradeMarginPerCroreFX:
          res.data.tradeMarginSettings.FX?.marginPerCrore || 0,
        tradeMarginPerCroreMCX:
          res.data.tradeMarginSettings.MCX?.marginPerCrore || 0,
        tradeMarginPerCroreNSE:
          res.data.tradeMarginSettings.NSE?.marginPerCrore || 0,
        tradeMarginPerCroreOptions:
          res.data.tradeMarginSettings.Options?.marginPerCrore || 0,
        tradeMarginPerLotFX: res.data.tradeMarginSettings.FX?.marginPerLot || 0,
        tradeMarginPerLotMCX:
          res.data.tradeMarginSettings.MCX?.marginPerLot || 0,
        tradeMarginPerLotNSE:
          res.data.tradeMarginSettings.NSE?.marginPerLot || 0,
        tradeMarginPerLotOptions:
          res.data.tradeMarginSettings.Options?.marginPerLot || 0,
        validTill: res.data.userData.validTillDate,
      });
    }
    let dropdown = await apiCall(
      {
        url: userId
          ? `${Routes.GET_CREATE_USER_DROPDOWN_DATA.url}?userId=${userId}`
          : Routes.GET_CREATE_USER_DROPDOWN_DATA.url,
        method: Routes.GET_CREATE_USER_DROPDOWN_DATA.method,
      },
      {}
    );
    if (dropdown.status) {
      console.log(dropdown.data);
      setDropdowns({
        userTypeOptions: {
          options: dropdown.data.userType.map((item: any) => ({
            value: item.value,
            label: item.text,
            constant: item.constant,
          })),
          name: 'userType',
        },
        cityOptions: {
          options: dropdown.data.city.map((item: any) => ({
            value: item.value,
            label: item.text,
            constant: item.constant,
          })),
          name: 'city',
        },
        tradeSquareOffLimitOptions: {
          options: dropdown.data.tradeSquareOffLimit.map((item: any) => ({
            value: item.value,
            label: item.text,
            constant: item.constant,
          })),
          name: 'tradeSquareOffLimit',
        },
      });
      if (setDropDowns) {
        console.log('checksss', dropdown.data.userType[0].value);
        setUser({
          ...defaultUser,
          userType: dropdown.data.userType[0].value,
          city: dropdown.data.city[0].value,
          tradeSquareOffLimit: dropdown.data.tradeSquareOffLimit[0].value,
        });
      }
    }
    if (res.status && dropdown.status) {
      setParentFetch(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (parentFetch) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);
  return { loading, fetchData, setUserDetails };
};

export default useParentFetch;
