import NodeCache from 'node-cache';

class LocalCache {
  cache = new NodeCache({
    stdTTL: 900,
    checkperiod: 600,
    deleteOnExpire: true,
    useClones: true,
  });

  public set(key: string, value: any, ttl?: number) {
    if (ttl) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
    return;
  }

  public get(key: string) {
    return this.cache.get(key);
  }
}

const cache = new LocalCache();
export default cache;
