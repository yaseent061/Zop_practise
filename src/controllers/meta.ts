import { Image } from "../model/image";
import { Request,Response } from "express";
import { FilterQuery } from "mongoose";
import RedisService from "../db/redisService";
import logger from "../logger/logger";
import getCacheKey from "../util/cacheKey";
import ModelService from '../db/modelService';
export default async function meta(req: Request, res: Response) {
    const { name, fileType } = req.query;
    const size_gt = Number(req.query['size.gt']);
    const size_lt = Number(req.query['size.lt']);
    const size_eq = Number(req.query['size.eq']);
    let cacheStr = getCacheKey(req.query as Record<string, string>);

    let queryFilter: FilterQuery<Image> = {};

    if (name) queryFilter.name = name as string;
    if (fileType) queryFilter.fileType = fileType as string;
    if (size_gt) {
        queryFilter.size = { $gt: size_gt };
    }
    if (size_lt) {
        queryFilter.size = { $lt: size_lt };
    }
    if (size_eq) {
        queryFilter.size = { $eq: size_eq };
    }

    try {
        let imageInfo;
        let redis = RedisService.getInstance();
        let model = ModelService.getInstance(Image);
        let cacheData = await redis.getCache(cacheStr)
        if(cacheData){
            imageInfo = JSON.parse(cacheData);
        }
        else{
            imageInfo = await model.find(queryFilter);
            redis.setCache(cacheStr, JSON.stringify(imageInfo));
        }   

        logger.info("Image found: " + imageInfo)
        res.json(imageInfo);

    } catch (e) {
        res.status(500).send("Server error")
    }
}

