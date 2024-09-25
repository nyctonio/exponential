import express from 'express';
import logsController from '../../controllers/logs';
import AuthService from '../../services/auth';
const logsRouter = express.Router();

logsRouter.get('/list', logsController.getLogsList);

module.exports = logsRouter;
