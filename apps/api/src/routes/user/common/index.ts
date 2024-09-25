import express from 'express';
import AuthService from '../../../services/auth';
import UsersCommonController from '../../../controllers/user/common';
const commonRouter = express.Router();

commonRouter.get(
  '/get-associated-users',
  UsersCommonController.getAssociatedUsers
);

commonRouter.get('/get-user-details', UsersCommonController.getUserDetails);

commonRouter.get(
  '/get-allowed-exchanges/:username',
  AuthService.verifyUserHierarchy,
  UsersCommonController.getAllowedExchange
);

commonRouter.get(
  '/get-parent-id',
  AuthService.verifyUserHierarchy,
  UsersCommonController.getParentId
);

commonRouter.get(
  '/get-user-access-data/:username',
  AuthService.verifyUserHierarchy,
  UsersCommonController.getUserAccess
);

commonRouter.put(
  '/update-user-access-data',
  AuthService.verifyUserHierarchy,
  UsersCommonController.updateUserAccess
);

commonRouter.post(
  '/contact',
  AuthService.verifyUserHierarchy,
  UsersCommonController.userContact
);

module.exports = commonRouter;
