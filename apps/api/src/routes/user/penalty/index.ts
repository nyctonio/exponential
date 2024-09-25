import express from 'express';
import AuthService from '../../../services/auth';
import PenaltyController from '../../../controllers/user/penalty';

const router = express.Router();

router.post('/get-penalty', PenaltyController.getPenalty);
router.post('/set-penalty', PenaltyController.setPenalty);

module.exports = router;
