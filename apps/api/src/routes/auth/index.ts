import express from 'express';
import AuthController from '../../controllers/auth';
import AuthService from '../../services/auth';
const authRouter = express.Router();

authRouter.post('/login', AuthController.login);

authRouter.post(
  '/reset-password',
  AuthService.verifyResetPassword,
  AuthController.resetPassword
);

module.exports = authRouter;
