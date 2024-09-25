import express from 'express';
import CreateUserController from '../../../controllers/user/create-user';
import AuthService from '../../../services/auth';
const createUserRouter = express.Router();

createUserRouter.post('/', CreateUserController.createUser);

createUserRouter.get(
  '/get-username-availability/:username',
  CreateUserController.getUsernameAvailability
);

createUserRouter.get(
  '/get-dropdown-data',
  CreateUserController.getDropdownData
);

module.exports = createUserRouter;
