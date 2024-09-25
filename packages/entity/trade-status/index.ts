import { t_tradestatus } from 'database/sql/schema';
import moment from 'moment';
import ProjectSetting from '../project-settings';
import { Between } from 'typeorm';

export type TradeStatusPayload = {
  date: Date;
  startTimeNSE: Date;
  endTimeNSE: Date;
  startTimeMCX: Date;
  endTimeMCX: Date;
  tradeActiveNSE: boolean;
  tradeActiveMCX: boolean;
  disabledInstruments: string[];
};
class TradeStatus {
  async getTradeStatusByMonth(startDate: Date, endDate: Date) {
    startDate = moment(startDate, 'YYYY-MM-DDTHH:mm:ss').utc().toDate();
    endDate = moment(endDate, 'YYYY-MM-DDTHH:mm:ss').utc().toDate();
    let tradeStatus = await t_tradestatus.find({
      where: { date: Between(startDate, endDate) },
    });

    return tradeStatus;
  }

  async saveTradeStatus(data: TradeStatusPayload) {
    let tradeStatus = await t_tradestatus.findOne({
      where: { date: moment(data.date).toDate() },
    });
    await t_tradestatus.upsert(
      {
        date: data.date,
        startTimeNSE: data.startTimeNSE,
        endTimeNSE: data.endTimeNSE,
        startTimeMCX: data.startTimeMCX,
        endTimeMCX: data.endTimeMCX,
        tradeActiveNSE: data.tradeActiveNSE,
        tradeActiveMCX: data.tradeActiveMCX,
        disabledInstruments: data.disabledInstruments,
      },
      { conflictPaths: { date: true } }
    );
    if (!tradeStatus) {
      //creating crons
    } else {
      //updating crons
    }

    return;
  }

  async getTradeStatusByDate(date: Date) {
    let tradeStatus = await t_tradestatus.findOne({ where: { date: date } });
    return tradeStatus;
  }

  async updateCrons(date: Date, crons) {
    await t_tradestatus.update({ date: date }, { tradeCrons: crons });
  }
}

export default TradeStatus;
