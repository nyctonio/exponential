import express from 'express';
import morgan from 'morgan';
import { env } from 'env';
import { AppDataSource } from 'database/sql';
import cors from 'cors';
import DailySettlementService from './services/daily-settlement';
import WeeklySettlementService from './services/weekly-settlement';
import BroadcastMessageService from './services/broadcast-message';
import redisClient from 'lib/redis';
import cronitor from 'cronitor';
import nodecron from 'node-cron';
import { queue } from './lib/queue';
import OpeningBalance from './services/weekly-settlement/update-opening-balance';
import ReconciliationsService from './services/reconciliations';
const app = express();
const PORT = env.JOBS_PORT;

const cron = cronitor(env.CRONITOR_API_KEY);
cron.wraps(nodecron);

app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use('/', require('./hooks/index'));

// app.use('/api', require('./routes/routes'));

app.listen(PORT, async () => {
  await AppDataSource.initialize();
  await queue.connect();
  // initializeAllCrons();
  // await ReconciliationsService.runReconciliations();
  // await WeeklySettlementService.runWeeklySettlement('NSE');
  console.log(`Server is started on port ${PORT}`);
});
