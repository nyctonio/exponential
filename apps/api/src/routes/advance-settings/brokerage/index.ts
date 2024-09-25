import express from 'express';
import AuthService from '../../../services/auth';
import BrokerageSettingsController from '../../../controllers/advance-settings/brokerage';
const scriptBrokerageRouter = express.Router();

scriptBrokerageRouter.get(
  '/get-script-brokerage/:userId',
  AuthService.verifyUserHierarchy,
  BrokerageSettingsController.getScriptBrokerageSettings
);

scriptBrokerageRouter.put(
  '/update-script-brokerage',
  AuthService.verifyUserHierarchy,
  BrokerageSettingsController.updateScriptBrokerageSettings
);

module.exports = scriptBrokerageRouter;
