import { ILike, In, Like } from 'typeorm';
import { m_user } from 'database/sql/schema';

class SearchUser {
  curr_user_id: number | null = null;
  curr_user_type: { id: number; type: string } | null = null;
  constructor(id: number) {
    this.curr_user_id = id;
  }

  public async getCompanyBrokers() {
    let brokersData = await m_user.find({
      where: {
        company: { id: this.curr_user_id },
        userType: { prjSettConstant: 'Broker' },
      },
      relations: {
        userType: true,
      },
      select: {
        id: true,
        username: true,
        userType: {
          prjSettConstant: true,
          id: true,
        },
      },
    });

    return brokersData;
  }

  public async getSubBrokers() {
    let subBrokersData = await m_user.find({
      where: [
        {
          company: { id: this.curr_user_id },
          userType: { prjSettConstant: 'Sub-Broker' },
        },
        {
          broker: { id: this.curr_user_id },
          userType: { prjSettConstant: 'Sub-Broker' },
        },
      ],
      relations: {
        userType: true,
      },
      select: {
        id: true,
        username: true,
        userType: {
          prjSettConstant: true,
          id: true,
        },
      },
    });

    return subBrokersData;
  }

  public async getUserType() {
    let user = await m_user.findOne({
      where: { id: this.curr_user_id },
      relations: { userType: true },
      select: { id: true, userType: { id: true, prjSettConstant: true } },
    });

    this.curr_user_type = {
      id: user.userType.id,
      type: user.userType.prjSettConstant,
    };

    return this.curr_user_type;
  }

  private async filterHandler({
    username,
    userType,
  }: {
    username: string[];
    userType: string[];
  }) {
    // console.log('user type is ', userType);
    // console.log('usernames are ', username);
    let whereCondition = [];
    let fixedConditions = {};
    let currUserType = await this.getUserType();
    if (currUserType.type == 'Company') {
      fixedConditions['company'] = {
        id: this.curr_user_id,
      };
    } else if (currUserType.type == 'Master') {
      fixedConditions['master'] = {
        id: this.curr_user_id,
      };
    } else if (currUserType.type == 'Broker') {
      fixedConditions['broker'] = {
        id: this.curr_user_id,
      };
    } else if (currUserType.type == 'Sub-Broker') {
      fixedConditions['subBroker'] = {
        id: this.curr_user_id,
      };
    }
    fixedConditions['userType'] = {
      prjSettConstant: In(userType),
    };
    let allUsersData = await m_user.find({
      where: { username: In(username) },
      relations: {
        userType: true,
        broker: true,
        subBroker: true,
        master: true,
        company: true,
      },
      select: {
        id: true,
        username: true,
        userType: { id: true, prjSettConstant: true },
        broker: { id: true },
        master: { id: true },
        company: { id: true },
        subBroker: { id: true },
      },
    });

    username.map((item) => {
      let checkUser = allUsersData.find((a) => a.username == item);
      if (checkUser) {
        let userUnderHierarchy = false;
        switch (currUserType.type) {
          case 'Company':
            if (
              checkUser.company &&
              checkUser.company.id == this.curr_user_id
            ) {
              userUnderHierarchy = true;
            }
            break;
          case 'Master':
            if (checkUser.master && checkUser.master.id == this.curr_user_id) {
              userUnderHierarchy = true;
            }
            break;
          case 'Broker':
            if (checkUser.broker && checkUser.broker.id == this.curr_user_id) {
              userUnderHierarchy = true;
            }
            break;
          case 'Sub-Broker':
            if (
              checkUser.subBroker &&
              checkUser.subBroker.id == this.curr_user_id
            ) {
              userUnderHierarchy = true;
            }
            break;
        }
        let hierarchyCondition = {};
        if (userUnderHierarchy) {
          if (checkUser.userType.prjSettConstant == 'Master') {
            hierarchyCondition['master'] = {
              id: checkUser.id,
            };
          } else if (checkUser.userType.prjSettConstant == 'Broker') {
            hierarchyCondition['broker'] = {
              id: checkUser.id,
            };
          } else if (checkUser.userType.prjSettConstant == 'Sub-Broker') {
            hierarchyCondition['subBroker'] = {
              id: checkUser.id,
            };
          } else if (checkUser.userType.prjSettConstant == 'Client') {
            hierarchyCondition['username'] = item;
          }
          whereCondition.push({ ...fixedConditions, ...hierarchyCondition });
        } else {
          whereCondition.push({
            ...fixedConditions,
            username: ILike(`%${item}%`),
          });
        }
      } else {
        whereCondition.push({
          ...fixedConditions,
          username: ILike(`%${item}%`),
        });
      }
    });

    return whereCondition;
  }

  public async searchUser({
    pageNumber,
    pageSize,
    sortObj,
    username,
    userType,
    upline,
  }: {
    pageNumber: number;
    pageSize: number;
    sortObj: any;
    username: string[];
    userType: string[];
    upline: {
      broker: number[];
      subBroker: number[];
    };
  }) {
    if (Object.keys(sortObj).length == 0) {
      sortObj['username'] = 'ASC';
    }
    let [users, count] = await m_user.findAndCount({
      where: await this.filterHandler({ username, userType }),
      relations: {
        userType: true,
        createdByUser: true,
        userStatus: true,
      },
      order: {
        ...sortObj,
      },
      select: {
        username: true,
        id: true,
        userType: {
          id: true,
          prjSettDisplayName: true,
          prjSettConstant: true,
        },
        createdByUser: {
          username: true,
        },
        firstName: true,
        lastName: true,
        mobileNumber: true,
        onlySquareOff: true,
        createdAt: true,
        shortMarginSquareOff: true,
        m2mSquareOff: true,
        openingBalance: true,
        userStatus: {
          id: true,
          prjSettDisplayName: true,
          prjSettConstant: true,
        },
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    let finalUsers = users.map((a) => {
      return { ...a, smSquareOff: a.shortMarginSquareOff };
    });

    return { users: finalUsers, count };
  }

  public async updatePassword(userId: number, password: string) {
    await m_user.update({ id: userId }, { password, resetRequired: true });
    return;
  }
}

export default SearchUser;
