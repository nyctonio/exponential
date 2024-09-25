import { env } from 'env';
import amqplib from 'amqplib';
// import QueueUtils from './utils';
// import { SingleScript, RoomDataType } from '../../types';
import NodeCache from 'node-cache';
import moment from 'moment';
import redisClient from '../redis';
import Instruments from 'entity/instruments';

const cache = new NodeCache({
  stdTTL: 86400,
  useClones: true,
  deleteOnExpire: true,
});

const printSafe = (...obj: any) => {
  if (env.ENVIRONMENT == 'development') {
    console.log(...obj);
  }
};

const startLiveDataService = async () => {
  try {
    console.log('starting live data service');
    await redisClient.connect();
    redisClient.on('error', (err) => {
      console.log('error in redis', err);
      throw new Error("Can't connect to redis");
    });
    redisClient.on('connect', () => {
      console.log('Connected to Redis!!!');
    });

    let checkData: any = cache.get('exchange-data');
    if (!checkData) {
      let instrument = new Instruments();
      checkData = await instrument.getAllInstruments();
      cache.set('exchange-data', checkData);
    }
    const instrumentsMap = new Map();
    checkData.map((item) => {
      item.expiry = moment(item.expiry).utcOffset('+05:30').format('D-MMM-YY');
      instrumentsMap.set(item.instrument_token, item);
    });

    const conn = await amqplib.connect(env.QUEUE_HOST);
    const channel = await conn.createChannel();
    await channel.assertQueue(env.QUEUE_NAME);
    channel.consume(env.QUEUE_NAME, async (message) => {
      if (message != null) {
        let scriptData: any = JSON.parse(message.content.toString());
        scriptData.forEach((data) => {
          const data_to_send: any = {
            instrumentToken: data.instrument_token,
            tradable: data.tradable,
            change: data.change.toFixed(2),
            ltp: data.last_price.toFixed(2),
            buyQty: data.depth && data.depth.buy[0].quantity,
            buyPrice: data.depth && data.depth.buy[0].price.toFixed(2),
            sellPrice: data.depth && data.depth.sell[0].price.toFixed(2),
            sellQty: data.depth && data.depth.sell[0].quantity,
            exchangeTimestamp: data.exchange_timestamp,
            volumeTraded: data.volume_traded,
            tbq: data.total_buy_quantity,
            tsq: data.total_sell_quantity,
            oi: data.oi,
            open: data.ohlc.open.toFixed(2),
            high: data.ohlc.high.toFixed(2),
            low: data.ohlc.low.toFixed(2),
            close: data.ohlc.close.toFixed(2),
          };
          if (instrumentsMap.has(`${data.instrument_token}`)) {
            const instrument = instrumentsMap.get(`${data.instrument_token}`);
            data_to_send.exchange = instrument.exchange;
            data_to_send.symbol = instrument.tradingsymbol;
            data_to_send.expiry = instrument.expiry;
            data_to_send.lotSize = instrument.lot_size;
            data_to_send.isSelected = false;
            redisClient.set(
              `live-${data_to_send.exchange}:${data_to_send.symbol}`,
              JSON.stringify({ ...data_to_send })
            );
          } else {
            redisClient.set(
              `live-market-index:${data_to_send.instrumentToken}`,
              JSON.stringify(data_to_send)
            );
          }
        });
        channel.ack(message);
      } else {
        console.log('Consumer cancelled by server');
      }
    });
    return;
  } catch (e) {
    console.log('error in connecting to queue ', e);
    return;
  }
};

export default startLiveDataService;
