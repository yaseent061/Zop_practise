import fileRouter from './fileRouter';
import {Router} from 'express';
import Upload from '../controllers/upload';
import Meta from '../controllers/meta'
import Download from '../controllers/download';
import update from '../controllers/update';
import remove from '../controllers/remove';
 
jest.mock("../controllers/Upload.ts");
jest.mock("../controllers/Meta.ts");
jest.mock("../controllers/Download.ts");
jest.mock("../controllers/update.ts");
jest.mock("../controllers/remove.ts");

describe("fileRouter",()=>{
  let router : Router;
    beforeAll(()=>{
       router = { post: jest.fn(), get: jest.fn(), put: jest.fn(), delete: jest.fn() } as unknown as Router;
    })

    beforeEach(()=>{
      jest.clearAllMocks();
    })

    it("fileRouter returns router",()=>{
      let fn = fileRouter(router);//{get, post}
      expect(fn).toBe(router);
    });

    it("routes have been set",()=>{
      (Upload as jest.Mock).mockImplementation(jest.fn());
      (Meta as jest.Mock).mockImplementation(jest.fn());
      (Download as jest.Mock).mockImplementation(jest.fn());
      (update as jest.Mock).mockImplementation(jest.fn());
      (remove as jest.Mock).mockImplementation(jest.fn());

      let fn = fileRouter(router);

      expect(fn.post).toHaveBeenCalledWith("/binary", Upload);
      expect(fn.get).toHaveBeenCalledWith("/binary/:name",Download);
      expect(fn.get).toHaveBeenCalledWith("/binary/meta",Meta);
      expect(fn.put).toHaveBeenCalledWith("/binary/:name",update);
      expect(fn.delete).toHaveBeenCalledWith("/binary/:name",remove);
    })
})