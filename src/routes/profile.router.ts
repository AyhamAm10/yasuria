import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { PropertySearchController } from "../controllers/propertySearch.controller";
import { CarSearchController } from "../controllers/carSearch.controller";
import { updateProfile } from "../controllers/vendor.controller";



const profileRouter: Router = Router();

const propertyController = new PropertySearchController();

profileRouter.put("/profile",
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.vendor , UserRole.user]),
    upload.single("image"),
    updateProfile
);



export default profileRouter;
