import { Request,Response } from "express";
import minioClient from "../db/minioService";
import busboy from "busboy";
import { Image } from "../model/image";
import logger from "../logger/logger";
import upload from "./upload";

jest.mock("../db/minio.ts");
jest.mock("../logger/logger.ts");
jest.mock("../model/image");
jest.mock("busboy");

describe("Should upload image to minio and meta data to mongo", () => {
    let mockReq : Partial<Request>={
        headers: {
            "content-length" : "0"
        },
        pipe : jest.fn()
    };
    let mockRes : Partial<Response> = {
        send: jest.fn(),
        status : jest.fn().mockReturnThis(),
    };

    let bb = {
        on :jest.fn()
    }

    let session = {
        startTransaction : jest.fn(),
        commitTransaction : jest.fn(),
        abortTransaction : jest.fn(),
        endSession : jest.fn(),
    }

    let file = {};
    let info = {
        filename : "xyz.pdf"
    };

    beforeEach(()=>{
        jest.clearAllMocks();
    })

    it("should call busboy", async() => {
        (busboy as jest.Mock).mockReturnValue(bb);

        upload(mockReq as Request, mockRes as Response);

        expect(busboy).toHaveBeenCalledWith({headers : mockReq.headers});
        expect(mockReq.pipe).toHaveBeenCalledWith(bb);
        
    }); 

    it("busboy on file event",async()=>{
        (busboy as jest.Mock).mockReturnValue(bb);
        (Image.findOne as jest.Mock).mockReturnValue(null);
        (Image.startSession as jest.Mock).mockReturnValue(session);
        (minioClient.putObject as jest.Mock);
        (logger.info as jest.Mock);
        Image.prototype.save = jest.fn();
        const imageMeta = new Image();

        upload(mockReq as Request, mockRes as Response);
        await bb.on.mock.calls[0][1]("",file,info);

        expect(bb.on).toHaveBeenCalledWith("file", expect.any(Function));
        expect(Image.findOne).toHaveBeenCalledWith({name : "xyz.pdf"}); 
        expect(Image.startSession).toHaveBeenCalled();
        expect(session.startTransaction).toHaveBeenCalled();
        expect(imageMeta.save).toHaveBeenCalledWith({session});
        expect(minioClient.putObject).toHaveBeenCalledWith("images","xyz.pdf",file,0);
        expect(session.commitTransaction).toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith("MetaData and file uploaded");
        expect(mockRes.send).toHaveBeenCalledWith("File uploaded successfully");
    })

    it("should return 400 if image exists",async()=>{
        (busboy as jest.Mock).mockReturnValue(bb);
        (Image.findOne as jest.Mock).mockResolvedValue({name : "xyz.pdf"});

        upload(mockReq as Request, mockRes as Response);
        await bb.on.mock.calls[0][1]("",file,info);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith("Image already exists");
    })

    it("should return 500 if transaction fails",async()=>{
        (busboy as jest.Mock).mockReturnValue(bb);
        (Image.findOne as jest.Mock).mockResolvedValue(null);
        (Image.startSession as jest.Mock).mockResolvedValue(session);
        (minioClient.putObject as jest.Mock).mockRejectedValue(new Error("Transaction failed"));
        (logger.error as jest.Mock);
        Image.prototype.save = jest.fn();

        upload(mockReq as Request, mockRes as Response);
        await bb.on.mock.calls[0][1]("",file,info);

        expect(session.abortTransaction).toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith("Error while uploading file Error: Transaction failed");
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith("Server error");
    })
});
