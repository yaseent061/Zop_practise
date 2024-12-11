import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { httpRequestsTotal } from '../registry/registry';

export default function(req : Request , res : Response , next : NextFunction){
    const originalEnd = res.end;

    res.end = function (this: Response, data?: any, encoding?: string | (() => void), callback?: () => void): Response {
        if (typeof encoding === 'function') {
          callback = encoding; 
          encoding = undefined; 
        }

        const {method , path } = req;
        const {statusCode} = res;
        logger.info(`${method} HTTP request ${path} called with ${statusCode}`);
        httpRequestsTotal.inc({ method, status: statusCode , path});
    
        return originalEnd.call(this, data, encoding as BufferEncoding, callback);  
      };
    
      next(); 
}