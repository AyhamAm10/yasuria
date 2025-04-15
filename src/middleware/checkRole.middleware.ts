import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entity/User";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const lang = req.headers["accept-language"] || "ar"; 
      const user = req.currentUser;

      if (!user) {
        return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المستخدم", "unauthorized", lang)));
      }

      if (!roles.includes(user.role)) {
        return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("الدور", "forbidden", lang)));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
