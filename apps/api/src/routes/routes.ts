import express from 'express';
import AuthService from '../services/auth';
const router = express.Router();

router.use('/auth', require('./auth'));
router.use(
  '/watchlist',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./watchlist')
);
router.use(
  '/menus',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./menus')
);
router.use(
  '/project-settings',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./project-settings')
);
router.use(
  '/user',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./user')
);
router.use(
  '/advance-settings/brokerage',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./advance-settings/brokerage')
);
router.use(
  '/advance-settings/script-quantity',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./advance-settings/script-quantity')
);
router.use(
  '/advance-settings/margin',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./advance-settings/margin')
);
router.use(
  '/advance-settings/auto-cut',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./advance-settings/auto-cut')
);
router.use(
  '/advance-settings/pl-brokerage-sharing',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./advance-settings/pl-brokerage-sharing')
);
router.use(
  '/trade/orders',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./trade/orders')
);

router.use(
  '/trade/status',
  AuthService.verifyUserLogin,
  require('./trade/status')
);

router.use(
  '/suspicious',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./suspicious')
);

router.use(
  '/notifications',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./notifications')
);

router.use(
  '/broadcast-message',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./broadcast-message')
);

router.use(
  '/logs',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./logs')
);

router.use(
  '/static-content',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./static-content')
);

router.use(
  '/contact-us',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./contact-us')
);

router.use(
  '/trade/corporate-actions',
  AuthService.verifyUserLogin,
  AuthService.verifyUserAccess,
  require('./trade/corporate-actions')
);

module.exports = router;
