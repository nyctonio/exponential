import {
  m_exchangesetting,
  m_exchange,
  m_scriptquantity,
} from 'database/sql/schema';
import { EntityManager, ILike, In } from 'typeorm';

class ExchangeSetting {
  userId = null;
  tmanager = null;
  exchangeSettings: null | m_exchangesetting[] = null;
  scriptExchangeSettings: null | m_scriptquantity[] = null;
  constructor({ userId }: { userId?: number }) {
    this.userId = userId;
  }

  setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  async getAllExchanges() {
    let data = await m_exchange.find();
    return data;
  }

  async getExchangeSetting() {
    if (this.exchangeSettings == null) {
      let exchangeSetting = await m_exchangesetting.find({
        where: {
          user: {
            id: this.userId,
          },
        },
        relations: ['exchange'],
      });
      this.exchangeSettings = exchangeSetting;
    }
    return this.exchangeSettings;
  }

  async getCustomExchangeSetting({
    exchangeName,
    isExchangeActive = false,
    exchangeMaxLotSize = false,
    scriptMaxLotSize = false,
    tradeMaxLotSize = false,
  }) {
    const exchangeSetting = await m_exchangesetting.find({
      where: {
        user: {
          id: this.userId,
        },
        exchange: {
          exchangeName: exchangeName,
          isActive: true,
        },
        isExchangeActive: true,
      },
      relations: ['exchange'],
      select: {
        exchangeMaxLotSize,
        scriptMaxLotSize,
        tradeMaxLotSize,
        isExchangeActive,
        exchange: {
          exchangeName: true,
        },
      },
    });
    return exchangeSetting;
  }

  async getUserAllowedExchanges() {
    let exchangeSetting = await m_exchangesetting.find({
      where: {
        user: {
          id: this.userId,
        },
        isExchangeActive: true,
      },
      relations: ['exchange'],
    });
    return exchangeSetting;
  }

  async getScriptExchangeSetting(user = true) {
    if (this.scriptExchangeSettings == null) {
      let scriptExchangeSetting = await m_scriptquantity.find({
        where: {
          user: {
            id: this.userId,
          },
        },
        relations: {
          exchange: true,
          user,
        },
      });
      this.scriptExchangeSettings = scriptExchangeSetting;
    }
    return this.scriptExchangeSettings;
  }

  async getCustomScriptExchangeSetting({ scriptName }) {
    console.log('scriptName', scriptName);
    let scriptExchangeSetting = await m_scriptquantity.find({
      where: {
        user: {
          id: this.userId,
        },
        instrumentName: scriptName,
      },
    });
    return scriptExchangeSetting;
  }

  async getAllUsersExchangeSetting(user: number[]) {
    let exchangeSetting = await m_exchangesetting.find({
      where: {
        user: {
          id: In(user),
        },
      },
      relations: ['exchange', 'user'],
    });
    return exchangeSetting;
  }

  async getAllUsersScriptExchangeSetting(user: number[]) {
    let scriptExchangeSetting = await m_scriptquantity.find({
      where: {
        user: {
          id: In(user),
        },
      },
      relations: ['exchange', 'user'],
    });
    return scriptExchangeSetting;
  }

  async disableAllChildsExchanges(user: number[], exchangeId: number) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .update(m_exchangesetting)
      .set({ isExchangeActive: false })
      .where('user.id IN (:...user)', { user })
      .andWhere('exchange.id = :exchangeId', {
        exchangeId,
      })
      .execute();
  }

  async updateExchangeSetting({
    id,
    exchangeAllowed,
    exchangeMaxLotSize,
    scriptMaxLotSize,
    tradeMaxLotSize,
  }: {
    id: number;
    exchangeAllowed: boolean;
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .update(m_exchangesetting)
      .set({
        isExchangeActive: exchangeAllowed,
        exchangeMaxLotSize,
        scriptMaxLotSize,
        tradeMaxLotSize,
      })
      .where('id = :id', { id })
      .execute();
  }

  async updateAllChildsExchangeSetting({
    child,
    exchangeMaxLotSize,
    scriptMaxLotSize,
    tradeMaxLotSize,
    exchangeId,
  }: {
    child: number[];
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
    exchangeId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    // update exchange max lot size
    await Promise.all([
      this.tmanager
        .createQueryBuilder()
        .update(m_exchangesetting)
        .set({
          exchangeMaxLotSize,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('exchangeMaxLotSize > :exchangeMaxLotSize', {
          exchangeMaxLotSize,
        })
        .execute(),
      // update script max lot size
      this.tmanager
        .createQueryBuilder()
        .update(m_exchangesetting)
        .set({
          scriptMaxLotSize,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('scriptMaxLotSize > :scriptMaxLotSize', {
          scriptMaxLotSize,
        })
        .execute(),
      // update trade max lot size
      this.tmanager
        .createQueryBuilder()
        .update(m_exchangesetting)
        .set({
          tradeMaxLotSize,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('tradeMaxLotSize > :tradeMaxLotSize', {
          tradeMaxLotSize,
        })
        .execute(),
    ]);
  }

  async updateAllChildsScriptExchangeSetting({
    child,
    scriptMaxLotSize,
    tradeMaxLotSize,
    exchangeId,
  }: {
    child: number[];
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
    exchangeId: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    // update script max lot size
    await Promise.all([
      this.tmanager
        .createQueryBuilder()
        .update(m_scriptquantity)
        .set({
          scriptMaxLotSize,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('scriptMaxLotSize > :scriptMaxLotSize', {
          scriptMaxLotSize,
        })
        .execute(),
      // update trade max lot size
      this.tmanager
        .createQueryBuilder()
        .update(m_scriptquantity)
        .set({
          tradeMaxLotSize,
        })
        .where('user.id IN (:...child)', { child })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('tradeMaxLotSize > :tradeMaxLotSize', {
          tradeMaxLotSize,
        })
        .execute(),
    ]);
  }

  async createExchangeSetting({
    exchangeId,
    exchangeAllowed,
    exchangeMaxLotSize,
    scriptMaxLotSize,
    tradeMaxLotSize,
  }: {
    exchangeId: number;
    exchangeAllowed: boolean;
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
  }) {
    if (this.tmanager == null) throw new Error('Transaction manager not set');
    await this.tmanager
      .createQueryBuilder()
      .insert()
      .into(m_exchangesetting)
      .values({
        exchange: {
          id: exchangeId,
        },
        user: {
          id: this.userId,
        },
        isExchangeActive: exchangeAllowed,
        exchangeMaxLotSize,
        scriptMaxLotSize,
        tradeMaxLotSize,
      })
      .execute();
  }

  async upsertExchangeSetting(data: m_scriptquantity[]) {
    await m_scriptquantity.upsert(data, {
      conflictPaths: ['user.id', 'instrumentName'],
      skipUpdateIfNoValuesChanged: true,
    });
    return;
  }
}

export default ExchangeSetting;
