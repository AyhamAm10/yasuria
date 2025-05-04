import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { upload } from "../middleware/uploadProfile";
import { BrokerController } from "../controllers/broker.controller";

const officeRouter: Router = Router();

officeRouter.post("/", 
    upload.single("image"),
    BrokerController.createBrokerOffice
);

officeRouter.get("/", 
    BrokerController.getBrokerOffices
);

officeRouter.get("/:id", 
    // authMiddleware,
    // checkRole([UserRole.vendor , UserRole.user , UserRole.admin , UserRole.superAdmin]),
    BrokerController.getBrokerProfile
);

officeRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor , UserRole.superAdmin]),
    upload.single("image"),
    BrokerController.updateBrokerOffice
);

officeRouter.delete("/", 
    authMiddleware,
    checkRole([UserRole.vendor , UserRole.superAdmin]),
    BrokerController.deleteBrokerOffice
);

export default officeRouter;
