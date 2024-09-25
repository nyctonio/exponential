import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  ELASTIC_USERNAME: process.env.ELASTIC_USERNAME,
  ELASTIC_PASSWORD: process.env.ELASTIC_PASSWORD,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  ZERODHA_API_KEY: process.env.ZERODHA_API_KEY,
  ZERODHA_API_SECRET: process.env.ZERODHA_API_SECRET,
  DATABASE: process.env.DATABASE,
  USER_NAME: process.env.USER_NAME,
  PASSWORD: process.env.PASSWORD,
  HOST_NAME: process.env.HOST_NAME,
  DATABASE_PORT: process.env.DATABASE_PORT,
  ZERODHA_URL: process.env.ZERODHA_URL,
  ELASTIC_CLOUD_ID: process.env.ELASTIC_CLOUD_ID,
};
