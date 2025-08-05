import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/uploadProfile";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { PropertySearchController } from "../controllers/propertySearch.controller";
import { CarSearchController } from "../controllers/carSearch.controller";
import { deleteProfile, updateProfile } from "../controllers/vendor.controller";



const profileRouter: Router = Router();

profileRouter.put("/profile",
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.user]),
    upload.single("image"),
    updateProfile
);

profileRouter.delete("/profile",
    authMiddleware,
    deleteProfile
)



export default profileRouter;
