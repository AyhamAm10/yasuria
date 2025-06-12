import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entity/Car";
import { APIError } from "../error/api.error";
import { User } from "../entity/User";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { Equal } from "typeorm";
import { AttributeValue } from "../entity/AttributeValue";
import { Attribute, EntityAttribute } from "../entity/Attribute";
import { Specifications } from "../entity/Specifications";
import {
  EntitySpecification,
  SpecificationsValue,
} from "../entity/SpecificationsValue";
import { BrokerOffice } from "../entity/BrokerOffice";
import { Entity_Type } from "../entity/Favorites";
import { CarType } from "../entity/CarType";
import { isFavorite } from "../helper/isFavorite";
import { Governorate } from "../entity/governorate";

const carRepository = AppDataSource.getRepository(Car);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const specificationRepostry = AppDataSource.getRepository(Specifications);
const specificationValueRepostry =
  AppDataSource.getRepository(SpecificationsValue);
const brokerOfficeRepository = AppDataSource.getRepository(BrokerOffice);
const carTypeReposetry = AppDataSource.getRepository(CarType);
const governorateReposetory = AppDataSource.getRepository(Governorate);

export const getCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      governorate_id,
      page = "1",
      limit = "10",
      sortByPrice, // "asc" or "desc"
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارات" : "items";
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;
    const userId = req.currentUser?.id;
    const query = carRepository.createQueryBuilder("car");

    if (governorate_id) {
      query.andWhere("car.governorateId = :governorateId", {
        governorateId: governorate_id,
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

    if (!queryResult || queryResult.length === 0) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const data = await Promise.all(
      queryResult.map(async (rawCar) => {
        console.log(rawCar);
        const car = {
          ...rawCar,
          is_favorite: await isFavorite(userId, rawCar.car_id, Entity_Type.car),
        };

        return {
          ...car,
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

export const getCarById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "السيارات" : "items";
    const userId = req.currentUser?.id;

    const carQuery = carRepository
      .createQueryBuilder("car")
      .where("car.id = :id", { id: Number(id) })
      .leftJoinAndSelect("car.user", "user")
      .leftJoinAndSelect("car.broker_office", "broker_office")
      .leftJoinAndSelect("car.car_type", "car_type")
      .leftJoinAndSelect("car.governorateInfo", "governorateInfo");

    const carResult = await carQuery.getRawOne();

    if (!carResult) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const { ...carRawData } = carResult;
    const car = {
      ...carRawData,
      id: carRawData.car_id,
      user: {
        id: carRawData.user_id,
      },
    };

    const [attributes, specifications] = await Promise.all([
      attributeValueRepository.find({
        where: { entity: EntityAttribute.car, entity_id: car.id },
        relations: ["attribute"],
      }),

      specificationValueRepostry.find({
        where: { entity: EntitySpecification.car, entity_id: car.id },
        relations: ["specification"],
      }),
    ]);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        {
          type: "car" ,
          ...car,
          is_favorite: await isFavorite(userId, car.id, Entity_Type.car),
          attributes,
          specifications,
        },
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
      location,
      price_usd,
      price_sy,
      specifications,
      latitude,
      longitude,
      listing_type,
      type_id,
      seller_type,
      governorate_id,
    } = req.body;

    // await validator(addCarSchema(lang), req.body);

    const userId = req["currentUser"]?.id;

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new APIError(
        HttpStatusCode.UNAUTHORIZED,
        ErrorMessages.generateErrorMessage(userMessage, "not found", lang)
      );
    }

    const carType = await carTypeReposetry.findOneBy({ id: type_id });

    if (!carType && type_id) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("type id", "not found", lang)
      );
    }

    const isOffice = await brokerOfficeRepository.findOne({
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

    const newCar = carRepository.create({
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      location,
      price_sy,
      price_usd,
      user,
      images,
      lat:latitude,
      long:longitude,
      listing_type,
      seller_type,
      broker_office: isOffice || null,
      car_type: carType,
      governorateId: governorate.id,
      governorateInfo: governorate,
    });

    const savedCar = await carRepository.save(newCar);

    let attributeList = [];
    if (attributes && attributes.length > 0) {
      const attributePromises = attributes.map(async (attr) => {
        const attribute = await attributeRepository.findOneBy({ id: attr.id });
        if (!attribute) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("Attribute", "not found", lang)
          );
        }

        return attributeValueRepository.create({
          attribute: attribute,
          entity: EntityAttribute.car,
          entity_id: savedCar.id,
          value: attr.value,
        });
      });

      attributeList = await attributeValueRepository.save(
        await Promise.all(attributePromises)
      );
    }

    let specificationsList = [];
    if (specifications && specifications.length > 0) {
      const specPromises = specifications.map(async (item) => {
        const spec = await specificationRepostry.findOneBy({ id: item.id });
        if (!spec) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage(
              "Specification",
              "not found",
              lang
            )
          );
        }

        return specificationValueRepostry.create({
          specification: spec,
          entity: EntitySpecification.car,
          entity_id: savedCar.id,
          IsActive: true,
        });
      });

      specificationsList = await specificationValueRepostry.save(
        await Promise.all(specPromises)
      );
    }

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(
        {
          car: savedCar,
          attributes: attributeList,
          specifications: specificationsList,
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
    const entity = lang == "ar" ? "السيارات" : "items";

    const {
      id,
      title_ar,
      title_en,
      desc_ar,
      desc_en,
      attributes,
      location,
      price_usd,
      price_sy,
      specifications,
      latitude,
      longitude,
      listing_type,
      type_id,
      seller_type,
      governorate_id,
      keptImages, 
      isActive
    } = req.body;

    console.log(isActive)
    const userId = req["currentUser"]?.id;

    const car = await carRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ["user"],
    });

    if (!car) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const user = car.user;

    const carType = await carTypeReposetry.findOneBy({ id: type_id });
    if (!carType && type_id) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("type id", "not found", lang)
      );
    }

    const isOffice = await brokerOfficeRepository.findOne({ where: { user } });

    const governorate = await governorateReposetory.findOneBy({ id: governorate_id });
    if (!governorate) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("governorate", "not found", lang)
      );
    }

    const newImages = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/src/public/uploads/${file.filename}`
        )
      : [];

    let keptImagesArray: string[] = [];
    if (keptImages) {
      keptImagesArray = JSON.parse(keptImages);
    }

    car.title_ar = title_ar ?? car.title_ar;
    car.title_en = title_en ?? car.title_en;
    car.desc_ar = desc_ar ?? car.desc_ar;
    car.desc_en = desc_en ?? car.desc_en;
    car.location = location ?? car.location;
    car.price_sy = price_sy ?? car.price_sy;
    car.price_usd = price_usd ?? car.price_usd;
    car.lat = latitude ?? car.lat;
    car.long = longitude ?? car.long;
    car.listing_type = listing_type ?? car.listing_type;
    car.seller_type = seller_type ?? car.seller_type;
    car.broker_office = isOffice || null;
    car.car_type = carType ?? car.car_type;
    car.governorateId = governorate.id;
    car.governorateInfo = governorate;
    car.images = [...keptImagesArray, ...newImages];
    car.isActive = isActive ?? car.isActive

    const savedCar = await carRepository.save(car);

    await specificationValueRepostry.delete({ entity: EntitySpecification.car, entity_id: savedCar.id });

    let specificationsList = [];
    if (specifications && specifications.length > 0) {
      const specPromises = specifications.map(async (item) => {
        const spec = await specificationRepostry.findOneBy({ id: item.id });
        if (!spec) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("Specification", "not found", lang)
          );
        }
        return specificationValueRepostry.create({
          specification: spec,
          entity: EntitySpecification.car,
          entity_id: savedCar.id,
          IsActive: true,
        });
      });

      specificationsList = await specificationValueRepostry.save(await Promise.all(specPromises));
    }

    await attributeValueRepository.delete({ entity: EntityAttribute.car, entity_id: savedCar.id });

    let attributeList = [];
    if (attributes && attributes.length > 0) {
      const attrPromises = attributes.map(async (attr) => {
        const attribute = await attributeRepository.findOneBy({ id: attr.id });
        if (!attribute) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("Attribute", "not found", lang)
          );
        }
        return attributeValueRepository.create({
          attribute,
          entity: EntityAttribute.car,
          entity_id: savedCar.id,
          value: attr.value,
        });
      });

      attributeList = await attributeValueRepository.save(await Promise.all(attrPromises));
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        {
          car: savedCar,
          attributes: attributeList,
          specifications: specificationsList,
        },
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
      where: { id: Number(id), user: Equal(userId.id) },
      relations: ["user"],
    });

    if (!car)
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("المنتج", "not found")
      );

    await carRepository.delete(id);

    const attribute = await attributeValueRepository.find({
      where: { entity_id: car.id, entity: EntityAttribute.car },
    });
    await attributeValueRepository.remove(attribute);

    const specifications = await specificationValueRepostry.find({
      where: { entity_id: car.id, entity: EntitySpecification.car },
    });

    await specificationValueRepostry.remove(specifications);

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
