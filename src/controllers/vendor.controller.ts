import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const userRepository = AppDataSource.getRepository(User);
    const user = req.currentUser;

    if (!user) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المستخدم", "unauthorized", lang)));
    }

    const { name, image_url, phone } = req.body;

    if (phone && phone !== user.phone) {
      const existingUser = await userRepository.findOne({ where: { phone } });
      if (existingUser) {
        return next(new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage("رقم الهاتف", "already exists", lang)));
      }
    }

    user.name = name || user.name;
    user.image_url = image_url || user.image_url;
    user.phone = phone || user.phone;

    await userRepository.save(user);

    return res.status(HttpStatusCode.OK).json(ApiResponse.success(user,ErrorMessages.generateErrorMessage("الملف الشخصي", "updated", lang)));

  } catch (error) {
    next(new APIError(HttpStatusCode.INTERNAL_SERVER, ErrorMessages.generateErrorMessage("الملف الشخصي", "internal", req.headers["accept-language"] || "ar")));
  }
};
