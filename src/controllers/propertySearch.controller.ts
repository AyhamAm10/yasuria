import { Request, Response, NextFunction } from "express";
import { Property } from "../entity/Property";
import { AttributeValue } from "../entity/AttributeValue";
import {
  EntitySpecification,
  SpecificationsValue,
} from "../entity/SpecificationsValue";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { AppDataSource } from "../config/data_source";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { Entity_Type, Favorite } from "../entity/Favorites";
import { isFavorite } from "../helper/isFavorite";
import { Attribute } from "../entity/Attribute";

// const specificationValueRepository
const favoriteRepository = AppDataSource.getRepository(Favorite);
export class PropertySearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        listing_type,
        seller_type,
        property_type_id,
        min_price,
        max_price,
        location,
        attributes,
        specifications,
        governorate_id,
        page = 1,
        limit = 20,
      } = req.body;

      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "العقار" : "property";
      const userId = req.currentUser?.id;

      if (page < 1 || limit < 1) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          "Page and limit must be positive numbers"
        );
      }

      const propertyRepo = AppDataSource.getRepository(Property);
      const query = propertyRepo
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.property_type", "property_type")
        .leftJoinAndSelect("p.user", "user");

      // Filters...
      if (listing_type)
        query.andWhere("p.listing_type = :listing_type", { listing_type });
      if (seller_type)
        query.andWhere("p.seller_type = :seller_type", { seller_type });
      if (property_type_id)
        query.andWhere("p.property_type = :property_type_id", {
          property_type_id,
        });
      if (min_price) query.andWhere("p.price_sy >= :min_price", { min_price });
      if (max_price) query.andWhere("p.price_sy <= :max_price", { max_price });
      if (location)
        query.andWhere("p.location LIKE :location", {
          location: `%${location}%`,
        });
      if (governorate_id)
        query.andWhere("p.governorateId = :governorateId", {
          governorateId: governorate_id,
        });

      // Attributes joins...
      if (attributes && attributes.length > 0) {
        for (const [index, attr] of attributes.entries()) {
          const alias = `av${index}`;

          const attributeEntity = await AppDataSource.getRepository(
            Attribute
          ).findOne({
            where: { id: attr.attribute_id },
          });

          if (!attributeEntity) {
            throw new APIError(
              HttpStatusCode.BAD_REQUEST,
              `Attribute with id ${attr.attribute_id} not found`
            );
          }

          query.innerJoin(
            AttributeValue,
            alias,
            `${alias}.entity_id = p.id AND ${alias}.entity = 'property' AND ${alias}.attribute_id = :attrId${index}`,
            { [`attrId${index}`]: attr.attribute_id }
          );

          if (attributeEntity.input_type === "dropdown") {
            if (attr.value !== undefined) {
              query.andWhere(`${alias}.value = :attrValue${index}`, {
                [`attrValue${index}`]: `${attr.value}`,
              });
            }
          } else if (attributeEntity.input_type === "text") {
            if (attr.min !== undefined) {
              query.andWhere(`${alias}.value >= :attrMin${index}`, {
                [`attrMin${index}`]: `${attr.min}`,
              });
            }
            if (attr.max !== undefined) {
              query.andWhere(`${alias}.value <= :attrMax${index}`, {
                [`attrMax${index}`]: `${attr.max}`,
              });
            }
          }
        }
      }

      if (specifications && specifications.length > 0) {
        specifications.forEach((specId: number, index: number) => {
          const alias = `sv${index}`;
          query.innerJoin(
            SpecificationsValue,
            alias,
            `${alias}.entity_id = p.id AND ${alias}.entity = 'property' AND ${alias}.specification.id = :specId${index}`,
            { [`specId${index}`]: specId }
          );
          query.andWhere(`${alias}.IsActive = :isActive${index}`, {
            [`isActive${index}`]: true,
          });
        });
      }

      const [properties, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      const data = await Promise.all(
        properties.map(async (property) => {
          return {
            ...property,
            is_favorite: await isFavorite(
              userId,
              property.id,
              Entity_Type.properties
            ),
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
  }
}
