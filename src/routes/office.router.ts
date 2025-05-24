import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { upload } from "../middleware/uploadProfile";
import { BrokerController } from "../controllers/broker.controller";
import { followOrUnfollowBroker, rateBroker } from "../controllers/brokerOficeApi.controller";

const officeRouter: Router = Router();

officeRouter.post("/", 
    upload.single("image"),
    BrokerController.createBrokerOffice
);

officeRouter.get("/", 
    authMiddleware,
    BrokerController.getBrokerOffices
);

officeRouter.post("/follow", 
    authMiddleware,
    checkRole([UserRole.vendor , UserRole.user , UserRole.admin , UserRole.superAdmin]),
    followOrUnfollowBroker
);

officeRouter.post("/rate", 
    authMiddleware,
    checkRole([UserRole.vendor , UserRole.user , UserRole.admin , UserRole.superAdmin]),
    rateBroker
);

officeRouter.get("/:id", 
    authMiddleware,
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
