import { Request,Response } from "express";
import minioClient from "../db/minio";
import busboy from "busboy";
import { Image } from "../model/image";
import logger from "../logger/logger";
import {setCache} from "../db/redis";

export default function upload(req:Request , res:Response) : void{

    const bb = busboy({ headers: req.headers });
    const bucketName = "images";
    req.pipe(bb);

    bb.on("file",async (_,file,info)=>{
        const fileName = info.filename;
        const size : number = Number(req.headers["content-length"]);
        const fileType = fileName.split('.')[1];
    
        let session = await Image.startSession();
        session.startTransaction();
        try{
            let found = await Image.findOne({name : fileName});
            if(found){ 
                logger.error("Image already exists");
                return res.status(400).send("Image already exists")
            }
            
            const imageMetaData = new Image({
                name : fileName,
                size,
                fileType 
            });

            await imageMetaData.save({session});

            await minioClient.putObject(
                bucketName,
                fileName,
                file,
                size,
            )
            await session.commitTransaction();
            setCache(fileName,JSON.stringify(imageMetaData));

            logger.info("MetaData and file uploaded");
            res.send("File uploaded successfully");
        }catch(err){
            if(session){
                await session.abortTransaction();
            }
            logger.error(`Error while uploading file ${err}`);
            res.status(500).send("Server error");
        }
        finally{
            session.endSession();
        }
    })
   
};