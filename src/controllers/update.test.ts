import { Request, Response } from "express";
import minioClient from "../db/minio";
import busboy from "busboy";
import { Image } from "../model/image";
import logger from "../logger/logger";
import update from "./update";


jest.mock("../db/minio.ts");
jest.mock("../logger/logger.ts");
jest.mock("../model/image");
jest.mock("busboy");

describe("Should update image details and size in mongo and minio", () => {
    let mockReq : Partial<Request>={
        headers: {
            "content-length" : "0"
        },
        pipe : jest.fn(),
        params : {
            name : "image.jpg"
        }
    };
    let mockRes : Partial<Response>={
        send : jest.fn(),
        status : jest.fn().mockReturnThis(),
    }
    let bb= {
        on : jest.fn(),
    }

    let file = {};

    let session = {
        startTransaction : jest.fn(),
        commitTransaction : jest.fn(),
        abortTransaction : jest.fn(),
        endSession : jest.fn(),
    }

    let found = {name: "image.jpg", updateOne : jest.fn()};

    beforeEach(()=>{
        jest.clearAllMocks();
        (busboy as jest.Mock).mockReturnValue(bb); 
    })

    it("Should update file and meta",async()=>{
    
    (Image.findOne as jest.Mock).mockReturnValue(found);
    (Image.startSession as jest.Mock).mockReturnValue(session);
    (minioClient.putObject as jest.Mock);
    (logger.info as jest.Mock);
    
    update(mockReq as Request, mockRes as Response);
    await bb.on.mock.calls[0][1]("",file);

    expect(mockReq.pipe).toHaveBeenCalledWith(bb);
    expect(bb.on).toHaveBeenCalledWith("file", expect.any(Function));
    expect(Image.findOne).toHaveBeenCalledWith({name :"image.jpg"});
    expect(Image.startSession).toHaveBeenCalled();
    expect(session.startTransaction).toHaveBeenCalled();
    expect(found.updateOne).toHaveBeenCalledWith({name :"image.jpg"},{$set :{size : 0}});
    expect(minioClient.putObject).toHaveBeenCalledWith("images","image.jpg",file,0)
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("MetaData and file updated");
    expect(mockRes.send).toHaveBeenCalledWith("File updated successfully");
    })
    
    it("Should return 404 if image not found",async()=>{  
        (Image.findOne as jest.Mock).mockReturnValue(null);
        (logger.error as jest.Mock)

        update(mockReq as Request, mockRes as Response);
        await bb.on.mock.calls[0][1]("",file);

        expect(bb.on).toHaveBeenCalledWith("file", expect.any(Function));
        expect(Image.findOne).toHaveBeenCalledWith({name :"image.jpg"});
        expect(mockReq.pipe).toHaveBeenCalledWith(bb);
        expect(logger.error).toHaveBeenCalledWith("Image does not exist");
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith("Image does not exist");
    })

    it("Should return 500 if error occurs",async()=>{
    (Image.findOne as jest.Mock).mockReturnValue(found);
    (Image.startSession as jest.Mock).mockReturnValue(session);
    (minioClient.putObject as jest.Mock);
    (found.updateOne as jest.Mock).mockRejectedValue(new Error("Error occurred"));
    (logger.error as jest.Mock);
    
    update(mockReq as Request, mockRes as Response);
    await bb.on.mock.calls[0][1]("",file);

    expect(mockReq.pipe).toHaveBeenCalledWith(bb);
    expect(bb.on).toHaveBeenCalledWith("file", expect.any(Function));
    expect(Image.findOne).toHaveBeenCalledWith({name :"image.jpg"});
    expect(Image.startSession).toHaveBeenCalled();
    expect(session.startTransaction).toHaveBeenCalled();
    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith("Error while updating file Error: Error occurred");
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Server error");
    })
});