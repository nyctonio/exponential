import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  DATABASE: process.env.DATABASE,
  USER_NAME: process.env.USER_NAME,
  PASSWORD: process.env.PASSWORD,
  HOST_NAME: process.env.HOST_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,
  JWT_RESET_TOKEN_EXPIRES_IN: process.env.JWT_RESET_TOKEN_EXPIRES_IN,
  DATABASE_PORT: process.env.DATABASE_PORT,
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USER: process.env.REDIS_USER,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  MONGO: process.env.MONGO_URL,
};
