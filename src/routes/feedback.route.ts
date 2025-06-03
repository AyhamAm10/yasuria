import { Router } from "express";
import {
  createUserFeedback,
  deleteUserFeedback,
  getAllUserFeedbacks,
  getUserFeedbackById,
} from "../controllers/userFeedback.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

const feedbackRouter = Router();

feedbackRouter.post("/", authMiddleware, createUserFeedback);

feedbackRouter.get(
  "/",
  authMiddleware,
  checkRole([UserRole.superAdmin, UserRole.admin]),
  getAllUserFeedbacks
);

feedbackRouter.get(
  "/:id",
  authMiddleware,
  checkRole([UserRole.superAdmin, UserRole.admin]),
  getUserFeedbackById
);

feedbackRouter.delete(
  "/:id",
  authMiddleware,
  checkRole([UserRole.superAdmin, UserRole.admin]),
  deleteUserFeedback
);



export default feedbackRouter;
