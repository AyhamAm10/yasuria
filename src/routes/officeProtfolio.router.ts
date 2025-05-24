import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { upload } from "../middleware/uploadProfile";
import { BrokerController } from "../controllers/broker.controller";
import { followOrUnfollowBroker, rateBroker } from "../controllers/brokerOficeApi.controller";
import { addBrokerPortfolio, deleteBrokerPortfolio, getBrokerPortfolios } from "../controllers/brokerProfolio.controller";

const officeProtfolioRouter: Router = Router();

officeProtfolioRouter.post("/", 
    authMiddleware,
    checkRole([UserRole.vendor]),
    upload.array("image"),
    addBrokerPortfolio
);

officeProtfolioRouter.get("/", 
    getBrokerPortfolios
);

officeProtfolioRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.vendor , UserRole.superAdmin , UserRole.admin]),
    deleteBrokerPortfolio
);

export default officeProtfolioRouter;
