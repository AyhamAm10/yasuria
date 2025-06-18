import { Request, Response, NextFunction } from "express";
import { Specifications } from "../entity/Specifications";
import { AppDataSource } from "../config/data_source";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { validator } from "../helper/validation/validator";
import { addSpecificationSchema } from "../helper/validation/schema/addSpecificationSchema";
import { CarType } from "../entity/CarType";
import { PropertyType } from "../entity/PropertyType";

const specificationRepository = AppDataSource.getRepository(Specifications);

export const getSpecifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = "1", limit = "20", entityType, type_id } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "المواصفات" : "specifications";

    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    let queryBuilder =
      specificationRepository.createQueryBuilder("specification");

    if (entityType) {
      queryBuilder = queryBuilder.where("specification.entity = :entityType", {
        entityType,
      });
    }

    if (type_id && entityType) {
      if (entityType === "car") {
        queryBuilder = queryBuilder.andWhere(
          "specification.carType.id = :typeId",
          {
            typeId: Number(type_id),
          }
        );
      } else if (entityType === "property") {
        queryBuilder = queryBuilder.andWhere(
          "specification.propertyType.id = :typeId",
          {
            typeId: Number(type_id),
          }
        );
      }
    }

    const [specifications, totalCount] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

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
          specifications,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getSpecificationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "المواصفة" : "specification";

    const specification = await specificationRepository.findOneBy({
      id: Number(id),
    });

    if (!specification) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          specification,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createSpecification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, type, entity, carTypeId, propertyTypeId } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "المواصفة" : "specification";
    await validator(addSpecificationSchema(lang), req.body);

    if (!title || !type || !entity) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const icon = req.file ? req.file.filename : "";

    const carType = carTypeId
      ? await AppDataSource.getRepository(CarType).findOneBy({
          id: Number(carTypeId),
        })
      : null;
    const propertyType = propertyTypeId
      ? await AppDataSource.getRepository(PropertyType).findOneBy({
          id: Number(propertyTypeId),
        })
      : null;

    const newSpecification = specificationRepository.create({
      title,
      type,
      entity,
      icon,
      carType: carType || null,
      propertyType: propertyType || null,
    });
    await specificationRepository.save(newSpecification);

    res
      .status(HttpStatusCode.OK_CREATED)
      .json(
        ApiResponse.success(
          newSpecification,
          ErrorMessages.generateErrorMessage(entityName, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateSpecification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, type, entity, carTypeId, propertyTypeId } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "المواصفة" : "specification";

    const specification = await specificationRepository.findOne({
      where: { id: Number(id) },
      relations: ["carType", "propertyType"], // نجيب العلاقات لو بدنا نعدلها
    });

    if (!specification) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    specification.title = title || specification.title;
    specification.type = type || specification.type;
    specification.entity = entity || specification.entity;
    if (req.file) specification.icon = req.file.filename;

    if (carTypeId !== undefined) {
      const carType = carTypeId
        ? await AppDataSource.getRepository(CarType).findOneBy({
            id: Number(carTypeId),
          })
        : null;
      specification.carType = carType || null;
    }

    if (propertyTypeId !== undefined) {
      const propertyType = propertyTypeId
        ? await AppDataSource.getRepository(PropertyType).findOneBy({
            id: Number(propertyTypeId),
          })
        : null;
      specification.propertyType = propertyType || null;
    }

    await specificationRepository.save(specification);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          specification,
          ErrorMessages.generateErrorMessage(entityName, "updated", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const deleteSpecification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "المواصفة" : "specification";

    const specification = await specificationRepository.findOneBy({
      id: Number(id),
    });

    if (!specification) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    await specificationRepository.remove(specification);

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
