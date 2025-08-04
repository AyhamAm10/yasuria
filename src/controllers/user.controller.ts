import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../config/data_source";
import { User, UserRole } from "../entity/User";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { Car } from "../entity/Car";
import { Property } from "../entity/Property";
import { Request as RequestEntity } from "../entity/Request";

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
    const { userId } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارات" : "cars";

    const cars = await AppDataSource.getRepository(Car)
      .createQueryBuilder("car")
      .where("car.userId = :userId", { userId })
      .getMany();

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        cars,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getUserProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "العقارات" : "properties";

    const properties = await AppDataSource.getRepository(Property)
      .createQueryBuilder("property")
      .where("property.userId = :userId", { userId })
      .getMany();

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        properties,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getUserRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "الطلبات" : "requests";

    const requests = await AppDataSource.getRepository(RequestEntity)
      .createQueryBuilder("request")
      .where("request.userId = :userId", { userId })
      .getMany();

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        requests,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const deleteUserCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { carId } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارة" : "car";

    const result = await AppDataSource.getRepository(Car).delete(carId);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        result,
        ErrorMessages.generateErrorMessage(entity, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const deleteUserProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { propertyId } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "العقار" : "property";

    const result = await AppDataSource.getRepository(Property).delete(propertyId);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        result,
        ErrorMessages.generateErrorMessage(entity, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};


export const deleteUserRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { requestId } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "الطلب" : "request";

    const result = await AppDataSource.getRepository(Request).delete(requestId);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        result,
        ErrorMessages.generateErrorMessage(entity, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};


export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const {currentUser} = req
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "المستخدم" : "user";

    if(currentUser.role === UserRole.superAdmin){
      await AppDataSource.getRepository(User).delete(userId);
    }
    else{
      await AppDataSource.getRepository(User).delete({id: currentUser.id});
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        {},
        ErrorMessages.generateErrorMessage(entity, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};





