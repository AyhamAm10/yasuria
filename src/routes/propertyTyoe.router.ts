import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

import { createCarType, deleteCarType, getAllCarTypes, getCarTypeById, updateCarType } from "../controllers/carType.controller";

const propertyTypeRouter: Router = Router();

propertyTypeRouter.post("/",
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    createCarType
);
propertyTypeRouter.get("/", 
    getAllCarTypes
);
propertyTypeRouter.get("/:id", 
    getCarTypeById
);
propertyTypeRouter.put("/:id", 
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    updateCarType
);
propertyTypeRouter.delete("/:id", 
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    deleteCarType
);

export default propertyTypeRouter;
