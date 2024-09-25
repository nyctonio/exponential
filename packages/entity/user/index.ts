import {
  m_contact,
  m_exchangesetting,
  m_intradaytrademarginsetting,
  m_scriptquantity,
  m_trademarginsetting,
  m_user,
  m_userbrokeragesetting,
  t_userlogin,
  t_userstatuslogs,
  t_usertransactionledger,
} from 'database/sql/schema';
import { lookup } from 'fast-geoip';
import { EntityManager, ILike, In } from 'typeorm';
import moment from 'moment';
import { CREATE, GET, UPDATE } from './methods';

class User {
  user_data: m_user = null;
  userId: number = null;
  userName: string = null;
  tmanager: EntityManager = null;
  public get: GET;
  private create: CREATE;
  public update: UPDATE;
  constructor({ userId, userName }: { userId?: number; userName?: string }) {
    this.userId = userId;
    this.userName = userName;
    this.get = new GET({ userId: this.userId, userName: this.userName });
    this.create = new CREATE({ userId: this.userId, userName: this.userName });
    this.update = new UPDATE({ userId: this.userId, userName: this.userName });
  }

  async setUserId({ userName }: { userName: string }) {
    let userData = await m_user.findOne({
      where: { username: ILike(userName) },
      select: { id: true },
    });
    if (!userData) {
      throw new Error('User not found');
    }
    this.userId = userData.id;
    this.userName = userName;
    this.get = new GET({ userId: this.userId, userName: this.userName });
    this.create = new CREATE({ userId: this.userId, userName: this.userName });
    this.update = new UPDATE({ userId: this.userId, userName: this.userName });
  }

  async setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
    this.update.setTransactionManager(this.tmanager);
    this.create.setTransactionManager(this.tmanager);
  }

  async getUserData(
    relations: {
      userType?: boolean;
      tradeSquareOffLimit?: boolean;
      createdByUser?: boolean;
      company?: boolean;
      broker?: boolean;
      subBroker?: boolean;
      master?: boolean;
    } = {
      userType: false,
      tradeSquareOffLimit: false,
      createdByUser: false,
      company: false,
      broker: false,
      subBroker: false,
      master: false,
    }
  ): Promise<m_user> {
    return await this.get.getUserData(relations);
  }

  async getParentUser() {
    let userData = await this.getUserData({
      createdByUser: true,
    });
    if (userData.createdByUser == null) {
      return null;
    }
    return new User({ userId: userData.createdByUser.id });
  }

  async getIsIntradayAllowed() {
    let userData = await this.getUserData();
    return userData.isIntradayAllowed;
  }

  async updateIsIntradayAllowed(isIntradayAllowed: boolean) {
    let userData = await this.getUserData();
    if (!this.tmanager) {
      await m_user.update(
        { id: userData.id },
        { isIntradayAllowed: isIntradayAllowed }
      );
    } else {
      await this.tmanager.update(
        m_user,
        { id: this.userId },
        { isIntradayAllowed: isIntradayAllowed }
      );
    }
  }

  async getLoginHistory({
    userId,
    pageNumber,
  }: {
    userId: number;
    pageNumber: number;
  }) {
    return await this.get.getLoginHistory({
      userId,
      pageNumber,
    });
  }

  async getAssociatedUsers(searchText: string) {
    return await this.get.getAssociatedUsers(searchText);
  }

  async getUserCompleteInfo() {
    return await this.get.getUserCompleteInfo();
  }

  async getUsernameAvailability() {
    return await this.get.getUsernameAvailability();
  }

  async getAllChildUsers() {
    return await this.get.getAllChildUsers();
  }

  // async getAllChildUsersArray() {
  //   return await this.get.getAllChildUsersArray();
  // }

  async updateLoginAttemptCount(reset = false) {
    let userData = await this.getUserData();
    return await this.update.updateLoginAttemptCount(reset, userData);
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
    validTillDate?: Date | null;
    maxLossCap?: number;
    onlySquareOff?: boolean;
    updatedBy?: number;
  }) {
    return await this.update.updateUserDetails(data);
  }

  async updateChildIdsFlags(
    {
      childIds,
      smSquareOff,
      m2mSquareOff,
      onlySquareOff,
    }: {
      childIds: number[];
      smSquareOff?: boolean | null;
      m2mSquareOff?: boolean | null;
      onlySquareOff?: boolean | null;
    } = {
      childIds: [],
      m2mSquareOff: null,
      onlySquareOff: null,
      smSquareOff: null,
    }
  ) {
    console.log('in function');
    let dataToUpdate = {};
    if (smSquareOff != null) {
      dataToUpdate['shortMarginSquareOff'] = smSquareOff;
    }
    if (m2mSquareOff != null) {
      dataToUpdate['m2mSquareOff'] = m2mSquareOff;
    }
    if (onlySquareOff != null) {
      dataToUpdate['onlySquareOff'] = onlySquareOff;
    }
    await m_user.update({ id: In(childIds) }, { ...dataToUpdate });
    return;
  }

  async updateUserStatus(
    updatedStatus: number,
    lastStatus: number,
    currUserId: number,
    remarks: string
  ) {
    return await this.update.updateUserStatus(
      updatedStatus,
      lastStatus,
      currUserId,
      remarks
    );
  }

  async passwordUpdate(password: string) {
    let userData = await this.getUserData();
    await m_user.update(
      { id: userData.id },
      { resetRequired: false, password }
    );
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
    return await this.update.updateDownlineStatus({
      updatedStatus,
      brokerId,
      subBrokerId,
      masterId,
    });
  }

  async createUserLoginLog(ip: string) {
    let locationData = await lookup(ip);
    let userData = await this.getUserData();
    const newLoginLog: any = new t_userlogin();
    newLoginLog.user = { id: userData.id };
    newLoginLog.ipAddress = ip;
    newLoginLog.locationMetadata = locationData || {};
    newLoginLog.deviceMetadata = {};
    await newLoginLog.save();
    return;
  }

  async createTransaction({
    amount,
    currUserId,
    remarks,
    transactionParticularId,
    transactionTypeId,
  }: {
    amount: number;
    transactionParticularId: number;
    transactionTypeId: number;
    remarks: string;
    currUserId: number;
  }) {
    return await t_usertransactionledger.insert({
      transactionAmount: amount,
      transactionParticular: {
        id: transactionParticularId,
      },
      transactionType: {
        id: transactionTypeId,
      },
      transactionRemarks: remarks,
      user: {
        id: this.userId,
      },
      createdBy: {
        id: currUserId,
      },
      updatedBy: {
        id: currUserId,
      },
      transactionDate: moment().toDate(),
    });
  }

  async getAllowedExchanges() {
    if (this.userId) {
      let exchange = await m_exchangesetting.find({
        where: { user: { id: this.userId }, isExchangeActive: true },
        relations: {
          exchange: true,
        },
        select: {
          exchange: {
            exchangeName: true,
            id: true,
          },
          id: true,
        },
      });

      return {
        status: true,
        data: {
          exchange,
        },
      };
    }
    let userCheck = await m_user.findOne({
      where: { username: this.userName },
      relations: { userType: true },
      select: { id: true },
    });
    if (!userCheck) {
      return { status: false };
    }
    let exchange = await m_exchangesetting.find({
      where: { user: { id: userCheck.id }, isExchangeActive: true },
      relations: {
        exchange: true,
      },
      select: {
        exchange: {
          exchangeName: true,
          id: true,
        },
        id: true,
      },
    });

    return {
      status: true,
      data: {
        exchange,
        userId: userCheck.id,
        userType: userCheck.userType.prjSettConstant,
      },
    };
  }

  async userContact(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    userId: number;
  }) {
    let { name, email, phone, subject, message } = data;
    let res = await m_contact.insert({
      name,
      email,
      phone,
      subject,
      message,
      user: {
        id: this.userId,
      },
    });
    return res;
  }

  async updateFcmToken(userId: number, deviceToken: string) {
    await m_user.update({ id: userId }, { deviceToken: deviceToken });
  }

  //bulk user functions for settlement

  async getAllClients() {
    return await m_user
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userType', 'userType')
      .where('userType.prjSettConstant = :userType', { userType: 'Client' })
      .select(['user.id', 'user.username'])
      .getMany();
  }

  async getAllClientsWithHierarchy() {
    let userData = await m_user.find({
      where: { userType: { prjSettConstant: 'Client' } },
      relations: { broker: true, subBroker: true, master: true, company: true },
      select: {
        broker: {
          id: true,
          username: true,
        },
        master: {
          id: true,
          username: true,
        },
        subBroker: {
          id: true,
          username: true,
        },
        company: {
          id: true,
          username: true,
        },
      },
    });

    return userData;
  }
}

export default User;
