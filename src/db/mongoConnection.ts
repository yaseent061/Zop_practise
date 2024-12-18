import mongoose from "mongoose";
import config from "config";
const uri : string = config.get("mongo.uri")
import logger from "../logger/logger";

class MongoConnection {
    private constructor() {
    }

    public static connect = async()=>{
        try{
            await mongoose.connect(uri);
        }catch(err){
            logger.error("Error connecting to db");
            process.exit(1);
        }
    }
}

export default MongoConnection;