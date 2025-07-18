import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { createProperty, deleteProperty, getProperties, getPropertyById, updateProperty } from "../controllers/property.controller";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";

const propertyRouter: Router = Router();

propertyRouter.post("/",
    authMiddleware,
    checkRole([UserRole.user]),
    upload.array("images", 20),
    createProperty
);

propertyRouter.get("/", 
    optionalAuthMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getProperties
);
propertyRouter.get("/:id", 
    optionalAuthMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getPropertyById
);
propertyRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.user]),
    upload.array("images", 20),
    updateProperty
);
propertyRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.user, UserRole.admin, UserRole.superAdmin]),
    deleteProperty
);

export default propertyRouter;
