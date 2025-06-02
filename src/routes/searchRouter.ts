import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";
import { PropertySearchController } from "../controllers/propertySearch.controller copy";
import { CarSearchController } from "../controllers/carSearch2.controller";
import { NextFunction , Request , Response } from "express-serve-static-core";



const SearchRouter: Router = Router();

const propertyController = new PropertySearchController();
const carControoler = new CarSearchController()

SearchRouter.post("/properties",
    optionalAuthMiddleware,
    propertyController.search
);

SearchRouter.post("/cars",
    optionalAuthMiddleware,
    carControoler.search
);


export default SearchRouter;
