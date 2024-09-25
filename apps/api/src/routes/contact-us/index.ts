import express from 'express';
import ContactUsController from '../../controllers/contact-us';
import AuthService from '../../services/auth';
const contactUsRouter = express.Router();

contactUsRouter.get('/list', ContactUsController.list);
contactUsRouter.put('/changeStatus', ContactUsController.changeStatus);

module.exports = contactUsRouter;
