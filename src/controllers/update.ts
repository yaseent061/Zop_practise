import { Request, Response } from "express";
import minioClient from "../db/minio";
import busboy from "busboy";
import { Image } from "../model/image";
import logger from "../logger/logger";
import {setCache} from "../db/redis";

export default function update(req : Request, res : Response){
    const bb = busboy({ headers: req.headers });
    const bucketName = "images";
    req.pipe(bb);

    bb.on("file",async (_,file)=>{
        const fileName = req.params.name;
        const size = Number(req.headers["content-length"]);

        let session;
        try{
            let found = await Image.findOne({name : fileName})
            if(!found){ 
                logger.error("Image does not exist");
                return res.status(404).send("Image does not exist")
            }
            session = await Image.startSession();
            session.startTransaction();

            console.log(await found.updateOne({name : fileName},{$set : {size}}));

            await minioClient.putObject(
            bucketName,
            fileName,
            file,
            size,
            )

        await session.commitTransaction();
        session.endSession();
        found.size = size;
        setCache(fileName,JSON.stringify(found));
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