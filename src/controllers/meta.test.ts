import { Image } from "../model/image";
import Meta from "./meta";
jest.mock("../model/image.ts")
import { Request,Response } from "express";


describe("Meta",()=>{

    let queryTypes = {
        name : "image.jpg",
        fileType : "jpg",
        "size.gt" : 200,
        "size.lt" : 250,
        "size.eq" : 200
    }

    let mockReq : Partial<Request>= {
    }

    let data = [{name: "image.jpg", size : 200 , fileType : "jpg"}];

    let mockRes: Partial<Response> = {
        json : jest.fn(),
        send: jest.fn()
    };
    

    beforeEach(()=>{
        mockRes.status = jest.fn().mockReturnValue(mockRes);
    })

    afterEach(()=>{
        jest.clearAllMocks();
    })

    it("findOne being called",async ()=>{
        (Image.findOne as jest.Mock).mockReturnValue(data);
        for (const [key, value] of Object.entries(queryTypes)) {
            let queryFilter = {}; 
            if (key === "name" || key === "fileType") {
                queryFilter = { [key]: value }; 
            } else if (key === "size.gt") {
                queryFilter = { size: { $gt: value } };
            } else if (key === "size.lt") {
                queryFilter = { size: { $lt: value } };
            } else if (key === "size.eq") {
                queryFilter = { size: { $eq: value } };
            }
            
            mockReq = {
                query: { [key]: value.toString() }, 
            };
    
            await Meta(mockReq as Request, mockRes as Response);
            expect(Image.findOne).toHaveBeenCalledWith(queryFilter);
            expect(mockRes.json).toHaveBeenCalledWith(data);
        }
    })

    it("should return a 500 status if error occurs",async()=>{
        (Image.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));
        await Meta(mockReq as Request, mockRes as Response);
        expect(mockRes.status).toHaveBeenCalledWith(500); 
        expect(mockRes.send).toHaveBeenCalledWith("Server error");
    })
})