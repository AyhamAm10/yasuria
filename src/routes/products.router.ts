import { Router } from "express";
import { productsController } from "../controllers/product.controller";

const productsRouter: Router = Router();

productsRouter.get("/", 
    productsController.getProducts
);


export default productsRouter;
