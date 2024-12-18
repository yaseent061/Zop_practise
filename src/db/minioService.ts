import * as minio from "minio"
import config from "config";
import { Minio } from "../types/db";
import { Readable } from "stream";
import errorHandler from "../util/errorHandler";

const { endPoint, accessKey, secretKey, useSSL,port} : Minio = config.get("minio") 

class MinioService{
    minio : minio.Client;
    private static instance : MinioService | null = null;

    private constructor(minioClient : minio.Client){
        this.minio = minioClient;
    }   

    public static getInstance() : MinioService{
        if(!MinioService.instance){
            const minioClient = new minio.Client({
                endPoint,
                port,
                accessKey,
                secretKey,
                useSSL
            })
            MinioService.instance = new MinioService(minioClient);
        }
        return MinioService.instance;
    }

    async uploadFile(bucketName: string, fileName: string, file: Readable, size: number): Promise<void>{
        errorHandler(async()=>{
            await this.minio.putObject(
                bucketName,
                fileName,
                file,
                size,
            )
        })
    }

    async deleteFile(bucketName: string, fileName: string) : Promise<void>{
        errorHandler(async()=>{
            await this.minio.removeObject(bucketName, fileName);
        })
    }

    async statFile(bucketName: string, fileName: string) : Promise<minio.BucketItemStat>{
        return errorHandler(async() =>{
            return await this.minio.statObject(bucketName, fileName);
        })
    }

    async getFile(bucketName: string, fileName: string) : Promise<Readable>{
        return errorHandler(async() =>{
            return await this.minio.getObject(bucketName, fileName);
        })
    }
}

export default MinioService;