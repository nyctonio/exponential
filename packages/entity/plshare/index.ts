import { m_userplsharing, m_user } from 'database/sql/schema';
import { EntityManager, In } from 'typeorm';

class PlShare {
  userId: number = null;
  plshare_data: m_userplsharing[] = null;
  tmanager: EntityManager = null;

  constructor({ userId }: { userId: number }) {
    this.userId = userId;
  }

  setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  async setUserId({ username }: { username: string }) {
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

  async getPlShareData() {
    if (this.plshare_data == null) {
      let plShareData = await m_userplsharing.find({
        where: {
          user: {
            id: this.userId,
          },
        },
        relations: ['exchange'],
      });
      this.plshare_data = plShareData;
    }
    return this.plshare_data;
  }

  async getPlShareDataByExchange(exchangeId: number) {
    if (this.plshare_data == null) {
      let plShareData = await m_userplsharing.find({
        where: {
          user: {
            id: this.userId,
          },
          exchange: {
            id: exchangeId,
          },
        },
        relations: ['exchange'],
      });
      return plShareData;
    } else {
      return this.plshare_data.filter((data) => {
        return data.exchange.id == exchangeId;
      });
    }
  }

  async getMinChildPlShare({
    exchangeId,
    userType,
    childIds,
  }: {
    exchangeId: number;
    userType: string;
    childIds: number[];
  }): Promise<number> {
    if (this.tmanager == null) {
      throw new Error('Transaction Manager is not initialized');
    }
    let orderBy = {};
    if (userType == 'Master') {
      orderBy['masterSharing'] = 'ASC';
    } else if (userType == 'Broker') {
      orderBy['brokerSharing'] = 'ASC';
    } else if (userType == 'Sub-Broker') {
      orderBy['subbrokerSharing'] = 'ASC';
    }
    const data = await this.tmanager.find(m_userplsharing, {
      where: {
        user: {
          id: In(childIds),
        },
        exchange: {
          id: exchangeId,
        },
      },
      order: {
        ...orderBy,
      },
      take: 1,
    });
    if (data.length == 0) {
      return null;
    }
    if (userType == 'Master') {
      return data[0].masterSharing;
    } else if (userType == 'Broker') {
      return data[0].brokerSharing;
    } else if (userType == 'Sub-Broker') {
      return data[0].subbrokerSharing;
    } else {
      return null;
    }
  }

  async updateAllChildsPlShare({
    prevSharing,
    newSharing,
    userType,
    parentType,
    Ids,
    exchangeId,
  }: {
    prevSharing: number;
    newSharing: number;
    userType: string;
    parentType: string;
    Ids: number[];
    exchangeId: number;
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction Manager is not initialized');
    }
    if (userType == 'Master' && parentType == 'Company') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          companySharing: newSharing,
          masterSharing: () => `masterSharing - ${newSharing - prevSharing}`,
        })
        .where({
          user: {
            id: In(Ids),
          },
          exchange: {
            id: exchangeId,
          },
          companySharing: prevSharing,
        })
        .execute();
    } else if (userType == 'Broker' && parentType == 'Master') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          masterSharing: newSharing,
          brokerSharing: () => `brokerSharing - ${newSharing - prevSharing}`,
        })
        .where({
          user: {
            id: In(Ids),
          },
          exchange: {
            id: exchangeId,
          },
          masterSharing: prevSharing,
        })
        .execute();
    } else if (userType == 'Sub-Broker' && parentType == 'Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          brokerSharing: newSharing,
          subbrokerSharing: () =>
            `subbrokerSharing - ${newSharing - prevSharing}`,
        })
        .where({
          user: {
            id: In(Ids),
          },
          exchange: {
            id: exchangeId,
          },
          brokerSharing: prevSharing,
        })
        .execute();
    }
  }

  async updatePlShare({
    id,
    userType,
    parentType,
    plShare,
  }: {
    id: number;
    userType: string;
    parentType: string;
    plShare: number;
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction Manager is not initialized');
    }
    if (userType == 'Master' && parentType == 'Company') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          companySharing: plShare,
        })
        .where({
          id: id,
        })
        .execute();
    } else if (userType == 'Broker' && parentType == 'Master') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          masterSharing: plShare,
        })
        .where({
          id: id,
        })
        .execute();
    } else if (userType == 'Sub-Broker' && parentType == 'Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          brokerSharing: plShare,
        })
        .where({
          id: id,
        })
        .execute();
    }
  }

  async createPlShare({
    exchangeId,
    parentType,
    userType,
    plShare,
    parentSharing,
  }: {
    exchangeId: number;
    parentType: string;
    userType: string;
    plShare: number;
    parentSharing: {
      companySharing: number;
      masterSharing: number;
      brokerSharing: number;
      subbrokerSharing: number;
    };
  }) {
    if (this.tmanager == null) {
      throw new Error('Transaction Manager is not initialized');
    }
    if (parentType == 'Company' && userType == 'Master') {
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: plShare,
        })
        .execute();
    } else if (parentType == 'Master' && userType == 'Broker') {
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: parentSharing.companySharing,
          masterSharing: plShare,
        })
        .execute();
    } else if (parentType == 'Broker' && userType == 'Sub-Broker') {
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: parentSharing.companySharing,
          masterSharing: parentSharing.masterSharing,
          brokerSharing: plShare,
        })
        .execute();
    } else if (parentType == 'Company' && userType == 'Client') {
      if (plShare != 100) {
        throw new Error('Sharing Should be 100%');
      }
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: plShare,
        })
        .execute();
    } else if (parentType == 'Master' && userType == 'Client') {
      if (plShare + parentSharing.companySharing != 100) {
        throw new Error('Sharing Should be 100%');
      }
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: parentSharing.companySharing,
          masterSharing: plShare,
        })
        .execute();
    } else if (parentType == 'Broker' && userType == 'Client') {
      if (
        plShare + parentSharing.companySharing + parentSharing.masterSharing !=
        100
      ) {
        throw new Error('Sharing Should be 100%');
      }
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: parentSharing.companySharing,
          masterSharing: parentSharing.masterSharing,
          brokerSharing: plShare,
        })
        .execute();
    } else if (parentType == 'Sub-Broker' && userType == 'Client') {
      if (
        plShare +
          parentSharing.companySharing +
          parentSharing.masterSharing +
          parentSharing.brokerSharing !=
        100
      ) {
        throw new Error('Sharing Should be 100%');
      }
      await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_userplsharing)
        .values({
          exchange: {
            id: exchangeId,
          },
          user: {
            id: this.userId,
          },
          companySharing: parentSharing.companySharing,
          masterSharing: parentSharing.masterSharing,
          brokerSharing: parentSharing.brokerSharing,
          subbrokerSharing: plShare,
        })
        .execute();
    } else {
      throw new Error('Invalid parent type and user type combination');
    }
  }

  // For Changing PL Share (Not For Update)
  async updatePlSharing({
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
      companySharing: number;
      masterSharing: number;
      brokerSharing: number;
      subbrokerSharing: number;
      thirdpartySharing: number;
    };
    newData: {
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
      if (
        newData.self + newData.master !=
        prevData.companySharing + prevData.masterSharing
      ) {
        throw new Error('Sharing is not equal to parent sharing');
      }
      this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          companySharing: newData.self,
          masterSharing: newData.master,
        })
        .where({
          user: {
            id: In(childIds),
          },
          exchange: {
            id: exchangeId,
          },
          companySharing: prevData.companySharing,
          masterSharing: prevData.masterSharing,
        })
        .execute();
    } else if (parentType == 'Company' && userType == 'Sub-Broker') {
      if (
        newData.self + newData.master + newData.broker !=
        prevData.companySharing +
          prevData.masterSharing +
          prevData.brokerSharing
      ) {
        throw new Error('Sharing is not equal to parent sharing');
      }
      this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          companySharing: newData.self,
          masterSharing: newData.master,
          brokerSharing: newData.broker,
        })
        .where({
          user: {
            id: In(childIds),
          },
          exchange: {
            id: exchangeId,
          },
          companySharing: prevData.companySharing,
          masterSharing: prevData.masterSharing,
          brokerSharing: prevData.brokerSharing,
        })
        .execute();
    } else if (parentType == 'Company' && userType == 'Client') {
      this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          companySharing: newData.self,
          masterSharing: newData.master,
          brokerSharing: newData.broker,
          subbrokerSharing: newData.subbroker,
          thirdpartySharing: newData.thirdparty,
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
    } else if (parentType == 'Master' && userType == 'Sub-Broker') {
      if (
        newData.self + newData.broker !=
        prevData.masterSharing + prevData.brokerSharing
      ) {
        throw new Error('Sharing is not equal to parent sharing');
      }
      this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          masterSharing: newData.self,
          brokerSharing: newData.broker,
        })
        .where({
          user: {
            id: In(childIds),
          },
          exchange: {
            id: exchangeId,
          },
          masterSharing: prevData.masterSharing,
          brokerSharing: prevData.brokerSharing,
        })
        .execute();
    } else if (parentType == 'Master' && userType == 'Client') {
      this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          masterSharing: newData.self,
          brokerSharing: newData.broker,
          subbrokerSharing: newData.subbroker,
          thirdpartySharing: newData.thirdparty,
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
    } else if (parentType == 'Broker' && userType == 'Client') {
      this.tmanager
        .createQueryBuilder()
        .update(m_userplsharing)
        .set({
          brokerSharing: newData.self,
          subbrokerSharing: newData.subbroker,
          thirdpartySharing: newData.thirdparty,
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
    } else {
      throw new Error('Invalid parent type and user type combination');
    }
  }
}

export default PlShare;
