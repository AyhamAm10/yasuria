import { Router } from "express";
import { productsController } from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

const productsRouter: Router = Router();

productsRouter.get(
  "/",
  authMiddleware,
  checkRole([
    UserRole.vendor,
    UserRole.user,
    UserRole.admin,
    UserRole.superAdmin,
  ]),
  productsController.getProducts
);

export default productsRouter;
