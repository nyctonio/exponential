import express from 'express';
import AuthService from '../../../services/auth';
import UpdateUserController from '../../../controllers/user/update-user';
const router = express.Router();

router.put(
  '/basic-details',
  AuthService.verifyUserHierarchy,
  UpdateUserController.basicDetails
);

router.put(
  '/trade-settings',
  AuthService.verifyUserHierarchy,
  UpdateUserController.tradeSettings
);

router.put(
  '/sm-square-off/:userId',
  AuthService.verifyUserHierarchy,
  UpdateUserController.smSquareOff
);

router.put(
  '/only-square-off/:userId',
  AuthService.verifyUserHierarchy,
  UpdateUserController.onlySquareOff
);

router.put(
  '/m2m-square-off/:userId',
  AuthService.verifyUserHierarchy,
  UpdateUserController.m2mSquareOff
);

module.exports = router;
