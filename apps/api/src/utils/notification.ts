var admin = require('firebase-admin');
import serviceAccount from '../lib/firebase/firebase-config.json';

//Importing models
import { models } from 'database/sql/models';
import {
  m_notification,
  m_notification_main,
  m_user,
  m_broadcastmessagesuser,
} from 'database/sql/schema';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import { IsNull, Not, In } from 'typeorm';

// let sendNotification = await Noitification.sendNotification(
// userData.id,
// title,
// content,
// type,
// );

class Noitification {
  public static async sendNotification(
    userId: number,
    title: string,
    content: string,
    type: string
  ) {
    let checkUser = await models.m_user.findOne({
      where: { id: userId },
      select: {
        deviceToken: true,
      },
    });
    if (checkUser) {
      const saveNotification = await m_notification.insert({
        user: {
          id: userId,
        },
        title: title,
        content: content,
        type: type,
      });

      const message = {
        notification: {
          title: title,
          body: content,
        },
        data: {
          title: title,
          body: content,
        },
        android: {
          notification: {
            icon: 'stock_ticker_update',
            color: '#7e55c3',
          },
        },
        token: checkUser.deviceToken,
        // token: 'eqxeMWI6rUeQpVJhPSaziC:APA91bHK7U1s10Y5XZ3AxZ4J_4h-UJxx7PHLRUGE0hizNUSv9bb5X_V3KiLQSoI_xxP5rCEq92Iy5AonpF-JEY8I_3SwaJIwufkKQZC7eQleOC813n7aLEsPl3ojot3escYX3-awMBu0',
      };
      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
          return { status: true, message: 'Notification send' };
        })
        .catch((error) => {
          console.log('Error sending message:', error);
          return { status: false, message: 'Error sending message' };
        });
    } else {
      return { status: false, message: 'User Not Under Control' };
    }
  }

  // public static async adminSendNotification(
  //   userId: any,
  //   title: string,
  //   content: string,
  //   type: string
  // ) {
  //   let checkUserToken = await m_user.find({
  //     where: { id: userId },
  //     select: {
  //       deviceToken: true,
  //     },
  //   });
  //   if (checkUserToken && checkUserToken.length > 0) {
  //     for (let i = 0; i < checkUserToken.length; i++) {
  //       const saveNotification = await m_notification.insert({
  //         user: {
  //           id: checkUserToken[i].id,
  //         },
  //         title: title,
  //         content: content,
  //         type: type,
  //       });

  //       const message = {
  //         notification: {
  //           title: title,
  //           body: content,
  //         },
  //         data: {
  //           title: title,
  //           body: content,
  //         },
  //         android: {
  //           notification: {
  //             icon: 'stock_ticker_update',
  //             color: '#7e55c3',
  //           },
  //         },
  //         token: checkUserToken[i].deviceToken,
  //         // token: 'eqxeMWI6rUeQpVJhPSaziC:APA91bHK7U1s10Y5XZ3AxZ4J_4h-UJxx7PHLRUGE0hizNUSv9bb5X_V3KiLQSoI_xxP5rCEq92Iy5AonpF-JEY8I_3SwaJIwufkKQZC7eQleOC813n7aLEsPl3ojot3escYX3-awMBu0',
  //       };
  //       admin
  //         .messaging()
  //         .send(message)
  //         .then((response) => {
  //           console.log('Successfully sent message:', response);
  //           return { status: true, message: 'Notification send' };
  //         })
  //         .catch((error) => {
  //           console.log('Error sending message:', error);
  //           return { status: false, message: 'Error sending message' };
  //         });
  //     }
  //   } else {
  //     return { status: false, message: 'User Not Under Control' };
  //   }
  // }

  public static async adminSendNotification(
    userId: any,
    title: string,
    content: string,
    type: string
  ) {
    let checkUserToken = await m_user.find({
      where: {
        id: In(userId),
        // deviceToken: Not(IsNull())
      },
      select: {
        id: true,
        deviceToken: true,
      },
    });
    if (checkUserToken && checkUserToken.length > 0) {
      for (let i = 0; i < checkUserToken.length; i++) {
        const saveNotification = await m_notification.insert({
          user: {
            id: checkUserToken[i].id,
          },
          title: title,
          content: content,
          type: type,
        });

        // const message = {
        //   notification: {
        //     title: title,
        //     body: content,
        //   },
        //   data: {
        //     title: title,
        //     body: content,
        //   },
        //   android: {
        //     notification: {
        //       icon: 'stock_ticker_update',
        //       color: '#7e55c3',
        //     },
        //   },
        //   token: checkUserToken[i].deviceToken,
        //   // token: 'eqxeMWI6rUeQpVJhPSaziC:APA91bHK7U1s10Y5XZ3AxZ4J_4h-UJxx7PHLRUGE0hizNUSv9bb5X_V3KiLQSoI_xxP5rCEq92Iy5AonpF-JEY8I_3SwaJIwufkKQZC7eQleOC813n7aLEsPl3ojot3escYX3-awMBu0',
        // };
        // admin
        //   .messaging()
        //   .send(message)
        //   .then((response) => {
        //     console.log('Successfully sent message:', response);
        //     return { status: true, message: 'Notification send' };
        //   })
        //   .catch((error) => {
        //     console.log('Error sending message:', error);
        //     return { status: false, message: 'Error sending message' };
        //   });
      }
    } else {
      return { status: false, message: 'User Not Under Control' };
    }
  }

  public static async broadCastNotification(
    userId: any,
    title: string,
    message: string,
    severity: string,
    type: string
  ) {
    let checkUserToken = await m_user.find({
      where: {
        id: In(userId),
        // deviceToken: Not(IsNull())
      },
      select: {
        id: true,
        deviceToken: true,
      },
    });
    if (checkUserToken && checkUserToken.length > 0) {
      for (let i = 0; i < checkUserToken.length; i++) {
        const saveNotification = await m_broadcastmessagesuser.insert({
          user: {
            id: checkUserToken[i].id,
          },
          title: title,
          message: message,
          type: type,
          severity: severity,
        });

        // const message = {
        //   notification: {
        //     title: title,
        //     body: content,
        //   },
        //   data: {
        //     title: title,
        //     body: content,
        //   },
        //   android: {
        //     notification: {
        //       icon: 'stock_ticker_update',
        //       color: '#7e55c3',
        //     },
        //   },
        //   token: checkUserToken[i].deviceToken,
        //   // token: 'eqxeMWI6rUeQpVJhPSaziC:APA91bHK7U1s10Y5XZ3AxZ4J_4h-UJxx7PHLRUGE0hizNUSv9bb5X_V3KiLQSoI_xxP5rCEq92Iy5AonpF-JEY8I_3SwaJIwufkKQZC7eQleOC813n7aLEsPl3ojot3escYX3-awMBu0',
        // };
        // admin
        //   .messaging()
        //   .send(message)
        //   .then((response) => {
        //     console.log('Successfully sent message:', response);
        //     return { status: true, message: 'Notification send' };
        //   })
        //   .catch((error) => {
        //     console.log('Error sending message:', error);
        //     return { status: false, message: 'Error sending message' };
        //   });
      }
    } else {
      return { status: false, message: 'User Not Under Control' };
    }
  }
}

export default Noitification;
