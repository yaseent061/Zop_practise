import Redis from "ioredis";
import logger from "../logger/logger";
import { IRedisService } from "../types/db";
import errorHandler from "../util/errorHandler";
import config from "config";


class RedisService implements IRedisService {
    redis : Redis;
    private static instance : RedisService | null = null;

    private constructor(cacheClient : Redis){
         this.redis = cacheClient;
    }

    public static getInstance(): RedisService{
        if(!RedisService.instance){
            const cacheClient = new Redis({
                port : config.get("redis.port"),
                host : config.get("redis.host")
              });
            
            RedisService.instance = new RedisService(cacheClient);
        }
        return RedisService.instance;
    }

    async setCache(key: string, value : string): Promise<void> {
        errorHandler(async () => {
            await this.redis.set(key,value);
            logger.info(`Set cache for ${key} with ${value}`);
        })
    }
    
    async deleteCache(key: string){
        errorHandler(async () => {
            await this.redis.del(key)
            logger.info(`Deleted cache for ${key}`);
        })
    }
    
    async getCache(key: string ): Promise<string|null>{
        return errorHandler(async () => {
            const value = await this.redis.get(key);
                logger.info(`Got cache for ${key} with ${value}`);
                return value;
        })
}
}

export default RedisService;
