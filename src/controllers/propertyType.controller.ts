import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data_source';
import { CarType } from '../entity/CarType';
import { APIError, HttpStatusCode } from '../error/api.error';
import { ApiResponse } from '../helper/apiResponse';
import { ErrorMessages } from '../error/ErrorMessages';
import { PropertyType } from '../entity/PropertyType';


const propertyRepository = AppDataSource.getRepository(PropertyType);


export const createCarType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "نوع العقار" : "property type";
    

    const newCarType = propertyRepository.create(req.body);
    const savedCarType = await propertyRepository.save(newCarType);

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
    const entity = lang == "ar" ? "نوع العقار" : "property type";


    const carTypes = await propertyRepository.find();

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          carTypes,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
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
    const entity = lang == "ar" ? "نوع العقار" : "property type";

    const id = parseInt(req.params.id);

    const carType = await propertyRepository.findOneBy({ id });

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
    const entity = lang == "ar" ? "نوع العقار" : "property type";

    const id = parseInt(req.params.id);

    const carType = await propertyRepository.findOneBy({ id });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    propertyRepository.merge(carType, req.body);
    const updatedCarType = await propertyRepository.save(carType);

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
    const entity = lang == "ar" ? "نوع العقار" : "property type";

    const id = parseInt(req.params.id);

    const carType = await propertyRepository.findOneBy({ id });

    if (!carType) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    await propertyRepository.remove(carType);

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