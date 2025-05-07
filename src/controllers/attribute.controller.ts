import { Request, Response, NextFunction } from "express";
import { Attribute } from "../entity/Attribute";
import { AppDataSource } from "../config/data_source";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { validator } from "../helper/validation/validator";
import { attributeSchema } from "../helper/validation/schema/addAttributeSchema";
import { CarType } from "../entity/CarType";
import { PropertyType } from "../entity/PropertyType";

const attributeRepository = AppDataSource.getRepository(Attribute);

export const getAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      entityType,
      parentId,
      parentValue,
      purpose,
      showInSearch,
      carTypeId,
      propertyTypeId,
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخصائص" : "attributes";

    let queryBuilder = attributeRepository.createQueryBuilder("attribute");

    queryBuilder = queryBuilder.andWhere("attribute.parent_id IS NULL");

    if (entityType) {
      queryBuilder = queryBuilder.andWhere("attribute.entity = :entityType", {
        entityType,
      });
    }

    if (purpose) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.purpose = :purpose OR attribute.purpose = 'both'",
        {
          purpose,
        }
      );
    }

    if (showInSearch !== undefined) {
      const showInSearchBool = showInSearch === "true";
      queryBuilder = queryBuilder.andWhere(
        "attribute.show_in_search = :showInSearch",
        {
          showInSearch: showInSearchBool,
        }
      );
    }

    if (carTypeId) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.car_type = :carTypeId",
        {
          carTypeId: Number(carTypeId),
        }
      );
    }

    if (propertyTypeId) {
      queryBuilder = queryBuilder.andWhere(
        "attribute.property_type = :propertyTypeId",
        {
          propertyTypeId: Number(propertyTypeId),
        }
      );
    }

    const attributes = await queryBuilder.getMany();

    if (!attributes.length) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          attributes,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
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

    const attribute = await attributeRepository.findOne({
      where: { id: Number(id) },
      relations: ["values"],
    });

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

export const getChildattribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { value } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخاصية" : "attribute";
    const message = lang === "ar" 
      ? "لايوجد خاصية مرتبطة بهذا ال id" 
      : "attribute nested not found";

    const queryBuilder = attributeRepository.createQueryBuilder("attribute");
    console.log(value)
    queryBuilder.where("attribute.parent_id = :id", { id });

    if (value) {
      queryBuilder.andWhere("attribute.parent_value = :value", { value });
    }

    const attributes = await queryBuilder.getMany();

    if (!attributes.length) {
      throw new APIError(HttpStatusCode.NOT_FOUND, message);
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        attributes,
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
    const {
      title,
      input_type,
      entity,
      parent_id,
      parent_value,
      options,
      has_child = false,
      show_in_search,
      purpose,
      car_type_id,
      property_type_id
    } = req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "الخاصية" : "attribute";

    await validator(attributeSchema(lang), req.body);

    const showInSearchBoolean =
      typeof show_in_search === "string"
        ? show_in_search === "true"
        : Boolean(show_in_search);

    const has_childhBoolean =
      typeof show_in_search === "string"
        ? has_child === "true"
        : Boolean(show_in_search);

    const requiredFields = ["title", "input_type", "entity"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entityName, "missing fields", lang)
      );
    }

    if (parent_id) {
      const parentAttribute = await attributeRepository.findOneBy({
        id: parent_id,
      });
      if (!parentAttribute) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "السمة الأم غير موجودة" : "Parent attribute not found"
        );
      }
    }

    if (car_type_id) {
      const carType = await AppDataSource.getRepository(CarType).findOneBy({ id: car_type_id });
      if (!carType) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "نوع السيارة غير موجود" : "Car type not found"
        );
      }
    }

    if (property_type_id) {
      const propertyType = await AppDataSource.getRepository(PropertyType).findOneBy({ id: property_type_id });
      if (!propertyType) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "نوع العقار غير موجود" : "Property type not found"
        );
      }
    }


    const icon = req.file ? req.file.filename : "";

    const newAttribute = attributeRepository.create({
      title,
      input_type,
      entity,
      has_child: has_childhBoolean,
      parent_id: parent_id || null,
      parent_value: parent_value || null,
      options: options ? JSON.parse(options) : null,
      show_in_search: showInSearchBoolean,
      purpose,
      icon,
      car_type: car_type_id ? { id: car_type_id } : null,
      property_type: property_type_id ? { id: property_type_id } : null,
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
    const { title, input_type, entity, parent_id, parent_value, options } =
      req.body;
    const lang = req.headers["accept-language"] || "ar";
    const entityName = lang === "ar" ? "الخاصية" : "attribute";

    const attribute = await attributeRepository.findOneBy({ id: Number(id) });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entityName, "not found", lang)
      );
    }

    if (parent_id) {
      const parentAttribute = await attributeRepository.findOneBy({
        id: parent_id,
      });
      if (!parentAttribute) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          lang === "ar" ? "السمة الأم غير موجودة" : "Parent attribute not found"
        );
      }
    }

    attribute.title = title || attribute.title;
    attribute.input_type = input_type || attribute.input_type;
    attribute.entity = entity || attribute.entity;
    attribute.parent_id = parent_id || attribute.parent_id;
    attribute.parent_value = parent_value || attribute.parent_value;
    attribute.options = options ? JSON.parse(options) : attribute.options;
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

    const attribute = await attributeRepository.findOne({
      where: { id: Number(id) },
      relations: ["values"],
    });

    if (!attribute) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    if (attribute.values && attribute.values.length > 0) {
      await attributeRepository.manager
        .getRepository("attribute_value")
        .remove(attribute.values);
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
