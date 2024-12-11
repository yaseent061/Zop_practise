import { Request, Response } from "express";
import { register } from "../registry/registry";

export default async function(req : Request, res : Response){
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}