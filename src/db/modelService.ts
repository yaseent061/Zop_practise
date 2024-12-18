import { Image } from "../model/image";
import mongoose from "mongoose";
import errorHandler from "../util/errorHandler";
import { IModelService } from "../types/db";

class ModelService<T> implements IModelService {
    model: mongoose.Model<T>;
    private static instance : ModelService<any> | null = null;
    private constructor(model : mongoose.Model<T>) {
        this.model = model;
    }

    public static getInstance<U>(model : mongoose.Model<U>) : ModelService<U> {
        if(!ModelService.instance){
            ModelService.instance = new ModelService(model)
        }
        return ModelService.instance;
    }


    async find(query: object): Promise<T[]>{
       return errorHandler(async ()=>{
        return await this.model.find(query);
       })
    }

    async findOne(query: object): Promise<T>{
        return errorHandler(async ()=>{
         return await this.model.findOne(query);
        })
     }

     async startSession(){
        return errorHandler(async ()=>{
            return await this.model.startSession();
        })
     }

     async deleteOne(query: object){
        return errorHandler(async ()=>{
            return await this.model.deleteOne(query);
           })
     }

     async updateOne(query: object, data: object){
        errorHandler(async ()=>{
            return await this.model.updateOne(query, data);
        })
     }

}

export default ModelService