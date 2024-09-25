import express from 'express';
import { env } from 'env';
import Rabbit from 'lib/rabbit';
const RabbitMQ = new Rabbit();
import { KiteTicker, KiteConnect } from 'kiteconnect';
import { Logger } from 'winston';
import InstrumentDataServices from './services/instruments-data';
import { AppDataSource } from 'database/sql';
import cron from 'node-cron';
import Instruments from 'entity/instruments';
import ProjectSetting from 'entity/project-settings';
import { redisClient } from './lib/redis';
import { mcx_conversion } from './constants/mcx_conversion';

const app = express();
const PORT = env.PUBLISHER_PORT;
let kc = new KiteConnect({
  api_key: env.ZERODHA_API_KEY,
});

app.get('/', (req, res) => {
  res.writeHead(301, {
    Location: env.ZERODHA_URL + env.ZERODHA_API_KEY + '&v=3',
  });
  res.end();
});

app.get('/zerodha', async (req, res) => {
  try {
    // await RabbitMQ.publish('test', 'Hello World!');
    let token = req.query.request_token;
    // console.log('token', token);
    const response = await kc.generateSession(token, env.ZERODHA_API_SECRET);
    console.log('res', response);

    let instrument = new Instruments();
    let projectSetting = new ProjectSetting(['MRKIND']);
    // get all instruments id from db

    let instruments = null;
    await AppDataSource.transaction(async (tmanager) => {
      instrument.setTransactionManager(tmanager);
      await instrument.updateMCXLotSize(mcx_conversion);
      instruments = await instrument.getAllInstruments();
    });

    const marketIndices = await projectSetting.getProjectSettingByKeys();

    let allInstruments = instruments.map((instrument) =>
      parseInt(instrument.instrument_token)
    );
    allInstruments = [
      ...allInstruments,
      ...marketIndices.map((a) => parseInt(a.prjSettDisplayName)),
    ];
    console.log('all', allInstruments);

    let access_token = response.access_token;
    console.log('=====>', access_token);
    let ticker = new KiteTicker({
      api_key: env.ZERODHA_API_KEY,
      access_token: access_token,
    });
    ticker.autoReconnect(true, -1, 5);
    ticker.connect();
    ticker.on('connect', () => {
      console.log('connected to zerodha');
      ticker.subscribe(allInstruments);
      ticker.setMode(ticker.modeFull, allInstruments);
    });
    ticker.on('ticks', async (ticks) => {
      // console.dir(ticks, {
      //   depth: null,
      // });
      await redisClient.publish('live_data', JSON.stringify(ticks));
      RabbitMQ.publish(env.TRADE_DATA_QUEUE, JSON.stringify(ticks));
      RabbitMQ.publish(env.QUEUE_NAME, JSON.stringify(ticks));
      // RabbitMQ.publish('suspicioustrade', JSON.stringify(ticks));
    });
    res.sendStatus(200);
  } catch (err) {
    console.log('error', err);
    res.sendStatus(500);
  }
});

app.get('/test-rabbitmq', async (req, res) => {
  try {
    await RabbitMQ.publish('test', 'Hello World!');
    res.sendStatus(200);
  } catch (err) {
    console.log('error', err);
    res.sendStatus(500);
  }
});

app.listen(PORT, async () => {
  await AppDataSource.initialize();
  await RabbitMQ.connect();
  console.log(`Server is running on port ${PORT}`);
  // await InstrumentDataServices.dataHandler();

  cron.schedule(
    '00 08 * * *',
    async () => {
      await InstrumentDataServices.dataHandler();
    },
    { timezone: 'Asia/Kolkata' }
  );
});
