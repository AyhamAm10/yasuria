import { Request, Response, NextFunction } from "express";
import { BrokerOffice } from "../entity/BrokerOffice";
import { BrokerFollower } from "../entity/BrokerFollower";
import { BrokerRating } from "../entity/BrokerRating";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data_source";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";

export const toggleFollowBroker = async (req: Request, res: Response, next: NextFunction) => {
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

    const existingFollow = await followerRepo.findOne({
      where: {
        user: { id: userId },
        broker_office: { id: brokerOfficeId }
      }
    });

    let message: string;

    if (existingFollow) {
      // إزالة المتابعة
      await followerRepo.remove(existingFollow);

      // تحديث followers_count
      brokerOffice.followers_count = Math.max(brokerOffice.followers_count - 1, 0);
      await officeRepo.save(brokerOffice);

      message = lang === "ar" ? "تم إلغاء المتابعة" : "Unfollowed successfully";
    } else {
      // إضافة المتابعة
      const newFollow = followerRepo.create({ user, broker_office: brokerOffice });
      await followerRepo.save(newFollow);

      // تحديث followers_count
      brokerOffice.followers_count += 1;
      await officeRepo.save(brokerOffice);

      message = lang === "ar" ? "تمت المتابعة بنجاح" : "Followed successfully";
    }

    res.status(HttpStatusCode.OK).json(ApiResponse.success(null, message));

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

    // تحقق إذا المستخدم قيّم سابقًا
    let existingRating = await ratingRepo.findOne({
      where: { user: { id: userId }, broker_office: { id: brokerOfficeId } }
    });

    let savedRating;

    if (existingRating) {
      // تحديث التقييم القديم
      existingRating.rating = rating;
      existingRating.comment = comment;
      savedRating = await ratingRepo.save(existingRating);
    } else {
      // إضافة تقييم جديد
      const newRating = ratingRepo.create({ user, broker_office: brokerOffice, rating, comment });
      savedRating = await ratingRepo.save(newRating);
    }

    // حساب المتوسط الجديد للتقييمات
    const ratings = await ratingRepo.find({ where: { broker_office: { id: brokerOfficeId } } });
    const totalRatings = ratings.length;
    const totalScore = ratings.reduce((sum, r) => sum + r.rating, 0);
    const newAvg = totalRatings > 0 ? totalScore / totalRatings : 0;

    // تحديث المتوسط في BrokerOffice
    brokerOffice.rating_avg = parseFloat(newAvg.toFixed(2));
    await officeRepo.save(brokerOffice);

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(savedRating, lang === "ar" ? "تم التقييم بنجاح" : "Rated successfully")
    );
  } catch (error) {
    next(error);
  }
};


