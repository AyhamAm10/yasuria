import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const userRepository = AppDataSource.getRepository(User);
    const user = req.currentUser;

    if (!user) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المستخدم", "unauthorized", lang)));
    }

    const { name, phone , city } = req.body;

    const image = req.file ? req.file.filename : null;

    if (phone && phone !== user.phone) {
      const existingUser = await userRepository.findOne({ where: { phone } });
      if (existingUser) {
        return next(new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage("رقم الهاتف", "already exists", lang)));
      }
    }

    
    user.name = name || user.name;
    user.image_url = image || user.image_url;
    user.phone = phone || user.phone;
    user.city = city || user.city

    await userRepository.save(user);

   res.status(HttpStatusCode.OK).json(ApiResponse.success(user,ErrorMessages.generateErrorMessage("الملف الشخصي", "updated", lang)));

  } catch (error) {
    next(new APIError(HttpStatusCode.INTERNAL_SERVER, ErrorMessages.generateErrorMessage("الملف الشخصي", "internal", req.headers["accept-language"] || "ar")));
  }
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const userRepository = AppDataSource.getRepository(User);
    const user = req.currentUser;

    if (!user) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المستخدم", "unauthorized", lang)));
    }

    const userToDelete =await userRepository.findOneBy({id: user.id})
    await userRepository.remove(userToDelete);

    res.status(HttpStatusCode.OK).json(ApiResponse.success(null, ErrorMessages.generateErrorMessage("المستخدم", "deleted", lang)));
  } catch (error) {
    next(error);
  }
};
