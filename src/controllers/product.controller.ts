import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { Car } from "../entity/Car";
import { Property } from "../entity/Property";
import { Attribute, EntityAttribute } from "../entity/Attribute";
import { AttributeValue } from "../entity/AttributeValue";
import { Specifications } from "../entity/Specifications";
import { EntitySpecification, SpecificationsValue } from "../entity/SpecificationsValue";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { Entity_Type, Favorite } from "../entity/Favorites";
import { isFavorite } from "../helper/isFavorite";


const carRepository = AppDataSource.getRepository(Car);
const propertyRepository = AppDataSource.getRepository(Property);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const specificationValueRepository = AppDataSource.getRepository(SpecificationsValue);
const favoriteRepository = AppDataSource.getRepository(Favorite)
export class productsController {
  
  static async getProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        brand,
        model,
        carLocation,
        carMinPrice,
        carMaxPrice,
        propertyTitle,
        propertyLocation,
        propertyMinPrice,
        propertyMaxPrice,
        propertyArea,
      } = req.query;

      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المنتجات" : "products";
      const user = req.currentUser;
      const userId = req.currentUser?.id;

      const carQuery = carRepository.createQueryBuilder("car");

      if (brand) carQuery.andWhere("car.brand = :brand", { brand });
      if (model) carQuery.andWhere("car.model = :model", { model });
      if (carLocation) carQuery.andWhere("car.location = :carLocation", { carLocation });
      if (carMinPrice) carQuery.andWhere("car.price >= :carMinPrice", { carMinPrice });
      if (carMaxPrice) carQuery.andWhere("car.price <= :carMaxPrice", { carMaxPrice });

      const cars = await carQuery
        .orderBy("car.created_at", "DESC")
        .take(10)
        .getMany();

      const carData = await Promise.all(cars.map(async (car) => {
        // const attributes = await attributeValueRepository.find({
        //   where: { entity: EntityAttribute.car, entity_id: car.id },
        // });

        // const specifications = await specificationValueRepository.find({
        //   where: { entity: EntitySpecification.car, entity_id: car.id },
        // });


        return {
          type: "car",
          data: car,
          // attributes,
          // specifications,
          is_favorite : await isFavorite(userId , car.id , Entity_Type.car),
          created_at: car.created_at,
        };
      }));

      const propertyQuery = propertyRepository.createQueryBuilder("property");

      if (propertyTitle)
        propertyQuery.andWhere("property.title_ar ILIKE :propertyTitle OR property.title_en ILIKE :propertyTitle", {
          propertyTitle: `%${propertyTitle}%`,
        });
      if (propertyLocation)
        propertyQuery.andWhere("property.location = :propertyLocation", { propertyLocation });
      if (propertyMinPrice)
        propertyQuery.andWhere("property.price >= :propertyMinPrice", { propertyMinPrice });
      if (propertyMaxPrice)
        propertyQuery.andWhere("property.price <= :propertyMaxPrice", { propertyMaxPrice });
      if (propertyArea)
        propertyQuery.andWhere("property.area = :propertyArea", { propertyArea });

      const properties = await propertyQuery
        .orderBy("property.created_at", "DESC")
        .take(10)
        .getMany();

      const propertyData = await Promise.all(properties.map(async (property) => {
        // const attributes = await attributeValueRepository.find({
        //   where: { entity: EntityAttribute.properties, entity_id: property.id },
        // });

        // const specifications = await specificationValueRepository.find({
        //   where: { entity: EntitySpecification.properties, entity_id: property.id },
        // });


        return {
          type: "property",
          data: property,
          // attributes,
          // specifications,
          is_favorite : await isFavorite(userId , property.id , Entity_Type.properties),
          created_at: property.created_at,
        };
      }));

      const mergedData = [...carData, ...propertyData].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          mergedData,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

