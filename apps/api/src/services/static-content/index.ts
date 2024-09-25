import { m_staticcontent, m_projectsetting } from 'database/sql/schema';

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

class StaticContentService {
  public static async save(data) {
    if (data.contentType == 'user_manual') {
      let checkExist = await m_staticcontent.find({
        where: {
          name: data.name,
        },
      });
      if (checkExist.length > 0) {
        return {
          status: false,
          type: ResponseType.ERROR,
          message: 'Manual with same name already exists.',
        };
      }
    }
    const saveData = await m_staticcontent.insert({
      name: data.name,
      text: data.text,
      contentType: data.contentType,
      email: data.email,
      phone: data.phone,
      address: data.address,
    });
    if (saveData) {
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

  public static async listAdmin(type) {
    let query = {};
    if (type && type != '') {
      query = {
        contentType: type,
      };
    }

    let data = await m_staticcontent.find({
      where: query,
    });

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

  public static async changeStatus(status, id) {
    let data = await m_staticcontent.update({ id: id }, { status: status });
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
      message: 'Changes Saved',
    };
  }

  public static async edit(data) {
    let dataUpdate = await m_staticcontent.update(
      { id: data.id, contentType: data.contentType },
      {
        name: data.name,
        text: data.text,
        // contentType: data.contentType,
        email: data.email,
        phone: data.phone,
        address: data.address,
      }
    );
    if (!dataUpdate) {
      return {
        status: false,
        data: [],
        type: ResponseType.ERROR,
        message: 'Error',
      };
    }

    return {
      status: true,
      data: [],
      type: ResponseType.SUCCESS,
      message: 'Changes Saved',
    };
  }

  public static async editUserManual(data) {
    let dataUpdate;
    for (let doc of data) {
      dataUpdate = await m_staticcontent.update(
        { id: doc.id, contentType: doc.contentType },
        {
          name: doc.name,
          text: doc.text,
        }
      );
    }

    if (!dataUpdate) {
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
      message: 'Changes Saved',
    };
  }

  public static async listUser(type) {
    let data = await m_staticcontent.find({
      where: { contentType: type, status: true },
      order: {},
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
}
export default StaticContentService;
