import Redis from "ioredis";
import logger from "../logger/logger";

const redis = new Redis({
    port : 6379,
    host : "redis"
  });

const setCache = async(key: string, value : string) =>{
    try{
        await redis.set(key,value);
        logger.info(`Set cache for ${key} with ${value}`);
    }catch(err){
        logger.error(`Error when deleting from cache ${err}`);
    }
}

const deleteCache = async(key: string ) => {
    try{
        await redis.del(key)
        logger.info(`Deleted cache for ${key}`);
    }catch(err){
        logger.error(`Error when deleting from cache ${err}`);
    }
}

const getCache = async(key: string , cb : Function) => {
    try{
        const value = await redis.get(key);
        logger.info(`Got cache for ${key} with ${value}`);
        cb(value,null);
    }catch(err){
        cb(null,err);
        logger.error(`Error when getting from cache ${err}`);
    }
};


const getCacheKey = (query : Record<string,string>) : string =>{
    const sortedByKey = Object.keys(query)
    .sort()  
    .reduce((acc: Record<string,string>, key) => {
        acc[key]  = query[key];  
        return acc;
    }, {});
    return JSON.stringify(sortedByKey);
}
export {setCache, deleteCache, getCache, getCacheKey}