import { Router } from "express";
import {
  getAllUser,
  getUserCars,
  getUserProperties,
  getUserRequests,
  deleteUser,
  deleteUserCar,
  deleteUserProperty,
  deleteUserRequest,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware"; 
import { UserRole } from "../entity/User";

const userRoute = Router();

userRoute.get("/", authMiddleware, checkRole([UserRole.superAdmin]), getAllUser);

userRoute.get("/:userId/cars", authMiddleware, checkRole([UserRole.superAdmin]), getUserCars);
userRoute.get("/:userId/properties", authMiddleware, checkRole([UserRole.superAdmin]), getUserProperties);
userRoute.get("/:userId/requests", authMiddleware, checkRole([UserRole.superAdmin]), getUserRequests);

userRoute.delete("/car/:carId", authMiddleware, checkRole([UserRole.superAdmin]), deleteUserCar);
userRoute.delete("/property/:propertyId", authMiddleware, checkRole([UserRole.superAdmin]), deleteUserProperty);
userRoute.delete("/request/:requestId", authMiddleware, checkRole([UserRole.superAdmin]), deleteUserRequest);

userRoute.delete("/:userId", authMiddleware, checkRole([UserRole.superAdmin]), deleteUser);

export default userRoute;
