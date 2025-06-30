import { Router } from "express";
import { RequestController } from "../controllers/request.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

const requesteRouter: Router = Router();

requesteRouter.post("/", 
    authMiddleware,
    checkRole([UserRole.user]),
    RequestController.createRequest
);

requesteRouter.get("/", 
    RequestController.getAll
);

requesteRouter.get("/:id", 
    RequestController.getById
);

requesteRouter.get("/user/:id", 
    RequestController.getByUserId
);

requesteRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.user]),
    RequestController.updateRequest
);

requesteRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.user]),
    RequestController.deleteRequest
);

export default requesteRouter;
