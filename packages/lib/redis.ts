import { createClient } from 'redis';
// import type { RedisClientType } from 'redis';
import { env } from 'env';

let redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.connect();

redisClient.on('connect', () => {
  console.log('Connected to Redis!!!');
});

redisClient.on('error', (err) => {
  console.log('error in connecting to redis ', err);
});

type RedisClientType = typeof redisClient;

export default redisClient;
export type { RedisClientType };
