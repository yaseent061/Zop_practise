import { Request,Response } from "express";
import minioClient from "../db/minio";
import logger from "../logger/logger";

export default async function download(req : Request , res : Response){
    const bucketName = "images";
    const img = req.params.name;
    try{
        const stat = await minioClient.statObject(bucketName,img);
        if(!stat){
            logger.error("Image does not exist");
            res.status(400).send("Image does not exist");
        }

        const dataStream = await minioClient.getObject(bucketName,img);
        
        dataStream.pipe(res);
        dataStream.on("error",(err)=>{
           logger.error(`Error streaming data ${err}`);
        })
        
    }catch(e){
        logger.error(`Error while fetching image ${JSON.stringify(e)}`);
        res.status(500).send("Server error")
    }
}