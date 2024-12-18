import { Request,Response } from "express";
import MinioService from "../db/minioService";
import busboy from "busboy";
import { Image } from "../model/image";
import logger from "../logger/logger";
import RedisService from "../db/redisService";
import ModelService from "../db/modelService";

export default function upload(req:Request , res:Response) : void{

    const bb = busboy({ headers: req.headers });
    const bucketName = "images";
    req.pipe(bb);

    bb.on("file",async (_,file,info)=>{
        const fileName = info.filename;
        const size : number = Number(req.headers["content-length"]);
        const fileType = fileName.split('.')[1];
        let model = ModelService.getInstance(Image);
        
        let session = await model.startSession();
        session.startTransaction();
        try{
            let redis = RedisService.getInstance();
            let minio = MinioService.getInstance();
            let found = await model.findOne({name : fileName});
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

            minio.uploadFile(bucketName ,fileName ,file ,size);    

            await session.commitTransaction();

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