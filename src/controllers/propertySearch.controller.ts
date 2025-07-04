import { Request, Response, NextFunction } from "express";
import { Property } from "../entity/Property";
import { AttributeValue, EntityAttribute } from "../entity/AttributeValue";
import {
  SpecificationsValue,
} from "../entity/SpecificationsValue";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { AppDataSource } from "../config/data_source";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { Attribute } from "../entity/Attribute";
import { Between, In, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
import { Specifications } from "../entity/Specifications";

export class PropertySearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        listing_type,
        seller_type,
        property_type_id,
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
      const propertyRepo = AppDataSource.getRepository(Property);
      const attributeRepo = AppDataSource.getRepository(Attribute);
      const attributeValueRepo = AppDataSource.getRepository(AttributeValue);
      const specificationsRepo = AppDataSource.getRepository(Specifications);
      const specificationsValueRepo = AppDataSource.getRepository(SpecificationsValue);

      let propertyIdsSets: Set<number>[] = [];

      if (attributes.length > 0) {
        const attrIds = attributes.map((a: any) => a.attribute_id);
        const attrs = await attributeRepo.findBy({ id: In(attrIds) });

        for (const attrFilter of attributes) {
          const attr = attrs.find((a) => a.id === attrFilter.attribute_id);
          if (!attr) {
            throw new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage("attribute id" , "not found" , lang));
          }

          if (attr.input_type === "dropdown") {
            if (attrFilter.value === undefined) continue;

            const matchedValues = await attributeValueRepo.find({
              where: {
                attribute: attrFilter.attribute_id,
                entity: EntityAttribute.properties,
                value: attrFilter.value,
              },
            });

            const propertyIds = new Set(matchedValues.map((v) => v.entity_id));
            propertyIdsSets.push(propertyIds);
          }

          else if (attr.input_type === "text") {
            const allValues = await attributeValueRepo.find({
              where: {
                attribute: attrFilter.attribute_id,
                entity: EntityAttribute.properties,
              },
            });

            const filteredValues = allValues.filter((val) => {
              const num = parseFloat(val.value);
              if (isNaN(num)) return false;

              if (attrFilter.min !== undefined && attrFilter.max !== undefined) {
                return num >= attrFilter.min && num <= attrFilter.max;
              } else if (attrFilter.min !== undefined) {
                return num >= attrFilter.min;
              } else if (attrFilter.max !== undefined) {
                return num <= attrFilter.max;
              }
              return true;
            });

            const propertyIds = new Set(filteredValues.map((v) => v.entity_id));
            propertyIdsSets.push(propertyIds);
          }
        }
      }

      if (specifications.length > 0) {
        const specIds = specifications.map((s: any) => s.specification_id);
        const specs = await specificationsRepo.findBy({ id: In(specIds) });

        for (const specFilter of specifications) {
          const spec = specs.find((s) => s.id === specFilter.specification_id);
          if (!spec) {
            throw new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage("specification id", "not found", lang));
          }

          let whereConditions: any = {
            specification: specFilter.specification_id,
            entity: "property",
            IsActive: true,
          };

          if (specFilter.value !== undefined) {
            whereConditions.value = specFilter.value;
          }

          const matchedSpecValues = await specificationsValueRepo.find({
            where: whereConditions,
          });

          const propertyIds = new Set(matchedSpecValues.map((v) => v.entity_id));
          propertyIdsSets.push(propertyIds);
        }
      }

      let finalPropertyIds: Set<number>;
      if (propertyIdsSets.length > 0) {
        finalPropertyIds = propertyIdsSets.reduce((acc, set) => {
          return new Set([...acc].filter((x) => set.has(x)));
        });
      } else {
        finalPropertyIds = new Set();
      }

      const whereConditions: any = {};
      if (listing_type) whereConditions.listing_type = listing_type;
      if (seller_type) whereConditions.seller_type = seller_type;
      if (property_type_id) whereConditions.property_type = { id: property_type_id };
      if (min_price) whereConditions.price_sy = MoreThanOrEqual(min_price);
      if (max_price) whereConditions.price_sy = LessThanOrEqual(max_price);
      if (location) whereConditions.location = Like(`%${location}%`);
      if (governorate_id) whereConditions.governorateId = governorate_id;

      if (finalPropertyIds.size > 0) {
        whereConditions.id = In([...finalPropertyIds]);
      } else if (attributes.length > 0 || specifications.length > 0) {
        res.json(ApiResponse.success([], "No properties found", { total: 0, page, limit, totalPages: 0 }));
        return;
      }

      const [properties, total] = await propertyRepo.findAndCount({
        where: whereConditions,
        relations: ["property_type", "user", "governorateInfo"],
        skip: (page - 1) * limit,
        take: limit,
        order: { created_at: "DESC" },
      });

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      res.status(200).json(ApiResponse.success(properties, "Properties retrieved", pagination));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
