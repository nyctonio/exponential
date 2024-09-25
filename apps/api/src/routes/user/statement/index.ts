import express from 'express';
import AuthService from '../../../services/auth';
import UserStatementController from '../../../controllers/user/statement';
// import SearchUserController from '../../../controllers/user/search-user';
const router = express.Router();

router.get('/', UserStatementController.getUserStatement);

router.post(
  '/get-transactions',
  UserStatementController.getHierarchyTransactions
);

router.post(
  '/get-settlement-indexes',
  AuthService.verifyUserHierarchy,
  UserStatementController.getSettlementIndexes
);

router.post(
  '/get-settlement-logs',
  AuthService.verifyUserHierarchy,
  UserStatementController.getSettlementLogs
);

module.exports = router;
