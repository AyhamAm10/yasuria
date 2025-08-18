// src/routes/chat.router.ts
import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const chatRouter = Router();
const controller = new ChatController()
chatRouter.post("/send", authMiddleware, controller.sendMessage.bind(controller));

chatRouter.get("/messages/:receiverId", authMiddleware,  controller.getMessages.bind(controller));

chatRouter.get("/contacts/", authMiddleware,  controller.getContacts.bind(controller));

export default chatRouter;
