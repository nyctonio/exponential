import {
  m_instruments,
  m_scriptbrokeragesetting,
  m_user,
  m_userbrokeragesetting,
} from 'database/sql/schema';
import { EntityManager, ILike, In, MoreThan } from 'typeorm';

class BrokerageSettings {
  userId: number = null;
  brokerage_settings: null | m_userbrokeragesetting[] = null;
  script_brokerage_settings: null | m_scriptbrokeragesetting[] = null;
  tmanager: null | EntityManager = null;
  constructor({ userId }: { userId?: number }) {
    this.userId = userId;
  }

  setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  public async setUserId({ username }: { username: string }) {
    let user = await m_user.findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    this.userId = user.id;
  }

  public async getMasterInstruments(allowedExchangesName: string[]) {
    let instruments = await m_instruments
      .createQueryBuilder()
      .distinctOn(['name'])
      .where('exchange in :exchange', { exchange: allowedExchangesName })
      .getMany();
    console.log('instruments are ', instruments.length);
    return instruments;
  }

  public async getBrokerageSettings(exchangeName = null) {
    console.log('exchange name is ', exchangeName ? exchangeName : 'null');
    if (this.brokerage_settings == null) {
      let defaultBrokerageSettings = await m_userbrokeragesetting.find({
        where: exchangeName
          ? {
              user: { id: this.userId },
              exchange: { exchangeName: exchangeName },
            }
          : {
              user: { id: this.userId },
            },
        relations: { user: true, exchange: true },
        select: {
          user: { id: true },
          exchange: { id: true, exchangeName: true },
        },
      });
      this.brokerage_settings = defaultBrokerageSettings;
    }
    return this.brokerage_settings;
  }

  // pass parentUser Type and it will return the maximum amount that parent amout can reach
  public async minChildBrokerageOfParent({
    childIds,
    parentType,
    exchangeId,
  }: {
    childIds: number[];
    parentType: string;
    exchangeId: number;
  }) {
    let orderCr = {},
      orderLot = {},
      selectCr = {},
      selectLot = {};
    if (parentType == 'Company') {
      orderCr = {
        companyPerCroreAmt: 'ASC',
      };
      orderLot = {
        companyPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        companyPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        companyPerLotAmt: true,
      };
    } else if (parentType == 'Master') {
      orderCr = {
        masterPerCroreAmt: 'ASC',
      };
      orderLot = {
        masterPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        masterPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        masterPerLotAmt: true,
      };
    } else if (parentType == 'Broker') {
      orderCr = {
        brokerPerCroreAmt: 'ASC',
      };
      orderLot = {
        brokerPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        brokerPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        brokerPerLotAmt: true,
      };
    } else if (parentType == 'Sub-Broker') {
      orderCr = {
        subBrokerPerCroreAmt: 'ASC',
      };
      orderLot = {
        subBrokerPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        subBrokerPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        subBrokerPerLotAmt: true,
      };
    }
    let minCrore = await m_userbrokeragesetting.find({
      where: {
        user: {
          id: In(childIds),
        },
        exchange: {
          id: exchangeId,
        },
      },
      order: orderCr,
      take: 1,
      select: selectCr,
    });
    let minLot = await m_userbrokeragesetting.find({
      where: {
        user: {
          id: In(childIds),
        },
        exchange: {
          id: exchangeId,
        },
      },
      order: orderLot,
      take: 1,
      select: selectLot,
    });
    return {
      cr: minCrore.length > 0 ? minCrore[0].masterPerCroreAmt : null,
      lot: minLot.length > 0 ? minLot[0].masterPerLotAmt : null,
    };
  }

  public async minChildScriptBrokerageOfParent({
    childIds,
    parentType,
    name,
  }: {
    childIds: number[];
    parentType: string;
    name: string;
  }) {
    let orderCr = {},
      orderLot = {},
      selectCr = {},
      selectLot = {};
    if (parentType == 'Company') {
      orderCr = {
        companyPerCroreAmt: 'ASC',
      };
      orderLot = {
        companyPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        companyPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        companyPerLotAmt: true,
      };
    } else if (parentType == 'Master') {
      orderCr = {
        masterPerCroreAmt: 'ASC',
      };
      orderLot = {
        masterPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        masterPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        masterPerLotAmt: true,
      };
    } else if (parentType == 'Broker') {
      orderCr = {
        brokerPerCroreAmt: 'ASC',
      };
      orderLot = {
        brokerPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        brokerPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        brokerPerLotAmt: true,
      };
    } else if (parentType == 'Sub-Broker') {
      orderCr = {
        subBrokerPerCroreAmt: 'ASC',
      };
      orderLot = {
        subBrokerPerLotAmt: 'ASC',
      };
      selectCr = {
        id: true,
        subBrokerPerCroreAmt: true,
      };
      selectLot = {
        id: true,
        subBrokerPerLotAmt: true,
      };
    }
    let minCrore = await m_scriptbrokeragesetting.find({
      where: {
        user: {
          id: In(childIds),
        },
        instrumentName: name,
      },
      order: orderCr,
      take: 1,
      select: selectCr,
    });
    let minLot = await m_scriptbrokeragesetting.find({
      where: {
        user: {
          id: In(childIds),
        },
        instrumentName: name,
      },
      order: orderLot,
      take: 1,
      select: selectLot,
    });
    return {
      cr: minCrore.length > 0 ? minCrore[0].masterPerCroreAmt : null,
      lot: minLot.length > 0 ? minLot[0].masterPerLotAmt : null,
    };
  }

  public async getBrokerageOfMultipleUsers({
    userIds,
    exchangeId,
  }: {
    userIds: number[];
    exchangeId: number;
  }) {
    let brokerageSettings = await m_userbrokeragesetting.find({
      where: {
        user: {
          id: In(userIds),
        },
        exchange: {
          id: exchangeId,
          isActive: true,
        },
      },
      relations: {
        exchange: true,
        user: true,
      },
      select: {
        user: {
          id: true,
        },
        exchange: {
          id: true,
          exchangeName: true,
        },
      },
    });
    return brokerageSettings;
  }

  public async getScriptBrokerageSettings() {
    if (this.script_brokerage_settings == null) {
      let scriptBrokerageSettings = await m_scriptbrokeragesetting.find({
        where: { user: { id: this.userId } },
        relations: { user: true, exchange: true },
        select: { user: { id: true } },
      });
      this.script_brokerage_settings = scriptBrokerageSettings;
    }
    return this.script_brokerage_settings;
  }

  public async getScriptBrokerageSettingsByName({
    names,
  }: {
    names: string[];
  }) {
    let scriptBrokerageSettings = await m_scriptbrokeragesetting.find({
      where: {
        user: {
          id: this.userId,
        },
        instrumentName: In(names),
      },
      relations: {
        exchange: true,
      },
    });

    return scriptBrokerageSettings;
  }

  public async getGreaterChildBrokerage({
    childIds,
    brokeragePerCroreAmt,
    brokeragePerLotAmt,
  }: {
    childIds: number[];
    brokeragePerLotAmt: number;
    brokeragePerCroreAmt: number;
  }) {
    let brokeragePerLotSettings = await m_userbrokeragesetting.find({
      where: {
        brokeragePerLotAmt: MoreThan(brokeragePerLotAmt),
        user: {
          id: In(childIds),
        },
      },
      relations: {
        exchange: true,
      },
      select: {
        exchange: {
          exchangeName: true,
        },
      },
    });

    let brokeragePerCroreSettings = await m_userbrokeragesetting.find({
      where: {
        brokeragePerCroreAmt: MoreThan(brokeragePerCroreAmt),
        user: {
          id: In(childIds),
        },
      },
      relations: {
        exchange: true,
      },
      select: {
        exchange: {
          exchangeName: true,
        },
      },
    });

    return { brokeragePerCroreSettings, brokeragePerLotSettings };
  }

  public async updateBrokerageSettings({
    id,
    brokerageType,
    brokeragePerCroreAmt,
    oldBrokeragePerCroreAmt,
    brokeragePerLotAmt,
    oldBrokeragePerLotAmt,
    parentUserType,
    parentData,
  }: {
    id: number;
    brokerageType: string;
    brokeragePerCroreAmt: number;
    oldBrokeragePerCroreAmt: number;
    brokeragePerLotAmt: number;
    oldBrokeragePerLotAmt: number;
    parentUserType: 'Broker' | 'Sub-Broker' | 'Master' | 'Company' | string;
    parentData: {
      companyPerCroreAmt: number;
      companyPerLotAmt: number;
      masterPerCroreAmt: number;
      masterPerLotAmt: number;
      brokerPerCroreAmt: number;
      brokerPerLotAmt: number;
      subBrokerPerCroreAmt: number;
      subBrokerPerLotAmt: number;
    };
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    }
    if (parentUserType == 'Company') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: brokeragePerCroreAmt,
          companyPerLotAmt: brokeragePerLotAmt,
        })
        .execute();
    } else if (parentUserType == 'Master') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: parentData.companyPerCroreAmt,
          companyPerLotAmt: parentData.companyPerLotAmt,
          masterPerCroreAmt: () =>
            `"masterPerCroreAmt" - (${oldBrokeragePerCroreAmt}-${brokeragePerCroreAmt})`,
          masterPerLotAmt: () =>
            `"masterPerLotAmt" - (${oldBrokeragePerLotAmt}-${brokeragePerLotAmt})`,
        })
        .execute();
    } else if (parentUserType == 'Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: parentData.companyPerCroreAmt,
          companyPerLotAmt: parentData.companyPerLotAmt,
          masterPerCroreAmt: parentData.masterPerCroreAmt,
          masterPerLotAmt: parentData.masterPerLotAmt,
          brokerPerCroreAmt: () =>
            `"brokerPerCroreAmt" - (${oldBrokeragePerCroreAmt}-${brokeragePerCroreAmt})`,
          brokerPerLotAmt: () =>
            `"brokerPerLotAmt" - (${oldBrokeragePerLotAmt}-${brokeragePerLotAmt})`,
        })
        .execute();
    } else if (parentUserType == 'Sub-Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: parentData.companyPerCroreAmt,
          companyPerLotAmt: parentData.companyPerLotAmt,
          masterPerCroreAmt: parentData.masterPerCroreAmt,
          masterPerLotAmt: parentData.masterPerLotAmt,
          brokerPerCroreAmt: parentData.brokerPerCroreAmt,
          brokerPerLotAmt: parentData.brokerPerLotAmt,
          subBrokerPerCroreAmt: () =>
            `"subBrokerPerCroreAmt" - (${oldBrokeragePerCroreAmt}-${brokeragePerCroreAmt})`,
          subBrokerPerLotAmt: () =>
            `"subBrokerPerLotAmt" - (${oldBrokeragePerLotAmt}-${brokeragePerLotAmt})`,
        })
        .execute();
    }
  }

  public async updateScriptBrokerageSettings({
    id,
    brokerageType,
    brokeragePerCroreAmt,
    oldBrokeragePerCroreAmt,
    brokeragePerLotAmt,
    oldBrokeragePerLotAmt,
    parentUserType,
    parentData,
  }: {
    id: number;
    brokerageType: string;
    brokeragePerCroreAmt: number;
    oldBrokeragePerCroreAmt: number;
    brokeragePerLotAmt: number;
    oldBrokeragePerLotAmt: number;
    parentUserType: 'Broker' | 'Sub-Broker' | 'Master' | 'Company' | string;
    parentData: {
      companyPerCroreAmt: number;
      companyPerLotAmt: number;
      masterPerCroreAmt: number;
      masterPerLotAmt: number;
      brokerPerCroreAmt: number;
      brokerPerLotAmt: number;
      subBrokerPerCroreAmt: number;
      subBrokerPerLotAmt: number;
    };
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    }
    console.log(
      'updating script brokerage settings...........',
      parentUserType,
      id
    );
    if (parentUserType == 'Company') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: brokeragePerCroreAmt,
          companyPerLotAmt: brokeragePerLotAmt,
        })
        .execute();
    } else if (parentUserType == 'Master') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: parentData.companyPerCroreAmt,
          companyPerLotAmt: parentData.companyPerLotAmt,
          masterPerCroreAmt: () =>
            `"masterPerCroreAmt" - (${oldBrokeragePerCroreAmt}-${brokeragePerCroreAmt})`,
          masterPerLotAmt: () =>
            `"masterPerLotAmt" - (${oldBrokeragePerLotAmt}-${brokeragePerLotAmt})`,
        })
        .execute();
    } else if (parentUserType == 'Broker') {
      console.log('updating broker script brokerage settings...........', {
        id,
        brokerageType,
        brokeragePerCroreAmt,
        brokeragePerLotAmt,
        companyPerCroreAmt: parentData.companyPerCroreAmt,
        companyPerLotAmt: parentData.companyPerLotAmt,
        masterPerCroreAmt: parentData.masterPerCroreAmt,
        masterPerLotAmt: parentData.masterPerLotAmt,
      });
      await this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: parentData.companyPerCroreAmt,
          companyPerLotAmt: parentData.companyPerLotAmt,
          masterPerCroreAmt: parentData.masterPerCroreAmt,
          masterPerLotAmt: parentData.masterPerLotAmt,
          brokerPerCroreAmt: () =>
            `"brokerPerCroreAmt" - (${oldBrokeragePerCroreAmt}-${brokeragePerCroreAmt})`,
          brokerPerLotAmt: () =>
            `"brokerPerLotAmt" - (${oldBrokeragePerLotAmt}-${brokeragePerLotAmt})`,
        })
        .execute();
    } else if (parentUserType == 'Sub-Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .where({
          id,
        })
        .set({
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt: parentData.companyPerCroreAmt,
          companyPerLotAmt: parentData.companyPerLotAmt,
          masterPerCroreAmt: parentData.masterPerCroreAmt,
          masterPerLotAmt: parentData.masterPerLotAmt,
          brokerPerCroreAmt: parentData.brokerPerCroreAmt,
          brokerPerLotAmt: parentData.brokerPerLotAmt,
          subBrokerPerCroreAmt: () =>
            `"subBrokerPerCroreAmt" - (${oldBrokeragePerCroreAmt}-${brokeragePerCroreAmt})`,
          subBrokerPerLotAmt: () =>
            `"subBrokerPerLotAmt" - (${oldBrokeragePerLotAmt}-${brokeragePerLotAmt})`,
        })
        .execute();
    }
  }

  public async updateAllChildsBrokerageSettings({
    childIds,
    exchangeId,
    brokeragePerCroreAmt,
    brokeragePerLotAmt,
    parentUserType,
    userUserType,
    userData,
  }: {
    childIds: number[];
    exchangeId: number;
    brokeragePerCroreAmt: number;
    brokeragePerLotAmt: number;
    parentUserType: 'Broker' | 'Sub-Broker' | 'Master' | 'Company' | string;
    userUserType: 'Broker' | 'Sub-Broker' | 'Master' | 'Company' | string;
    userData: {
      brokeragePerCroreAmt: number;
      brokeragePerLotAmt: number;
      companyPerCroreAmt: number;
      companyPerLotAmt: number;
      masterPerCroreAmt: number;
      masterPerLotAmt: number;
      brokerPerCroreAmt: number;
      brokerPerLotAmt: number;
      subBrokerPerCroreAmt: number;
      subBrokerPerLotAmt: number;
    };
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    }
    if (parentUserType == 'Company' && userUserType == 'Master') {
      this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .set({
          companyPerCroreAmt: brokeragePerCroreAmt,
          companyPerLotAmt: brokeragePerLotAmt,
          masterPerCroreAmt: () =>
            `"masterPerCroreAmt" - (${brokeragePerCroreAmt} - ${userData.brokeragePerCroreAmt})`,
          masterPerLotAmt: () =>
            `"masterPerLotAmt" - (${brokeragePerLotAmt} - ${userData.brokeragePerLotAmt})`,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('brokeragePerCroreAmt >= :brokeragePerCroreAmt', {
          brokeragePerCroreAmt,
        })
        .andWhere('brokeragePerLotAmt >= :brokeragePerLotAmt', {
          brokeragePerLotAmt,
        })
        .execute();
    } else if (parentUserType == 'Master' && userUserType == 'Broker') {
      this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .set({
          masterPerCroreAmt: brokeragePerCroreAmt - userData.companyPerCroreAmt,
          masterPerLotAmt: brokeragePerLotAmt - userData.companyPerLotAmt,
          brokerPerCroreAmt: () =>
            `"brokerPerCroreAmt" - (${brokeragePerCroreAmt} - ${userData.brokeragePerCroreAmt})`,
          brokerPerLotAmt: () =>
            `"brokerPerLotAmt" - (${brokeragePerLotAmt} - ${userData.brokeragePerLotAmt})`,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('brokeragePerCroreAmt >= :brokeragePerCroreAmt', {
          brokeragePerCroreAmt,
        })
        .andWhere('brokeragePerLotAmt >= :brokeragePerLotAmt', {
          brokeragePerLotAmt,
        })
        .execute();
    } else if (parentUserType == 'Broker' && userUserType == 'Sub-Broker') {
      this.tmanager
        .createQueryBuilder()
        .update(m_userbrokeragesetting)
        .set({
          brokerPerCroreAmt:
            brokeragePerCroreAmt -
            userData.companyPerCroreAmt -
            userData.masterPerCroreAmt,
          brokerPerLotAmt:
            brokeragePerLotAmt -
            userData.companyPerLotAmt -
            userData.masterPerLotAmt,
          subBrokerPerCroreAmt: () =>
            `"subBrokerPerCroreAmt" - (${brokeragePerCroreAmt} - ${userData.brokeragePerCroreAmt})`,
          subBrokerPerLotAmt: () =>
            `"subBrokerPerLotAmt" - (${brokeragePerLotAmt} - ${userData.brokeragePerLotAmt})`,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('brokeragePerCroreAmt >= :brokeragePerCroreAmt', {
          brokeragePerCroreAmt,
        })
        .andWhere('brokeragePerLotAmt >= :brokeragePerLotAmt', {
          brokeragePerLotAmt,
        })
        .execute();
    }
  }

  public async updateAllChildsScriptBrokerageSettings({
    childIds,
    exchangeId,
    brokeragePerCroreAmt,
    brokeragePerLotAmt,
    parentUserType,
    userUserType,
    userData,
  }: {
    childIds: number[];
    exchangeId: number;
    brokeragePerCroreAmt: number;
    brokeragePerLotAmt: number;
    parentUserType: 'Broker' | 'Sub-Broker' | 'Master' | 'Company' | string;
    userUserType: 'Broker' | 'Sub-Broker' | 'Master' | 'Company' | string;
    userData: {
      brokeragePerCroreAmt: number;
      brokeragePerLotAmt: number;
      companyPerCroreAmt: number;
      companyPerLotAmt: number;
      masterPerCroreAmt: number;
      masterPerLotAmt: number;
      brokerPerCroreAmt: number;
      brokerPerLotAmt: number;
      subBrokerPerCroreAmt: number;
      subBrokerPerLotAmt: number;
    };
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    }
    if (parentUserType == 'Company' && userUserType == 'Master') {
      this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .set({
          companyPerCroreAmt: brokeragePerCroreAmt,
          companyPerLotAmt: brokeragePerLotAmt,
          masterPerCroreAmt: () =>
            `"masterPerCroreAmt" - (${brokeragePerCroreAmt} - ${userData.brokeragePerCroreAmt})`,
          masterPerLotAmt: () =>
            `"masterPerLotAmt" - (${brokeragePerLotAmt} - ${userData.brokeragePerLotAmt})`,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('brokeragePerCroreAmt >= :brokeragePerCroreAmt', {
          brokeragePerCroreAmt,
        })
        .andWhere('brokeragePerLotAmt >= :brokeragePerLotAmt', {
          brokeragePerLotAmt,
        })
        .execute();
    } else if (parentUserType == 'Master' && userUserType == 'Broker') {
      this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .set({
          masterPerCroreAmt: brokeragePerCroreAmt - userData.companyPerCroreAmt,
          masterPerLotAmt: brokeragePerLotAmt - userData.companyPerLotAmt,
          brokerPerCroreAmt: () =>
            `"brokerPerCroreAmt" - (${brokeragePerCroreAmt} - ${userData.brokeragePerCroreAmt})`,
          brokerPerLotAmt: () =>
            `"brokerPerLotAmt" - (${brokeragePerLotAmt} - ${userData.brokeragePerLotAmt})`,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('brokeragePerCroreAmt >= :brokeragePerCroreAmt', {
          brokeragePerCroreAmt,
        })
        .andWhere('brokeragePerLotAmt >= :brokeragePerLotAmt', {
          brokeragePerLotAmt,
        })
        .execute();
    } else if (parentUserType == 'Broker' && userUserType == 'Sub-Broker') {
      this.tmanager
        .createQueryBuilder()
        .update(m_scriptbrokeragesetting)
        .set({
          brokerPerCroreAmt:
            brokeragePerCroreAmt -
            userData.companyPerCroreAmt -
            userData.masterPerCroreAmt,
          brokerPerLotAmt:
            brokeragePerLotAmt -
            userData.companyPerLotAmt -
            userData.masterPerLotAmt,
          subBrokerPerCroreAmt: () =>
            `"subBrokerPerCroreAmt" - (${brokeragePerCroreAmt} - ${userData.brokeragePerCroreAmt})`,
          subBrokerPerLotAmt: () =>
            `"subBrokerPerLotAmt" - (${brokeragePerLotAmt} - ${userData.brokeragePerLotAmt})`,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .andWhere('exchange.id = :exchangeId', {
          exchangeId,
        })
        .andWhere('brokeragePerCroreAmt >= :brokeragePerCroreAmt', {
          brokeragePerCroreAmt,
        })
        .andWhere('brokeragePerLotAmt >= :brokeragePerLotAmt', {
          brokeragePerLotAmt,
        })
        .execute();
    }
  }

  public async createBrokerageSettings({
    exchangeId,
    brokerageType,
    brokeragePerCroreAmt,
    brokeragePerLotAmt,
    companyPerCroreAmt,
    companyPerLotAmt,
    masterPerCroreAmt,
    masterPerLotAmt,
    brokerPerCroreAmt,
    brokerPerLotAmt,
    subBrokerPerCroreAmt,
    subBrokerPerLotAmt,
  }: {
    exchangeId: number;
    brokerageType: 'crore' | 'lot' | null;
    brokeragePerCroreAmt: number;
    brokeragePerLotAmt: number;
    companyPerCroreAmt: number;
    companyPerLotAmt: number;
    masterPerCroreAmt: number;
    masterPerLotAmt: number;
    brokerPerCroreAmt: number;
    brokerPerLotAmt: number;
    subBrokerPerCroreAmt: number;
    subBrokerPerLotAmt: number;
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    } else {
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userbrokeragesetting)
        .values({
          user: {
            id: this.userId,
          },
          exchange: {
            id: exchangeId,
          },
          brokerageType,
          brokeragePerCroreAmt,
          brokeragePerLotAmt,
          companyPerCroreAmt,
          companyPerLotAmt,
          masterPerCroreAmt,
          masterPerLotAmt,
          brokerPerCroreAmt,
          brokerPerLotAmt,
          subBrokerPerCroreAmt,
          subBrokerPerLotAmt,
        })
        .execute();
    }
  }

  public async createScriptBrokerageSettings(
    data: {
      instrumentName: string;
      exchange: {
        id: number;
      };
      user: {
        id: number;
      };
      brokerageType: string | null;
      brokeragePerCroreAmt: number;
      brokeragePerLotAmt: number;
      companyPerCroreAmt: number;
      companyPerLotAmt: number;
      masterPerCroreAmt: number;
      masterPerLotAmt: number;
      brokerPerCroreAmt: number;
      brokerPerLotAmt: number;
      subBrokerPerCroreAmt: number;
      subBrokerPerLotAmt: number;
    }[]
  ) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    } else {
      // console.log('data is ', data);
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_scriptbrokeragesetting)
        .values(
          data.map((d) => {
            return {
              ...d,
            };
          })
        )
        .execute();
    }
  }

  public async updateBrokerageSharing({
    userType,
    parentType,
    prevData,
    newData,
    exchangeId,
    childIds,
  }: {
    userType: string;
    parentType: string;
    prevData: {
      companyPerCroreAmt: number;
      companyPerLotAmt: number;
      masterPerCroreAmt: number;
      masterPerLotAmt: number;
      brokerPerCroreAmt: number;
      brokerPerLotAmt: number;
      subBrokerPerCroreAmt: number;
      subBrokerPerLotAmt: number;
      thirdpartyPerCroreAmt: number;
      thirdpartyPerLotAmt: number;
    };
    newData: {
      brokerageType: string;
      upline: number;
      self: number;
      master: number;
      broker: number;
      subbroker: number;
      thirdparty: number;
    };
    exchangeId: number;
    childIds: number[];
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction Manager is not initialized');
    }
    if (parentType == 'Company' && userType == 'Broker') {
      if (newData.brokerageType == 'crore') {
        if (
          newData.self + newData.master !=
          prevData.companyPerCroreAmt + prevData.masterPerCroreAmt
        ) {
          throw new Error('Sharing is not equal to parent sharing');
        }
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            companyPerCroreAmt: newData.self,
            masterPerCroreAmt: newData.master,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
            companyPerCroreAmt: prevData.companyPerCroreAmt,
            masterPerCroreAmt: prevData.masterPerCroreAmt,
          })
          .execute();
      } else if (newData.brokerageType == 'lot') {
        if (
          newData.self + newData.master !=
          prevData.companyPerLotAmt + prevData.masterPerLotAmt
        ) {
          throw new Error('Sharing is not equal to parent sharing');
        }
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            companyPerLotAmt: newData.self,
            masterPerLotAmt: newData.master,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
            companyPerLotAmt: prevData.companyPerLotAmt,
            masterPerLotAmt: prevData.masterPerLotAmt,
          })
          .execute();
      }
    } else if (parentType == 'Company' && userType == 'Sub-Broker') {
      if (newData.brokerageType == 'crore') {
        if (
          newData.self + newData.master + newData.broker !=
          prevData.companyPerCroreAmt +
            prevData.masterPerCroreAmt +
            prevData.brokerPerCroreAmt
        ) {
          throw new Error('Sharing is not equal to parent sharing');
        }
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            companyPerCroreAmt: newData.self,
            masterPerCroreAmt: newData.master,
            brokerPerCroreAmt: newData.broker,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
            companyPerCroreAmt: prevData.companyPerCroreAmt,
            masterPerCroreAmt: prevData.masterPerCroreAmt,
            brokerPerCroreAmt: prevData.brokerPerCroreAmt,
          })
          .execute();
      } else if (newData.brokerageType == 'lot') {
        if (
          newData.self + newData.master + newData.broker !=
          prevData.companyPerLotAmt +
            prevData.masterPerLotAmt +
            prevData.brokerPerLotAmt
        ) {
          throw new Error('Sharing is not equal to parent sharing');
        }
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            companyPerLotAmt: newData.self,
            masterPerLotAmt: newData.master,
            brokerPerLotAmt: newData.broker,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
            companyPerLotAmt: prevData.companyPerLotAmt,
            masterPerLotAmt: prevData.masterPerLotAmt,
            brokerPerLotAmt: prevData.brokerPerLotAmt,
          })
          .execute();
      }
    } else if (parentType == 'Company' && userType == 'Client') {
      if (newData.brokerageType == 'crore') {
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            companyPerCroreAmt: newData.self,
            masterPerCroreAmt: newData.master,
            brokerPerCroreAmt: newData.broker,
            subBrokerPerCroreAmt: newData.subbroker,
            thirdpartyPerCroreAmt: newData.thirdparty,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
          })
          .execute();
      } else if (newData.brokerageType == 'lot') {
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            companyPerLotAmt: newData.self,
            masterPerLotAmt: newData.master,
            brokerPerLotAmt: newData.broker,
            subBrokerPerLotAmt: newData.subbroker,
            thirdpartyPerLotAmt: newData.thirdparty,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
          })
          .execute();
      }
    } else if (parentType == 'Master' && userType == 'Sub-Broker') {
      if (newData.brokerageType == 'crore') {
        if (
          newData.self + newData.broker !=
          prevData.masterPerCroreAmt + prevData.brokerPerCroreAmt
        ) {
          throw new Error('Sharing is not equal to parent sharing');
        }
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            masterPerCroreAmt: newData.self,
            brokerPerCroreAmt: newData.broker,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
            masterPerCroreAmt: prevData.masterPerCroreAmt,
            brokerPerCroreAmt: prevData.brokerPerCroreAmt,
          })
          .execute();
      } else if (newData.brokerageType == 'lot') {
        if (
          newData.self + newData.broker !=
          prevData.masterPerLotAmt + prevData.brokerPerLotAmt
        ) {
          throw new Error('Sharing is not equal to parent sharing');
        }
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            masterPerLotAmt: newData.self,
            brokerPerLotAmt: newData.broker,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
            masterPerLotAmt: prevData.masterPerLotAmt,
            brokerPerLotAmt: prevData.brokerPerLotAmt,
          })
          .execute();
      }
    } else if (parentType == 'Master' && userType == 'Client') {
      if (newData.brokerageType == 'crore') {
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            masterPerLotAmt: newData.self,
            brokerPerLotAmt: newData.broker,
            subBrokerPerLotAmt: newData.subbroker,
            thirdpartyPerLotAmt: newData.thirdparty,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
          })
          .execute();
      } else if (newData.brokerageType == 'lot') {
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            masterPerLotAmt: newData.self,
            brokerPerLotAmt: newData.broker,
            subBrokerPerLotAmt: newData.subbroker,
            thirdpartyPerLotAmt: newData.thirdparty,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
          })
          .execute();
      }
    } else if (parentType == 'Broker' && userType == 'Client') {
      if (newData.brokerageType == 'crore') {
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            brokerPerLotAmt: newData.self,
            subBrokerPerLotAmt: newData.subbroker,
            thirdpartyPerLotAmt: newData.thirdparty,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
          })
          .execute();
      } else if (newData.brokerageType == 'lot') {
        this.tmanager
          .createQueryBuilder()
          .update(m_userbrokeragesetting)
          .set({
            brokerPerLotAmt: newData.self,
            subBrokerPerLotAmt: newData.subbroker,
            thirdpartyPerLotAmt: newData.thirdparty,
          })
          .where({
            user: {
              id: In(childIds),
            },
            exchange: {
              id: exchangeId,
            },
          })
          .execute();
      }
    } else {
      throw new Error('Invalid parent type and user type combination');
    }
  }
}
export default BrokerageSettings;
