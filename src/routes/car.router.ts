import { Router } from "express";
import { createCar, deleteCar, getCarById, getCars, updateCar } from "../controllers/car.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

const carRouter: Router = Router();

carRouter.post("/", 
    // authMiddleware,
    // checkRole([UserRole.vendor]),
    upload.array("images", 5),
    createCar
);
carRouter.get("/", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getCars
);
carRouter.get("/:id", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
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
