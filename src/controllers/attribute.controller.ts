import { Request, Response, NextFunction } from "express";
import { Attribute } from "../entity/Attribute";
import { AppDataSource } from "../config/data_source";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { validator } from "../helper/validation/validator";
import { attributeSchema } from "../helper/validation/schema/addAttributeSchema";

const attributeRepository = AppDataSource.getRepository(Attribute);

export const getAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = "1", limit = "10", entityType } = req.query; // إضافة entityType كـ query parameter
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخصائص" : "attributes";

    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    let queryBuilder = attributeRepository.createQueryBuilder("attribute");

    if (entityType) {
      queryBuilder = queryBuilder.where("attribute.entity = :entityType", {
        entityType,
      });
    }

    const [attributes, totalCount] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    if (!attributes.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

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
          attributes,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getAttributeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOneBy({ id: Number(id) });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          attribute,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, type, entity } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "الخاصية" : "attribute";
    await validator(attributeSchema(lang), req.body);

    if (!title || !type || !entity) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    const icon = req.file ? req.file.filename : "";

    const newAttribute = attributeRepository.create({
      title,
      type,
      entity,
      icon,
    });
    await attributeRepository.save(newAttribute);

    res
      .status(HttpStatusCode.OK_CREATED)
      .json(
        ApiResponse.success(
          newAttribute,
          ErrorMessages.generateErrorMessage(entityName, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, type, entity } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOneBy({ id: Number(id) });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    attribute.title = title || attribute.title;
    attribute.type = type || attribute.type;
    attribute.entity = entity || attribute.entity;
    if (req.file) attribute.icon = req.file.filename;

    await attributeRepository.save(attribute);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          attribute,
          ErrorMessages.generateErrorMessage(entityName, "updated", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const deleteAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOneBy({ id: Number(id) });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    await attributeRepository.remove(attribute);

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
