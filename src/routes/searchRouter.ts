import { Router } from "express";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";
import { CarSearchController } from "../controllers/carSearch2.controller";
import { PropertySearchController } from "../controllers/propertySearch.controller";

const SearchRouter: Router = Router();

const propertyController = new PropertySearchController();
const carControoler = new CarSearchController();

SearchRouter.post(
  "/properties",
  optionalAuthMiddleware,
  propertyController.search
);

SearchRouter.post("/cars", optionalAuthMiddleware, carControoler.search);

export default SearchRouter;
