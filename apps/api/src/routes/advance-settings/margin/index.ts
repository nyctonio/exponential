import express from 'express';
import AuthService from '../../../services/auth';
import MarginController from '../../../controllers/advance-settings/margin';
const marginRouter = express.Router();

marginRouter.get(
  '/get-margin-settings/:userId',
  AuthService.verifyUserHierarchy,
  MarginController.getMarginSettings
);

marginRouter.put(
  '/update-margin-settings',
  AuthService.verifyUserHierarchy,
  MarginController.updateMarginSettings
);

module.exports = marginRouter;
