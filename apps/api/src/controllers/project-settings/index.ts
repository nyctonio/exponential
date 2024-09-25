import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import {
  createProjectSettingSchema,
  getProjectSettingsSchema,
  updateProjectSettingSchema,
} from './validations';
import ProjectSettingService from '../../services/project-settings';
import { ResponseType } from '../../constants/common/response-type';

class ProjectSettingController {
  public static async getProjectSettings(req: UserRequest, res: Response) {
    try {
      let validationResult = getProjectSettingsSchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: validationResult.error.details[0].message,
        });
      }

      let data = await ProjectSettingService.getProjectSettings(req.body);

      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getProjectSettingsByKey(req: UserRequest, res: Response) {
    try {
      let projectSettingsData =
        await ProjectSettingService.getProjectSettingsByKeys(req.body.keys);
      return res.send({
        status: true,
        data: projectSettingsData,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getDistinctSettingsKey(req: UserRequest, res: Response) {
    try {
      let settingsData = await ProjectSettingService.getDistinctSettings();
      return res.send({
        status: true,
        data: settingsData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updateProjectSetting(req: UserRequest, res: Response) {
    try {
      let validationResult = updateProjectSettingSchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: validationResult.error.details[0].message,
        });
      }

      await ProjectSettingService.updateProjectSetting({
        id: req.body.id,
        displayValue: req.body.displayValue,
        sortOrder: req.body.sortOrder,
        active: req.body.active,
      });

      return res.send({
        status: true,
        data: {},
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async createProjectSetting(req: UserRequest, res: Response) {
    try {
      let validationResult = createProjectSettingSchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: validationResult.error.details[0].message,
        });
      }

      let projectSetting = await ProjectSettingService.createProjectSetting({
        applicationSettingKey: req.body.applicationSettingKey,
        applicationSettingName: req.body.applicationSettingName,
        applicationSettingValue: req.body.applicationSettingValue,
        applicationSettingDisplay: req.body.applicationSettingDisplay,
        applicationSettingSort: req.body.applicationSettingSort,
      });

      return res.send({
        status: true,
        data: projectSetting,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('errr ', e);
      if (e.code == 'ER_DUP_ENTRY') {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: 'Record already exists for the same.',
        });
      }
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default ProjectSettingController;
