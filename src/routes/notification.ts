import { Router } from "express";
import { NotificationController } from "../controllers/Notification.controller";


const notificationRoutes = Router();
const controller = new NotificationController();

notificationRoutes.get("/user/", controller.getUserNotifications.bind(controller));
notificationRoutes.post("/register-token", controller.registerToken.bind(controller));
notificationRoutes.post("/send-notification", controller.sendNotification.bind(controller));
export default notificationRoutes;
