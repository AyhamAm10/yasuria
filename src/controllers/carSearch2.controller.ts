import { Request, Response, NextFunction } from "express";
import { Car } from "../entity/Car";
import { AttributeValue } from "../entity/AttributeValue";
import { EntitySpecification, SpecificationsValue } from "../entity/SpecificationsValue";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { AppDataSource } from "../config/data_source";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { Entity_Type, Favorite } from "../entity/Favorites";
import { isFavorite } from "../helper/isFavorite";
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
import { Attribute } from "../entity/Attribute";

export class CarSearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      listing_type,
      seller_type,
      car_type_id,
      min_price,
      max_price,
      location,
      attributes = [],
      specifications = [],
      governorate_id,
      page = 1,
      limit = 20,
    } = req.body;

    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "السيارة" : "car";
    const userId = req.currentUser?.id;

    const carRepo = AppDataSource.getRepository(Car);
    const attributeRepo = AppDataSource.getRepository(Attribute);
    const attributeValueRepo = AppDataSource.getRepository(AttributeValue);
    const specificationValueRepo = AppDataSource.getRepository(SpecificationsValue);

    if (page < 1 || limit < 1) {
      throw new APIError(HttpStatusCode.BAD_REQUEST, "Page and limit must be positive numbers");
    }

    const attrIds = attributes.map((a: any) => a.attribute_id);
    const attrs = await attributeRepo.findBy({ id: In(attrIds) });

    let carIdsSets: Set<number>[] = [];

    for (const attrFilter of attributes) {
      const attr = attrs.find((a) => a.id === attrFilter.attribute_id);
      if (!attr) {
        throw new APIError(HttpStatusCode.BAD_REQUEST, `Attribute with id ${attrFilter.attribute_id} not found`);
      }

      let whereConditions: any = {
        attribute: attrFilter.attribute_id,
        entity: "car",
      };

      if (attr.input_type === "dropdown") {
        if (attrFilter.value === undefined) continue;
        whereConditions.value = attrFilter.value;
      } else if (attr.input_type === "text") {
        if (attrFilter.min !== undefined && attrFilter.max !== undefined) {
          whereConditions.value = Between(attrFilter.min, attrFilter.max);
        } else if (attrFilter.min !== undefined) {
          whereConditions.value = MoreThanOrEqual(attrFilter.min);
        } else if (attrFilter.max !== undefined) {
          whereConditions.value = LessThanOrEqual(attrFilter.max);
        }
      }

      const matchedValues = await attributeValueRepo.find({
        where: whereConditions,
      });

      const carIds = new Set(matchedValues.map((v) => v.entity_id));
      carIdsSets.push(carIds);
    }

    if (specifications.length > 0) {
      const specValues = await specificationValueRepo.find({
        where: {
          specification: In(specifications),
          entity: EntitySpecification.car,
          IsActive: true,
        },
      });

      const specCarIds = new Set(specValues.map((v) => v.entity_id));
      carIdsSets.push(specCarIds);
    }

    let finalCarIds: Set<number>;
    if (carIdsSets.length > 0) {
      finalCarIds = carIdsSets.reduce((acc, set) => {
        return new Set([...acc].filter((x) => set.has(x)));
      });
    } else {
      finalCarIds = new Set(); 
    }

    const whereConditions: any = {};
    if (listing_type) whereConditions.listing_type = listing_type;
    if (seller_type) whereConditions.seller_type = seller_type;
    if (car_type_id) whereConditions.car_type = { id: car_type_id };
    if (min_price) whereConditions.price = MoreThanOrEqual(min_price);
    if (max_price) whereConditions.price = LessThanOrEqual(max_price);
    if (location) whereConditions.location = Like(`%${location}%`);
    if (governorate_id) whereConditions.governorateId = governorate_id;

    if (finalCarIds.size > 0) {
      whereConditions.id = In([...finalCarIds]);
    } else if (attributes.length > 0 || specifications.length > 0) {
       res.json(ApiResponse.success([], "No cars found", { total: 0, page, limit, totalPages: 0 }));
        return;
    }

    const [cars, total] = await carRepo.findAndCount({
      where: whereConditions,
      relations: ["car_type", "user", "governorateInfo"],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
    });

    const carsWithFavorite = await Promise.all(
      cars.map(async (car) => {
        return {
          ...car,
          is_favorite: await isFavorite(userId, car.id, Entity_Type.car),
        };
      })
    );

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    res
      .status(HttpStatusCode.OK)
      .json(ApiResponse.success(carsWithFavorite, ErrorMessages.generateErrorMessage(entity, "retrieved", lang), pagination));
  } catch (error) {
    console.log(error);
    next(error);
  }
}

}
