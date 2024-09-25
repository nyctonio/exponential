import { env } from 'env';
import amqplib from 'amqplib';
// import QueueUtils from './utils';
import { io, pubClient } from '../socket';
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
    pubClient.connect().then(() => {
      console.log('connected to pub client');
    });
    pubClient.on('error', (err) => {
      console.log('error in redis', err);
    });
    io.on('connection', async (socket) => {});

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
    console.log('ins==>', instrumentsMap);

    await redisClient.subscribe('live_data', async (msg) => {
      if (msg !== null) {
        let scriptData: any = JSON.parse(msg.toString());
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
            io.in(`${data_to_send.exchange}:${data_to_send.symbol}`).emit(
              'TRADE_CHANGE',
              JSON.stringify({ ...data_to_send })
            );
          } else {
            // console.log('got the data', data_to_send);
            io.in(`live:${data_to_send.instrumentToken}`).emit(
              'TRADE_CHANGE',
              JSON.stringify({ ...data_to_send })
            );
          }
        });

        // console.log('scriptData', scriptData);
        // if (scriptData) {
        //   let parsedScriptData: SingleScript[] =
        //     QueueUtils.dataFormatter(scriptData);
        //   let filteredData: RoomDataType[] =
        //     QueueUtils.roomDataFilter(parsedScriptData);
        //   let checkData: any = cache.get('exchange-data');
        //   if (!checkData) {
        //     // console.log('checkData');
        //     let instrument = new Instruments();
        //     checkData = await instrument.getAllInstruments();
        //     cache.set('exchange-data', checkData);
        //   }
        //   filteredData.map((queryData: RoomDataType) => {
        //     let exchangeData = checkData.find((item: any) => {
        //       return item.instrument_token == queryData.instrumentToken;
        //     });
        //     if (exchangeData) {
        //       let finalExchangeData = {
        //         exchange: exchangeData.exchange,
        //         symbol: exchangeData.tradingsymbol,
        //         expiry: moment(exchangeData.expiry)
        //           .utcOffset('+05:30')
        //           .format('D-MMM-YY'),
        //         isSelected: false,
        //         lotSize: exchangeData.lot_size,
        //       };
        //       if (finalExchangeData) {
        //         // printSafe('emmiting ======>', queryData.instrumentToken);
        //       } else {
        //         console.log('some error');
        //       }
        //       // set data in redis
        //       redisClient.set(
        //         `live-${finalExchangeData.exchange}:${finalExchangeData.symbol}`,
        //         JSON.stringify({ ...queryData, ...finalExchangeData })
        //       );
        //       // sending data to socket
        //       const vall = {
        //         ...queryData,
        //         ...finalExchangeData,
        //       };
        //       console.log(vall);
        //       io.in(
        //         `${finalExchangeData.exchange}:${finalExchangeData.symbol}`
        //       ).emit(
        //         'TRADE_CHANGE',
        //         JSON.stringify({ ...queryData, ...finalExchangeData })
        //       );
        //     } else {
        //       console.log('got the data');
        //       redisClient.set(
        //         `live-market-index:${queryData.instrumentToken}`,
        //         JSON.stringify(queryData)
        //       );
        //       io.in(`live:${queryData.instrumentToken}`).emit(
        //         'TRADE_CHANGE',
        //         JSON.stringify({ ...queryData })
        //       );
        //     }

        //     // console.log('exchangeData', exchangeData);
        //   });
        // }
        // console.timeEnd(`time-${count}`);
        // count++;
        // channel.ack(msg);
      } else {
        console.log('Consumer cancelled by server');
      }
    });

    // const conn = await amqplib.connect(env.QUEUE_HOST);
    // const channel = await conn.createChannel();
    // await channel.assertQueue(env.QUEUE_NAME);
    // channel.consume(env.QUEUE_NAME, async (message) => {
    //   if (message != null) {
    //     let scriptData: any = JSON.parse(message.content.toString());
    //     scriptData.forEach((data) => {
    //       const data_to_send: any = {
    //         instrumentToken: data.instrument_token,
    //         tradable: data.tradable,
    //         change: data.change.toFixed(2),
    //         ltp: data.last_price.toFixed(2),
    //         buyQty: data.depth && data.depth.buy[0].quantity,
    //         buyPrice: data.depth && data.depth.buy[0].price.toFixed(2),
    //         sellPrice: data.depth && data.depth.sell[0].price.toFixed(2),
    //         sellQty: data.depth && data.depth.sell[0].quantity,
    //         exchangeTimestamp: data.exchange_timestamp,
    //         volumeTraded: data.volume_traded,
    //         tbq: data.total_buy_quantity,
    //         tsq: data.total_sell_quantity,
    //         oi: data.oi,
    //         open: data.ohlc.open.toFixed(2),
    //         high: data.ohlc.high.toFixed(2),
    //         low: data.ohlc.low.toFixed(2),
    //         close: data.ohlc.close.toFixed(2),
    //       };
    //       if (instrumentsMap.has(`${data.instrument_token}`)) {
    //         const instrument = instrumentsMap.get(`${data.instrument_token}`);
    //         data_to_send.exchange = instrument.exchange;
    //         data_to_send.symbol = instrument.tradingsymbol;
    //         data_to_send.expiry = instrument.expiry;
    //         data_to_send.lotSize = instrument.lot_size;
    //         data_to_send.isSelected = false;
    //         setLiveDataRedisClient.set(
    //           `live-${data_to_send.exchange}:${data_to_send.symbol}`,
    //           JSON.stringify({ ...data_to_send })
    //         );
    //       } else {
    //         setLiveDataRedisClient.set(
    //           `live:${data_to_send.instrumentToken}`,
    //           JSON.stringify(data_to_send)
    //         );
    //       }
    //     });
    //     channel.ack(message);
    //   } else {
    //     console.log('Consumer cancelled by server');
    //   }
    // });
    return;
  } catch (e) {
    console.log('error in connecting to queue ', e);
    return;
  }
};

export default startLiveDataService;
