import {
  m_trademarginsetting,
  m_intradaytrademarginsetting,
  m_scripttrademarginsetting,
  m_scriptintradaymarginsetting,
} from 'database/sql/schema';
import { EntityManager, In } from 'typeorm';

class MarginSettings {
  userId: number = null;
  trade_margin_setting: null | m_trademarginsetting[] = null;
  intraday_trade_margin_setting: null | m_intradaytrademarginsetting[] = null;
  script_trade_margin_setting: null | m_scripttrademarginsetting[] = null;
  script_intraday_trade_margin_setting: null | m_scriptintradaymarginsetting[] =
    null;
  tmanager: EntityManager | null = null;

  constructor({ userId }: { userId: number }) {
    this.userId = userId;
  }

  public setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  public async getTradeMarginSettings() {
    if (this.trade_margin_setting == null) {
      let tradeMarginSetting = await m_trademarginsetting.find({
        where: {
          user: {
            id: this.userId,
          },
        },
        relations: ['exchange'],
      });
      this.trade_margin_setting = tradeMarginSetting;
    }
    return this.trade_margin_setting;
  }

  public async getTradeMarginSettingsByExchange(exchange: string) {
    return await m_trademarginsetting.findOne({
      where: {
        user: { id: this.userId },
        exchange: { exchangeName: exchange },
      },
    });
  }

  public async getIntradayMarginSettingsByExchange(exchange: string) {
    return await m_intradaytrademarginsetting.findOne({
      where: {
        user: { id: this.userId },
        exchange: { exchangeName: exchange },
      },
    });
  }

  public async getIntradayMarginSettings() {
    if (this.intraday_trade_margin_setting == null) {
      let intradayTradeMarginSetting = await m_intradaytrademarginsetting.find({
        where: {
          user: {
            id: this.userId,
          },
        },
        relations: ['exchange'],
      });
      this.intraday_trade_margin_setting = intradayTradeMarginSetting;
    }
    return this.intraday_trade_margin_setting;
  }

  public async getScriptTradeMarginSettings() {
    if (this.script_trade_margin_setting == null) {
      let scriptTradeMarginSetting = await m_scripttrademarginsetting.find({
        where: {
          user: {
            id: this.userId,
          },
        },
        relations: ['exchange'],
      });
      this.script_trade_margin_setting = scriptTradeMarginSetting;
    }
    return this.script_trade_margin_setting;
  }

  public async getScriptIntradayTradeMarginSettings() {
    if (this.script_intraday_trade_margin_setting == null) {
      let scriptIntradayTradeMarginSetting =
        await m_scriptintradaymarginsetting.find({
          where: {
            user: {
              id: this.userId,
            },
          },
          relations: ['exchange'],
        });
      this.script_intraday_trade_margin_setting =
        scriptIntradayTradeMarginSetting;
    }
    return this.script_intraday_trade_margin_setting;
  }

  public async updateTradeMarginSettings({
    id,
    marginType,
    marginPerCrore,
    marginPerLot,
  }: {
    id: number;
    marginType: 'crore' | 'lot';
    marginPerCrore: number;
    marginPerLot: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .update(m_trademarginsetting)
      .set({
        marginType,
        marginPerCrore,
        marginPerLot,
      })
      .where({
        id,
      })
      .execute();
  }

  public async updateAllChildsMarginSetting({
    child,
    marginPerCrore,
    marginPerLot,
    exchangeId,
  }: {
    child: number[];
    marginPerCrore: number;
    marginPerLot: number;
    exchangeId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    // update margin per crore
    await Promise.all([
      this.tmanager
        .createQueryBuilder()
        .update(m_trademarginsetting)
        .set({
          marginPerCrore,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerCrore < :marginPerCrore', {
          marginPerCrore,
        })
        .execute(),
      // update margin per lot
      this.tmanager
        .createQueryBuilder()
        .update(m_trademarginsetting)
        .set({
          marginPerLot,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerLot < :marginPerLot', {
          marginPerLot,
        })
        .execute(),
    ]);
  }

  public async updateAllChildsScriptMarginSetting({
    child,
    marginPerCrore,
    marginPerLot,
    exchangeId,
  }: {
    child: number[];
    marginPerCrore: number;
    marginPerLot: number;
    exchangeId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    // update margin per crore
    await Promise.all([
      this.tmanager
        .createQueryBuilder()
        .update(m_scripttrademarginsetting)
        .set({
          marginPerCrore,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerCrore < :marginPerCrore', {
          marginPerCrore,
        })
        .execute(),
      // update margin per lot
      this.tmanager
        .createQueryBuilder()
        .update(m_scripttrademarginsetting)
        .set({
          marginPerLot,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerLot < :marginPerLot', {
          marginPerLot,
        })
        .execute(),
    ]);
  }

  public async updateIntradayMarginSettings({
    id,
    marginType,
    marginPerCrore,
    marginPerLot,
  }: {
    id: number;
    marginType: 'crore' | 'lot';
    marginPerCrore: number;
    marginPerLot: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .update(m_intradaytrademarginsetting)
      .set({
        marginType,
        marginPerCrore,
        marginPerLot,
      })
      .where({
        id,
      })
      .execute();
  }

  public async updateAllChildsIntradayMarginSetting({
    child,
    marginPerCrore,
    marginPerLot,
    exchangeId,
  }: {
    child: number[];
    marginPerCrore: number;
    marginPerLot: number;
    exchangeId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    // update margin per crore
    await Promise.all([
      this.tmanager
        .createQueryBuilder()
        .update(m_intradaytrademarginsetting)
        .set({
          marginPerCrore,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerCrore < :marginPerCrore', {
          marginPerCrore,
        })
        .execute(),
      // update margin per lot
      this.tmanager
        .createQueryBuilder()
        .update(m_intradaytrademarginsetting)
        .set({
          marginPerLot,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerLot < :marginPerLot', {
          marginPerLot,
        })
        .execute(),
    ]);
  }

  public async updateAllChildsScriptIntradayMarginSetting({
    child,
    marginPerCrore,
    marginPerLot,
    exchangeId,
  }: {
    child: number[];
    marginPerCrore: number;
    marginPerLot: number;
    exchangeId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    // update margin per crore
    await Promise.all([
      this.tmanager
        .createQueryBuilder()
        .update(m_intradaytrademarginsetting)
        .set({
          marginPerCrore,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerCrore < :marginPerCrore', {
          marginPerCrore,
        })
        .execute(),
      // update margin per lot
      this.tmanager
        .createQueryBuilder()
        .update(m_intradaytrademarginsetting)
        .set({
          marginPerLot,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('marginPerLot < :marginPerLot', {
          marginPerLot,
        })
        .execute(),
    ]);
  }

  public async createTradeMarginSettings({
    exchangeId,
    marginType,
    marginPerCrore,
    marginPerLot,
    userId,
  }: {
    exchangeId: number;
    marginType: 'crore' | 'lot';
    marginPerCrore: number;
    marginPerLot: number;
    userId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .insert()
      .into(m_trademarginsetting)
      .values({
        exchange: {
          id: exchangeId,
        },
        marginType: marginType,
        marginPerCrore,
        marginPerLot,
        user: {
          id: userId,
        },
      })
      .execute();
  }

  public async createIntradayMarginSettings({
    exchangeId,
    marginPerCrore,
    marginPerLot,
    userId,
  }: {
    exchangeId: number;
    marginPerCrore: number;
    marginPerLot: number;
    userId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .insert()
      .into(m_intradaytrademarginsetting)
      .values({
        exchange: {
          id: exchangeId,
        },
        marginPerCrore,
        marginPerLot,
        user: {
          id: userId,
        },
      })
      .execute();
  }

  public async getChildUsersMarginSettings(
    childUserIds: number[],
    scripts: string[]
  ) {
    let defaultNormalMarginPromise = m_trademarginsetting.find({
      where: { user: { id: In(childUserIds) } },
      relations: { exchange: true, user: true },
      select: {
        exchange: { exchangeName: true, id: true },
        user: { id: true },
      },
    });

    let defaultIntradayMarginPromise = m_intradaytrademarginsetting.find({
      where: { user: { id: In(childUserIds) } },
      relations: { exchange: true, user: true },
      select: {
        exchange: { exchangeName: true, id: true },
        user: { id: true },
      },
    });

    let scriptNormalMarginPromise = m_scripttrademarginsetting.find({
      where: { user: { id: In(childUserIds) }, instrumentName: In(scripts) },
      relations: { exchange: true, user: true },
      select: {
        exchange: { exchangeName: true, id: true },
        user: { id: true },
      },
    });

    let scriptIntradayMarginPromise = m_scriptintradaymarginsetting.find({
      where: { user: { id: In(childUserIds) }, instrumentName: In(scripts) },
      relations: { exchange: true, user: true },
      select: {
        exchange: { exchangeName: true, id: true },
        user: { id: true },
      },
    });

    const [
      defaultNormalMargin,
      defaultIntradayMargin,
      scriptNormalMargin,
      scriptIntradayMargin,
    ] = await Promise.all([
      defaultNormalMarginPromise,
      defaultIntradayMarginPromise,
      scriptNormalMarginPromise,
      scriptIntradayMarginPromise,
    ]);

    return {
      defaultNormalMargin,
      defaultIntradayMargin,
      scriptNormalMargin,
      scriptIntradayMargin,
    };
  }

  public async upsertMarginSettings(data: {
    normal: m_scripttrademarginsetting[];
    intraday: m_scriptintradaymarginsetting[];
  }) {
    if (data.intraday && data.intraday.length != 0) {
      this.tmanager.upsert(m_scriptintradaymarginsetting, data.intraday, {
        conflictPaths: { instrumentName: true, user: true },
      });
    }
    this.tmanager.upsert(m_scripttrademarginsetting, data.normal, {
      conflictPaths: { instrumentName: true, user: true },
    });
    return;
  }

  public async getScriptTradeMarginSettingsByName(name: string) {
    let scriptTradeMarginSetting = await m_scripttrademarginsetting.findOne({
      where: {
        instrumentName: name,
        user: {
          id: this.userId,
        },
      },
      relations: ['exchange'],
    });
    return scriptTradeMarginSetting;
  }

  public async getScriptIntradayTradeMarginSettingsByName(name: string) {
    let scriptIntradayTradeMarginSetting =
      await m_scriptintradaymarginsetting.findOne({
        where: {
          instrumentName: name,
          user: {
            id: this.userId,
          },
        },
        relations: ['exchange'],
      });

    return scriptIntradayTradeMarginSetting;
  }
}

export default MarginSettings;
