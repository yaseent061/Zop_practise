import logger from "../logger/logger"

const errorHandler = (fn : Function)=>{
    try{
        return fn();
    }
    catch(err : any) {
        logger.error(err.message);
    }
}

export default errorHandler;