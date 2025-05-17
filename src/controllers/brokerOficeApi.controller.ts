import { Request, Response, NextFunction } from "express";
import { BrokerOffice } from "../entity/BrokerOffice";
import { BrokerFollower } from "../entity/BrokerFollower";
import { BrokerRating } from "../entity/BrokerRating";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data_source";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";

export const followOrUnfollowBroker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const userId = req["currentUser"]?.id;
    const { brokerOfficeId } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const officeRepo = AppDataSource.getRepository(BrokerOffice);
    const followerRepo = AppDataSource.getRepository(BrokerFollower);

    const user = await userRepo.findOneBy({ id: userId });
    const brokerOffice = await officeRepo.findOneBy({ id: brokerOfficeId });

    if (!user || !brokerOffice) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("الوسيط", "not found", lang)
      );
    }

    const existingFollow = await followerRepo.findOne({ where: { user, broker_office: brokerOffice } });

    if (existingFollow) {
      await followerRepo.remove(existingFollow);
       res.status(HttpStatusCode.OK).json(
        ApiResponse.success(null, lang === "ar" ? "تم إلغاء المتابعة" : "Unfollowed successfully")
      );
    } else {
      const newFollow = followerRepo.create({ user, broker_office: brokerOffice });
      await followerRepo.save(newFollow);
      res.status(HttpStatusCode.OK_CREATED).json(
        ApiResponse.success(null, lang === "ar" ? "تمت المتابعة بنجاح" : "Followed successfully")
      );
    }
  } catch (error) {
    next(error);
  }
};

export const rateBroker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const userId = req["currentUser"]?.id;
    const { brokerOfficeId, rating, comment } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const officeRepo = AppDataSource.getRepository(BrokerOffice);
    const ratingRepo = AppDataSource.getRepository(BrokerRating);

    const user = await userRepo.findOneBy({ id: userId });
    const brokerOffice = await officeRepo.findOneBy({ id: brokerOfficeId });

    if (!user || !brokerOffice) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("الوسيط", "not found", lang)
      );
    }

    const newRating = ratingRepo.create({ user, broker_office: brokerOffice, rating, comment });
    const savedRating = await ratingRepo.save(newRating);

     res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(savedRating, lang === "ar" ? "تم التقييم بنجاح" : "Rated successfully")
    );
  } catch (error) {
    next(error);
  }
};

