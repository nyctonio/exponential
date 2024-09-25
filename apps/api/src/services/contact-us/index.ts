import { m_contact, m_projectsetting } from 'database/sql/schema';

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

class ContactUsService {
  public static async list(status) {
    let query = {};
    if (status && status != '') {
      query = {
        status: status,
      };
    }

    let data = await m_contact.find({
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
    let data = await m_contact.update({ id: id }, { status: status });
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
      data: [],
      type: ResponseType.SUCCESS,
      message: 'Changes Saved',
    };
  }
}
export default ContactUsService;
