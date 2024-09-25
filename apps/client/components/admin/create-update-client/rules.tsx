import Joi from 'joi';
import {
  ParentUserType,
  CreateUserType,
  useUserCreateStore,
} from '@/store/create-update-user';
import moment from 'moment';
import useFetch from '@/hooks/useFetch';

const Rules = () => {
  const { parent, user, updatedUser, dropdowns } = useUserCreateStore();
  const userValidation = Joi.object({
    userName: Joi.string().regex(/^\S+$/).required(),
    userType: Joi.number().positive().allow(0).required().messages({
      'number.base': 'Enter a Value',
    }),
    firstName: Joi.string().required(),
    lastName: Joi.string().optional().allow(null, ''),
    email: Joi.string()
      .email({
        tlds: { allow: false },
      })
      .required(),
    mobile: Joi.string()
      .required()
      .pattern(/^[0-9]+$/)
      .length(10)
      .messages({
        'string.length': 'Mobile number must be 10 digits',
        'string.pattern.base': 'Invalid mobile number',
      }),
    password: Joi.string().required(),
    retypePassword: Joi.string().required(),
    city: Joi.number().positive().allow(0).required().messages({
      'number.base': 'Enter a Value',
    }),
    remarks: Joi.string().required(),
    tradeSquareOffLimit: Joi.number().positive().allow(0).required().messages({
      'number.base': 'Enter a Value',
    }),
    validTill: Joi.string().optional().allow(null, ''),
    creditBalance: Joi.number().positive().allow(0).required().messages({
      'number.base': 'Enter a Value',
    }),
    creditRemarks: Joi.string().required(),
    demoId: Joi.boolean().required(),
    tradeAllowedInQuantityNSE: Joi.boolean().required(),
    exchangeAllowedNSE: Joi.boolean().required(),
    exchangeAllowedMCX: Joi.boolean().required(),
    exchangeAllowedFX: Joi.boolean().required(),
    exchangeAllowedOptions: Joi.boolean().required(),
    exchangeMaxLotSizeNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    exchangeMaxLotSizeMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      })
      .required()
      .messages({
        'number.base': 'Enter a Value',
      }),
    exchangeMaxLotSizeFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      })
      .required()
      .messages({
        'number.base': 'Enter a Value',
      }),
    exchangeMaxLotSizeOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      })
      .required()
      .messages({
        'number.base': 'Enter a Value',
      }),
    scriptMaxLotSizeNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('exchangeMaxLotSizeNSE'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Script max lot size must be less than or equal to exchange max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    scriptMaxLotSizeMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('exchangeMaxLotSizeMCX'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Script max lot size must be less than or equal to exchange max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    scriptMaxLotSizeFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('exchangeMaxLotSizeFX'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Script max lot size must be less than or equal to exchange max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    scriptMaxLotSizeOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('exchangeMaxLotSizeOptions'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Script max lot size must be less than or equal to exchange max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMaxLotSizeNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('scriptMaxLotSizeNSE'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Trade max lot size must be less than or equal to Script max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMaxLotSizeMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('scriptMaxLotSizeMCX'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Trade max lot size must be less than or equal to Script max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMaxLotSizeFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('scriptMaxLotSizeFX'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Trade max lot size must be less than or equal to Script max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMaxLotSizeOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .max(Joi.ref('scriptMaxLotSizeOptions'))
          .required()
          .messages({
            'number.base': 'Enter a value',
            'number.max':
              'Trade max lot size must be less than or equal to Script max lot size',
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      })
      .required()
      .messages({
        'number.base': 'Enter a Value',
      }),
    m2mSquareOff: Joi.boolean().required(),
    maximumLossPercentageCap: Joi.number()
      .positive()
      .allow(0)
      .required()
      .messages({
        'number.base': 'Enter a Value',
      }),
    m2mSquareOffValue: Joi.number()
      .positive()
      .allow(0)
      .max(100)
      .required()
      .messages({
        'number.base': 'Enter a Value',
      }),
    shortMarginSquareOff: Joi.boolean().required(),
    activeBrokerageTypeNSE: Joi.string().valid('lot', 'crore', null).required(),
    activeBrokerageTypeMCX: Joi.string().valid('lot', 'crore', null).required(),
    activeBrokerageTypeFX: Joi.string().valid('lot', 'crore', null).required(),
    activeBrokerageTypeOptions: Joi.string()
      .valid('lot', 'crore', null)
      .required(),
    brokeragePerCroreNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerCroreMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerCroreFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerCroreOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerLotNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerLotMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerLotFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    brokeragePerLotOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    plShareNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    plShareMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    plShareFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    plShareOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    activeMarginTypeNSE: Joi.string().valid('lot', 'crore', null).required(),
    activeMarginTypeMCX: Joi.string().valid('lot', 'crore', null).required(),
    activeMarginTypeFX: Joi.string().valid('lot', 'crore', null).required(),
    activeMarginTypeOptions: Joi.string()
      .valid('lot', 'crore', null)
      .required(),
    tradeMarginPerCroreNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerCroreMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerCroreFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerCroreOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerLotNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerLotMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerLotFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    tradeMarginPerLotOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().positive().allow(0).required().messages({
          'number.base': 'Enter a value',
        }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayTrade: Joi.boolean().required(),
    intradayMarginPerCroreNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerCroreMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerCroreFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerCroreOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerLotNSE: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerLotMCX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerLotFX: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedFX', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
    intradayMarginPerLotOptions: Joi.number()
      .positive()
      .allow(0)
      .when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number()
          .positive()
          .allow(0)
          .when('intradayTrade', {
            is: true,
            then: Joi.number().positive().allow(0).required().messages({
              'number.base': 'Enter a value',
            }),
            otherwise: Joi.number().positive().allow(0).allow(null),
          }),
        otherwise: Joi.number().positive().allow(0).allow(null),
      }),
  });

  const validate = (isAll?: boolean) => {
    const data = user;
    const errors: any = {};
    console.log('error === >', errors);
    // password and retype password should be same
    if (data.password !== data.retypePassword) {
      errors.password = 'Password and retype password should be same';
      errors.retypePassword = 'Password and retype password should be same';
    }
    if (data.userName.length > 15) {
      errors.userName = 'Username should be less than 15 characters';
    }
    // if parent data is present then validate it
    if (parent) {
      console.log('parent', parent);
      // validations
      // console.log(
      //   parent.validTill,
      //   moment(parent.validTill).isBefore(moment(data.validTill))
      // );

      // enable this if you want to validate valid till

      // if (
      //   parent.validTill &&
      //   moment(parent.validTill).isBefore(moment(data.validTill))
      // ) {
      //   errors.validTill = 'Valid till of child cant be more than parent';
      // }
      if (
        data.exchangeMaxLotSizeNSE &&
        data.exchangeMaxLotSizeNSE > parent.exchangeMaxLotSizeNSE
      ) {
        errors.exchangeMaxLotSizeNSE = 'Cant be more than parent';
      }
      if (
        data.exchangeMaxLotSizeMCX &&
        data.exchangeMaxLotSizeMCX > parent.exchangeMaxLotSizeMCX
      ) {
        errors.exchangeMaxLotSizeMCX = 'Cant be more than parent';
      }
      if (
        data.exchangeMaxLotSizeFX &&
        data.exchangeMaxLotSizeFX > parent.exchangeMaxLotSizeFX
      ) {
        errors.exchangeMaxLotSizeFX = 'Cant be more than parent';
      }
      if (
        data.exchangeMaxLotSizeOptions &&
        data.exchangeMaxLotSizeOptions > parent.exchangeMaxLotSizeOptions
      ) {
        errors.exchangeMaxLotSizeOptions = 'Cant be more than parent';
      }
      if (
        data.scriptMaxLotSizeNSE &&
        data.scriptMaxLotSizeNSE > parent.scriptMaxLotSizeNSE
      ) {
        errors.scriptMaxLotSizeNSE = 'Cant be more than parent';
      }
      if (
        data.scriptMaxLotSizeMCX &&
        data.scriptMaxLotSizeMCX > parent.scriptMaxLotSizeMCX
      ) {
        errors.scriptMaxLotSizeMCX = 'Cant be more than parent';
      }
      if (
        data.scriptMaxLotSizeFX &&
        data.scriptMaxLotSizeFX > parent.scriptMaxLotSizeFX
      ) {
        errors.scriptMaxLotSizeFX = 'Cant be more than parent';
      }
      if (
        data.scriptMaxLotSizeOptions &&
        data.scriptMaxLotSizeOptions > parent.scriptMaxLotSizeOptions
      ) {
        errors.scriptMaxLotSizeOptions = 'Cant be more than parent';
      }
      if (
        data.tradeMaxLotSizeNSE &&
        data.tradeMaxLotSizeNSE > parent.tradeMaxLotSizeNSE
      ) {
        errors.tradeMaxLotSizeNSE = 'Cant be more than parent';
      }
      if (
        data.tradeMaxLotSizeMCX &&
        data.tradeMaxLotSizeMCX > parent.tradeMaxLotSizeMCX
      ) {
        errors.tradeMaxLotSizeMCX = 'Cant be more than parent';
      }
      if (
        data.tradeMaxLotSizeFX &&
        data.tradeMaxLotSizeFX > parent.tradeMaxLotSizeFX
      ) {
        errors.tradeMaxLotSizeFX = 'Cant be more than parent';
      }
      if (
        data.tradeMaxLotSizeOptions &&
        data.tradeMaxLotSizeOptions > parent.tradeMaxLotSizeOptions
      ) {
        errors.tradeMaxLotSizeOptions = 'Cant be more than parent';
      }
      if (
        data.brokeragePerCroreNSE &&
        data.brokeragePerCroreNSE < parent.brokeragePerCroreNSE
      ) {
        errors.brokeragePerCroreNSE = 'Cant be less than parent';
      }
      if (
        data.brokeragePerCroreMCX &&
        data.brokeragePerCroreMCX < parent.brokeragePerCroreMCX
      ) {
        errors.brokeragePerCroreMCX = 'Cant be less than parent';
      }
      if (
        data.brokeragePerCroreFX &&
        data.brokeragePerCroreFX < parent.brokeragePerCroreFX
      ) {
        errors.brokeragePerCroreFX = 'Cant be less than parent';
      }
      if (
        data.brokeragePerCroreOptions &&
        data.brokeragePerCroreOptions < parent.brokeragePerCroreOptions
      ) {
        errors.brokeragePerCroreOptions = 'Cant be less than parent';
      }
      if (
        data.brokeragePerLotNSE &&
        data.brokeragePerLotNSE < parent.brokeragePerLotNSE
      ) {
        errors.brokeragePerLotNSE = 'Cant be less than parent';
      }
      if (
        data.brokeragePerLotMCX &&
        data.brokeragePerLotMCX < parent.brokeragePerLotMCX
      ) {
        errors.brokeragePerLotMCX = 'Cant be less than parent';
      }
      if (
        data.brokeragePerLotFX &&
        data.brokeragePerLotFX < parent.brokeragePerLotFX
      ) {
        errors.brokeragePerLotFX = 'Cant be less than parent';
      }
      if (
        data.brokeragePerLotOptions &&
        data.brokeragePerLotOptions < parent.brokeragePerLotOptions
      ) {
        errors.brokeragePerLotOptions = 'Cant be less than parent';
      }

      if (
        data.tradeMarginPerCroreNSE &&
        data.tradeMarginPerCroreNSE < parent.tradeMarginPerCroreNSE
      ) {
        errors.tradeMarginPerCroreNSE = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerCroreMCX &&
        data.tradeMarginPerCroreMCX < parent.tradeMarginPerCroreMCX
      ) {
        errors.tradeMarginPerCroreMCX = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerCroreFX &&
        data.tradeMarginPerCroreFX < parent.tradeMarginPerCroreFX
      ) {
        errors.tradeMarginPerCroreFX = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerCroreOptions &&
        data.tradeMarginPerCroreOptions < parent.tradeMarginPerCroreOptions
      ) {
        errors.tradeMarginPerCroreOptions = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerLotNSE &&
        data.tradeMarginPerLotNSE < parent.tradeMarginPerLotNSE
      ) {
        errors.tradeMarginPerLotNSE = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerLotMCX &&
        data.tradeMarginPerLotMCX < parent.tradeMarginPerLotMCX
      ) {
        errors.tradeMarginPerLotMCX = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerLotFX &&
        data.tradeMarginPerLotFX < parent.tradeMarginPerLotFX
      ) {
        errors.tradeMarginPerLotFX = 'Cant be less than parent';
      }
      if (
        data.tradeMarginPerLotOptions &&
        data.tradeMarginPerLotOptions < parent.tradeMarginPerLotOptions
      ) {
        errors.tradeMarginPerLotOptions = 'Cant be less than parent';
      }

      if (
        data.intradayMarginPerCroreNSE &&
        data.intradayMarginPerCroreNSE < parent.intradayMarginPerCroreNSE
      ) {
        errors.intradayMarginPerCroreNSE = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerCroreMCX &&
        data.intradayMarginPerCroreMCX < parent.intradayMarginPerCroreMCX
      ) {
        errors.intradayMarginPerCroreMCX = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerCroreFX &&
        data.intradayMarginPerCroreFX < parent.intradayMarginPerCroreFX
      ) {
        errors.intradayMarginPerCroreFX = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerCroreOptions &&
        data.intradayMarginPerCroreOptions <
          parent.intradayMarginPerCroreOptions
      ) {
        errors.intradayMarginPerCroreOptions = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerLotNSE &&
        data.intradayMarginPerLotNSE < parent.intradayMarginPerLotNSE
      ) {
        errors.intradayMarginPerLotNSE = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerLotMCX &&
        data.intradayMarginPerLotMCX < parent.intradayMarginPerLotMCX
      ) {
        errors.intradayMarginPerLotMCX = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerLotFX &&
        data.intradayMarginPerLotFX < parent.intradayMarginPerLotFX
      ) {
        errors.intradayMarginPerLotFX = 'Cant be less than parent';
      }
      if (
        data.intradayMarginPerLotOptions &&
        data.intradayMarginPerLotOptions < parent.intradayMarginPerLotOptions
      ) {
        errors.intradayMarginPerLotOptions = 'Cant be less than parent';
      }
    }

    if (
      dropdowns.userTypeOptions.options.filter((_v) => {
        return Number(_v.value) == data.userType;
      })[0].constant == 'Client'
    ) {
      if (user.exchangeAllowedNSE) {
        if (user.activeBrokerageTypeNSE == null) {
          errors.activeBrokerageTypeNSE = 'Please select a type';
        }
        if (user.activeMarginTypeNSE == null) {
          errors.activeMarginTypeNSE = 'Please select a type';
        }
      }
      if (user.exchangeAllowedMCX) {
        if (user.activeBrokerageTypeMCX == null) {
          errors.activeBrokerageTypeMCX = 'Please select a type';
        }
        if (user.activeMarginTypeMCX == null) {
          errors.activeMarginTypeMCX = 'Please select a type';
        }
      }
      if (user.exchangeAllowedFX) {
        if (user.activeBrokerageTypeFX == null) {
          errors.activeBrokerageTypeFX = 'Please select a type';
        }
        if (user.activeMarginTypeFX == null) {
          errors.activeMarginTypeFX = 'Please select a type';
        }
      }
      if (user.exchangeAllowedOptions) {
        if (user.activeBrokerageTypeOptions == null) {
          errors.activeBrokerageTypeOptions = 'Please select a type';
        }
        if (user.activeMarginTypeOptions == null) {
          errors.activeMarginTypeOptions = 'Please select a type';
        }
      }
    }

    if (isAll) {
      // joi validation
      const { error } = userValidation.validate(data, {
        abortEarly: false,
        allowUnknown: true,
      });
      if (error) {
        error.details.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        return errors;
      } else {
        return {};
      }
    } else {
      const { error } = userValidation.validate(data);
      if (error) {
        error.details.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        console.log(errors);
        return errors;
      } else {
        return {};
      }
    }
  };

  const disableHandler = (label: string) => {
    // in the case of update user
    if (updatedUser.username != '' && updatedUser.type == 'update') {
      if (
        label == 'userName' ||
        label == 'userType' ||
        label == 'password' ||
        label == 'retypePassword' ||
        label == 'demoId' ||
        label == 'creditBalance' ||
        label == 'creditRemarks' ||
        label == 'remarks'
        // label == 'rentRemarks'
      ) {
        return true;
      }
    }
    // if user intra day trade is false then disable all intra day trade fields
    if (user.intradayTrade === false) {
      if (
        label == 'intradayMarginPerCroreNSE' ||
        label == 'intradayMarginPerCroreMCX' ||
        label == 'intradayMarginPerCroreFX' ||
        label == 'intradayMarginPerCroreOptions' ||
        label == 'intradayMarginPerLotNSE' ||
        label == 'intradayMarginPerLotMCX' ||
        label == 'intradayMarginPerLotFX' ||
        label == 'intradayMarginPerLotOptions'
      ) {
        return true;
      }
    }
    if (parent) {
      // if parent intraday is off than child intra day also should be off
      if (parent.intradayTrade === false) {
        if (label == 'intradayTrade') {
          return true;
        }
      }
      // if parent do not have exchange allowed then child also should not have
      if (parent.exchangeAllowedNSE === false) {
        if (label == 'exchangeAllowedNSE') {
          return true;
        }
      }
      if (parent.exchangeAllowedMCX === false) {
        if (label == 'exchangeAllowedMCX') {
          return true;
        }
      }
      if (parent.exchangeAllowedFX === false) {
        if (label == 'exchangeAllowedFX') {
          return true;
        }
      }
      if (parent.exchangeAllowedOptions === false) {
        if (label == 'exchangeAllowedOptions') {
          return true;
        }
      }
    }
    // disable across all exchanges
    if (user.exchangeAllowedNSE === false) {
      if (
        label == 'activeBrokerageTypeNSE' ||
        label == 'exchangeMaxLotSizeNSE' ||
        label == 'scriptMaxLotSizeNSE' ||
        label == 'tradeMaxLotSizeNSE' ||
        label == 'brokeragePerCroreNSE' ||
        label == 'brokeragePerLotNSE' ||
        label == 'plShareNSE' ||
        label == 'activeMarginTypeNSE' ||
        label == 'tradeMarginPerCroreNSE' ||
        label == 'tradeMarginPerLotNSE' ||
        label == 'intradayMarginPerCroreNSE' ||
        label == 'intradayMarginPerLotNSE'
      ) {
        return true;
      }
    }
    if (user.exchangeAllowedMCX === false) {
      if (
        label == 'activeBrokerageTypeMCX' ||
        label == 'exchangeMaxLotSizeMCX' ||
        label == 'scriptMaxLotSizeMCX' ||
        label == 'tradeMaxLotSizeMCX' ||
        label == 'brokeragePerCroreMCX' ||
        label == 'brokeragePerLotMCX' ||
        label == 'plShareMCX' ||
        label == 'activeMarginTypeMCX' ||
        label == 'tradeMarginPerCroreMCX' ||
        label == 'tradeMarginPerLotMCX' ||
        label == 'intradayMarginPerCroreMCX' ||
        label == 'intradayMarginPerLotMCX'
      ) {
        return true;
      }
    }
    if (user.exchangeAllowedFX === false) {
      if (
        label == 'activeBrokerageTypeFX' ||
        label == 'exchangeMaxLotSizeFX' ||
        label == 'scriptMaxLotSizeFX' ||
        label == 'tradeMaxLotSizeFX' ||
        label == 'brokeragePerCroreFX' ||
        label == 'brokeragePerLotFX' ||
        label == 'plShareFX' ||
        label == 'activeMarginTypeFX' ||
        label == 'tradeMarginPerCroreFX' ||
        label == 'tradeMarginPerLotFX' ||
        label == 'intradayMarginPerCroreFX' ||
        label == 'intradayMarginPerLotFX'
      ) {
        return true;
      }
    }
    if (user.exchangeAllowedOptions === false) {
      if (
        label == 'activeBrokerageTypeOptions' ||
        label == 'exchangeMaxLotSizeOptions' ||
        label == 'scriptMaxLotSizeOptions' ||
        label == 'tradeMaxLotSizeOptions' ||
        label == 'brokeragePerCroreOptions' ||
        label == 'brokeragePerLotOptions' ||
        label == 'plShareOptions' ||
        label == 'activeMarginTypeOptions' ||
        label == 'tradeMarginPerCroreOptions' ||
        label == 'tradeMarginPerLotOptions' ||
        label == 'intradayMarginPerCroreOptions' ||
        label == 'intradayMarginPerLotOptions'
      ) {
        return true;
      }
    }

    if (label) return false;
  };

  const showHandler = (label: string) => {
    return '';
  };

  return {
    userValidation,
    validate,
    disableHandler,
    showHandler,
  };
};

export default Rules;
