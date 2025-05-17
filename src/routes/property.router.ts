import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { createProperty, deleteProperty, getProperties, getPropertyById, updateProperty } from "../controllers/property.controller";

const propertyRouter: Router = Router();

propertyRouter.post("/",
    authMiddleware,
    checkRole([UserRole.vendor]),
    upload.array("images", 5),
    createProperty
);
propertyRouter.get("/", 
    getProperties
);
propertyRouter.get("/:id", 
    getPropertyById
);
propertyRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    upload.array("images", 5),
    updateProperty
);
propertyRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor, UserRole.admin, UserRole.superAdmin]),
    deleteProperty
);

export default propertyRouter;
