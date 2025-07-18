import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter:Router = Router();

authRouter.get("/me", AuthController.me);
authRouter.post("/login", AuthController.login );
authRouter.post("/regester", AuthController.register );
authRouter.post("/logout", AuthController.logout);

export default authRouter;
