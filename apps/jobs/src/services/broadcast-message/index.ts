import {
  m_user,
  m_broadcastmessagesuser,
  m_broadcastmessages,
  m_projectsetting,
} from 'database/sql/schema';
import { AppDataSource } from 'database/sql';

import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import Notification from '../../../../api/src/utils/notification';

class BroadcastMessageService {
  public static async sendScheduleMessage() {
    console.log('Hii');
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    const currentTime = `${currentHours}:${currentMinutes}`;
    // console.log('currentTime============++>', currentTime);

    let data = await m_broadcastmessages.find({
      where: {
        is_multiple: true,
        from_date: LessThanOrEqual(currentDate) as unknown as Date,
        to_date: MoreThanOrEqual(currentDate) as unknown as Date,
      },
    });
    if (data.length == 0) {
      return {
        status: false,
        data: [],
        type: 'ERROR',
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
      type: 'SUCCESS',
      message: 'Data found',
    };
  }
}

export default BroadcastMessageService;
