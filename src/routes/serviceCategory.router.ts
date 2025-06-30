import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload, uploadIcon } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../controllers/Service.controller";
import { ServiceCategoryController } from "../controllers/serviceCategory.controller";

const serviceCategoryRouter: Router = Router();

serviceCategoryRouter.post(
  "/",
  authMiddleware,
  checkRole([UserRole.superAdmin]),
  upload.single("icon"),
  ServiceCategoryController.createCategory
);

serviceCategoryRouter.get(
  "/",
  authMiddleware,
  checkRole([
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.user,
  ]),
  ServiceCategoryController.getCategorys
);

serviceCategoryRouter.put(
  "/:id",
  authMiddleware,
  checkRole([UserRole.superAdmin]),
  upload.single("icon"),
  ServiceCategoryController.updateCategory
);

serviceCategoryRouter.get(
  "/:id",
  authMiddleware,
  checkRole([
    UserRole.superAdmin,
    UserRole.admin,
    UserRole.user,
  ]),
  ServiceCategoryController.getServiceByCategoryId
);

serviceCategoryRouter.delete(
  "/:id",
  authMiddleware,
  checkRole([UserRole.superAdmin]),
  ServiceCategoryController.getServiceByCategoryId
);

export default serviceCategoryRouter;
