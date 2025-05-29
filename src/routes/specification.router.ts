import { Router } from "express";
import { createCar, deleteCar, getCarById, getCars, updateCar } from "../controllers/car.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadIcon } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { createSpecification , deleteSpecification , getSpecificationById , getSpecifications , updateSpecification } from "../controllers/Specifications.controller";

const specificationRouter: Router = Router();

specificationRouter.post("/",
    authMiddleware,
    checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    uploadIcon.single("icon"),
    createSpecification
);

specificationRouter.get("/", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getSpecifications
);

specificationRouter.get("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getSpecificationById
);

specificationRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    uploadIcon.single("icon"),
    updateSpecification
);

specificationRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor, UserRole.admin, UserRole.superAdmin]),
    deleteSpecification
);

export default specificationRouter;
