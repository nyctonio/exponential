import express from 'express';
import AuthService from '../../../services/auth';
import OrdersController from '../../../controllers/trade/orders';
const router = express.Router();

router.get('/prevalidation', OrdersController.preValidation);
router.post('/create-order', OrdersController.createOrder);
router.get('/get-open-orders', OrdersController.getOpenOrders);
router.post(
  '/get-orders',
  AuthService.verifyUserHierarchy,
  OrdersController.getOrders
);
router.post(
  '/square-off-trades',
  AuthService.verifyUserHierarchy,
  OrdersController.squareOffTrades
);

router.post(
  '/cancel-order',
  AuthService.verifyUserHierarchy,
  OrdersController.cancelOrder
);

router.post(
  '/delete-order',
  AuthService.verifyUserHierarchy,
  OrdersController.deleteTrade
);

router.post(
  '/edit-order',
  AuthService.verifyUserHierarchy,
  OrdersController.editOrder
);

router.post(
  '/edit-pending-order',
  AuthService.verifyUserHierarchy,
  OrdersController.editPendingOrder
);

router.post(
  '/convert-order',
  AuthService.verifyUserHierarchy,
  OrdersController.convertOrder
);

// router.get('/get-positions', OrdersController.getPositions);

module.exports = router;
