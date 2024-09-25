import { ILike, In } from 'typeorm';
import {
  m_user,
  t_userlogin,
  m_userwatchlist,
  m_instruments,
  m_watchlistcolumn,
} from 'database/sql/schema';
import type { RedisClientType } from 'lib/redis';

class Watchlist {
  public userId = null;
  public watchlist_data: m_userwatchlist[] = null;
  public watchlist_instruments_data: m_instruments[] = null;
  public watchlist_instruments_latest_data = null;
  public searched_instruments_data: m_instruments[] = null;
  public watchlist_columns_data: m_watchlistcolumn[] = null;
  redisClient: RedisClientType = null;
  constructor(userId: number | null, redisClient: RedisClientType) {
    this.userId = userId;
    if (!redisClient) {
      throw new Error('redis client is null');
    }
    this.redisClient = redisClient;
  }

  async updateFastTrade({
    watchlistId,
    fastTradeActive,
    fastTradeLotSize,
  }: {
    watchlistId: number;
    fastTradeActive: boolean;
    fastTradeLotSize: number;
  }) {
    await m_userwatchlist.update(
      { id: watchlistId },
      {
        fastTradeActive,
        fastTradeLotSize,
      }
    );
    return;
  }

  async getWatchlistData() {
    if (!this.watchlist_data) {
      this.watchlist_data = await m_userwatchlist.find({
        where: { user: { id: this.userId } },
      });
    }
    return this.watchlist_data;
  }

  async getWatchlistInstrumentData(instrumentIds: string[]) {
    // instrumentIds is like ['NSE:INFY', 'NSE:RELIANCE']
    console.log('instrument ids ', instrumentIds);
    let parsedKeys = instrumentIds.map((instrumentId) => {
      let [exchange, tradingsymbol] = instrumentId.split(':');
      return { exchange, tradingsymbol };
    });
    this.watchlist_instruments_data = await m_instruments.find({
      where: parsedKeys,
      select: [
        'instrument_token',
        'tradingsymbol',
        'expiry',
        'lot_size',
        'exchange',
      ],
    });
    return this.watchlist_instruments_data;
  }

  async getWatchlistInstrumentLatestData(instrumentIds: string[]) {
    if (instrumentIds.length == 0) {
      this.watchlist_instruments_latest_data = [];
      return this.watchlist_instruments_latest_data;
    }
    let redisKeys = instrumentIds.map((instrumentId) => {
      return `live-${instrumentId}`;
    });
    if (redisKeys.length == 0) {
      return [];
    }
    let data = await this.redisClient.mGet(redisKeys);
    this.watchlist_instruments_latest_data = data.map((item) => {
      return JSON.parse(item);
    });
    // console.log('data', redisKeys, data);
    // this.watchlist_instruments_latest_data = await m_instrumentlatestdata.find({
    //   instrumentToken: {
    //     $in: instrumentIds,
    //   },
    // });
    return this.watchlist_instruments_latest_data;
  }

  async searchInstruments({
    searchText,
    customFilter,
    page,
  }: {
    searchText: string;
    page: String;
    customFilter: {};
  }) {
    this.searched_instruments_data = await m_instruments.find({
      where: [
        {
          tradingsymbol: ILike(`%${searchText}%`),
          ...customFilter,
          isDeleted: false,
        },
        {
          name: ILike(`%${searchText}%`),
          ...customFilter,
          isDeleted: false,
        },
      ],
      select: ['tradingsymbol', 'instrument_token', 'exchange'],
      skip: (parseInt(page.toString()) - 1) * 15,
      take: 15,
    });
    return this.searched_instruments_data;
  }

  async getWatchlistUser(watchlistId: number) {
    let watchlistData = await m_userwatchlist.findOne({
      where: { id: watchlistId },
      relations: {
        user: true,
      },
      select: {
        user: {
          id: true,
        },
        id: true,
      },
    });
    return watchlistData.user.id;
  }

  async updateWatchlist({
    watchlistId,
    columns = null,
    name = null,
    scripts = null,
  }: {
    watchlistId: number;
    scripts: string[] | null;
    columns: any | null;
    name: string | null;
  }) {
    let dataToUpdate = {};
    if (scripts) {
      dataToUpdate['scripts'] = [...new Set([...scripts])];
    }
    if (columns) {
      dataToUpdate['columns'] = columns;
    }
    if (name) {
      dataToUpdate['name'] = name;
    }
    console.log('updating ', watchlistId, ' with scripts ', dataToUpdate);
    await m_userwatchlist.update({ id: watchlistId }, dataToUpdate);
    return;
  }

  async getColumnsData() {
    if (!this.watchlist_columns_data) {
      this.watchlist_columns_data = await m_watchlistcolumn.find({});
    }
    return this.watchlist_columns_data;
  }

  public async getMasterInstrumentsGroupedByName(
    allowedExchangesName: string[]
  ) {
    console.log('allowed excahnges  name ', allowedExchangesName);
    let instruments = await m_instruments
      .createQueryBuilder('instrument')
      .where('instrument.exchange IN (:...allowed)', {
        allowed: allowedExchangesName,
      })
      .distinctOn(['name', 'exchange'])
      .getMany();
    console.log('instruments are ', instruments.length);
    return instruments;
  }

  public async getMarketIndexData(marketIds: String[]) {
    let redisKeys = marketIds.map((instrumentId) => {
      return `live-market-index:${instrumentId}`;
    });
    if (redisKeys.length == 0) {
      return [];
    }
    let data = await this.redisClient.mGet(redisKeys);
    return data.map((item) => {
      return JSON.parse(item);
    });
  }
}

export default Watchlist;
