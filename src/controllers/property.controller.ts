import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { Property } from "../entity/Property";
import { User } from "../entity/User";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { AttributeValue } from "../entity/AttributeValue";
import { Attribute, EntityAttribute } from "../entity/Attribute";
import { Specifications } from "../entity/Specifications";
import {
  EntitySpecification,
  SpecificationsValue,
} from "../entity/SpecificationsValue";
import { validator } from "../helper/validation/validator";
import { addPropertySchema } from "../helper/validation/schema/addPropertySchema";
import { BrokerOffice } from "../entity/BrokerOffice";
import { CarType } from "../entity/CarType";
import { PropertyType } from "../entity/PropertyType";

const propertyRepository = AppDataSource.getRepository(Property);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const specificationRepository = AppDataSource.getRepository(Specifications);
const specificationValueRepository =
  AppDataSource.getRepository(SpecificationsValue);
const brokerOfficeRepository = AppDataSource.getRepository(BrokerOffice);
const propertyTypeReposetry = AppDataSource.getRepository(PropertyType);


export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      location,
      minPrice,
      maxPrice,
      area,
      page = "1",
      limit = "10",
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العقارات" : "properties";
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    const query = propertyRepository.createQueryBuilder("property");

    if (title)
      query.andWhere("property.title LIKE :title", { title: `%${title}%` });
    if (location) query.andWhere("property.location = :location", { location });
    if (minPrice) query.andWhere("property.price >= :minPrice", { minPrice });
    if (maxPrice) query.andWhere("property.price <= :maxPrice", { maxPrice });
    if (area) query.andWhere("property.area = :area", { area });

    const [properties, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const pagination = {
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };

    const data = await Promise.all(
      properties.map(async (property) => {
        const attributes = await attributeValueRepository.find({
          where: { entity: EntityAttribute.properties, entity_id: property.id },
        });

        const specifications = await specificationValueRepository.find({
          where: {
            entity: EntitySpecification.properties,
            entity_id: property.id,
          },
        });

        return {
          property,
          attributes,
          specifications,
        };
      })
    );

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          data,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العقار" : "property";

    const property = await propertyRepository.findOne({
      where: { id: Number(id) },
      relations: ["user" , "broker_office" , "property_type"],
    });

    if (!property) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const attributes = await attributeValueRepository.find({
      where: { entity: EntityAttribute.properties, entity_id: property.id },
    });

    const specifications = await specificationValueRepository.find({
      where: { entity: EntitySpecification.properties, entity_id: property.id },
    });

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          { property, attributes, specifications },
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العقار" : "property";
    const userMessage = lang === "ar" ? "المستخدم" : "user";

    await validator(addPropertySchema(lang), req.body);

    const {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price,
      attributes,
      specifications,
      long,
      lat,
      type_id,
    } = req.body;

    const userId = req["currentUser"].id;
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new APIError(
        HttpStatusCode.UNAUTHORIZED,
        ErrorMessages.generateErrorMessage(userMessage, "not found", lang)
      );
    }

    const propertyType = await propertyTypeReposetry.findOneBy({ id: type_id });

    if (!propertyType && type_id) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("type id", "not found", lang)
      );
    }

    const isBrokerOffice = await brokerOfficeRepository.findOne({
      where: { user },
    });

    const images = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : [];

    const newProperty = propertyRepository.create({
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price,
      user,
      lat,
      long,
      images,
      broker_office: isBrokerOffice || null,
      property_type:propertyType
    });

    const savedProperty = await propertyRepository.save(newProperty);

    let attributeValues = [];
    if (attributes && attributes.length > 0) {
      const attributePromises = attributes.map(async (attr) => {
        const attribute = await attributeRepository.findOne({
          where: { id: attr.id },
        });

        if (!attribute) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("السمة", "not found", lang)
          );
        }

        return attributeValueRepository.create({
          attribute,
          entity: EntityAttribute.properties,
          entity_id: savedProperty.id,
          value: attr.value,
        });
      });

      attributeValues = await attributeValueRepository.save(
        await Promise.all(attributePromises)
      );
    }

    let specificationValues = [];
    if (specifications && specifications.length > 0) {
      const specPromises = specifications.map(async (spec) => {
        const specification = await specificationRepository.findOneBy({
          id: spec.id,
        });
        if (!specification) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("المواصفة", "not found", lang)
          );
        }

        return specificationValueRepository.create({
          specifications: specification,
          entity: EntitySpecification.properties,
          entity_id: savedProperty.id,
          value: spec.value,
        });
      });

      specificationValues = await specificationValueRepository.save(
        await Promise.all(specPromises)
      );
    }

    const propertyWithRelations = await propertyRepository.findOne({
      where: { id: savedProperty.id },
      relations: ["attribute_value", "specification_value"],
    });

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(
        {
          property: propertyWithRelations,
          attributes: attributeValues,
          specifications: specificationValues,
        },
        ErrorMessages.generateErrorMessage(entity, "created", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};
export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العقار" : "property";
    const userMessage = lang === "ar" ? "المستخدم" : "user";

    const { id } = req.params;
    const {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price,
      attributes,
      specifications,
      lat,
      long,
      keptImages,
    } = req.body;

    const userId = req["currentUser"].id;

    const property = await propertyRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"],
    });

    if (!property) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    if (property.user.id !== userId) {
      throw new APIError(
        HttpStatusCode.FORBIDDEN,
        ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
      );
    }

    propertyRepository.merge(property, {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price,
      lat,
      long,
    });

    const newImages = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : [];

    const keptImagesArray = keptImages ? JSON.parse(keptImages) : [];

    property.images = [...keptImagesArray, ...newImages];

    const updatedProperty = await propertyRepository.save(property);

    if (attributes && attributes.length > 0) {
      const updatedAttributes = attributes.map(async (attr) => {
        const attribute = await attributeValueRepository.findOneBy({
          id: attr.id,
        });
        if (!attribute) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("السمة", "not found", lang)
          );
        }

        return attributeValueRepository.merge(attribute, {
          value: attr.value,
        });
      });

      await attributeValueRepository.save(await Promise.all(updatedAttributes));
    }

    if (specifications && specifications.length > 0) {
      const updatedSpecifications = specifications.map(async (spec) => {
        const specification = await specificationValueRepository.findOneBy({
          id: spec.id,
        });
        if (!specification) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("المواصفة", "not found", lang)
          );
        }

        return specificationValueRepository.merge(specification, {
          value: spec.value,
        });
      });

      await specificationValueRepository.save(
        await Promise.all(updatedSpecifications)
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          updatedProperty,
          ErrorMessages.generateErrorMessage(entity, "updated", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req["currentUser"].id;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العقار" : "property";

    const property = await propertyRepository.findOne({
      where: { id: Number(id), user: { id: userId } },
    });

    if (!property) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    await propertyRepository.delete(id);

    const attributes = await attributeValueRepository.find({
      where: { entity: EntityAttribute.properties, entity_id: property.id },
    });
    await attributeValueRepository.remove(attributes);

    const specifications = await specificationValueRepository.find({
      where: { entity: EntitySpecification.properties, entity_id: property.id },
    });
    await specificationValueRepository.remove(specifications);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          [],
          ErrorMessages.generateErrorMessage(entity, "deleted", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};
