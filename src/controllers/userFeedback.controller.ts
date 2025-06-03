import { Request, Response, NextFunction } from "express";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data_source";
import { Feedback } from "../entity/feedback";
import { ApiResponse } from "../helper/apiResponse";


const userFeedbackRepository = AppDataSource.getRepository(Feedback)
export const createUserFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message } = req.body;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "الرسالة" : "feedback";

    if (!message) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const currentUser = req["currentUser"] as User;
    if (!currentUser) {
      throw new APIError(
        HttpStatusCode.UNAUTHORIZED,
        lang === "ar" ? "المستخدم غير مصرح" : "Unauthorized user"
      );
    }

    const newFeedback = userFeedbackRepository.create({
      message,
      user: currentUser
    });

    await userFeedbackRepository.save(newFeedback);

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(
        newFeedback,
        ErrorMessages.generateErrorMessage(entityName, "created", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUserFeedbacks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "الرسائل" : "feedbacks";

    const feedbacks = await userFeedbackRepository.find({
      relations: ["user"]
    });

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        feedbacks,
        ErrorMessages.generateErrorMessage(entityName, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getUserFeedbackById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "الرسالة" : "feedback";

    const feedback = await userFeedbackRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"]
    });

    if (!feedback) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        feedback,
        ErrorMessages.generateErrorMessage(entityName, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const deleteUserFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "الرسالة" : "feedback";

    const feedback = await userFeedbackRepository.findOneBy({ id: Number(id) });

    if (!feedback) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    await userFeedbackRepository.remove(feedback);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        null,
        ErrorMessages.generateErrorMessage(entityName, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};