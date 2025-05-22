import { Request, Response, NextFunction } from 'express';
import { Property } from '../entity/Property'; 
import { AttributeValue } from '../entity/AttributeValue';
import { EntitySpecification, SpecificationsValue } from '../entity/SpecificationsValue';
import { APIError } from '../error/api.error';
import { HttpStatusCode } from '../error/api.error';
import { AppDataSource } from '../config/data_source';
import { ApiResponse } from '../helper/apiResponse';
import { ErrorMessages } from '../error/ErrorMessages';
import { Entity_Type, Favorite } from '../entity/Favorites';

// const specificationValueRepository
const favoriteRepository = AppDataSource.getRepository(Favorite)
export class PropertySearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        listing_type,
        seller_type,
        property_type_id,
        min_price,
        max_price,
        min_area,
        max_area,
        min_floors,
        max_floors,
        location,
        attributes,
        specifications,
        page = 1,
        limit = 20,
      } = req.body;

      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "العقار" : "property";
      const userId = req.currentUser?.id;

      if (page < 1 || limit < 1) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          'Page and limit must be positive numbers'
        );
      }

      const propertyRepo = AppDataSource.getRepository(Property);
      const query = propertyRepo.createQueryBuilder('p')
        .leftJoinAndSelect('p.property_type', 'property_type')
        .leftJoinAndSelect('p.user', 'user');

      // Filters...
      if (listing_type)      query.andWhere('p.listing_type = :listing_type', { listing_type });
      if (seller_type)       query.andWhere('p.seller_type = :seller_type',   { seller_type });
      if (property_type_id)  query.andWhere('p.property_type_id = :property_type_id', { property_type_id });
      if (min_price)         query.andWhere('p.price >= :min_price',        { min_price });
      if (max_price)         query.andWhere('p.price <= :max_price',        { max_price });
      if (min_area)          query.andWhere('p.area >= :min_area',          { min_area });
      if (max_area)          query.andWhere('p.area <= :max_area',          { max_area });
      if (min_floors)        query.andWhere('p.floors >= :min_floors',       { min_floors });
      if (max_floors)        query.andWhere('p.floors <= :max_floors',       { max_floors });
      if (location)          query.andWhere('p.location LIKE :location',     { location: `%${location}%` });

      // Attributes joins...
      if (attributes && attributes.length > 0) {
        attributes.forEach((attr: any, index: number) => {
          const alias = `av${index}`;
          query.innerJoin(
            AttributeValue,
            alias,
            `${alias}.entity_id = p.id AND ${alias}.entity = 'property' AND ${alias}.attribute_id = :attrId${index}`,
            { [`attrId${index}`]: attr.attribute_id }
          );
          if (attr.value !== undefined) {
            query.andWhere(`${alias}.value = :attrValue${index}`, { [`attrValue${index}`]: `${attr.value}` });
          }
        });
      }

      // Specifications joins...
      if (specifications && specifications.length > 0) {
        specifications.forEach((specId: number, index: number) => {
          const alias = `sv${index}`;
          query.innerJoin(
            SpecificationsValue,
            alias,
            `${alias}.entity_id = p.id AND ${alias}.entity = 'property' AND ${alias}.specifications_id = :specId${index}`,
            { [`specId${index}`]: specId }
          );
          query.andWhere(`${alias}.value = :specValue${index}`, { [`specValue${index}`]: 'true' });
        });
      }

      // Pagination & execute
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

      // الآن نضيف is_favorite لكل عقار
      const data = await Promise.all(
        properties.map(async (property) => {
          let is_favorite = false;
          if (userId) {
            const fav = await favoriteRepository.findOne({
              where: {
                user: { id: userId },
                item_id: property.id,
                item_type: Entity_Type.properties,
              },
            });
            is_favorite = !!fav;
          }

          return {
            ...property,
            is_favorite,
          };
        })
      );

       res.status(HttpStatusCode.OK).json(
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


