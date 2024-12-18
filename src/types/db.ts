import { Readable } from "stream";
import * as minio from 'minio';

interface IRedisService{
    setCache(key: string, value : string) : Promise<void>;
    getCache(key: string) : Promise<string|null> ;
    deleteCache(key: string) : void;
}

interface IMinioService{
    uploadFile(bucketName: string, fileName: string, file: Readable, size: number) : Promise<void>;
    deleteFile(bucketName: string, fileName: string) : void;
    statFile(bucketName: string, fileName: string) : Promise<minio.BucketItemStat>;
    getFile(bucketName: string, fileName: string) : Promise<Readable>;
}

interface IModelService {
    find(query: object): Promise<any>;
    findOne(query: object): Promise<any>;
    startSession(): Promise<any>;
    deleteOne(query: object): Promise<any>;
    updateOne(query: object, data: object): Promise<any>;
}

interface Minio {
    endPoint : string,
    port: number,
    accessKey : string,
    secretKey : string,
    useSSL : boolean 
}

export {IRedisService, Minio, IMinioService, IModelService}