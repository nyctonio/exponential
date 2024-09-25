// import redisClient from '../../../../apps/api/src/lib/redis';
import printSafe from '../common/printSafe';

class Redis {
  public static async create(key: string, value: string) {
    // let newSession = await redisClient.set(key, value);
    printSafe(['value ', value]);
    return;
  }

  public static async get(key: string) {
    // let data = await redisClient.get(key);
    // return data;
    return '';
  }
}

export default Redis;
