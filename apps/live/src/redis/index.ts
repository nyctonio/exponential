import { createClient } from 'redis';
import { env } from 'env';

let redisClient = createClient({
  url: env.REDIS_URL,
});

export default redisClient;
