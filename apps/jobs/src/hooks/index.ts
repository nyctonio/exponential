import express from 'express';
import WeeklySettlementService from '../services/weekly-settlement';
import DailySettlementService from '../services/daily-settlement';
import redisClient from 'lib/redis';
import TradeStatus from 'entity/trade-status';
import moment from 'moment';
const router = express.Router();
import axios from 'axios';
import { env } from 'env';

function generateCronExpressions(): string[] {
  const cronExpressions: string[] = [];
  const daysOfWeek = ['1', '2', '3', '4', '5']; // Monday-Friday (1-5 in cron)

  // Assuming you want to generate cron expressions for different times each day.
  const times = ['00:00']; // Example times: midnight, noon, 6 PM

  for (const dayOfWeek of daysOfWeek) {
    // Calculate the date for the current week's Monday-Friday
    const date = moment().startOf('week').add(parseInt(dayOfWeek), 'days');
    const dayOfMonth = date.date();
    const month = date.month() + 1; // month() returns 0-11, so add 1 for cron expression

    for (const time of times) {
      const [hour, minute] = time.split(':');
      const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`; // Include the day of the month and the month
      cronExpressions.push(cronExpression);
    }
  }

  return cronExpressions;
}

const dateToCron = (date: Date) => {
  console.log('date is ', date);
  const minutes = date.getUTCMinutes();
  const hours = date.getUTCHours();
  const days = date.getUTCDate();
  const months = date.getUTCMonth() + 1;
  const dayOfWeek = date.getUTCDay();

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};

router.get('/enable-nse', async (req, res) => {
  try {
    await redisClient.set(`NSE:TRADE`, JSON.stringify(1));
    return res.send({ status: true, data: {} });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
});

router.get('/disable-nse', async (req, res) => {
  try {
    await redisClient.set(`NSE:TRADE`, JSON.stringify(0));
    return res.send({ status: true, data: {} });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
});

router.get('/enable-mcx', async (req, res) => {
  try {
    await redisClient.set(`MCX:TRADE`, JSON.stringify(1));
    return res.send({ status: true, data: {} });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
});

router.get('/disable-mcx', async (req, res) => {
  try {
    await redisClient.set(`MCX:TRADE`, JSON.stringify(0));
    return res.send({ status: true, data: {} });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
});

router.get('/daily/:exchange', async (req, res) => {
  try {
    await DailySettlementService.runDailySettlement(
      req.params.exchange == 'NSE' ? 'NSE' : 'MCX'
    );
    return res.send({ status: true, data: {} });
  } catch (e) {
    console.log('error in daily settlement ', e);
    return res.send({ status: false, message: e.message });
  }
});

router.get('/weekly', async (req, res) => {
  try {
    await WeeklySettlementService.runWeeklySettlement();
    return res.send({ status: true, data: {} });
  } catch (e) {
    console.log('error in daily settlement ', e);
    return res.send({ status: false, message: e.message });
  }
});

router.get('/opening-balance', async (req, res) => {
  try {
    await WeeklySettlementService.updateOpeningBalance();
    return res.send({ status: true, data: {} });
  } catch (e) {
    console.log('error in daily settlement ', e);
    return res.send({ status: false, message: e.message });
  }
});

router.get('/schedule-crons', async (req, res) => {
  try {
    let tradeStatus = new TradeStatus();
    let currDate = moment().startOf('day').utc().toDate();

    let currTradeStatus = await tradeStatus.getTradeStatusByDate(currDate);
    if (!currTradeStatus) {
      if (currDate.getUTCDay() == 0 || currDate.getUTCDay() == 6) {
        //not creating default schedule for saturdays and sundays
      } else {
        await tradeStatus.saveTradeStatus({
          date: currDate,
          disabledInstruments: [],
          startTimeNSE: moment()
            .utcOffset('+05:30')
            .set('hour', 9)
            .set('minute', 30)
            .toDate(),
          endTimeNSE: moment()
            .utcOffset('+05:30')
            .set('hour', 15)
            .set('minute', 30)
            .toDate(),
          startTimeMCX: moment()
            .utcOffset('+05:30')
            .set('hour', 9)
            .set('minute', 30)
            .toDate(),
          endTimeMCX: moment()
            .utcOffset('+05:30')
            .set('hour', 23)
            .set('minute', 45)
            .toDate(),
          tradeActiveMCX: true,
          tradeActiveNSE: true,
        });
        currTradeStatus = await tradeStatus.getTradeStatusByDate(currDate);
      }
    }

    //creating daily market and daily settlement crons
    if (currTradeStatus) {
      //schedule market opening and closing crons
      let nseCrons = {
        startCron: dateToCron(
          moment(currTradeStatus.startTimeNSE).utc().toDate()
        ),
        endCron: dateToCron(moment(currTradeStatus.endTimeNSE).utc().toDate()),
      };
      let mcxCrons = {
        startCron: dateToCron(
          moment(currTradeStatus.startTimeMCX).utc().toDate()
        ),
        endCron: dateToCron(moment(currTradeStatus.endTimeMCX).utc().toDate()),
      };

      let dailySettlementCrons = {
        nse: dateToCron(
          moment(currTradeStatus.endTimeNSE).add(1, 'hour').utc().toDate()
        ),
        mcx: dateToCron(
          moment(currTradeStatus.endTimeMCX).add(1, 'hour').utc().toDate()
        ),
      };

      const cronsConfig = {
        marketOpeningAndClosing: {
          nse: {
            startConfig: {
              method: 'post',
              url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/enable-nse`,
              headers: {
                Authorization:
                  'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
                'Upstash-Cron': nseCrons.startCron,
              },
              data: {},
            },
            endConfig: {
              method: 'post',
              url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/disable-nse`,
              headers: {
                Authorization:
                  'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
                'Upstash-Cron': nseCrons.endCron,
              },
              data: {},
            },
          },
          mcx: {
            startConfig: {
              method: 'post',
              url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/enable-mcx`,
              headers: {
                Authorization:
                  'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
                'Upstash-Cron': mcxCrons.startCron,
              },
              data: {},
            },
            endConfig: {
              method: 'post',
              url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/disable-mcx`,
              headers: {
                Authorization:
                  'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
                'Upstash-Cron': mcxCrons.endCron,
              },
              data: {},
            },
          },
        },
        dailySettlement: {
          nse: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/daily/nse`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dailySettlementCrons.nse,
            },
            data: {},
          },

          mcx: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/daily/mcx`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dailySettlementCrons.mcx,
            },
            data: {},
          },
        },
      };

      let [
        nseStartData,
        nseEndData,
        mcxStartData,
        mcxEndData,
        nseDailyData,
        mcxDailyData,
      ] = await Promise.all([
        axios(cronsConfig.marketOpeningAndClosing.nse.startConfig),
        axios(cronsConfig.marketOpeningAndClosing.nse.endConfig),
        axios(cronsConfig.marketOpeningAndClosing.mcx.startConfig),
        axios(cronsConfig.marketOpeningAndClosing.mcx.endConfig),
        axios(cronsConfig.dailySettlement.nse),
        axios(cronsConfig.dailySettlement.mcx),
      ]);

      await tradeStatus.updateCrons(currDate, {
        startNSE: nseStartData.data.scheduleId,
        endNSE: nseEndData.data.scheduleId,
        startMCX: mcxStartData.data.scheduleId,
        endMCX: mcxEndData.data.scheduleId,
        settlementNSE: nseDailyData.data.scheduleId,
        settlementMCX: mcxDailyData.data.scheduleId,
      });
    }

    //scheduling for weekly settlement
    if (currDate.getUTCDay() == 6) {
      let sundayCheck = await tradeStatus.getTradeStatusByDate(
        moment(currDate).add(1, 'day').toDate()
      );
      if (!currTradeStatus && !sundayCheck) {
        //schedule normal way
        let cronsConfig = {
          weeklySettlement: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/weekly`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dateToCron(
                moment(currDate)
                  .utcOffset('+05:30')
                  .set('hour', 4)
                  .set('minute', 30)
                  .utc()
                  .toDate()
              ),
            },
            data: {},
          },
          openingBalance: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/opening-balance`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dateToCron(
                moment(currDate)
                  .add(2, 'days')
                  .utcOffset('+05:30')
                  .set('hour', 4)
                  .set('minute', 30)
                  .utc()
                  .toDate()
              ),
            },
            data: {},
          },
        };

        await Promise.all([
          axios(cronsConfig.openingBalance),
          axios(cronsConfig.weeklySettlement),
        ]);
      }
    }

    if (currDate.getUTCDay() == 0) {
      //check if saturday was a trading day
      let saturdayCheck = await tradeStatus.getTradeStatusByDate(
        moment(currDate).subtract(1, 'day').toDate()
      );
      if (!currTradeStatus && saturdayCheck) {
        //saturday was a trading day, so we need to schedule weekly settlement for now
        let cronsConfig = {
          weeklySettlement: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/weekly`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dateToCron(
                moment(currDate)
                  .utcOffset('+05:30')
                  .set('hour', 4)
                  .set('minute', 30)
                  .utc()
                  .toDate()
              ),
            },
            data: {},
          },
          openingBalance: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/opening-balance`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dateToCron(
                moment(currDate)
                  .add(1, 'days')
                  .utcOffset('+05:30')
                  .set('hour', 4)
                  .set('minute', 30)
                  .utc()
                  .toDate()
              ),
            },
            data: {},
          },
        };

        await Promise.all([
          axios(cronsConfig.openingBalance),
          axios(cronsConfig.weeklySettlement),
        ]);
      }

      //checking if sunday is a trade day
      if (currTradeStatus) {
        let cronsConfig = {
          weeklySettlement: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/weekly`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dateToCron(
                moment(currDate)
                  .utcOffset('+05:30')
                  .set('hour', 21)
                  .set('minute', 30)
                  .utc()
                  .toDate()
              ),
            },
            data: {},
          },
          openingBalance: {
            method: 'post',
            url: `https://qstash.upstash.io/v2/schedules/${env.JOB_URL}/opening-balance`,
            headers: {
              Authorization:
                'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
              'Upstash-Cron': dateToCron(
                moment(currDate)
                  .add(1, 'days')
                  .utcOffset('+05:30')
                  .set('hour', 4)
                  .set('minute', 30)
                  .utc()
                  .toDate()
              ),
            },
            data: {},
          },
        };

        await Promise.all([
          axios(cronsConfig.openingBalance),
          axios(cronsConfig.weeklySettlement),
        ]);
      }
    }

    console.log('curr trade status is ', currTradeStatus);

    return res.send({ status: true, message: '', data: {} });
  } catch (e) {
    console.log('error is ', e);
    return res.send({ status: false, message: e.message });
  }
});

module.exports = router;
