import {
  m_user,
  m_broadcastmessagesuser,
  m_broadcastmessages,
  m_projectsetting,
} from 'database/sql/schema';

import { ResponseType } from '../../constants/common/response-type';

import { AppDataSource } from 'database/sql';
import {
  IsNull,
  Not,
  In,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

import Notification from '../../utils/notification';

class BroadcastMessageService {
  public static async save(data) {
    const saveData = await m_broadcastmessages.insert({
      title: data.title,
      message: data.message,
      valid_for: data.valid_for == 6 ? 'All' : data.valid_for,
      type: data.type,
      severity: data.severity,
      from_date: data.from_date || null,
      to_date: data.to_date || null,
      users: data.users,
      is_multiple: data.is_multiple,
      frequency: data.frequency,
      scheduled_data: data.scheduled_data,
    });
    if (saveData) {
      if (data.is_multiple == false) {
        if (
          data.valid_for &&
          data.valid_for != 0 &&
          data.valid_for != 6 &&
          data.users.length == 0
        ) {
          let getUsers = await m_user.find({
            where: {
              userType: { id: data.valid_for },
              // deviceToken: Not(IsNull()),
            },
            select: {},
          });
          let userIds = getUsers.map((d) => d.id.toString());
          let sendNotification = await Notification.broadCastNotification(
            userIds,
            data.title,
            data.message,
            data.severity,
            data.type
          );
        }

        if (data.valid_for == 6) {
          let getUsers = await m_user.find({
            where: {
              // userType: { id: data.valid_for },
              // userType: Not(1),
              // deviceToken: Not(IsNull()),
            },
            select: {},
          });
          let userIds = getUsers.map((d) => d.id.toString());
          let sendNotification = await Notification.broadCastNotification(
            userIds,
            data.title,
            data.message,
            data.severity,
            data.type
          );
        }

        if (data.users && data.users.length > 0) {
          let sendMessage = await Notification.broadCastNotification(
            data.users,
            data.title,
            data.message,
            data.severity,
            data.type
          );
        }
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

  public static async listAdmin(search) {
    let query = [];
    if (search && search != '') {
      query = [
        { message: ILike(`%${search}%`) },
        { title: ILike(`%${search}%`) },
      ];
    }

    let data = await m_broadcastmessages.find({
      where: query,
      // relations: {
      //   valid_for: true,
      // },
      // select: {
      //   id: true,
      //   users:true,
      //   title:true,
      //   type:true,
      //   severity:true,
      //   message:true,
      //   frequency:true,
      //   from_date:true,
      //   to_date:true,
      //   createdAt:true,
      //   valid_for: { id: true, prjSettConstant: true },
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
        d.valid_for === 'All'
          ? 'All'
          : setingsdata.find((a) => a.id === parseInt(d.valid_for))
              ?.prjSettConstant;

      return {
        id: d.id,
        users: d.users,
        title: d.title,
        type: d.type,
        severity: d.severity,
        message: d.message,
        is_multiple: d.is_multiple,
        from_date: d.from_date,
        to_date: d.to_date,
        valid_for: validForValue,
        frequency: d.frequency,
        scheduled_data: d.scheduled_data,
      };
    });

    return {
      status: true,
      data: sendData,
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }

  public static async getMessages(userId: number) {
    let data = await m_broadcastmessagesuser.find({
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

  public static async read(userId, id) {
    let data = await m_broadcastmessagesuser.update(
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

  public static async sendScheduleMessage() {
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    const currentTime = `${currentHours}:${currentMinutes}`;
    // console.log('currentTime============++>', currentTime);

    let data = await m_broadcastmessages.find({
      where: {
        is_multiple: true,
        from_date: LessThanOrEqual(currentDate),
        to_date: MoreThanOrEqual(currentDate),
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
    for (const element of data) {
      const checkData = element.scheduled_data;
      for (const timeCheck of checkData) {
        const givenTime = timeCheck.time;
        const [givenHours, givenMinutes] = givenTime.split(':').map(Number);
        if (currentHours === givenHours && currentMinutes === givenMinutes) {
          // if (currentHours > givenHours || (currentHours === givenHours && currentMinutes >= givenMinutes)) {

          let updatedScheduledData = checkData.map((item) => {
            if (item.time === timeCheck.time) {
              return { ...item, executed: true };
            }
            return item;
          });

          let updateTimeSlots = await m_broadcastmessages.update(
            { id: element.id },
            { scheduled_data: updatedScheduledData }
          );

          if (
            element.valid_for &&
            parseInt(element.valid_for) != 0 &&
            parseInt(element.valid_for) != 6 &&
            element.users.length == 0
          ) {
            let getUsers = await m_user.find({
              where: {
                userType: { id: parseInt(element.valid_for) },
                // deviceToken: Not(IsNull()),
              },
              select: {},
            });
            let userIds = getUsers.map((d) => d.id.toString());
            let sendNotification = await Notification.broadCastNotification(
              userIds,
              element.title,
              element.message,
              element.severity,
              element.type
            );
          }

          if (parseInt(element.valid_for) == 6) {
            let getUsers = await m_user.find({
              where: {
                // userType: { id: data.valid_for },
                // userType: Not(1),
                // deviceToken: Not(IsNull()),
              },
              select: {},
            });
            let userIds = getUsers.map((d) => d.id.toString());
            let sendNotification = await Notification.broadCastNotification(
              userIds,
              element.title,
              element.message,
              element.severity,
              element.type
            );
          }

          if (element.users && element.users.length > 0) {
            let sendMessage = await Notification.broadCastNotification(
              element.users,
              element.title,
              element.message,
              element.severity,
              element.type
            );
          }

          console.log('Message SENT...');
        } else {
          console.log('The current time is less than the given time.');
          // return
        }
      }
    }

    return {
      status: true,
      data: [],
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }
}
export default BroadcastMessageService;
