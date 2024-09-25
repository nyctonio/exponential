import express from 'express';
import CorporateActionsController from '../../../controllers/trade/corporate-actions';

const corporateActionsRouter = express.Router();

corporateActionsRouter.post(
  '/create-action',
  CorporateActionsController.createAction
);

corporateActionsRouter.get(
  '/get-actions',
  CorporateActionsController.getActions
);

module.exports = corporateActionsRouter;
