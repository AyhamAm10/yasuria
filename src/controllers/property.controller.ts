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
import { Entity_Type } from "../entity/Favorites";
import { isFavorite } from "../helper/isFavorite";
import { Governorate } from "../entity/governorate";

const propertyRepository = AppDataSource.getRepository(Property);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const specificationRepository = AppDataSource.getRepository(Specifications);
const specificationValueRepository =
  AppDataSource.getRepository(SpecificationsValue);
const brokerOfficeRepository = AppDataSource.getRepository(BrokerOffice);
const propertyTypeReposetry = AppDataSource.getRepository(PropertyType);
const governorateReposetory = AppDataSource.getRepository(Governorate);

export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      governorate_id,
      sortByPrice,
      area,
      page = "1",
      limit = "10",
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العقارات" : "properties";
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;
    const userId = req.currentUser?.id;

    const query = propertyRepository.createQueryBuilder("property");

    if (title)
      query.andWhere("property.title LIKE :title", { title: `%${title}%` });
    if (governorate_id) {
      query.andWhere("property.governorateId = :governorateId", {
        governorateId: governorate_id,
      });
    }
    if (sortByPrice === "asc") {
      query.orderBy("property.price_usd", "ASC");
    } else if (sortByPrice === "desc") {
      query.orderBy("property.price_usd", "DESC");
    }
    if (area) query.andWhere("property.area = :area", { area });

    const rawResult = await query.skip(skip).take(pageSize).getRawAndEntities();

    const properties = rawResult.entities;

    const totalCount = await query.getCount();

    const pagination = {
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };

    const data = await Promise.all(
      properties.map(async (property, index) => {
        const attributes = await attributeValueRepository.find({
          where: { entity: EntityAttribute.properties, entity_id: property.id },
        });

        const specifications = await specificationValueRepository.find({
          where: {
            entity: EntitySpecification.properties,
            entity_id: property.id,
          },
        });

        const is_favorite = await isFavorite(
          userId,
          property.id,
          Entity_Type.properties
        );

        return {
          property,
          attributes,
          specifications,
          is_favorite,
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
    const userId = req.currentUser;

    const property = await propertyRepository.findOne({
      where: { id: Number(id) },
      relations: ["user", "broker_office", "property_type", "governorateInfo"],
    });

    if (!property) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const [attributes, specifications] = await Promise.all([
      attributeValueRepository.find({
        where: { entity: EntityAttribute.properties, entity_id: property.id },
        relations: ["attribute"],
      }),

      specificationValueRepository.find({
        where: {
          entity: EntitySpecification.properties,
          entity_id: property.id,
        },
        relations: ["specification"],
      }),
    ]);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        {
          type: "property",
          property,
          attributes,
          specifications,
          is_favorite: await isFavorite(
            userId?.id,
            property.id,
            Entity_Type.properties
          ),
        },
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

    // await validator(addPropertySchema(lang), req.body);

    const {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price_sy,
      price_usd,
      attributes,
      specifications,
      longitude,
      latitude,
      type_id,
      seller_type,
      listing_type,
      governorate_id,
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

    const governorate = await governorateReposetory.findOneBy({
      id: governorate_id,
    });
    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("governorate", "not found", lang)
      );
    }

    const newProperty = propertyRepository.create({
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price_sy,
      price_usd,
      user,
      latitude,
      longitude,
      images,
      broker_office: isBrokerOffice || null,
      property_type: propertyType,
      seller_type,
      listing_type,
      governorateId: governorate.id,
      governorateInfo: governorate,
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
          specification: specification,
          entity: EntitySpecification.properties,
          entity_id: savedProperty.id,
          IsActive: true,
        });
      });

      specificationValues = await specificationValueRepository.save(
        await Promise.all(specPromises)
      );
    }

    const propertyWithRelations = await propertyRepository.findOne({
      where: { id: savedProperty.id },
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

    const {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price_sy,
      price_usd,
      attributes,
      specifications,
      longitude,
      latitude,
      type_id,
      seller_type,
      listing_type,
      governorate_id,
      keptImages,
      isActive
    } = req.body;

    const userId = req["currentUser"].id;
    const id = Number(req.params.id);
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new APIError(
        HttpStatusCode.UNAUTHORIZED,
        ErrorMessages.generateErrorMessage(userMessage, "not found", lang)
      );
    }

    const property = await propertyRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    console.log(property);
    if (!property) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const propertyType = type_id
      ? await propertyTypeReposetry.findOneBy({ id: type_id })
      : property.property_type;

    const isBrokerOffice = await brokerOfficeRepository.findOne({
      where: { user },
    });

    const newImages = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : property.images;

    let keptImagesArray: string[] = [];
    if (keptImages) {
      keptImagesArray = JSON.parse(keptImages);
    }

    const governorate = governorate_id
      ? await governorateReposetory.findOneBy({ id: governorate_id })
      : property.governorateInfo;

    if (governorate_id && !governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("governorate", "not found", lang)
      );
    }

    property.images = [...keptImagesArray, ...newImages];
    propertyRepository.merge(property, {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price_sy,
      price_usd,
      latitude,
      longitude,
      broker_office: isBrokerOffice || property.broker_office,
      property_type: propertyType,
      seller_type,
      listing_type,
      governorateId: governorate?.id,
      governorateInfo: governorate,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : property.isActive
    });

    const updatedProperty = await propertyRepository.save(property);

    
    if (attributes && attributes.length > 0) {
      await attributeValueRepository.delete({
        entity: EntityAttribute.properties,
        entity_id: updatedProperty.id,
      });

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
          entity_id: updatedProperty.id,
          value: attr.value,
        });
      });

      await attributeValueRepository.save(await Promise.all(attributePromises));
    }


    if (specifications && specifications.length > 0) {
      await specificationValueRepository.delete({
        entity: EntitySpecification.properties,
        entity_id: updatedProperty.id,
      });

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
          specification,
          entity: EntitySpecification.properties,
          entity_id: updatedProperty.id,
          IsActive: true,
        });
      });

      await specificationValueRepository.save(await Promise.all(specPromises));
    }

    const propertyWithRelations = await propertyRepository.findOne({
      where: { id: updatedProperty.id },
    });

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        {
          property: propertyWithRelations,
        },
        ErrorMessages.generateErrorMessage(entity, "updated", lang)
      )
    );
  } catch (error) {
    console.log(error);
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
