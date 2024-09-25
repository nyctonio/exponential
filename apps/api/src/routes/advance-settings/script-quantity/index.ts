import express from 'express';
import AuthService from '../../../services/auth';
import ScriptQuantityController from '../../../controllers/advance-settings/script-quantity';
const scriptRouter = express.Router();

scriptRouter.get(
  '/get-script-quantity/:userId',
  AuthService.verifyUserHierarchy,
  ScriptQuantityController.getScriptQuantitySettings
);

scriptRouter.put(
  '/update-script-quantity',
  AuthService.verifyUserHierarchy,
  ScriptQuantityController.updateScriptQuantitySettings
);

module.exports = scriptRouter;
