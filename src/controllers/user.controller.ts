import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";

const userRepository = AppDataSource.getRepository(User);

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = "1", limit = "20", userName, sortByPrice } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "المستخدم" : "user";
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    const query = userRepository.createQueryBuilder("user");
    if (userName) {
      query.andWhere("user.name = :name", {
        name: userName,
      });
    }

    if (sortByPrice === "asc") {
      query.orderBy("car.price_usd", "ASC");
    } else if (sortByPrice === "desc") {
      query.orderBy("car.price_usd", "DESC");
    }

    const queryResult = await query.skip(skip).take(pageSize).getRawMany();
    const totalCount = await query.getCount();

    const pagination = {
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          queryResult,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getUserCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {}
};
