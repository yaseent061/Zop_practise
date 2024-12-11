import mongoose,{Schema} from "mongoose";
import {Image} from "../types/index"


const ImageSchema = new Schema<Image>({
    name : {type : String, required : true},
    size : {type : Number , required : true},
    fileType : {type : String}
})

const Image = mongoose.model<Image>("Image",ImageSchema);

export {Image}