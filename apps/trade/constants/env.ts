import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  QUEUE_HOST: process.env.QUEUE_HOST,
  QUEUE_NAME: process.env.QUEUE_NAME,
  REDIS_URL: process.env.REDIS_URL,
};
