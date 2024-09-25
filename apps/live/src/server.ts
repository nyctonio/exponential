import express from 'express';
import morgan from 'morgan';
import { env } from 'env';
import cors from 'cors';
import { AppDataSource } from 'database/sql';
const app = express();
import Instruments from 'entity/instruments';

import NodeCache from 'node-cache';
import connectRabbitMQ from './queue/index';

app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

const cache = new NodeCache({
  stdTTL: 86400,
  useClones: true,
  deleteOnExpire: true,
});

let instrument = new Instruments();
async function run() {
  console.log('running');
  await AppDataSource.initialize();
  let data = await instrument.getAllInstruments();
  // console.log('instruments are ', data);
  cache.set('exchange-data', data);
  app.listen(env.LIVE_PORT, () => {
    console.log(`Server is running on port ${env.LIVE_PORT}`);
  });
  connectRabbitMQ();
  return;
}

run();
