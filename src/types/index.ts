import { Document } from "mongoose"

interface Image extends Document{
    name : string,
    size : number,
    fileType: string; 
}

export {Image};