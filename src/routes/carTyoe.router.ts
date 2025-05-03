import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

import { createCarType, deleteCarType, getAllCarTypes, getCarTypeById, updateCarType } from "../controllers/carType.controller";

const carTypeRouter: Router = Router();

carTypeRouter.post("/",
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    createCarType
);
carTypeRouter.get("/", 
    getAllCarTypes
);
carTypeRouter.get("/:id", 
    getCarTypeById
);
carTypeRouter.put("/:id", 
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    updateCarType
);
carTypeRouter.delete("/:id", 
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    deleteCarType
);

export default carTypeRouter;
