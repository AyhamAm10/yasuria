import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { upload } from "../middleware/uploadProfile";
import { getUserFavorites, toggleFavorite } from "../controllers/favorite.controller";

const favoriteRoute: Router = Router();

favoriteRoute.get("/", 
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.vendor , UserRole.user]),
    getUserFavorites
);

favoriteRoute.post("/toggle", 
    authMiddleware,
    checkRole([UserRole.admin , UserRole.superAdmin , UserRole.vendor , UserRole.user]),
    toggleFavorite
);


export default favoriteRoute;
