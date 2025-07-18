import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter:Router = Router();

authRouter.get("/me", authMiddleware ,  AuthController.me);
authRouter.post("/login", AuthController.login );
authRouter.post("/regester", AuthController.register );
authRouter.post("/logout", AuthController.logout);

export default authRouter;
