import { m_instruments } from 'database/sql/schema';
import ProjectSetting from 'entity/project-settings';
import Watchlist from 'entity/watchlist';
import ExchangeSetting from 'entity/exchange-settings';
import { redisClient } from '../../lib/redis';

class WatchlistService {
  private static initialWatchlistDataFormatter(
    scriptsDetailData: m_instruments[],
    scriptsLiveData
  ) {
    let finalData = [];
    scriptsDetailData.map((scriptDetail) => {
      let latestScriptData = scriptsLiveData.find((a) => {
        if (a == null) {
          return false;
        }
        return a.instrumentToken == scriptDetail.instrument_token;
      });
      if (latestScriptData) {
        let tempObj = {
          ...scriptDetail,
          buyQty: latestScriptData.buyQty,
          buyPrice: latestScriptData.buyPrice,
          sellPrice: latestScriptData.sellPrice,
          sellQty: latestScriptData.sellQty,
          ltp: latestScriptData.ltp,
          volumeTraded: latestScriptData.volumeTraded,
          tbq: latestScriptData.tbq,
          tsq: latestScriptData.tsq,
          oi: latestScriptData.oi,
          change: latestScriptData.change,
          open: latestScriptData.open,
          high: latestScriptData.high,
          low: latestScriptData.low,
          close: latestScriptData.close,
        };
        finalData.push(tempObj);
      } else {
        // in the case of no data from redis
        let tempObj = {
          ...scriptDetail,
          buyQty: 0,
          buyPrice: 0,
          sellPrice: 0,
          sellQty: 0,
          ltp: 0,
          volumeTraded: 0,
          tbq: 0,
          tsq: 0,
          oi: 0,
          change: 0,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
        };
        finalData.push(tempObj);
      }
    });
    return finalData;
  }

  public static async verifyUserWatchlist(userId: number, watchlistId: number) {
    let watchlist = new Watchlist(null, redisClient);
    let watchlistUserId = await watchlist.getWatchlistUser(watchlistId);
    if (userId != watchlistUserId) {
      return false;
    }
    return true;
  }

  public static async getWatchlistData(userId: number) {
    let watchlist = new Watchlist(userId, redisClient);
    return await watchlist.getWatchlistData();
  }

  public static async getInitialWatchlistData(userId: number) {
    let watchlist = new Watchlist(userId, redisClient);
    let watchlistData = await watchlist.getWatchlistData();
    let instrumentIds = [];
    instrumentIds = [
      ...watchlistData[0].scripts,
      ...watchlistData[1].scripts,
      ...watchlistData[2].scripts,
      ...watchlistData[3].scripts,
    ];

    let finalInstrumentIds = [...new Set(instrumentIds)];

    let scriptsDetailData =
      await watchlist.getWatchlistInstrumentData(finalInstrumentIds);

    let scriptsLiveData =
      await watchlist.getWatchlistInstrumentLatestData(finalInstrumentIds);

    return this.initialWatchlistDataFormatter(
      scriptsDetailData,
      scriptsLiveData
    );
  }

  public static async searchInstruments(data: {
    searchText: string;
    exch: string;
    page: string;
  }) {
    let watchlist = new Watchlist(-1, redisClient);
    let { searchText, exch, page = '1' } = data;

    if (exch == 'NSE') {
      exch = 'NFO';
    }

    exch = exch.toString();
    let customFilter = {};

    if (exch && exch.length > 0) {
      customFilter['exchange'] = exch;
    }

    switch (exch) {
      case 'NFO':
        customFilter['segment'] = 'NFO-FUT';
        break;
      case 'Options':
        customFilter['segment'] = 'NFO-OPT';
        break;
      case 'MCX':
        customFilter['segment'] = 'MCX-FUT';
        break;
    }

    let scriptData = await watchlist.searchInstruments({
      searchText,
      customFilter,
      page,
    });

    return scriptData;
  }

  public static async updateWatchlist({
    watchlistId,
    name = null,
    scripts = null,
    columns = null,
  }: {
    watchlistId: number;
    scripts?: string[] | null;
    columns?: any | null;
    name?: string | null;
  }) {
    let watchlist = new Watchlist(null, redisClient);
    if (scripts) scripts = [...new Set(scripts)];
    if (columns) {
      columns = [
        ...new Set(
          columns.map((item: any) => {
            return JSON.stringify({ id: item.id, width: item.width });
          })
        ),
      ];
      columns = columns.map((item: any) => {
        return JSON.parse(item);
      });
    }
    await watchlist.updateWatchlist({ columns, name, scripts, watchlistId });
    return;
  }

  public static async getColumnsData() {
    let watchlist = new Watchlist(null, redisClient);
    return await watchlist.getColumnsData();
  }

  public static async getMarketIndexesData() {
    let watchlist = new Watchlist(null, redisClient);
    let projectSetting = new ProjectSetting(['MRKIND']);

    let settingsData = await projectSetting.getProjectSettingByKeys();
    let marketIndexData = await watchlist.getMarketIndexData(
      settingsData.map((a) => a.prjSettDisplayName)
    );
    console.log('marketIndexData', marketIndexData);
    marketIndexData = marketIndexData.map((item) => {
      return {
        ...item,
        name:
          settingsData.find(
            (a) => String(a.prjSettDisplayName) == String(item.instrumentToken)
          ).prjSettConstant || '',
      };
    });
    return marketIndexData;
  }

  public static async updateFastTrade({
    userId,
    watchlistId,
    fastTradeActive,
    fastTradeLotSize,
  }: {
    userId: number;
    watchlistId: number;
    fastTradeActive: boolean;
    fastTradeLotSize: number;
  }) {
    let watchlist = new Watchlist(null, redisClient);
    let exchangesettings = new ExchangeSetting({
      userId,
    });
    let exchangeData = await exchangesettings.getExchangeSetting();
    exchangeData.forEach((a) => {
      if (fastTradeLotSize > a.tradeMaxLotSize) {
        throw new Error(
          'Lot size is greater than max lot size per trade of exchange ' +
            a.exchange.exchangeName
        );
      }
    });
    await watchlist.updateFastTrade({
      watchlistId,
      fastTradeActive,
      fastTradeLotSize,
    });
    return;
  }
}

export default WatchlistService;
