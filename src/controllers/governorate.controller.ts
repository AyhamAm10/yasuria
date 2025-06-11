import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { Governorate } from "../entity/governorate";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";

const governorateRepository = AppDataSource.getRepository(Governorate);

export const getAllGovernorates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entity = lang === "ar" ? "المحافظات" : "governorates";

    const governorates = await governorateRepository.find();

    if (!governorates.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        governorates,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getGovernorateById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entity = lang === "ar" ? "المحافظة" : "governorate";

    const governorate = await governorateRepository.findOne({
      where: { id: Number(id) }
    });

    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        governorate,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const createGovernorate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "المحافظة" : "governorate";

    if (!name) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const existingGovernorateEn = await governorateRepository.findOneBy({ name });
    if (existingGovernorateEn) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar" 
          ? "اسم المحافظة  موجود بالفعل" 
          : "Governorate name already exists"
      );
    }

    const newGovernorate = governorateRepository.create({
      name
    });

    await governorateRepository.save(newGovernorate);

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(
        newGovernorate,
        ErrorMessages.generateErrorMessage(entityName, "created", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateGovernorate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entityName = lang === "ar" ? "المحافظة" : "governorate";

    if (!name) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const governorate = await governorateRepository.findOneBy({ id: Number(id) });
    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    const existingGovernorateAr = await governorateRepository.findOneBy({ name });
    if (existingGovernorateAr && existingGovernorateAr.id !== governorate.id) {
      throw new APIError(
        HttpStatusCode.CONFLICT,
        lang === "ar"
          ? "اسم المحافظة  الجديد موجود بالفعل"
          : "New governorate name already exists"
      );
    }

    

    governorate.name = name;

    await governorateRepository.save(governorate);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        governorate,
        ErrorMessages.generateErrorMessage(entityName, "updated", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const deleteGovernorate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = (req.headers["accept-language"] as string) || "ar";
    const entity = lang === "ar" ? "المحافظة" : "governorate";

    const governorate = await governorateRepository.findOne({
      where: { id: Number(id) },
      relations: ["cars" , "propertys" , "requests"]
    });

    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    if (governorate.cars && governorate.cars.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        lang === "ar"
          ? "لا يمكن حذف المحافظة لأنها مرتبطة بسيارات"
          : "Cannot delete governorate with associated cars"
      );
    }

     if (governorate.propertys && governorate.propertys.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        lang === "ar"
          ? "لا يمكن حذف المحافظة لأنها مرتبطة بعقارات"
          : "Cannot delete governorate with associated properties"
      );
    }

    if (governorate.requests && governorate.requests.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        lang === "ar"
          ? "لا يمكن حذف المحافظة لأنها مرتبطة بطلبات"
          : "Cannot delete governorate with associated requests"
      );
    }

    await governorateRepository.remove(governorate);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        null,
        ErrorMessages.generateErrorMessage(entity, "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};
