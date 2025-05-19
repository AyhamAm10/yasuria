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
import { Favorite } from "../entity/Favorites";
import { CarType } from "../entity/CarType";

const carRepository = AppDataSource.getRepository(Car);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository =AppDataSource.getRepository(AttributeValue);
const specificationRepostry = AppDataSource.getRepository(Specifications)
const specificationValueRepostry = AppDataSource.getRepository(SpecificationsValue)
const brokerOfficeRepository = AppDataSource.getRepository(BrokerOffice)
const carTypeReposetry = AppDataSource.getRepository(CarType)
export const getCars = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
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
    const userId = req.currentUser?.id
    const query = carRepository.createQueryBuilder("car");

    if (userId) {
      query.leftJoin(
        Favorite,
        "fav",
        "fav.item_id = car.id AND fav.item_type = 'car' AND fav.user_id = :userId",
        { userId }
      );
      query.addSelect("fav.id IS NOT NULL", "is_favorite");
    } else {
      query.addSelect("false", "is_favorite");
    }

    if (location) query.andWhere("car.location = :location", { location });
    if (minPrice) query.andWhere("car.price >= :minPrice", { minPrice });
    if (maxPrice) query.andWhere("car.price <= :maxPrice", { maxPrice });

    const queryResult = await query
      .skip(skip)
      .take(pageSize)
      .getRawMany();

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

    // const carIds = queryResult.map(c => c.car_id);
    // 
    // const [allAttributes, allSpecifications] = await Promise.all([
    //   attributeValueRepository.find({
    //     where: { 
    //       entity: EntityAttribute.car, 
    //       entity_id: In(carIds) 
    //     }
    //   }),
    //   specificationValueRepostry.find({
    //     where: { 
    //       entity: EntitySpecification.car, 
    //       entity_id: In(carIds) 
    //     }
    //   })
    // ]);

    const data = queryResult.map(rawCar => {

      const car = {
        ...rawCar
      };

      return {
        ...car,
        // attributes: allAttributes.filter(attr => attr.entity_id === rawCar.car_id),
        // specifications: allSpecifications.filter(spec => spec.entity_id === rawCar.car_id)
      };
    });


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
    const userId = req.currentUser?.id


    const carQuery = carRepository.createQueryBuilder("car")
      .where("car.id = :id", { id: Number(id) })
      .leftJoinAndSelect("car.user", "user")
      .leftJoinAndSelect("car.broker_office", "broker_office")
      .leftJoinAndSelect("car.car_type", "car_type")

    if (userId) {
      carQuery.leftJoin(
        Favorite,
        "fav",
        "fav.item_id = car.id AND fav.item_type = 'car' AND fav.user_id = :userId",
        { userId }
      );
      carQuery.addSelect("fav.id IS NOT NULL", "is_favorite");
    } else {
      carQuery.addSelect("false", "is_favorite");
    }

    const carResult = await carQuery.getRawOne();

    if (!carResult) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    const { is_favorite, ...carRawData } = carResult;
    const car = {
      ...carRawData,
      id: carRawData.car_id,
      user: {
        id: carRawData.user_id,
      }
    };

    const [attributes, specifications] = await Promise.all([
      attributeValueRepository.find({
        where: { entity: EntityAttribute.car, entity_id: car.id },
        relations:["attribute"]
      }),

      specificationValueRepostry.find({
        where: { entity: EntitySpecification.car, entity_id: car.id },
        relations: ["specification"]
      })
    ]);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        { 
          ...car,
          is_favorite: Boolean(is_favorite),
          attributes,
          specifications 
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
      lat,
      long,
      listing_type,
      type_id,
      seller_type
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

      const carType = await carTypeReposetry.findOneBy({id:type_id})

      if(!carType && type_id){
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("type id", "not found", lang)
        );
      }


    const isOffice = await brokerOfficeRepository.findOne({
      where: { user }
    });

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
      location,
      price_sy,
      price_usd,
      user,
      images,
      lat,
      long,
      listing_type,
      seller_type,
      broker_office: isOffice || null,
      car_type: carType
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

      attributeList = await attributeValueRepository.save(await Promise.all(attributePromises));
    }

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
          value: item.value
        });
      });

      specificationsList = await specificationValueRepostry.save(await Promise.all(specPromises));
    }

    res.status(HttpStatusCode.OK_CREATED).json(
      ApiResponse.success(
        {
          car: savedCar,
          attributes: attributeList,
          specifications: specificationsList
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
      location,
      price_sy,
      price_usd,
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
      location,
      price_sy,
      price_usd,
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
