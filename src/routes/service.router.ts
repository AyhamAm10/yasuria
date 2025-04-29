import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

import { createService, deleteService, getServiceById, getServices, updateService } from "../controllers/Service.controller";

const serviceRouter: Router = Router();

serviceRouter.post("/",
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    upload.single("icon"),
    createService
);
serviceRouter.get("/", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getServices
);
serviceRouter.get("/:id", 
    // authMiddleware,
    // checkRole([UserRole.vendor, UserRole.user, UserRole.admin, UserRole.superAdmin]),
    getServiceById
);
serviceRouter.put("/:id", 
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    upload.single("icon"),
    updateService
);
serviceRouter.delete("/:id", 
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    deleteService
);

export default serviceRouter;
