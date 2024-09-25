import express from 'express';
import suspiciousController from '../../controllers/suspicious';
import AuthService from '../../services/auth';
const suspiciousRouter = express.Router();

suspiciousRouter.get('/records', suspiciousController.getSuspiciousData);

//Filters
suspiciousRouter.get('/filters', suspiciousController.getFilters);
suspiciousRouter.post('/filters/update', suspiciousController.updateFilters);

// //Rules
suspiciousRouter.get('/rules', suspiciousController.getRules);
suspiciousRouter.put(
  '/rule/update/status',
  suspiciousController.updateRuleStatus
);
suspiciousRouter.post('/rule/update', suspiciousController.updateRules);

module.exports = suspiciousRouter;
