import { Image } from "../model/image";
import { Request,Response } from "express";
import { FilterQuery } from "mongoose";
import { getCache, setCache } from "../db/redis";
import logger from "../logger/logger";
export default async function meta(req : Request, res : Response){
    const {name,fileType} = req.query;
    const size_gt = Number(req.query['size.gt']);
    const size_lt = Number(req.query['size.lt']);
    const size_eq = Number(req.query['size.eq']);

    let queryFilter : FilterQuery<Image> = {};

    if(name) queryFilter.name = name as string;
    if(fileType) queryFilter.fileType = fileType as string;
    if(size_gt){
        queryFilter.size = {$gt : size_gt };
    }
    if(size_lt){
        queryFilter.size = {$lt : size_lt };
    }
    if(size_eq){
        queryFilter.size = {$eq : size_eq };
    }
    
    try{  
        let imageInfo;
        if(name){
            getCache(String(name), async(data : string, err : Error)=>{
                if(err) {
                    const imageInfo = await Image.findOne(queryFilter); 
                    setCache(String(name), JSON.stringify(imageInfo));
                    return
                }
                imageInfo = JSON.parse(data);
            })
        } 
        else{
            imageInfo = await Image.findOne(queryFilter);    
        }
        logger.info("Image found: " + imageInfo)
        res.json(imageInfo);    
        
    }catch(e){
        res.status(500).send("Server error")
    }
}

