import express from 'express';
import AuthService from '../../../services/auth';
import TradeStatusController from '../../../controllers/trade/status';
const router = express.Router();

router.get('/get-trade-status', TradeStatusController.getTradeStatus);
router.post(
  '/get-trade-status-by-month',
  TradeStatusController.getTradeStatusByMonth
);

router.post('/save-trade-status', TradeStatusController.saveTradeStatus);
module.exports = router;
