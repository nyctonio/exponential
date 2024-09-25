import express from 'express';
const userRouter = express.Router();

userRouter.use('/search', require('./search'));
userRouter.use('/create', require('./create'));
userRouter.use('/common', require('./common'));
userRouter.use('/update', require('./update'));
userRouter.use('/statement', require('./statement'));
userRouter.use('/penalty', require('./penalty'));

module.exports = userRouter;
