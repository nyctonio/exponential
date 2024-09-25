import {
  m_exchangesetting,
  m_intradaytrademarginsetting,
  m_scriptquantity,
  m_trademarginsetting,
  m_user,
  m_userbrokeragesetting,
  m_userfunctionmapping,
  t_userlogin,
  t_userstatuslogs,
  t_usertransactionledger,
} from 'database/sql/schema';
import moment from 'moment';
import { EntityManager, ILike, In } from 'typeorm';

export class UPDATE {
  user_data: m_user = null;
  userId: number = null;
  userName: string = null;
  tmanager: EntityManager = null;
  constructor({ userId, userName }: { userId?: number; userName?: string }) {
    this.userId = userId;
    this.userName = userName;
  }

  async setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  async updateLoginAttemptCount(reset = false, userData) {
    if (reset == false) {
      await m_user.update(
        { id: userData.id },
        { noOfLoginAttempts: userData.noOfLoginAttempts + 1 }
      );
    } else {
      await m_user.update({ id: userData.id }, { noOfLoginAttempts: 0 });
    }
    return;
  }

  async updateUserDetails(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    city?: number;
    tradeSquareOffLimit?: number;
    m2mSquareOff?: boolean;
    m2mSquareOffLimit?: number;
    shortMarginSquareOff?: boolean;
    tradeAllowedinQty?: boolean;
    validTillDate?: Date;
    maxLossCap?: number;
    onlySquareOff?: boolean;
    updatedBy?: number;
  }) {
    const setter = Object.keys(data).reduce((acc, key) => {
      if (data[key] != null) {
        if (key == 'city') {
          acc[key] = { id: data[key] };
        } else if (key == 'tradeSquareOffLimit') {
          acc[key] = { id: data[key] };
        } else if (key == 'updatedBy') {
          acc[key] = { id: data[key] };
        } else if (key == 'validTillDate') {
          acc[key] = (data[key] && moment(data[key]).toDate()) || null;
        } else {
          acc[key] = data[key];
        }
      }
      return acc;
    }, {});
    if (this.tmanager == null) {
      await m_user.update(
        { id: this.userId },
        {
          ...setter,
          updatedAt: moment().toDate(),
        }
      );
    } else {
      await this.tmanager.update(
        m_user,
        { id: this.userId },
        {
          ...setter,
          updatedAt: moment().toDate(),
        }
      );
    }
  }

  async updateUserStatus(
    updatedStatus: number,
    lastStatus: number,
    currUserId: number,
    remarks: string
  ) {
    await m_user.update(
      { id: this.userId },
      { userStatus: { id: updatedStatus } }
    );

    await t_userstatuslogs.insert({
      updatedStatus: { id: updatedStatus },
      lastStatus: { id: lastStatus },
      user: { id: this.userId },
      createdBy: { id: currUserId },
      remarks,
    });
    return;
  }

  async updateDownlineStatus({
    updatedStatus,
    brokerId,
    subBrokerId,
    masterId,
  }: {
    updatedStatus: number;
    brokerId: number | null;
    subBrokerId: number | null;
    masterId: number | null;
  }) {
    if (brokerId) {
      await m_user.update(
        { broker: { id: brokerId } },
        { userStatus: { id: updatedStatus } }
      );
    }

    if (masterId) {
      await m_user.update(
        { master: { id: masterId } },
        { userStatus: { id: updatedStatus } }
      );
    }

    if (subBrokerId) {
      await m_user.update(
        { subBroker: { id: subBrokerId } },
        { userStatus: { id: updatedStatus } }
      );
    }

    return;
  }

  async updateUserAccess(funcIds: number[], value: boolean) {
    await m_userfunctionmapping.update(
      { id: In(funcIds) },
      { isAccess: value }
    );
    return;
  }
}
