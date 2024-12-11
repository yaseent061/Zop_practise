import * as minio from "minio"
import config from "config";
import { Minio } from "../types";

const { endPoint, accessKey, secretKey, useSSL,port} : Minio = config.get("minio") 

const minioClient = new minio.Client({
    endPoint,
    port,
    accessKey,
    secretKey,
    useSSL
})

export default minioClient;