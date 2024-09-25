import {
  m_transaction,
  m_usersuspicioustrademapping,
} from 'database/sql/schema';

import { RULES, SETTINGS } from 'database/mongodb/models';

import { ResponseType } from '../../constants/common/response-type';

import { AppDataSource } from 'database/sql';

import Logger from '../../utils/logger';

import Notification from '../../utils/notification';

class SuspiciousService {
  public static async getSuspiciousTrades() {
    const query = `select
      t1.*,
      t2.score ,
      t2.remark
    from
      m_transaction as t1
    join 
      m_usersuspicioustrademapping as t2 on
      t1."scriptName" = t2."scriptName"
      and t1."userId" = t2."userId"
      and t1.id = t2."orderId";`;

    let data = await AppDataSource.query(query);

    const logData = {
      operation: 'list',
      loggedInUser: 1,
      type: 'event',
      targetUsers: [1],
      actionDoneBy: 'user',
      description: 'List suspicious trades',
      metadata: {
        additionalInfo: data,
      },
    };
    Logger.logQueue(logData);

    return {
      status: true,
      data: data,
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }

  public static async getFilters() {
    let data = await SETTINGS.find({});

    return {
      status: true,
      data: data,
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }

  public static async updateFilters(records) {
    let data = records.records;

    var bulkUpdateOps = data.map(function (doc) {
      return {
        updateOne: {
          filter: {
            _id: doc._id,
            flag: doc.flag,
          },
          update: {
            $set: {
              timeAllowedMax: doc.timeAllowedMax,
              timeAllowedMin: doc.timeAllowedMin,
              variationMax: doc.variationMax,
              variationMin: doc.variationMin,
            },
          },
          upsert: true,
        },
      };
    });
    let updateData = await SETTINGS.bulkWrite(bulkUpdateOps);
    if (updateData) {
      return {
        status: true,
        data: [],
        type: ResponseType.SUCCESS,
        message: 'Chnages Saved',
      };
    } else {
      return {
        status: true,
        data: [],
        type: ResponseType.SUCCESS,
        message: 'Chnages Not Saved',
      };
    }
  }

  public static async getRules() {
    let data = await RULES.find({}).sort({ priority: 1 });

    return {
      status: true,
      data: data,
      type: ResponseType.SUCCESS,
      message: 'Data found',
    };
  }

  public static async updateRuleStatus(body) {
    let updateData = await RULES.findByIdAndUpdate(
      {
        _id: body._id,
      },
      {
        $set: {
          status: body.status,
        },
      },
      {
        new: true,
      }
    );
    if (updateData) {
      return {
        status: true,
        data: [],
        type: ResponseType.SUCCESS,
        message: 'Chnages Saved',
      };
    } else {
      return {
        status: true,
        data: [],
        type: ResponseType.SUCCESS,
        message: 'Chnages Not Saved',
      };
    }
  }

  public static async updateRules(records) {
    let data = records.records;

    var bulkUpdateOps = data.map(function (doc) {
      return {
        updateOne: {
          filter: {
            _id: doc._id,
          },
          update: {
            $set: {
              priority: doc.priority,
              level: doc.level,
              points: doc.points,
            },
          },
          upsert: true,
        },
      };
    });
    let updateData = await RULES.bulkWrite(bulkUpdateOps);
    if (updateData) {
      return {
        status: true,
        data: [],
        type: ResponseType.SUCCESS,
        message: 'Chnages Saved',
      };
    } else {
      return {
        status: true,
        data: [],
        type: ResponseType.SUCCESS,
        message: 'Chnages Not Saved',
      };
    }
  }
}
export default SuspiciousService;
