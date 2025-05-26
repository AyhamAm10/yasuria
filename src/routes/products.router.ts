import { Router } from "express";
import { productsController } from "../controllers/product.controller";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";

const productsRouter: Router = Router();

productsRouter.get(
  "/",
  optionalAuthMiddleware,
  productsController.getProducts
);

export default productsRouter;
