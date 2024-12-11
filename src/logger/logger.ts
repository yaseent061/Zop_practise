import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const filename = path.join(logDirectory, 'app-%DATE%.log');

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({label : "NodeApp"}),
        winston.format.json()
    ),
    transports: [
        new DailyRotateFile({
            filename : filename,
            datePattern : "YYYY-MM-DD",
            zippedArchive : true,
            maxSize : "20m",
            maxFiles : "14d"
        }),
        new winston.transports.Console({format : winston.format.simple()})
    ]
})

export default logger;