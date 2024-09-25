import dotenv from 'dotenv';
dotenv.config();

// const log = console.log;
// if (process.env.ENVIRONMENT === 'production') {
//   console.log = function () {
//     return;
//   };
// } else {
//   console.log = function (...args) {
//     log('log : ', ...args);
//   };
// }

export const env = {
  // ports
  TRADE_PORT: process.env.TRADE_PORT,
  API_PORT: process.env.API_PORT,
  EMITTER_PORT: process.env.EMITTER_PORT || '3004',
  SOCKET_PORT: process.env.SOCKET_PORT,
  PUBLISHER_PORT: process.env.PUBLISHER_PORT,
  LIVE_PORT: process.env.LIVE_PORT,
  LOGGER_PORT: process.env.LOGGER_PORT,
  JOBS_PORT: process.env.JOBS_PORT,
  // seed data
  SEED_DATABASE: process.env.SEED_DATABASE,
  SEED_USER_NAME: process.env.SEED_USER_NAME,
  SEED_PASSWORD: process.env.SEED_PASSWORD,
  SEED_HOST_NAME: process.env.SEED_HOST_NAME,
  SEED_DATABASE_PORT: process.env.SEED_DATABASE_PORT,
  // postgres
  DATABASE: process.env.DATABASE,
  USER_NAME: process.env.USER_NAME,
  PASSWORD: process.env.PASSWORD,
  HOST_NAME: process.env.HOST_NAME,
  DATABASE_PORT: process.env.DATABASE_PORT,
  SYNCRONIZE: process.env.SYNCRONIZE,
  // jwt
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,
  JWT_TOKEN_EXPIRES_IN: process.env.JWT_TOKEN_EXPIRES_IN,
  JWT_RESET_TOKEN_EXPIRES_IN: process.env.JWT_RESET_TOKEN_EXPIRES_IN,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  // redis
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USER: process.env.REDIS_USER,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_URL: process.env.REDIS_URL,
  // mongo
  MONGO: process.env.MONGO_URL,
  ENVIRONMENT: process.env.ENVIRONMENT,
  // queue
  QUEUE_NAME: process.env.QUEUE_NAME,
  QUEUE_HOST: process.env.QUEUE_HOST,
  ORDER_QUEUE: process.env.ORDER_QUEUE,
  TRADE_DATA_QUEUE: process.env.TRADE_DATA_QUEUE,
  LIMIT_ORDER_QUEUE: process.env.LIMIT_ORDER_QUEUE,
  // zerodha
  ZERODHA_API_KEY: process.env.ZERODHA_API_KEY,
  ZERODHA_URL: process.env.ZERODHA_URL,
  ZERODHA_API_SECRET: process.env.ZERODHA_API_SECRET,
  // nextjs
  NEXT_PUBLIC_BACKEND: process.env.NEXT_PUBLIC_BACKEND,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  // personal
  GH_TOKEN: process.env.GH_TOKEN,
  CRONITOR_API_KEY: process.env.CRONITOR_API_KEY,

  JOB_URL: process.env.JOB_URL,
};
