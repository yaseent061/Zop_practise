import {Router} from "express";
import upload from "../controllers/upload"
import Meta from "../controllers/meta";
import Download from "../controllers/download";
import update from "../controllers/update";
import remove from "../controllers/remove";
import metrics from "../controllers/metrics";
import healthCheck from "../controllers/healthCheck";

const fileRouter = (router : Router) : Router=>{
    router.post('/binary', upload); 
    router.get('/binary/meta', Meta);
    router.get('/binary/:name', Download);
    router.put('/binary/:name', update);
    router.delete('/binary/:name', remove);
    router.get('/metrics',metrics);
    router.get('health', healthCheck);
    return router
}

export default fileRouter