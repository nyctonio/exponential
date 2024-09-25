import { KiteTicker, KiteConnect } from 'kiteconnect';
import { env } from 'process';
let kc = new KiteConnect({
  api_key: env.ZERODHA_API_KEY,
});
import moment from 'moment';
import { Between, In, LessThanOrEqual, Raw } from 'typeorm';
import axios from 'axios';
import { AppDataSource } from 'database/sql';
import ProjectSetting from 'entity/project-settings';
import Instruments from 'entity/instruments';
import { m_instruments } from 'database/sql/schema';

export type instrument = {
  instrument_token: string;
  exchange_token: string;
  tradingsymbol: string;
  name: string;
  last_price: number;
  expiry: Date;
  strike: number;
  tick_size: number;
  lot_size: number;
  instrument_type: string;
  segment: string;
  exchange: string;
};

class InstrumentDataServices {
  // Helper functions to get current and next month codes
  private static getCurrentMonthCode(): string {
    const now = new Date();
    return `${now.getFullYear().toString().substr(2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
  }

  private static getNextMonthCode(): string {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return `${nextMonth.getFullYear().toString().substr(2)}${(
      nextMonth.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}`;
  }

  private static async storedProcedureRunner() {
    try {
      // Calculate the next month's expiry date for NFO-FUT
      const nextMonthExpiry = new Date();
      nextMonthExpiry.setMonth(nextMonthExpiry.getMonth() + 2);
      nextMonthExpiry.setDate(0);

      // Get the required instrument data
      let instrument = new Instruments();
      let instrumentData =
        await instrument.filterInstrumentStaging(nextMonthExpiry);
      return instrumentData;
    } catch (e) {
      console.log('error in getting data ', e);
      return [];
    }
  }

  public static async instrumentsFilter(data: {
    mcxInstrumentsData: instrument[];
    nseInstrumentsData: instrument[];
  }) {}

  private static async kcDataFetcher() {
    let mcxInstrumentsData = await kc.getInstruments('MCX');
    mcxInstrumentsData = mcxInstrumentsData.filter(
      (a) => a.exchange_token != null && a.expiry != ''
    );
    let nseInstrumentsData = await kc.getInstruments('NFO');
    nseInstrumentsData = nseInstrumentsData.filter(
      (a) => Object.keys(a).length == 12 && a.name.length > 0 && a.expiry != ''
    );

    return { mcxInstrumentsData, nseInstrumentsData };
  }

  private static async marketIndicesFetcher() {
    let data = await axios.get('https://api.kite.trade/instruments');
    console.log('data.data is ', data.data);
    // save data in csv
    // convert this strin to list
    data.data = data.data.split('\n');
    let header = data.data[0].split(',');
    // filter the lines of data which contain SENSEX, NIFTY 50, NIFTY IT, NIFTY BANK
    data.data = data.data.filter((item) => {
      return (
        item.includes('INDICES') &&
        (item.includes('SENSEX') ||
          item.includes('NIFTY 50') ||
          item.includes('NIFTY IT') ||
          item.includes('NIFTY BANK'))
      );
    });

    // console.log(data.data);
    return data.data;
  }

  public static async dataHandler() {
    //fetch kc data
    try {
      let kcIntrumentsData = await this.kcDataFetcher();
      let marketIndices = await this.marketIndicesFetcher();

      let parsedMarketIndices = [];
      marketIndices.map((item: string, index) => {
        let stats = item.split(',');
        if (stats[2] != 'NIFTY 500') {
          parsedMarketIndices.push({
            prjSettName: 'Market Index',
            prjSettKey: 'MRKIND',
            prjSettConstant: stats[2],
            prjSettSortOrder: index,
            prjSettDisplayName: stats[0],
          });
        }
      });

      console.log(
        'parsed market indices are ',
        kcIntrumentsData,
        parsedMarketIndices
      );
      AppDataSource.transaction(async (manager) => {
        let instruments = new Instruments();
        instruments.setTransactionManager(manager);
        await instruments.saveInstrumentsStaging([
          ...kcIntrumentsData.mcxInstrumentsData,
          ...kcIntrumentsData.nseInstrumentsData,
        ]);

        let projectSetting = new ProjectSetting([]);
        projectSetting.setEntityManager(manager);
        await projectSetting.upsertProjectSetting(parsedMarketIndices, {
          prjSettKey: true,
          prjSettName: true,
          prjSettDisplayName: true,
        });

        let filteredInstruments = await this.storedProcedureRunner();

        //   console.log('flag');
        let finalInstruments: any[] = filteredInstruments.map((a) => {
          return {
            exchange: a.exchange,
            exchange_token: a.exchange_token,
            expiry: a.expiry,
            instrument_token: a.instrument_token,
            instrument_type: a.instrument_type,
            tradingsymbol: a.tradingsymbol,
            tick_size: a.tick_size,
            last_price: a.last_price,
            lot_size: a.lot_size,
            name: a.name,
            segment: a.segment,
            strike: a.strike,
          };
        });
        console.log(
          'filtered instruments ',
          finalInstruments,
          ' length ',
          finalInstruments.length
        );

        await instruments.upsertInstruments(finalInstruments);

        let instrumentsData = await instruments.getAllInstruments();
        let expiredIds = [];
        instrumentsData.map((item) => {
          if (moment().utc().diff(moment(item.expiry).toDate(), 'd') > 0) {
            expiredIds.push(item.id);
          }
        });

        console.log('expired ids are ', expiredIds);
        //   // await manager.update(
        //   //   m_instruments,
        //   //   { id: In(expiredIds) },
        //   //   { isDeleted: true }
        //   // );
        await instruments.updateInstruments(expiredIds, { isDeleted: true });

        return;
      });
    } catch (e) {
      console.log('error ', e);
      return;
    }
  }
}

export default InstrumentDataServices;
