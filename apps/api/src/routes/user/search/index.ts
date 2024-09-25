import express from 'express';
import AuthService from '../../../services/auth';
import SearchUserController from '../../../controllers/user/search-user';
const searchRouter = express.Router();

searchRouter.post('/', SearchUserController.searchUser);
searchRouter.get('/get-brokers', SearchUserController.getCompanyBrokers);
searchRouter.get('/get-sub-brokers', SearchUserController.getSubBrokers);
searchRouter.put(
  '/update-user-status',
  AuthService.verifyUserHierarchy,
  SearchUserController.updateUserStatus
);
searchRouter.put(
  '/update-user-password',
  AuthService.verifyUserHierarchy,
  SearchUserController.updatePassword
);
searchRouter.post(
  '/create-transaction',
  AuthService.verifyUserHierarchy,
  SearchUserController.transaction
);
searchRouter.post(
  '/login-history',
  AuthService.verifyUserHierarchy,
  SearchUserController.getLoginHistory
);

module.exports = searchRouter;
