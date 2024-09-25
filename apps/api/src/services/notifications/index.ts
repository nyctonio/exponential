import {
  m_notification,
  m_notification_main,
  m_user,
  m_projectsetting,
} from 'database/sql/schema';

import { ResponseType } from '../../constants/common/response-type';

import { AppDataSource } from 'database/sql';
import { IsNull, Not, In } from 'typeorm';

import Notification from '../../utils/notification';

class NotificationService {
  public static async saveNotification(data) {
    const saveNotification = await m_notification_main.insert({
      title: data.title,
      message: data.message,
      userType: data.userType == 6 ? 'All' : data.userType,
      is_hierarchy: data.is_hierarchy,
      users: data.users,
    });
    if (saveNotification) {
      if (
        data.userType &&
        data.userType != 0 &&
        data.userType != 6 &&
        data.users.length == 0 &&
        data.is_hierarchy == false
      ) {
        let getUsers = await m_user.find({
          where: {
            userType: { id: data.userType },
            // deviceToken: Not(IsNull()),
          },
          select: {},
        });
        let userIds = getUsers.map((d) => d.id.toString());
        let sendNotification = await Notification.adminSendNotification(
          userIds,
          data.title,
          data.message,
          'type'
        );
      }
      if (
        data.userType &&
        data.userType != 0 &&
        data.userType != 6 &&
        data.users.length == 0 &&
        data.is_hierarchy == true
      ) {
        let getUsers = await m_user.find({
          where: {
            userType: { id: data.userType },
            // deviceToken: Not(IsNull()),
          },
          select: {
            id: true,
          },
        });

        let userIds = getUsers.map((d) => d.id);

        let userData = await m_user.find({
          where: [
            { createdByUser: { id: In(userIds) } },
            { subBroker: { id: In(userIds) } },
            { broker: { id: In(userIds) } },
            { master: { id: In(userIds) } },
            { company: { id: In(userIds) } },
          ],
          relations: { userType: true },
          select: ['id'],
        });

        let sendUserData = userData.map((d) => d.id);

        let sendNotification = await Notification.adminSendNotification(
          [...sendUserData, ...userIds],
          data.title,
          data.message,
          'type'
        );
      }
      if (data.users && data.users.length > 0) {
        let sendNotification = await Notification.adminSendNotification(
          data.users,
          data.title,
          data.message,
          'type'
        );
      }
      if (data.userType == 6) {
        let getUsers = await m_user.find({
          where: {
            // userType: { id: data.valid_for },
            // userType: Not(1),
            // deviceToken: Not(IsNull()),
          },
          select: {},
        });
        let userIds = getUsers.map((d) => d.id.toString());
        let sendNotification = await Notification.adminSendNotification(
          userIds,
          data.title,
          data.message,
          'type'
        );
      }
      return {
        status: true,
        type: ResponseType.SUCCESS,
        message: 'Data saved',
      };
    }

    return {
      status: false,
      type: ResponseType.ERROR,
      message: 'No data saved',
    };
  }

  public static async getNotificationsAdmin() {
    let data = await m_notification_main.find({
      where: {},
      // relations: {
      //   userType: true,
      // },
      order: {
        createdAt: 'DESC',
      },
    });

    let setingsdata = await m_projectsetting.find({
      where: {
        prjSettKey: 'USRTYP',
      },
    });

    if (data.length == 0) {
      return {
        status: false,
        data: [],
        type: ResponseType.ERROR,
        message: 'No data found',
      };
    }

    let sendData = data.map((d) => {
      let validForValue =
        d.userType === 'All'
          ? 'All'
          : setingsdata.find((a) => a.id === parseInt(d.userType))
              ?.prjSettConstant;

      return {
        id: d.id,
        users: d.users,
        title: d.title,
        message: d.message,
        userType: {
          id: 1,
          prjSettConstant: validForValue,
        },
        is_hierarchy: d.is_hierarchy,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        isDeleted: d.isDeleted,
      };
    });

    return {
      status: true,
      data: sendData,
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }

  public static async getNotifications(userId: number) {
    let data = await m_notification.find({
      where: { user: { id: userId } },
      order: {
        createdAt: 'DESC',
      },
    });
    if (data.length == 0) {
      return {
        status: true,
        data: [],
        type: ResponseType.ERROR,
        message: 'No data found',
      };
    }

    return {
      status: true,
      data: data,
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }

  public static async readNotifications(userId, id) {
    let data = await m_notification.update(
      { user: userId, id: id },
      { read: true }
    );
    if (!data) {
      return {
        status: false,
        data: [],
        type: ResponseType.ERROR,
        message: 'Error',
      };
    }

    return {
      status: true,
      data: data,
      type: ResponseType.SUCCESS,
      message: 'Read',
    };
  }
}
export default NotificationService;
