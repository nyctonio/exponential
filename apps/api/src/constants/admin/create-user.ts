export const CreateUserConstants = {
  KEYS: {
    USERNAME: 'USERNAME',
    DEMO_ID: 'DEMO_ID',
    VALID_TILL_DATE: 'VALID_TILL_DATE',
    NSE_EXCHANGE_MAX_LOT_SIZE: 'NSE_EXCHANGE_MAX_LOT_SIZE',
    MCX_EXCHANGE_MAX_LOT_SIZE: 'MCX_EXCHANGE_MAX_LOT_SIZE',
    Options_EXCHANGE_MAX_LOT_SIZE: 'Options_EXCHANGE_MAX_LOT_SIZE',
    FX_EXCHANGE_MAX_LOT_SIZE: 'FX_EXCHANGE_MAX_LOT_SIZE',
    NSE_TRADE_MAX_LOT_SIZE: 'NSE_TRADE_MAX_LOT_SIZE',
    MCX_TRADE_MAX_LOT_SIZE: 'MCX_TRADE_MAX_LOT_SIZE',
    Options_TRADE_MAX_LOT_SIZE: 'Options_TRADE_MAX_LOT_SIZE',
    FX_TRADE_MAX_LOT_SIZE: 'FX_TRADE_MAX_LOT_SIZE',
    NSE_SCRIPT_MAX_LOT_SIZE: 'NSE_SCRIPT_MAX_LOT_SIZE',
    MCX_SCRIPT_MAX_LOT_SIZE: 'MCX_SCRIPT_MAX_LOT_SIZE',
    Options_SCRIPT_MAX_LOT_SIZE: 'Options_SCRIPT_MAX_LOT_SIZE',
    FX_SCRIPT_MAX_LOT_SIZE: 'FX_SCRIPT_MAX_LOT_SIZE',
    NSE_EXCHANGE_TOGGLE: 'NSE_EXCHANGE_TOGGLE',
    MCX_EXCHANGE_TOGGLE: 'MCX_EXCHANGE_TOGGLE',
    FX_EXCHANGE_TOGGLE: 'FX_EXCHANGE_TOGGLE',
    Options_EXCHANGE_TOGGLE: 'Options_EXCHANGE_TOGGLE',
    TRADE_ALLOWED_IN_QTY: 'TRADE_ALLOWED_IN_QTY',
    NSE_BROKERAGE_PER_LOT: 'NSE_BROKERAGE_PER_LOT',
    NSE_BROKERAGE_PER_CRORE: 'NSE_BROKERAGE_PER_CRORE',
    MCX_BROKERAGE_PER_LOT: 'MCX_BROKERAGE_PER_LOT',
    MCX_BROKERAGE_PER_CRORE: 'MCX_BROKERAGE_PER_CRORE',
    Options_BROKERAGE_PER_LOT: 'Options_BROKERAGE_PER_LOT',
    Options_BROKERAGE_PER_CRORE: 'Options_BROKERAGE_PER_CRORE',
    FX_BROKERAGE_PER_LOT: 'FX_BROKERAGE_PER_LOT',
    FX_BROKERAGE_PER_CRORE: 'FX_BROKERAGE_PER_CRORE',
    NSE_TRADE_MARGIN_PER_LOT: 'NSE_TRADE_MARGIN_PER_LOT',
    NSE_TRADE_MARGIN_PER_CRORE: 'NSE_TRADE_MARGIN_PER_CRORE',
    MCX_TRADE_MARGIN_PER_LOT: 'MCX_TRADE_MARGIN_PER_LOT',
    MCX_TRADE_MARGIN_PER_CRORE: 'MCX_TRADE_MARGIN_PER_CRORE',
    Options_TRADE_MARGIN_PER_LOT: 'Options_TRADE_MARGIN_PER_LOT',
    Options_TRADE_MARGIN_PER_CRORE: 'Options_TRADE_MARGIN_PER_CRORE',
    FX_TRADE_MARGIN_PER_LOT: 'FX_TRADE_MARGIN_PER_LOT',
    FX_TRADE_MARGIN_PER_CRORE: 'FX_TRADE_MARGIN_PER_CRORE',
    NSE_INTRA_MARGIN_PER_LOT: 'NSE_INTRA_MARGIN_PER_LOT',
    NSE_INTRA_MARGIN_PER_CRORE: 'NSE_INTRA_MARGIN_PER_CRORE',
    MCX_INTRA_MARGIN_PER_LOT: 'MCX_INTRA_MARGIN_PER_LOT',
    MCX_INTRA_MARGIN_PER_CRORE: 'MCX_INTRA_MARGIN_PER_CRORE',
    Options_INTRA_MARGIN_PER_LOT: 'Options_INTRA_MARGIN_PER_LOT',
    Options_INTRA_MARGIN_PER_CRORE: 'Options_INTRA_MARGIN_PER_CRORE',
    FX_INTRA_MARGIN_PER_LOT: 'FX_INTRA_MARGIN_PER_LOT',
    FX_INTRA_MARGIN_PER_CRORE: 'FX_INTRA_MARGIN_PER_CRORE',
    TRADE_SQUARE_OFF_LIMIT: 'TRADE_SQUARE_OFF_LIMIT',
    USER_TYPE: 'USER_TYPE',
    NSE_PL_SHARE: 'NSE_PL_SHARE',
    MCX_PL_SHARE: 'MCX_PL_SHARE',
    FX_PL_SHARE: 'FX_PL_SHARE',
    Options_PL_SHARE: 'Options_PL_SHARE',
  },
  VALIDATION: {
    USERNAME: 'Username Already Taken',
    PARENT_DEMO_ACCOUNT: 'You Are Allowed To Create Demo Accounts Only',
    DEMO_BROKER_SUBBROKER: `Can't create more demo accounts`,
    DEMO_BROKER_CLIENT: `Can't create more demo accounts`,
    DEMO_SUBBROKER_CLIENT: `Can't create more demo accounts`,
    PAST_VALID_DATE: 'Valid Data Not Allowed in Past',
    VALID_TILL_DATE_GREATER_THAN_PARENT:
      'Valid till date should be less than :date',
    EXCHANGE_MAX_LOT_SIZE:
      ':exchange exchange lot size should be less than :value',
    TRADE_MAX_LOT_SIZE: ':exchange trade lot size should be less than :value',
    SCRIPT_MAX_LOT_SIZE: ':exchange script lot size should be less than :value',
    TRADE_ALLOWED_IN_QTY: 'Trade allowed in quantity not allowed',
    NSE_BROKERAGE_PER_LOT:
      'NSE Brokerage per LOT should be greater than :value',
    NSE_BROKERAGE_PER_CRORE:
      'NSE Brokerage per Crore should be greater than :value',
    MCX_BROKERAGE_PER_LOT:
      'MCX Brokerage per LOT should be greater than :value',
    MCX_BROKERAGE_PER_CRORE:
      'MCX Brokerage per Crore should be greater than :value',
    Options_BROKERAGE_PER_LOT:
      'Options Brokerage per LOT should be greater than :value',
    Options_BROKERAGE_PER_CRORE:
      'Options Brokerage per Crore should be greater than :value',
    FX_BROKERAGE_PER_LOT: 'FX Brokerage per LOT should be greater than :value',
    FX_BROKERAGE_PER_CRORE:
      'FX Brokerage per Crore should be greater than :value',
    NSE_TRADE_MARGIN_PER_LOT:
      'NSE Trade Margin per LOT should be greater than :value',
    NSE_TRADE_MARGIN_PER_CRORE:
      'NSE Trade Margin per Crore should be greater than :value',
    MCX_TRADE_MARGIN_PER_LOT:
      'MCX Trade Margin per LOT should be greater than :value',
    MCX_TRADE_MARGIN_PER_CRORE:
      'MCX Trade Margin per Crore should be greater than :value',
    Options_TRADE_MARGIN_PER_LOT:
      'Options Trade Margin per LOT should be greater than :value',
    Options_TRADE_MARGIN_PER_CRORE:
      'Options Trade Margin per Crore should be greater than :value',
    FX_TRADE_MARGIN_PER_LOT:
      'FX Trade Margin per LOT should be greater than :value',
    FX_TRADE_MARGIN_PER_CRORE:
      'FX Trade Margin per Crore should be greater than :value',
    NSE_INTRA_MARGIN_PER_LOT:
      'NSE Intraday Margin per LOT should be greater than :value',
    NSE_INTRA_MARGIN_PER_CRORE:
      'NSE Intraday Margin per Crore should be greater than :value',
    MCX_INTRA_MARGIN_PER_LOT:
      'MCX Intraday Margin per LOT should be greater than :value',
    MCX_INTRA_MARGIN_PER_CRORE:
      'MCX Intraday Margin per Crore should be greater than :value',
    Options_INTRA_MARGIN_PER_LOT:
      'Options Intraday Margin per LOT should be greater than :value',
    Options_INTRA_MARGIN_PER_CRORE:
      'Options Intraday Margin per Crore should be greater than :value',
    FX_INTRA_MARGIN_PER_LOT:
      'FX Intraday Margin per LOT should be greater than :value',
    FX_INTRA_MARGIN_PER_CRORE:
      'FX Intraday Margin per Crore should be greater than :value',
    TRADE_SQUARE_OFF_LIMIT: 'trade square off limit',
    USER_TYPE_NOT_ALLOWED: 'user type not allowed',
    NSE_PL_SHARE: 'NSE pl should be less than :value',
    MCX_PL_SHARE: 'MCX pl should be less than :value',
    FX_PL_SHARE: 'FX pl should be less than :value',
    Options_PL_SHARE: 'Options pl should be less than :value',
    NSE_PL_SHARE_CLIENT: 'NSE pl should be equal to :value',
    MCX_PL_SHARE_CLIENT: 'MCX pl should be equal to :value',
    FX_PL_SHARE_CLIENT: 'FX pl should be equal to :value',
    Options_PL_SHARE_CLIENT: 'Options pl should be equal to :value',
  },
};
