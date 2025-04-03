import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { UserPermission } from "../entity/User_permissions";
import { PermissionsEnum } from "../entity/User_permissions";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";

export const checkPermissions = (requiredPermissions: PermissionsEnum[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = req.headers["accept-language"] || "ar"; // تحديد اللغة الافتراضية

      if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        return next(new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage("الأذونات", "bad request", lang)));
      }

      const user = req.currentUser;
      if (!user || !user.id) {
        return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المستخدم", "unauthorized", lang)));
      }

      const userPermissions = await AppDataSource.getRepository(UserPermission)
        .createQueryBuilder("userPermission")
        .select("userPermission.permission")
        .where("userPermission.userId = :userId", { userId: user.id })
        .getMany();

      const userPermissionsSet = new Set(userPermissions.map((perm) => perm.permission));

      const hasPermission = requiredPermissions.some((perm) => userPermissionsSet.has(perm));

      if (!hasPermission) {
        return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("الأذونات", "forbidden", lang)));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
