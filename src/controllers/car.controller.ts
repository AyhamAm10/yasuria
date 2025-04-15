import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entity/Car";
import { APIError } from "../error/api.error";
import { User } from "../entity/User";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { validator } from "../helper/validation/validator";
import { Equal, In } from "typeorm";
import { AttributeValue } from "../entity/AttributeValue";
import { Attribute, EntityAttribute } from "../entity/Attribute";
import { Specifications } from "../entity/Specifications";
import { EntitySpecification, SpecificationsValue } from "../entity/SpecificationsValue";
import { addCarSchema } from "../helper/validation/schema/addCarSchema";
import { BrokerOffice } from "../entity/BrokerOffice";

const carRepository = AppDataSource.getRepository(Car);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository =AppDataSource.getRepository(AttributeValue);
const specificationRepostry = AppDataSource.getRepository(Specifications)
const specificationValueRepostry = AppDataSource.getRepository(SpecificationsValue)
const brokerOfficeRepository = AppDataSource.getRepository(BrokerOffice)

export const getCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      brand,
      model,
      location,
      minPrice,
      maxPrice,
      page = "1",
      limit = "10",
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارات" : "items";
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    const query = carRepository.createQueryBuilder("car");

    if (brand) query.andWhere("car.brand = :brand", { brand });
    if (model) query.andWhere("car.model = :model", { model });
    if (location) query.andWhere("car.location = :location", { location });
    if (minPrice) query.andWhere("car.price >= :minPrice", { minPrice });
    if (maxPrice) query.andWhere("car.price <= :maxPrice", { maxPrice });

    const [cars, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const pagination = {
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };

    if (!cars) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const data = await Promise.all(cars.map(async (car) => {
      const attribute = await attributeValueRepository.find({
        where: { entity: EntityAttribute.car, entity_id: car.id },
      });
    
      const specifications = await specificationValueRepostry.find({
        where: { entity: EntitySpecification.car, entity_id: car.id }
      });
    
      return {
        car,
        attributes: attribute,
        specifications
      };
    }));

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

export const getCarById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارات" : "items";

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"],
    });

    if (!car)
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );

    const attributes = await attributeValueRepository.find({
      where: { entity: EntityAttribute.car, entity_id: car.id },
    });

    const specifications = await specificationValueRepostry.find({
      where:{entity: EntitySpecification.car , entity_id:car.id}
    })

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          { car, attributes , specifications },
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارات" : "items";
    const userMessage = lang == "ar" ? "المستخدم" : "user";
    const {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      attributes,
      model,
      brand,
      location,
      status,
      price,
      specifications,
      lat,
      long,
      listing_type,

    } = req.body;

    await validator(addCarSchema(lang), req.body);

    const userId = req["currentUser"]?.id;

    // validate user 
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
    });

    if (!user)
      throw new APIError(
        HttpStatusCode.UNAUTHORIZED,
        ErrorMessages.generateErrorMessage(userMessage, "not found", lang)
      );

      // validate if the user is sempale user or broker office user
      

      const isOffice = await brokerOfficeRepository.findOne({
        where:{user}
      })



    const images = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : [];

    const newCar = carRepository.create({
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      model,
      brand,
      location,
      status,
      price,
      user,
      images,
      lat,
      long,
      listing_type,
      broker_office:isOffice || null
    });

    const savedCar = await carRepository.save(newCar);

    if (attributes && attributes.length > 0) {
      const newAttribute = attributes.map(async (attr) => {
        const attribute_id = await attributeRepository.findOneBy({
          id: attr.id,
        });
        if (!attribute_id) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage(
              userMessage,
              "not found",
              "attribute id"
            )
          );
        }

        return attributeValueRepository.create({
          attribute: attribute_id,
          entity: "car",
          entity_id: savedCar.id,
          value: attr.value,
        });
      });

      var attributeList = await attributeValueRepository.save(newAttribute);
    }

    if (specifications && specifications.length > 0) {
      const newSpecifications = specifications.map(async (item) => {
        const specifications_id = await specificationRepostry.findOneBy({
          id: item.id,
        });
        if (!specifications_id) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage(
              userMessage,
              "not found",
              "specifications id"
            )
          );
        }

        return specificationValueRepostry.create({
          specifications: specifications_id,
          entity: EntitySpecification.car,
          entity_id: savedCar.id,
          value: item.value,
        });
      });

      var specificationsList = await specificationValueRepostry.save(newSpecifications);
    }

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(
        {
          savedCar,
          attributes: attributeList || [],
          specifications: specificationsList || []
        },
        ErrorMessages.generateErrorMessage(entity, "created", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارة" : "items";
    const userMessage = lang == "ar" ? "المستخدم" : "user";

    const { id } = req.params;
    const {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      attributes,
      model,
      brand,
      location,
      status,
      price,
      specifications,
      keptImages, 
    } = req.body;

    const userId = req["currentUser"];

    const car = await carRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"],
    });

    if (!car)
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );

    if (car.user.id !== userId.id) {
      throw new APIError(
        HttpStatusCode.FORBIDDEN,
        ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
      );
    }

    carRepository.merge(car, {
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      model,
      brand,
      location,
      status,
      price,
    });

    const newImages = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : [];

    const keptImagesArray = keptImages ? JSON.parse(keptImages) : [];

    car.images = [...keptImagesArray, ...newImages];

    const updatedCar = await carRepository.save(car);

    if (attributes && attributes.length > 0) {
      const newAttributes = await Promise.all(
        attributes.map(async (attr) => {
          const attribute = await attributeValueRepository.findOneBy({
            id: attr.id,
          });

          if (!attribute) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage(userMessage, "not found", lang)
            );
          }

          return attributeValueRepository.merge(attribute, {
            value: attr.value,
          });
        })
      );

      await attributeValueRepository.save(newAttributes);
    }

    // تحديث المواصفات (Specifications)
    if (specifications && specifications.length > 0) {
      const newSpecifications = await Promise.all(
        specifications.map(async (item) => {
          const specification = await specificationValueRepostry.findOneBy({
            id: item.id,
          });

          if (!specification) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage(userMessage, "not found", lang)
            );
          }

          return specificationValueRepostry.merge(specification, {
            value: item.value,
            IsActive: item.isActive,
          });
        })
      );

      await specificationValueRepostry.save(newSpecifications);
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        updatedCar,
        ErrorMessages.generateErrorMessage(entity, "updated", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};


export const deleteCar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req["currentUser"];

    const car = await carRepository.findOne({
      where: { id: Number(id) , user: Equal(userId.id) },
      relations: ["user"],
    });

    if (!car)
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("المنتج", "not found")
      );

    await carRepository.delete(id);

    const attribute =await attributeValueRepository.find({
      where:{entity_id:car.id , entity:EntityAttribute.car}
    })
    await attributeValueRepository.remove(attribute)

    const specifications = await specificationValueRepostry.find({
      where:{entity_id:car.id , entity:EntitySpecification.car}
    })

    await specificationValueRepostry.remove(specifications)

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          [],
          ErrorMessages.generateErrorMessage("المنتج", "deleted")
        )
      );

  } catch (error) {
    next(error);
  }
};
