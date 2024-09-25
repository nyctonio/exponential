import express from 'express';
import AuthService from '../../../services/auth';
import AutoCutController from '../../../controllers/advance-settings/auto-cut';
const autoCutRouter = express.Router();

autoCutRouter.get(
  '/get-auto-cut-settings/:username',
  AuthService.verifyUserHierarchy,
  AutoCutController.getAutoCutSettings
);

autoCutRouter.put(
  '/update-auto-cut-settings',
  AuthService.verifyUserHierarchy,
  AutoCutController.updateAutoCutSettings
);

module.exports = autoCutRouter;
