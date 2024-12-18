import { Request, Response } from "express";
import minioService from "../db/minioService";
import busboy from "busboy";
import { Image } from "../model/image";
import logger from "../logger/logger";
import redisService from "../db/redisService";
import ModelService from "../db/modelService";

export default function update(req : Request, res : Response){
    const bb = busboy({ headers: req.headers });
    const bucketName = "images";
    req.pipe(bb);

    bb.on("file",async (_,file)=>{
        const fileName = req.params.name;
        const size = Number(req.headers["content-length"]);
        let session;
        try{
            let redis = redisService.getInstance();
            let minio = minioService.getInstance();
            let model = ModelService.getInstance(Image);
            let found = await model.findOne({name : fileName})
            if(!found){ 
                logger.error("Image does not exist");
                return res.status(404).send("Image does not exist")
            }
            session = await model.startSession();
            session.startTransaction();

            await model.updateOne({name : fileName},{$set : {size}});

            minio.uploadFile(bucketName, fileName, file, size);

        await session.commitTransaction();
        session.endSession();

        found.size = size;
        redis.setCache(fileName,JSON.stringify(found));
        logger.info("MetaData and file updated")
        res.send("File updated successfully")
    }
        catch(err){
            if(session){
                await session.abortTransaction();
                session.endSession();
            }
            logger.error(`Error while updating file ${err}`)
            res.status(500).send("Server error");
        }
    });
}