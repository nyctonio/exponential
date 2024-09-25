import express from 'express';
import BroadcastMessageController from '../../controllers/broadcast-message';
import AuthService from '../../services/auth';
const notificationsRouter = express.Router();

notificationsRouter.post('/save', BroadcastMessageController.save);
notificationsRouter.get('/list/admin', BroadcastMessageController.getListAdmin);

notificationsRouter.get('/list', BroadcastMessageController.getList);
notificationsRouter.put('/read', BroadcastMessageController.read);

notificationsRouter.get(
  '/scheduled',
  BroadcastMessageController.sendScheduleMessage
);

module.exports = notificationsRouter;
