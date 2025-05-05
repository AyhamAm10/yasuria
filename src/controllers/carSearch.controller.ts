import { Request, Response, NextFunction } from 'express';
import { Car } from '../entity/Car';
import { AttributeValue } from '../entity/AttributeValue';
import { SpecificationsValue } from '../entity/SpecificationsValue';
import { APIError } from '../error/api.error';
import { HttpStatusCode } from '../error/api.error';
import { AppDataSource } from '../config/data_source';
import { ApiResponse } from '../helper/apiResponse';
import { ErrorMessages } from '../error/ErrorMessages';

export class CarSearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        listing_type,
        seller_type,
        car_type_id,
        min_price,
        max_price,
        location,
        attributes,
        specifications,
        page = 1,
        limit = 20,
      } = req.body;

      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "السيارة" : "car";

      if (page < 1 || limit < 1) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          'Page and limit must be positive numbers'
        );
      }

      const carRepo = AppDataSource.getRepository(Car);
      const query = carRepo.createQueryBuilder('c')
        .leftJoinAndSelect('c.car_type', 'car_type')
        .leftJoinAndSelect('c.user', 'user');

      // Basic Filters
      if (listing_type) query.andWhere('c.listing_type = :listing_type', { listing_type });
      if (seller_type) query.andWhere('c.seller_type = :seller_type', { seller_type });
      if (car_type_id) query.andWhere('c.car_type_id = :car_type_id', { car_type_id });
      if (min_price) query.andWhere('c.price >= :min_price', { min_price });
      if (max_price) query.andWhere('c.price <= :max_price', { max_price });
      if (location) query.andWhere('c.location LIKE :location', { location: `%${location}%` });

      // Dynamic Attribute Filters
      if (attributes && attributes.length > 0) {
        attributes.forEach((attr: any, index: number) => {
          const alias = `av${index}`;
          
          query.innerJoin(
            AttributeValue,
            alias,
            `${alias}.entity_id = c.id AND ${alias}.entity = 'car' AND ${alias}.attribute_id = :attrId${index}`,
            { [`attrId${index}`]: attr.attribute_id }
          );

          if (attr.value !== undefined) {
            query.andWhere(`${alias}.value = :attrValue${index}`, { 
              [`attrValue${index}`]: attr.value.toString() 
            });
          }
        });
      }

      // Specifications Filters
      if (specifications && specifications.length > 0) {
        specifications.forEach((specId: number, index: number) => {
          const alias = `sv${index}`;
          
          query.innerJoin(
            SpecificationsValue,
            alias,
            `${alias}.entity_id = c.id AND ${alias}.entity = 'car' AND ${alias}.specifications.id = :specId${index}`,
            { [`specId${index}`]: specId }
          );

          query.andWhere(`${alias}.value = :specValue${index}`, {
            [`specValue${index}`]: 'true'
          });
        });
      }

      // Pagination
      query
        .skip((page - 1) * limit)
        .take(limit);

      const [cars, total] = await query.getManyAndCount();

      const pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          cars,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
        )
      );

    } catch (error) {
      next(error);
    }
  }
}
