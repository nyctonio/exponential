import Joi, { valid } from 'joi';
import { createUserApiBodyValidation } from '@/utils/validation/user-create';
import { ADMIN } from './admin';
import { TOOLS } from './tools';
import { TRADE } from './trade';
import { USER } from './user';
import { NOTIFICATION } from './notification';
import { TERMSANDCONDITIONS } from './static-content';
import { CONTACT_US } from './contact-us';

const Routes = {
  ADMIN: ADMIN,
  TOOLS: TOOLS,
  TRADE: TRADE,
  USER: USER,
  NOTIFICATION: NOTIFICATION,
  TERMSANDCONDITIONS: TERMSANDCONDITIONS,
  CONTACT_US: CONTACT_US,
  CREATE_USER: {
    url: '/api/user/create',
    method: {
      type: 'POST',
      validation: createUserApiBodyValidation,
    },
  },
  GET_PARENT_USERID: {
    url: '/api/user/common/get-parent-id',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  USER_DETAILS: {
    url: '/api/user/common/get-user-details',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  LOGIN: {
    url: '/api/auth/login',
    method: {
      type: 'POST',
      validation: Joi.object({
        password: Joi.string().required(),
        username: Joi.string().required().min(5).max(10).alphanum(),
      }),
    },
  },
  RESET_PASSWORD: {
    url: '/api/auth/reset-password',
    method: {
      type: 'POST',
      validation: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
      }),
    },
  },
  UPDATE_PASSWORD: {
    url: '/api/user/update-password',
    method: {
      type: 'POST',
      validation: Joi.any(),
    },
  },
  WATCHLIST_DATA: {
    url: '/api/watchlist',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_WATCHLIST: {
    url: '/api/watchlist/update-watchlist-script',
    method: { type: 'POST', validation: Joi.any() },
  },
  UPDATE_WATCHLIST_NAME: {
    url: '/api/watchlist/update-watchlist-name',
    method: { type: 'POST', validation: Joi.any() },
  },
  UPDATE_WATCHLIST_COLUMN: {
    url: '/api/watchlist/update-watchlist-column',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_COLUMN_DATA: {
    url: '/api/watchlist/columns-data',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_MARKET_INDEXES_DATA: {
    url: '/api/watchlist/get-market-index-data',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_WATCHLIST_EXCHANGE_DATA: {
    url: '/api/watchlist/watchlist-exchange-data',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_FAST_TRADE: {
    url: '/api/watchlist/update-fast-trade',
    method: {
      type: 'POST',
      validation: Joi.object().keys({
        watchlistId: Joi.number().required(),
        fastTradeActive: Joi.boolean().required(),
        fastTradeLotSize: Joi.number().required(),
      }),
    },
  },
  SEARCH_SCRIPT: {
    url: '/api/watchlist/search-script',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_USER_MENUS: {
    url: '/api/menus',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_USER_ALLOWED_EXCHANGES: {
    url: '/api/watchlist/user-allowed-exchange',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_PROJECT_SETTINGS_BY_KEY: {
    url: '/api/project-settings/keys',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_ALL_MANUAL: {
    url: '/api/user-manual',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_CREATE_USER_DROPDOWN_DATA: {
    url: '/api/user/create/get-dropdown-data',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_USERNAME_AVAILABILITY: {
    url: '/api/user/check-username-availability',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_UPDATE_USER_INITIAL_DATA: {
    url: '/api/user/update-user-initial-data',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_USER_BASIC_DETAILS: {
    url: '/api/user/update/basic-details',
    method: {
      type: 'PUT',
      validation: Joi.object().keys({
        userId: Joi.number().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        city: Joi.number().required(),
        tradeSquareOffLimit: Joi.number().required(),
        validTillDate: Joi.string().required().allow(null),
      }),
    },
  },
  UPDATE_TRADE_AUTO_CUT: {
    url: '/api/user/update-user-trade-auto-cut',
    method: {
      type: 'PUT',
      validation: Joi.object({
        userId: Joi.number().required(),
        tradeAutoCut: Joi.boolean().required(),
      }),
    },
  },
  UPDATE_USER_TRADE_INFO: {
    url: '/api/user/update/trade-settings',
    method: {
      type: 'PUT',
      validation: Joi.any(),
    },
  },
  UPDATE_USER_SCRIPT_QUANTITY: {
    url: '/api/advance-settings/script-quantity/update-script-quantity',
    method: {
      type: 'PUT',
      validation: Joi.object({
        userId: Joi.number().required(),
        instruments: Joi.array().items(
          Joi.object({
            name: Joi.string().required().label('name'),
            exchange: Joi.string().required(),
            scriptMaxLotSize: Joi.number().required(),
            tradeMaxLotSize: Joi.number()
              .required()
              .max(Joi.ref('scriptMaxLotSize'))
              .message(
                'Trade max lot size for {{name}} should be less than {{scriptMaxLotSize}}'
              ),
            tradeMinLotSize: Joi.number()
              .required()
              .less(Joi.ref('tradeMaxLotSize'))
              .message(
                'Trade min lot size for {{name}} should be less than {{tradeMaxLotSize}}'
              ),
            active: Joi.boolean().required(),
            isUpdated: Joi.boolean().required(),
          })
        ),
      }),
    },
  },
  SEARCH_USER: {
    url: '/api/user/search-user',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_SCRIPT_QTY_INITIAL_DATA: {
    url: '/api/advance-settings/script-quantity-initial-data',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_SCRIPT_QTY_DATA: {
    url: '/api/advance-settings/script-quantity/get-script-quantity',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  GET_TRADE_MARGIN_SETTINGS: {
    url: '/api/advance-settings/margin/get-margin-settings',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_USER_ONLY_SQUARE_OFF: {
    url: '/api/user/update/only-square-off',
    method: { type: 'PUT', validation: Joi.any() },
  },
  UPDATE_USER_SM_OFF: {
    url: '/api/user/update/sm-square-off',
    method: { type: 'PUT', validation: Joi.any() },
  },
  UPDATE_USER_M2M_OFF: {
    url: '/api/user/update/m2m-square-off',
    method: { type: 'PUT', validation: Joi.any() },
  },
  GET_USER_FLAGS: {
    url: '/api/user/get-user-flags',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_USER_LOGIN_HISTORY: {
    url: '/api/user/login-history',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_USER_STATUS: {
    url: '/api/user/update-user-status',
    method: { type: 'PUT', validation: Joi.any() },
  },
  CREATE_USER_TRANSACTION: {
    url: '/api/user/transaction',
    method: { type: 'POST', validation: Joi.any() },
  },
  UPDATE_TRADE_MARGIN_SETTINGS: {
    url: '/api/advance-settings/margin/update-margin-settings',
    method: {
      type: 'PUT',
      validation: Joi.any(),
    },
  },
  GET_BROKERAGE_SETTINGS: {
    url: '/api/advance-settings/brokerage/get-script-brokerage',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_BROKERAGE_SETTINGS: {
    url: '/api/advance-settings/brokerage/update-script-brokerage',
    method: {
      type: 'PUT',
      validation: Joi.object({
        userId: Joi.number().required(),
        instruments: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              brokerage: Joi.object({
                brokeragePerCroreAmt: Joi.number().required(),
                brokeragePerLotAmt: Joi.number().required(),
                brokerageType: Joi.string()
                  .allow(null)
                  .valid('lot', 'crore')
                  .required(),
              }).required(),
            })
          )
          .required(),
      }),
    },
  },
  GET_USER_ACCESS_MANAGEMENT: {
    url: '/api/user/common/get-user-access-data',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  GET_DEFAULT_ACCESS_MANAGEMENT: {
    url: '/api/menus/get-default-access-management',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  UPDATE_DEFAULT_ACCESS_MANAGEMENT: {
    url: '/api/menus/update-default-access-management',
    method: {
      type: 'PUT',
      validation: Joi.any(),
    },
  },
  UPDATE_USER_ACCESS_MANAGEMENT: {
    url: '/api/user/common/update-user-access-data',
    method: {
      type: 'PUT',
      validation: Joi.object().keys({
        username: Joi.string().required(),
        editedFunctions: Joi.array()
          .items(
            Joi.object().keys({
              funcId: Joi.number().required(),
              value: Joi.boolean().required(),
            })
          )
          .required(),
      }),
    },
  },
  GET_PROJECT_SETTINGS: {
    url: '/api/project-settings',
    method: {
      type: 'POST',
      validation: Joi.object({
        pageNumber: Joi.number().min(1).required(),
        pageSize: Joi.number().max(100).min(5).required(),
        prjSettKey: Joi.string().required().allow(''),
        prjSettName: Joi.string().required().allow(''),
        sort: Joi.object({
          key: Joi.string()
            .required()
            .allow('prjSettKey')
            .allow('prjSettName')
            .allow('prjSettConstant')
            .allow('prjSettDisplayName'),
          value: Joi.string().required().allow('ASC').allow('DESC'),
        }).allow(null),
      }),
    },
  },
  GET_DISTINCT_PROJECT_SETTINGS_KEY: {
    url: '/api/project-settings/get-distinct-keys',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  UPDATE_PROJECT_SETTINGS_KEY: {
    url: '/api/project-settings/update',
    method: {
      type: 'PUT',
      validation: Joi.object({
        id: Joi.number().required(),
        displayValue: Joi.string().required(),
        sortOrder: Joi.number().required().min(0),
        active: Joi.boolean().required(),
      }),
    },
  },
  GET_USER_BROKERAGE_SHARING: {
    url: '/api/advance-settings/pl-brokerage-sharing/get-brokerage-sharing',
    method: {
      type: 'POST',
      validation: Joi.object({
        username: Joi.string().required(),
      }),
    },
  },
  UPDATE_USER_BROKERAGE_SHARING: {
    url: '/api/advance-settings/pl-brokerage-sharing/update-brokerage-sharing',
    method: {
      type: 'PUT',
      validation: Joi.object({
        username: Joi.string().required(),
        updatedSharing: Joi.array().items(
          Joi.object({
            id: Joi.string().required(),
            exchange: Joi.string().required(),
            brokerageType: Joi.string().required(),
            upline: Joi.number().required().allow(null),
            self: Joi.number().required(),
            master: Joi.number().required().allow(null),
            broker: Joi.number().required().allow(null),
            subbroker: Joi.number().required().allow(null),
            thirdparty: Joi.number().required().allow(null),
            thirdpartyremarks: Joi.string().required().allow(null),
          })
        ),
      }),
    },
  },
  CREATE_NEW_PROJECT_SETTING: {
    url: '/api/project-settings/create',
    method: {
      type: 'POST',
      validation: Joi.object({
        applicationSettingKey: Joi.string().required(),
        applicationSettingName: Joi.string().required(),
        applicationSettingValue: Joi.string().required(),
        applicationSettingDisplay: Joi.string().required(),
        applicationSettingSort: Joi.number().required(),
      }),
    },
  },
  GET_USER_PL_SHARING: {
    url: '/api/advance-settings/pl-brokerage-sharing/get-pl-sharing',
    method: {
      type: 'POST',
      validation: Joi.object({
        username: Joi.string().required(),
      }),
    },
  },
  UPDATE_PL_SHARING: {
    url: '/api/advance-settings/pl-brokerage-sharing/update-pl-sharing',
    method: {
      type: 'PUT',
      validation: Joi.object({
        username: Joi.string().required(),
        updatedSharing: Joi.array().items(
          Joi.object({
            id: Joi.number().required().allow(null),
            exchange: Joi.string().required(),
            upline: Joi.number().required().allow(null),
            self: Joi.number().required(),
            broker: Joi.number().required().allow(null),
            subbroker: Joi.number().required().allow(null),
            thirdparty: Joi.number().required().allow(null),
            thirdpartyremarks: Joi.string().required().allow(null),
          })
        ),
      }),
    },
  },
  GET_AUTO_CUT_SETTINGS: {
    url: '/api/advance-settings/auto-cut/get-auto-cut-settings',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  UPDATE_AUTO_SETTINGS: {
    url: '/api/advance-settings/auto-cut/update-auto-cut-settings',
    method: {
      type: 'PUT',
      validation: Joi.object({
        userId: Joi.number().required(),
        bidStopSettings: Joi.array().items({
          id: Joi.number().required(),
          option: Joi.string(),
          outside: Joi.boolean().required(),
          between: Joi.boolean().required(),
          cmp: Joi.number().required(),
        }),
        mcxBidStopSettings: Joi.array().items({
          id: Joi.number().required(),
          bidValue: Joi.number().required(),
          stopLossValue: Joi.number().required(),
        }),
        cuttingSettings: Joi.array().items({
          id: Joi.number().required(),
          value: Joi.string().required(),
          name: Joi.string().required(),
        }),
      }),
    },
  },
  GET_ALLOWED_EXCHANGES: {
    url: '/api/user/common/get-allowed-exchanges',
    method: {
      type: 'GET',
      validation: Joi.any(),
    },
  },
  GET_ASSOCIATED_USERS: {
    url: '/api/user/common/get-associated-users',
    method: {
      type: 'GET',
      valdation: Joi.any(),
    },
  },
  GET_USER_RENT_SHARING: {
    url: '/api/advance-settings/pl-brokerage-sharing/get-rent-sharing',
    method: {
      type: 'POST',
      validation: Joi.object({
        username: Joi.string().required(),
      }),
    },
  },
};

export default Routes;
