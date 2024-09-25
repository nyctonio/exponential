// trading calender service
import TradeStatus, { TradeStatusPayload } from 'entity/trade-status';
import moment from 'moment';
import axios from 'axios';
import redisClient from 'lib/redis';
import { t_tradestatus } from 'database/sql/schema';
import { env } from 'env';
class TradeStatusService {
  public static async getTradeStatus() {
    let tradeStatus = new TradeStatus();
    return {};
  }

  private static dateToCron(date: Date) {
    console.log('date is ', date);
    const minutes = date.getUTCMinutes();
    const hours = date.getUTCHours();
    const days = date.getUTCDate();
    const months = date.getUTCMonth() + 1;
    const dayOfWeek = date.getUTCDay();

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
  }

  public static async getTradeStatusByMonth(startDate: Date, endDate: Date) {
    let tradeStatus = new TradeStatus();
    let statusData = await tradeStatus.getTradeStatusByMonth(
      startDate,
      endDate
    );
    return statusData;
  }

  private static async removeCrons(scheduleIds: string[]) {
    await Promise.all(
      scheduleIds.map(async (scheduleId) => {
        let config = {
          method: 'delete',
          url: `https://qstash.upstash.io/v2/schedules/${scheduleId}`,
          headers: {
            Authorization:
              'Bearer eyJVc2VySUQiOiIyNDQyZWQ1MS0zM2RhLTQzY2UtOTcyOS1hM2IwMjVhY2ZlMmQiLCJQYXNzd29yZCI6IjY4NDU5YThlMjMwMDQ4NTg5YzFlMGYwNjkxNTA0YTgyIn0=',
          },
          data: {},
        };
        await axios(config);
      })
    );
    return;
  }

  private static async generateUpdatedCrons(currTradeStatus: t_tradestatus) {
    //schedule market opening and closing crons
    let tradeStatus = new TradeStatus();
    let nseCrons = {
      startCron: this.dateToCron(
        moment(currTradeStatus.startTimeNSE).utc().toDate()
      ),
      endCron: this.dateToCron(
        moment(currTradeStatus.endTimeNSE).utc().toDate()
      ),
    };
    let mcxCrons = {
      startCron: this.dateToCron(
        moment(currTradeStatus.startTimeMCX).utc().toDate()
      ),
      endCron: this.dateToCron(
        moment(currTradeStatus.endTimeMCX).utc().toDate()
      ),
    };

    let dailySettlementCrons = {
      nse: this.dateToCron(
        moment(currTradeStatus.endTimeNSE).add(1, 'hour').utc().toDate()
      ),
      mcx: this.dateToCron(
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

    await tradeStatus.updateCrons(currTradeStatus.date, {
      startNSE: nseStartData.data.scheduleId,
      endNSE: nseEndData.data.scheduleId,
      startMCX: mcxStartData.data.scheduleId,
      endMCX: mcxEndData.data.scheduleId,
      settlementNSE: nseDailyData.data.scheduleId,
      settlementMCX: mcxDailyData.data.scheduleId,
    });
  }

  public static async saveTradeStatus(data: TradeStatusPayload) {
    console.log('data is ', data);
    let tradeStatus = new TradeStatus();

    //check the data
    let date = moment(data.date).startOf('day').utc().toDate();
    let diff = moment().startOf('day').utc().diff(date, 'days');
    let currDateCheck = await tradeStatus.getTradeStatusByDate(date);
    console.log('curr date check is ', currDateCheck);

    if (date.getUTCDay() == 0 && moment().utc().get('weekday') == 6) {
      throw new Error('Cannot create status of sunday on saturday');
    }

    console.log('diff is ', diff);

    if (diff > 0) {
      throw new Error('Cannot save past status');
    } else if (diff == 0) {
      if (!currDateCheck) {
        throw new Error(
          'Cannot create status of same day, You can only update curr date status'
        );
      }
      //updating status and crons
      await tradeStatus.saveTradeStatus({
        ...data,
        date: moment(data.date).startOf('day').utc().toDate(),
      });
      currDateCheck = await tradeStatus.getTradeStatusByDate(date);
      console.log('curr date check after updating is ', currDateCheck);
      //closing market on redis if nse or mcx is disabled
      if (data.tradeActiveMCX == false) {
        await redisClient.set('MCX:TRADE', 0);
      }
      if (data.tradeActiveNSE == false) {
        await redisClient.set('NSE:TRADE', 0);
      }
      //updating crons
      let currCrons = currDateCheck.tradeCrons;
      if (currCrons) {
        await this.removeCrons(Object.values(currCrons));
      }
      await this.generateUpdatedCrons(currDateCheck);
      return;
    }

    await tradeStatus.saveTradeStatus({
      ...data,
      date: moment(data.date).startOf('day').utc().toDate(),
    });
    return;
  }
}

export default TradeStatusService;
