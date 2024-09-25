import express from 'express';
import AuthService from '../../../services/auth';
import PlBrokerageSharingController from '../../../controllers/advance-settings/pl-brokerage-sharing';
const router = express.Router();

router.post(
  '/get-pl-sharing',
  AuthService.verifyUserHierarchy,
  PlBrokerageSharingController.getPlSharing
);

router.put(
  '/update-pl-sharing',
  AuthService.verifyUserHierarchy,
  PlBrokerageSharingController.updatePlSharing
);

router.post(
  '/get-brokerage-sharing',
  AuthService.verifyUserHierarchy,
  PlBrokerageSharingController.getBrokerageSharing
);

router.put(
  '/update-brokerage-sharing',
  AuthService.verifyUserHierarchy,
  PlBrokerageSharingController.updateBrokerageSharing
);

router.post(
  '/get-rent-sharing',
  AuthService.verifyUserHierarchy,
  PlBrokerageSharingController.getRentSharing
);
module.exports = router;
