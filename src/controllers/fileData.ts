import { Image } from "../model/image";
import { Request,Response } from "express";
import RedisService from "../db/redisService";
import logger from "../logger/logger";
import ModelService from "../db/modelService";
export default async function fileData(req: Request, res: Response) {
    const { name } = req.params;

    try {
        let imageInfo;
        let redis = RedisService.getInstance();
        let model = ModelService.getInstance(Image);
        let cacheData = await redis.getCache(name);
        if(cacheData){
            imageInfo = JSON.parse(cacheData);
        }
        else{
            imageInfo = await model.findOne({name});
            if(imageInfo)
                redis.setCache(name, JSON.stringify(imageInfo));
        }   

        logger.debug("Image found: " + imageInfo);
        res.json(imageInfo);
    } catch (e) {
        res.status(500).send("Server error");
    }
}

