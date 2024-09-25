import mongoose from 'mongoose';
const m_instrumentlatestdataschema = new mongoose.Schema(
  {
    tradable: {
      type: String,
    },
    mode: {
      type: String,
    },
    instrumentToken: {
      type: String,
    },
    last_price: {
      type: Number,
    },
    last_traded_quantity: {
      type: Number,
    },
    average_traded_price: {
      type: Number,
    },
    volume_traded: {
      type: Number,
    },
    total_buy_quantity: {
      type: Number,
    },
    total_sell_quantity: {
      type: Number,
    },
    ohlc: {
      type: Object,
    },
    change: {
      type: Number,
    },
    last_trade_time: {
      type: Date,
    },
    exchange_timestamp: {
      type: Date,
    },
    oi: {
      type: Number,
    },
    oi_day_high: {
      type: Number,
    },
    oi_day_low: {
      type: Number,
    },
    depth: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const m_instrumentlatestdata = mongoose.model(
  'latest_instrument_stats',
  m_instrumentlatestdataschema
);
export default m_instrumentlatestdata;
