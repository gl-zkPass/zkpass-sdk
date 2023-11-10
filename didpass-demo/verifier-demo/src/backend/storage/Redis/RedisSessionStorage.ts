import { injectable } from "inversify";
import Redis from "ioredis";
import { ISessionStorage } from "../ISessionStorage";

@injectable()
export class RedisSessionStorage implements ISessionStorage {
  private static REDIS_HOST: string = process.env.REDIS_HOST || "127.0.0.1";
  private static REDIS_PORT: number = parseInt(
    process.env.REDIS_PORT || "6379"
  );
  private static REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || "";
  private redisClient;
  private static redisSessionStorageInstance: RedisSessionStorage;

  public constructor() {
    this.redisClient = new Redis(RedisSessionStorage.REDIS_PORT, {
      host: RedisSessionStorage.REDIS_HOST,
      password: RedisSessionStorage.REDIS_PASSWORD,
    });
  }

  public static getInstance(): RedisSessionStorage {
    if (this.redisSessionStorageInstance === undefined) {
      this.redisSessionStorageInstance = new RedisSessionStorage();
      return this.redisSessionStorageInstance;
    }
    return this.redisSessionStorageInstance;
  }

  public async set(key: string, value: any): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value));
  }

  public async setWithTimeout(
    key: string,
    value: any,
    expiredAt: number
  ): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value));
    await this.redisClient.expireat(key, expiredAt);
  }

  public async get(key: string): Promise<any> {
    const data = await this.redisClient.get(key);
    if (data != null) {
      return JSON.parse(data);
    }

    return null;
  }

  public async delete(key: string): Promise<any> {
    try {
      const reply = await this.redisClient.del(key);
      return reply;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
