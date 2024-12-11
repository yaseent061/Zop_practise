import { Request, Response } from "express";
import {Image} from "../model/image";
import minioClient from "../db/minio";
import logger from "../logger/logger";
import remove from "./remove";

jest.mock("../model/image.ts");
jest.mock("../db/minio.ts");
jest.mock("../logger/logger.ts");

describe("Should delete image from minio and remove metadata", () => {
    let mockReq : Partial<Request>= {
        params: {
            name: "image.jpg"
        }
    }

    let mockRes : Partial<Response> =  {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
    }

    let session = {
        startTransaction : jest.fn(),
        commitTransaction : jest.fn(),
        abortTransaction : jest.fn(),
        endSession : jest.fn(),
    }

    let found = {name: "image.jpg"};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete image and metadata",async ()=>{
        (Image.findOne as jest.Mock).mockReturnValue({name: "image.jpg"});
        (Image.startSession as jest.Mock).mockReturnValue(session);
        (logger.info as jest.Mock);

        await remove(mockReq as Request,mockRes as Response);

        expect(Image.findOne).toHaveBeenCalledWith({name : "image.jpg"});
        expect(Image.startSession).toHaveBeenCalled();
        expect(session.startTransaction).toHaveBeenCalled();
        expect(Image.deleteOne).toHaveBeenCalledWith({name : "image.jpg"});
        expect(minioClient.removeObject).toHaveBeenCalledWith("images","image.jpg");
        expect(session.commitTransaction).toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith("Image image.jpg removed successfully");
        expect(mockRes.send).toHaveBeenCalledWith("Image removed successfully");
    })

    it("should return 404 if image not found",async()=>{
        (Image.findOne as jest.Mock).mockReturnValue(null);

        await remove(mockReq as Request,mockRes as Response);

        expect(Image.findOne).toHaveBeenCalledWith({name : "image.jpg"});
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith("Image does not exist");
    });

    it("should return 500 status if error occurs",async()=>{
        (Image.findOne as jest.Mock).mockReturnValue(found);
        (Image.startSession as jest.Mock).mockReturnValue(session);
        (session.startTransaction as jest.Mock);
        (Image.deleteOne as jest.Mock).mockRejectedValue(new Error("Error Occurred"));
        (session.abortTransaction as jest.Mock);
        (session.endSession as jest.Mock)
        

        await remove(mockReq as Request,mockRes as Response);

        expect(Image.findOne).toHaveBeenCalledWith({name : "image.jpg"});
        expect(Image.startSession).toHaveBeenCalled();
        expect(session.startTransaction).toHaveBeenCalled();
        expect(session.abortTransaction).toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith("Server error");
    });

});