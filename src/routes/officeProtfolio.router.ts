import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkRole } from "../middleware/checkRole.middleware";
import { UserRole } from "../entity/User";
import { upload } from "../middleware/uploadProfile";
import { addBrokerPortfolio, deleteBrokerPortfolio, getBrokerPortfolios } from "../controllers/brokerProfolio.controller";

const officeProtfolioRouter: Router = Router();

officeProtfolioRouter.post("/", 
    authMiddleware,
    checkRole([UserRole.user]),
    upload.array("image"),
    addBrokerPortfolio
);

officeProtfolioRouter.get("/:id", 
    authMiddleware,
    getBrokerPortfolios
);

officeProtfolioRouter.delete("/:id", 
    authMiddleware,
    checkRole([UserRole.user , UserRole.superAdmin , UserRole.admin]),
    deleteBrokerPortfolio
);

export default officeProtfolioRouter;
