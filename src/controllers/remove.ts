import { Request, Response } from "express";
import {Image} from "../model/image";
import MinioService from "../db/minioService";
import logger from "../logger/logger";
import RedisService from "../db/redisService";
import ModelService from "../db/modelService";

export default async function remove(req: Request, res: Response){
    const fileName = req.params.name;
    let session ;
    
    try{
        let redis = RedisService.getInstance();
        let minio = MinioService.getInstance();
        let model = ModelService.getInstance(Image);
        let found = await model.findOne({name: fileName});
        if(!found) {
            res.status(404).send("Image does not exist");
            return; 
        }
        session = await model.startSession();
        session.startTransaction();

        await model.deleteOne({name : fileName});
        minio.deleteFile("images" , fileName);
        
        session.commitTransaction();
        session.endSession();
        redis.deleteCache(fileName);  

        logger.info(`Image ${fileName} removed successfully`);
        res.send("Image removed successfully");
    }
    catch(err){
        if(session){
            await session.abortTransaction();
            session.endSession();
        }
        res.status(500).send("Server error");
    }
}