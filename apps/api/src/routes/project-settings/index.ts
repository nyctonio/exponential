import express from 'express';
import ProjectSettingController from '../../controllers/project-settings';
import AuthService from '../../services/auth';
const projectSettingRouter = express.Router();

projectSettingRouter.post('/', ProjectSettingController.getProjectSettings);

projectSettingRouter.post(
  '/keys',
  ProjectSettingController.getProjectSettingsByKey
);

projectSettingRouter.get(
  '/get-distinct-keys',
  ProjectSettingController.getDistinctSettingsKey
);

projectSettingRouter.put(
  '/update',
  ProjectSettingController.updateProjectSetting
);

projectSettingRouter.post(
  '/create',
  ProjectSettingController.createProjectSetting
);

module.exports = projectSettingRouter;
