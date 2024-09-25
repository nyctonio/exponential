import express from 'express';
import MenusController from '../../controllers/menus';
import AuthService from '../../services/auth';
const menuRouter = express.Router();

menuRouter.get('/', MenusController.getMenusData);
menuRouter.get(
  '/get-default-access-management/:userType',
  MenusController.getDefaultAccessData
);

menuRouter.put(
  '/update-default-access-management',
  MenusController.updateDefaultAccess
);
module.exports = menuRouter;
