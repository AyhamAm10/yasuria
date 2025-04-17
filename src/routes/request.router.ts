import { Router } from "express";
import { RequestController } from "../controllers/request.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";

const requesteRouter: Router = Router();

requesteRouter.post("/", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    RequestController.createRequest
);

requesteRouter.get("/", 
    RequestController.getAll
);

requesteRouter.get("/:id", 
    RequestController.getById
);

requesteRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    RequestController.updateRequest
);

requesteRouter.delete("/Lid", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    RequestController.deleteRequest
);

export default requesteRouter;
