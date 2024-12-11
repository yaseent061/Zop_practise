import { Document } from "mongoose"

interface Minio {
    endPoint : string,
    port: number,
    accessKey : string,
    secretKey : string,
    useSSL : boolean 
}

interface Image extends Document{
    name : string,
    size : number,
    fileType: string; 
}

// interface QueryFilter{
//     name ?: string,
//     type ?: string,
//     size ?: {
//         [string] : number
//     },
// }

export {Minio,Image};