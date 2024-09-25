import express from 'express';
import notificationsController from '../../controllers/notifications';
import AuthService from '../../services/auth';
const notificationsRouter = express.Router();

notificationsRouter.post('/save', notificationsController.saveNotifications);
notificationsRouter.get(
  '/list/admin',
  notificationsController.getNotificationsListAdmin
);

notificationsRouter.get('/list', notificationsController.getNotificationsList);
notificationsRouter.put('/read', notificationsController.readNotification);

module.exports = notificationsRouter;
