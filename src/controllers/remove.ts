import { Request, Response } from "express";
import {Image} from "../model/image";
import minioClient from "../db/minio";
import logger from "../logger/logger";
import {deleteCache} from "../db/redis";

export default async function remove(req: Request, res: Response){
    const fileName = req.params.name;
    let session ;
    
    try{
        let found = await Image.findOne({name: fileName});
        if(!found) {
            res.status(404).send("Image does not exist");
            return; 
        }
        session = await Image.startSession();
        session.startTransaction();

        await Image.deleteOne({name : fileName});
        await minioClient.removeObject("images", fileName);
        
        session.commitTransaction();
        session.endSession();

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