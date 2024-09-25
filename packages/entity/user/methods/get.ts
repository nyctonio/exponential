import {
  m_exchangesetting,
  m_intradaytrademarginsetting,
  m_rent,
  m_scriptquantity,
  m_trademarginsetting,
  m_user,
  m_userbrokeragesetting,
  m_usercreationcount,
  m_userfunctionmapping,
  m_userplsharing,
  t_userlogin,
  t_userstatuslogs,
  t_usertransactionledger,
} from 'database/sql/schema';
import { EntityManager, ILike, In } from 'typeorm';

export class GET {
  user_data: m_user = null;
  userId: number = null;
  userName: string = null;
  constructor({ userId, userName }: { userId?: number; userName?: string }) {
    this.userId = userId;
    this.userName = userName;
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
    if (
      relations.userType == true ||
      relations.tradeSquareOffLimit == true ||
      relations.createdByUser == true
    ) {
      // fresh search
      this.user_data = null;
    }
    if (this.user_data == null) {
      if (this.userId != null) {
        this.user_data = await m_user.findOne({
          where: {
            id: this.userId,
          },
          relations,
        });
      } else if (this.userName != null) {
        this.user_data = await m_user.findOne({
          where: {
            username: this.userName,
          },
          relations,
        });
      } else {
        throw new Error('Cannot get user data');
      }
    }
    return this.user_data;
  }

  async getAssociatedUsers(searchText: string) {
    let currUser = await this.getUserData({ userType: true });
    let query = {};
    switch (currUser.userType.prjSettConstant) {
      case 'Company':
        query['company'] = {
          id: currUser.id,
        };
        break;
      case 'Master':
        query['master'] = {
          id: currUser.id,
        };
        break;
      case 'Broker':
        query['broker'] = {
          id: currUser.id,
        };
        break;
    }
    if (searchText.length > 0) {
      query['username'] = ILike(`%${searchText}%`);
    }
    console.log('query is ', query);
    let userData = await m_user.find({
      where: { ...query },
      select: {
        username: true,
        id: true,
        userType: {
          prjSettConstant: true,
        },
      },
      relations: {
        userType: true,
      },
      take: 20,
    });
    return userData.map((user) => {
      return {
        username: user.username,
        id: user.id,
        userType: user.userType.prjSettConstant,
      };
    });
  }

  async getUserCompleteInfo() {
    const [
      userData,
      exchangeSettings,
      brokerageSettings,
      tradeMarginSettings,
      intradayMarginSettings,
      plShareSettings,
      creditDetails,
      rentData,
      userCreationCount,
    ] = await Promise.all([
      m_user.findOne({
        where: { id: this.userId },
        relations: {
          tradeSquareOffLimit: true,
          userType: true,
          createdByUser: true,
          city: true,
        },
      }),
      m_exchangesetting.find({
        where: { user: { id: this.userId } },
        relations: { exchange: true },
        select: { exchange: { exchangeName: true, id: true } },
      }),
      m_userbrokeragesetting.find({
        where: { user: { id: this.userId } },
        relations: { exchange: true },
        select: { exchange: { exchangeName: true, id: true } },
      }),
      m_trademarginsetting.find({
        where: { user: { id: this.userId } },
        relations: { exchange: true },
        select: { exchange: { exchangeName: true, id: true } },
      }),
      m_intradaytrademarginsetting.find({
        where: { user: { id: this.userId } },
        relations: { exchange: true },
        select: { exchange: { exchangeName: true, id: true } },
      }),
      m_userplsharing.find({
        where: { user: { id: this.userId } },
        relations: { exchange: true },
        select: { exchange: { exchangeName: true, id: true } },
      }),
      t_usertransactionledger.findOne({
        where: { user: { id: this.userId } },
      }),
      m_rent.findOne({
        where: { user: { id: this.userId } },
      }),
      m_usercreationcount.findOne({ where: { user: { id: this.userId } } }),
    ]);

    return {
      userData,
      exchangeSettings,
      brokerageSettings,
      intradayMarginSettings,
      tradeMarginSettings,
      creditDetails,
      plShareSettings,
      rentData,
      userCreationCount,
    };
  }

  async getUsernameAvailability() {
    let checkUser = await m_user.findOne({
      where: { username: this.userName },
      select: ['id'],
    });
    if (checkUser) {
      return false;
    }
    return true;
  }

  async getLoginHistory({
    userId,
    pageNumber,
  }: {
    userId: number;
    pageNumber: number;
  }) {
    let [history, count] = await t_userlogin.findAndCount({
      where: {
        user: {
          id: userId,
        },
      },
      skip: (pageNumber - 1) * 5,
      take: 5,
    });

    return { history, count };
  }

  async getAllChildUsers() {
    let userData = await m_user.find({
      where: [
        { createdByUser: { id: this.userId } },
        { subBroker: { id: this.userId } },
        { broker: { id: this.userId } },
        { master: { id: this.userId } },
        { company: { id: this.userId } },
      ],
      relations: { userType: true },
      select: ['id', 'username', 'userType'],
    });

    return userData;
  }

  // async getAllChildUsersArray() {
  //   let userData = await m_user.find({
  //     where: [
  //       { createdByUser: { id: In(this.userId) } },
  //       { subBroker: { id: In(this.userId) } },
  //       { broker: { id: In(this.userId) } },
  //       { master: { id: In(this.userId) } },
  //       { company: { id: In(this.userId) } },
  //     ],
  //     relations: { userType: true },
  //     select: ['id', 'username', 'userType'],
  //   });

  //   return userData;
  // }

  async getUserAccessData(userId: number) {
    let userFunctions = await m_userfunctionmapping.find({
      where: { user: { id: userId } },
      relations: { func: { subMenu: { menu: true } } },
      select: {
        id: true,
        isAccess: true,
        func: {
          id: true,
          funName: true,
          funLevel: true,
          isFunActive: true,
          subMenu: {
            id: true,
            subMenuConstantText: true,
            subMenuText: true,
            isSubMenuActive: true,
            menu: {
              isMenuActive: true,
              menuConstantText: true,
              menuText: true,
              id: true,
            },
          },
        },
      },
    });

    return userFunctions;
  }

  async getUserDirectChild(pageNumber: number) {
    let [userIds, count] = await m_user.findAndCount({
      where: { createdByUser: { id: this.userId } },
      relations: { createdByUser: true, userType: true },
      select: {
        id: true,
        username: true,
        createdByUser: { username: true },
        userType: { prjSettConstant: true, prjSettDisplayName: true },
      },
      skip: (pageNumber - 1) * 10,
      take: 10,
    });

    return { userIds, count };
  }
}
