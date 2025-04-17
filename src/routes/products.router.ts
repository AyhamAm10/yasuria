import { Router } from "express";
import { createCar, deleteCar, getCarById, getCars, updateCar } from "../controllers/car.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { productsController } from "../controllers/product.controller";

const productsRouter: Router = Router();

productsRouter.get("/", 
    productsController.getProducts
);


export default productsRouter;
