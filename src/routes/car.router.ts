import { Router } from "express";
import { createCar, deleteCar, getCarById, getCars, updateCar } from "../controllers/car.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";

const carRouter: Router = Router();

carRouter.post("/", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    upload.array("images", 5),
    createCar
);
carRouter.get("/", 
   optionalAuthMiddleware,
    getCars
);
carRouter.get("/:id", 
    optionalAuthMiddleware,
    getCarById
);
carRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    upload.array("images", 5),
    updateCar
);
carRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor, UserRole.admin, UserRole.superAdmin]),
    deleteCar
);

export default carRouter;
