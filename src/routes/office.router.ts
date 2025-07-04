import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { upload } from "../middleware/uploadProfile";
import { BrokerController } from "../controllers/broker.controller";
import { toggleFollowBroker, rateBroker } from "../controllers/brokerOficeApi.controller";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";

const officeRouter: Router = Router();

officeRouter.post("/", 
    authMiddleware,
    upload.single("image"),
    BrokerController.createNewBrokerOffice
);

officeRouter.get("/", 
    optionalAuthMiddleware,
    BrokerController.getBrokerOffices
);

officeRouter.post("/user", 
    optionalAuthMiddleware,
    upload.single("image"),
    BrokerController.createBrokerOffice
);
officeRouter.post("/follow", 
    authMiddleware,
    checkRole([ UserRole.user , UserRole.admin , UserRole.superAdmin]),
    toggleFollowBroker
);

officeRouter.post("/rate", 
    authMiddleware,
    checkRole([ UserRole.user , UserRole.admin , UserRole.superAdmin]),
    rateBroker
);

officeRouter.get("/:id", 
    optionalAuthMiddleware,
    BrokerController.getBrokerProfile
);

officeRouter.put("/:id", 
    authMiddleware,
    checkRole([UserRole.user , UserRole.superAdmin]),
    upload.single("image"),
    BrokerController.updateBrokerOffice
);

officeRouter.delete("/", 
    authMiddleware,
    checkRole([UserRole.user , UserRole.superAdmin]),
    BrokerController.deleteBrokerOffice
);

export default officeRouter;
