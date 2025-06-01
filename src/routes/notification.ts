import { Router } from "express";
import { NotificationController } from "../controllers/Notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";


const notificationRoutes = Router();
const controller = new NotificationController();

notificationRoutes.get("/user", authMiddleware , controller.getUserNotifications.bind(controller));
notificationRoutes.post("/register-token", authMiddleware , controller.registerToken.bind(controller));
notificationRoutes.post("/send-notification", authMiddleware ,checkRole([UserRole.superAdmin]), controller.sendNotification.bind(controller));
export default notificationRoutes;
