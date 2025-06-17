import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data_source';
import { CarType } from '../entity/CarType';
import { APIError, HttpStatusCode } from '../error/api.error';
import { ApiResponse } from '../helper/apiResponse';
import { ErrorMessages } from '../error/ErrorMessages';
import { Attribute } from '../entity/Attribute';


const carTypeRepository = AppDataSource.getRepository(CarType);
const attributeRepository = AppDataSource.getRepository(Attribute)

export const createCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "نوع السيارة" : "car type";
    

    const newCarType = carTypeRepository.create(req.body);
    const savedCarType = await carTypeRepository.save(newCarType);

    res
      .status(HttpStatusCode.OK_CREATED)
      .json(
        ApiResponse.success(
          savedCarType,
          ErrorMessages.generateErrorMessage(entity, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getAllCarTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "أنواع السيارات" : "car types";

    const carTypes = await carTypeRepository.find();

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          carTypes,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const getCarTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "نوع السيارة" : "car type";
    const id = parseInt(req.params.id);

    const carType = await carTypeRepository.findOneBy({ id });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          carType,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "نوع السيارة" : "car type";
    const id = parseInt(req.params.id);

    const carType = await carTypeRepository.findOneBy({ id });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    carTypeRepository.merge(carType, req.body);
    const updatedCarType = await carTypeRepository.save(carType);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          updatedCarType,
          ErrorMessages.generateErrorMessage(entity, "updated", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const deleteCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "نوع السيارة" : "car type";
    const id = parseInt(req.params.id);

    const carType = await carTypeRepository.findOneBy({ id });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const hasAttribute = await attributeRepository.findOneBy({car_type:carType})
    if (hasAttribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        `لايمكن حذف هذا النوع لانه مرتبط بل attribute ${hasAttribute.title} المعرف الخاص به ${hasAttribute.id}`
      );
    }
    await carTypeRepository.remove(carType);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          null,
          ErrorMessages.generateErrorMessage(entity, "deleted", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};