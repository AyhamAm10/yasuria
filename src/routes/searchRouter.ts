import { Router } from "express";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";
import { PropertySearchController } from "../controllers/propertySearch.controller";
import { CarSearchController } from "../controllers/carSearch.controller";

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
