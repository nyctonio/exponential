import express from 'express';
import StaticContentController from '../../controllers/static-content';
import AuthService from '../../services/auth';
const staticContentRouter = express.Router();

staticContentRouter.post('/save', StaticContentController.save);
staticContentRouter.get('/list/admin', StaticContentController.getListAdmin);

staticContentRouter.get('/list', StaticContentController.getListUser);
staticContentRouter.put('/changeStatus', StaticContentController.changeStatus);
staticContentRouter.put('/edit', StaticContentController.edit);
staticContentRouter.put(
  '/edit/userManual',
  StaticContentController.editUserManual
);

module.exports = staticContentRouter;
