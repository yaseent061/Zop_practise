import init from "./tracer/tracer";
init();

import express from "express";
import fileRouter from "./routes/fileRouter";
import config from "config";
import MongoConnection from "./db/mongoConnection";
import logger from "./logger/logger";
import metrics from "./middlewares/metrics";

const app = express();
let port : number  = config.get("app.port") || 5000;
const router = express.Router();

app.use(metrics)
app.use(fileRouter(router));

MongoConnection.connect();

app.listen(port,()=>{
    logger.info(`App listening on port ${port}`);
})

export default app