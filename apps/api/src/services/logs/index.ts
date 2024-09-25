import { EventLog } from 'database/mongodb/models';
import USER from 'entity/user';

import { ResponseType } from '../../constants/common/response-type';

import { AppDataSource } from 'database/sql';

class LogsService {
  userId: number = null;
  userName: string = null;
  constructor({ userId, userName }: { userId?: number; userName?: string }) {
    this.userId = userId;
    this.userName = userName;
  }

  public static async getLogs(user, type, page = 1, limit = 15) {
    let data = [];
    const userData = new USER({ userId: user });
    let childUsers = await userData.getAllChildUsers();
    let childIds = childUsers.map((a) => a.id);

    let query = {
      $or: [
        {
          loggedInUser: {
            $in: childIds,
          },
        },
        {
          targetUsers: {
            $in: childIds,
          },
        },
      ],
    };

    if (type == 'Company') {
      data = await EventLog.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    }
    if (type != 'Client' && type != 'Company') {
      data = await EventLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      // data = [
      //   {
      //     operation: 'list',
      //     loggedInUser: 1,
      //     type: 'event',
      //     targetUsers: [1, 2],
      //     actionDoneBy: 'user',
      //     description: 'List suspicious trades',
      //     metadata: {
      //       additionalInfo: [
      //         {
      //           id: 56410,
      //           exchange: 'NSE',
      //           scriptName: 'ADANIPORTS24JANFUT',
      //           isIntraday: false,
      //           orderType: 'market',
      //           tradeType: 'S',
      //           buyPrice: null,
      //           sellPrice: '1176.85',
      //           lotSize: 800,
      //           quantity: 800,
      //           quantityLeft: 0,
      //           transactionStatus: 'closed',
      //           margin: '28723.2',
      //           marginChargedType: 'crore',
      //           marginChargedRate: 300000,
      //           brokerage: '100',
      //           brokerageChargedType: 'lot',
      //           brokerageChargedRate: 100,
      //           isReconciliation: false,
      //           orderCreationDate: '2024-01-17T06:39:48.405Z',
      //           orderExecutionDate: '2024-01-17T06:39:48.999Z',
      //           ipAddr: '1.101.02.03',
      //           location: 'Noida',
      //           deviceId: null,
      //           deviceType: null,
      //           flag: 'high',
      //           createdAt: '2024-01-17T06:39:49.010Z',
      //           updatedAt: '2024-01-17T06:39:49.010Z',
      //           isDeleted: false,
      //           deletedAt: null,
      //           parentId: 56406,
      //           orderId: null,
      //           userId: 6,
      //           createdById: null,
      //           updatedById: null,
      //           deletedById: null,
      //           transactionRemarks: 'remarks',
      //           tradeRemarks: 'user squareoff',
      //           score: 10,
      //           remark: 'location',
      //         },
      //       ],
      //     },
      //   },
      // ];
    }

    if (data.length == 0) {
      return {
        status: false,
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
}
export default LogsService;
