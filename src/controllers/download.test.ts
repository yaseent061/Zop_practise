import { Request,Response } from "express";
import minioClient from "../db/minio";
import logger from "../logger/logger";
import download from "./download";


jest.mock("../db/minio");
jest.mock("../logger/logger.ts");

describe("Download", () => {
    let mockReq: Partial<Request>;
    let mockRes : Partial<Response>;
    let mockStream = {
        pipe: jest.fn(),
        on: jest.fn(),
    }

    beforeAll(()=>{
        mockReq  = {
            params: { name: "image.jpg" },
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    })
    afterEach(()=>{
        jest.clearAllMocks();
    })

    it("should check if image exists in minio", async () => {
        (logger.error as jest.Mock);
        (minioClient.statObject as jest.Mock).mockReturnValue(null);
        await download(mockReq as Request, mockRes as Response); 
        expect(logger.error).toHaveBeenCalledWith("Image does not exist");
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith("Image does not exist");
    })

    it("should fetch image for minio",async ()=>{
        (minioClient.getObject as jest.Mock).mockReturnValue(mockStream);
        await download(mockReq as Request, mockRes as Response); 
        expect(mockStream.pipe).toHaveBeenCalledWith(mockRes);
    })

    it("should return 500 status if error occurs",async()=>{
        (logger.error as jest.Mock);
        (minioClient.getObject as jest.Mock).mockRejectedValue(new Error("Error downloading image"));
        await download(mockReq as Request, mockRes as Response);
        expect(logger.error).toHaveBeenCalledWith("Error while fetching image {}");
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith("Server error");
        })

    it("should handle error event when streaming",async()=>{
        (logger.error as jest.Mock);
        (minioClient.getObject as jest.Mock).mockReturnValue(mockStream);

        await download(mockReq as Request, mockRes as Response);
        mockStream.on.mock.calls[0][1](new Error("Error streaming"));
        
        expect(mockStream.on).toHaveBeenCalledWith("error", expect.any(Function));  
        expect(logger.error).toHaveBeenCalledWith("Error streaming data Error: Error streaming");
    })
})