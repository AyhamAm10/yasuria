import { Router } from "express";
import { createCar, deleteCar, getCarById, getCars, updateCar } from "../controllers/car.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadIcon } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, getChildattribute, updateAttribute, updateAttributeOrder } from "../controllers/attribute.controller";

const attributeRouter: Router = Router();

attributeRouter.post("/",
    authMiddleware,
    checkRole([ UserRole.admin, UserRole.superAdmin]),
    uploadIcon.single("icon"),
    createAttribute
);

attributeRouter.get("/", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributes
);

attributeRouter.post("/child/:id", 
    getChildattribute
);

attributeRouter.put("/order/:id", 
    authMiddleware,
    checkRole([UserRole.superAdmin]),
    updateAttributeOrder
);

attributeRouter.get("/:id", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getAttributeById
);

attributeRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.superAdmin]),
    uploadIcon.single("icon"),
    updateAttribute
);


attributeRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.superAdmin]),
    deleteAttribute
);

export default attributeRouter;
