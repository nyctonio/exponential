import { m_rent, m_rentsharing, m_user } from 'database/sql/schema';
import { EntityManager } from 'typeorm';

class Rent {
  user_id: number;
  tmanager: EntityManager;
  constructor(userId: number) {
    this.user_id = userId;
  }

  setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  async getRentSharingData() {
    const condition = { where: { user: { id: this.user_id } } };
    if (this.tmanager) {
      return await this.tmanager.findOne(m_rentsharing, condition);
    }
    return await m_rentsharing.findOne(condition);
  }

  async getRentData() {
    const condition = { where: { user: { id: this.user_id } } };
    if (this.tmanager) {
      return await this.tmanager.findOne(m_rent, condition);
    }
    return await m_rent.findOne(condition);
  }

  async updateUserRent({
    rentDiff, // rentDiff = newRent - oldRent
    rentAmount, // newRent
    rentRemarks,
    childIds,
    parentType,
    userType,
  }) {
    console.log('updateRent', {
      rentDiff,
      rentAmount,
      rentRemarks,
      parentType,
      userType,
    });
    if (!this.tmanager) {
      throw new Error('Transaction Manager not set');
    }
    if (parentType == 'Company') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .where({ user: { id: this.user_id } })
        .set({
          totalRent: rentAmount,
          companySharing: () => `
            CASE
              WHEN "companySharing" + (${rentDiff}) < 0 THEN 0
              ELSE "companySharing" + (${rentDiff})
            END`,
          rentRemarks,
        })
        .execute();
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .set({
          totalRent: () => `
          CASE
            WHEN "masterSharing" - (${rentDiff}) >= 0
            THEN "totalRent"
            ELSE "totalRent" + (${rentDiff} - "masterSharing")
          END
          `,
          companySharing: () => `
          CASE
            WHEN "companySharing" + (${rentDiff}) < 0 THEN 0
            ELSE "companySharing" + (${rentDiff})
          END
          `,
          masterSharing: () => `
          CASE
            WHEN "masterSharing" - (${rentDiff}) < 0 THEN 0
            ELSE "masterSharing" - (${rentDiff})
          END
          `,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .execute();
    } else if (parentType == 'Master') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .where({ user: { id: this.user_id } })
        .set({
          totalRent: rentAmount,
          masterSharing: () => `
            CASE
              WHEN "masterSharing" + (${rentDiff}) < 0 THEN 0
              ELSE "masterSharing" + (${rentDiff})
            END`,
          rentRemarks,
        })
        .execute();
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .set({
          totalRent: () => `
          CASE
            WHEN "brokerSharing" - (${rentDiff}) >= 0
            THEN "totalRent"
            ELSE "totalRent" + (${rentDiff} - "brokerSharing")
          END
          `,
          masterSharing: () => `
          CASE
            WHEN "masterSharing" + (${rentDiff}) < 0 THEN 0
            ELSE "masterSharing" + (${rentDiff})
          END
          `,
          brokerSharing: () => `
          CASE
            WHEN "brokerSharing" - (${rentDiff}) < 0 THEN 0
            ELSE "brokerSharing" - (${rentDiff})
          END
          `,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .execute();
    } else if (parentType == 'Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .where({ user: { id: this.user_id } })
        .set({
          totalRent: rentAmount,
          brokerSharing: () => `
            CASE
              WHEN "brokerSharing" + (${rentDiff}) < 0 THEN 0
              ELSE "brokerSharing" + (${rentDiff})
            END`,
          rentRemarks,
        })
        .execute();
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .set({
          totalRent: () => `
          CASE
            WHEN "subbrokerSharing" - (${rentDiff}) >= 0
            THEN "totalRent"
            ELSE "totalRent" + (${rentDiff} - "subbrokerSharing")
          END
          `,
          brokerSharing: () => `
          CASE
            WHEN "brokerSharing" + (${rentDiff}) < 0 THEN 0
            ELSE "brokerSharing" + (${rentDiff})
          END
          `,
          subbrokerSharing: () => `
          CASE
            WHEN "subbrokerSharing" - (${rentDiff}) < 0 THEN 0
            ELSE "subbrokerSharing" - (${rentDiff})
          END
          `,
        })
        .where('user.id IN (:...childIds)', { childIds })
        .execute();
    } else if (parentType == 'Sub-Broker') {
      await this.tmanager
        .createQueryBuilder()
        .update(m_rent)
        .where({ user: { id: this.user_id } })
        .set({
          totalRent: rentAmount,
          subbrokerSharing: () => `
            CASE
              WHEN "subbrokerSharing" + (${rentDiff}) < 0 THEN 0
              ELSE "subbrokerSharing" + (${rentDiff})
            END`,
          rentRemarks,
        })
        .execute();
    } else {
      throw new Error('Invalid parent');
    }
  }

  async setOrUpdateRentSharingData({}) {}
}

export default Rent;
