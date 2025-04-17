import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

import { createService, deleteService, getServiceById, getServices, updateService } from "../controllers/Service.controller";
import { ServiceCategoryController } from "../controllers/serviceCategory.controller";

const serviceCategoryRouter: Router = Router();

serviceCategoryRouter.post("/",
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    ServiceCategoryController.createCategory
);

serviceCategoryRouter.get("/",
    authMiddleware,
    checkRole([ UserRole.superAdmin , UserRole.admin , UserRole.vendor , UserRole.user]),
    ServiceCategoryController.getCategorys
);

serviceCategoryRouter.get("/:id",
    authMiddleware,
    checkRole([ UserRole.superAdmin , UserRole.admin , UserRole.vendor , UserRole.user]),
    ServiceCategoryController.getServiceByCategoryId
);

serviceCategoryRouter.delete("/:id",
    authMiddleware,
    checkRole([ UserRole.superAdmin]),
    ServiceCategoryController.getServiceByCategoryId
);




export default serviceCategoryRouter;
