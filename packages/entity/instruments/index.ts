import { m_instruments, t_instrumentstaging } from 'database/sql/schema';
import { RedisClientType } from 'lib/redis';
import { EntityManager, In, LessThanOrEqual } from 'typeorm';
class Instruments {
  instruments_data: m_instruments[];
  tmanager: EntityManager | null = null;
  constructor() {
    this.instruments_data = null;
  }

  public async getInstruments({ names }: { names: string[] }) {
    if (this.instruments_data == null) {
      let instruments = await m_instruments.find({
        where: {
          isDeleted: false,
          name: In(names),
        },
      });
      //   remove multiple with same name
      let uniqueInstruments = [];
      let uniqueNames = [];
      instruments.map((item) => {
        if (!uniqueNames.includes(item.name)) {
          uniqueInstruments.push(item);
          uniqueNames.push(item.name);
        }
      });
      instruments = uniqueInstruments;
      // change exchange name if NFO then to NSE
      instruments = instruments.map((item) => {
        if (item.exchange == 'NFO') {
          item.exchange = 'NSE';
        }
        return item;
      });
      this.instruments_data = instruments;
    }
    return this.instruments_data;
  }

  public async updateMCXLotSize(data: { name: string; lotSize: number }[]) {
    await Promise.all(
      data.map(async (item) => {
        await this.tmanager.update(
          m_instruments,
          { name: item.name },
          { lot_size: `${item.lotSize}` }
        );
      })
    );
  }

  public async getAllInstruments() {
    console.log('looking for instruments');
    return await m_instruments.find({ where: { isDeleted: false } });
  }

  public setTransactionManager(tmanager) {
    this.tmanager = tmanager;
    return;
  }

  public async saveInstrumentsStaging(data: t_instrumentstaging[]) {
    await this.tmanager.delete(t_instrumentstaging, {});
    await this.tmanager.save(t_instrumentstaging, data, { chunk: 2000 });
    return;
  }

  public async filterInstrumentStaging(nextMonthExpiry) {
    const instrumentData = await t_instrumentstaging.find({
      where: [
        // {
        //   exchange: 'NFO',
        //   instrument_type: In(['CE', 'PE']),
        //   segment: 'NFO-OPT',
        //   tradingsymbol: In([
        //     this.getCurrentMonthCode(),
        //     this.getNextMonthCode(),
        //   ]),
        // },
        {
          exchange: 'NFO',
          instrument_type: 'FUT',
          expiry: LessThanOrEqual(nextMonthExpiry),
        },
        {
          exchange: 'MCX',
          segment: 'MCX-FUT',
          instrument_type: 'FUT',
          name: In([
            'ALUMINI',
            'ALUMINIUM',
            'COPPER',
            'CRUDEOIL',
            'GOLD',
            'GOLDGUINEA',
            'GOLDM',
            'GOLDPETAL',
            'LEAD',
            'NATURALGAS',
            'NICKEL',
            'SILVER',
            'SILVERM',
            'SILVERMIC',
            'ZINC',
            'ZINCMINI',
          ]),
          // expiry: LessThanOrEqual(nextMonthExpiry),
          // tradingsymbol: Raw(
          //   'LEFT(instrument.tradingsymbol, LENGTH(instrument.tradingsymbol) - LENGTH(RIGHT(instrument.tradingsymbol, 8))) = instrument.name'
          // ),
        },
      ],
      order: {
        name: 'ASC',
        strike: 'ASC',
      },
    });

    return instrumentData;
  }

  public async upsertInstruments(instruments: any) {
    await this.tmanager.upsert(m_instruments, instruments, {
      conflictPaths: {
        tradingsymbol: true,
        exchange: true,
      },
    });
    return;
  }

  public async updateInstruments(instrumentIds: number[], data: any) {
    if (this.tmanager) {
      await this.tmanager.update(
        m_instruments,
        { id: In(instrumentIds) },
        { ...data }
      );
    }
    return;
  }

  public async getInstrumentByTradingSymbol(tradingSymbol: string) {
    let scriptData = await m_instruments.findOne({
      where: { tradingsymbol: tradingSymbol },
    });
    return scriptData;
  }

  public async getLiveScriptDataByTradingSymbol(
    tradingSymbol: string,
    exchange: string,
    redisClient: RedisClientType
  ) {
    let key = `live-${exchange}:${tradingSymbol}`;
    let result = await redisClient.get(key);
    return JSON.parse(result);
  }
}

export default Instruments;
