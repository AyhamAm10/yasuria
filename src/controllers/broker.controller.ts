import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BrokerOffice } from "../entity/BrokerOffice";
import { User, UserRole } from "../entity/User";
import { validator } from "../helper/validation/validator";
import { AppDataSource } from "../config/data_source";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { brokerOfficeSchema } from "../helper/validation/schema/brokerSchema";
import { brokerService } from "../entity/BrokerService";
import { Service } from "../entity/Services";
import { BrokerFollower } from "../entity/BrokerFollower";
import { In } from "typeorm";
import { BrokerRating } from "../entity/BrokerRating";
import { Governorate } from "../entity/governorate";

const userRepository = AppDataSource.getRepository(User);
const brokerRepository = AppDataSource.getRepository(BrokerOffice);
const serviceRepository = AppDataSource.getRepository(Service);
const brokerofficeServiceRepository =
  AppDataSource.getRepository(brokerService);

const governorateRepository = AppDataSource.getRepository(Governorate);
export class BrokerController {
  // static async createBrokerOffice(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const lang = req.headers["accept-language"] || "ar";
  //     const entity = lang === "ar" ? "رقم الوتساب" : "phone";
  //     const serviceLang = lang === "ar" ? "ID الخدمة" : "ID service";

  //     // await validator(brokerOfficeSchema(lang), req.body);

  //     const {
  //       phone,
  //       office_name,
  //       user_name,
  //       city,
  //       commercial_number,
  //       whatsapp_number,
  //       governorate_id,
  //       address,
  //       lat,
  //       long,
  //       working_hours_from,
  //       working_hours_to,
  //       description,
  //       services,
  //     } = req.body;

  //     const image = req.file ? req.file.filename : "";

  //     const userExists = await userRepository.findOne({ where: { phone } });
  //     if (userExists) {
  //       throw new APIError(
  //         HttpStatusCode.BAD_REQUEST,
  //         ErrorMessages.generateErrorMessage(entity, "already exists", lang)
  //       );
  //     }

  //     const newUser = userRepository.create({
  //       phone,
  //       city,
  //       name: user_name,
  //       isActive: true,
  //       role: UserRole.vendor,
  //     });
  //     const user = await userRepository.save(newUser);

  //     const governorate = await governorateRepository.findOne({
  //       where: { id: governorate_id },
  //     });

  //     if (!governorate) {
  //       throw new APIError(
  //         HttpStatusCode.NOT_FOUND,
  //         ErrorMessages.generateErrorMessage("المحافظة", "not found", lang)
  //       );
  //     }

  //     const newBrokerOffice = brokerRepository.create({
  //       user,
  //       office_name,
  //       image: image || "default_broker.jpg",
  //       commercial_number,
  //       whatsapp_number,
  //       governorateId: governorate.id,
  //       governorateInfo: governorate,
  //       address,
  //       lat,
  //       long,
  //       working_hours_from,
  //       working_hours_to,
  //       description,
  //       rating_avg: 0,
  //       followers_count: 0,
  //     });

  //     const savedBroker = await brokerRepository.save(newBrokerOffice);

  //     if (services) {
  //       const servicePromises = services.map(async (id: number) => {
  //         const service = await serviceRepository.findOne({ where: { id } });

  //         if (!service) {
  //           throw new APIError(
  //             HttpStatusCode.NOT_FOUND,
  //             ErrorMessages.generateErrorMessage(serviceLang, "not found", lang)
  //           );
  //         }

  //         return brokerofficeServiceRepository.create({
  //           service,
  //           broker_office: savedBroker,
  //         });
  //       });

  //       const servicesToSave = await Promise.all(servicePromises);
  //       await brokerofficeServiceRepository.save(servicesToSave);
  //     }

  //     const accessToken = jwt.sign(
  //       {
  //         userId: user.id,
  //         phone: user.phone,
  //         role: UserRole.vendor,
  //       },
  //       process.env.ACCESS_TOKEN_SECRET!,
  //       { expiresIn: "20m" }
  //     );

  //     const refreshToken = jwt.sign(
  //       {
  //         userId: user.id,
  //         phone: user.phone,
  //         role: UserRole.vendor,
  //       },
  //       process.env.REFRESH_TOKEN_SECRET!,
  //       { expiresIn: "7d" }
  //     );

  //     res.cookie("jwt", refreshToken, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //     });

  //     res.status(HttpStatusCode.OK_CREATED).json(
  //       ApiResponse.success(
  //         {
  //           accessToken,
  //           broker: savedBroker,
  //           user,
  //         },
  //         ErrorMessages.generateErrorMessage(entity, "created", lang)
  //       )
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

static async createBrokerOffice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "رقم الوتساب" : "phone";
    const serviceLang = lang === "ar" ? "ID الخدمة" : "ID service";

    await validator(brokerOfficeSchema(lang), req.body);
    const {
      phone,
      office_name,
      user_name,
      city,
      commercial_number,
      whatsapp_number,
      governorate_id,
      address,
      lat,
      long,
      working_hours_from,
      working_hours_to,
      description,
      services,
    } = req.body;

    const image = req.file ? req.file.filename : "";

    const userExists = await userRepository.findOne({ where: { phone } });
    if (userExists) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(entity, "already exists", lang)
      );
    }

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const newUser = userRepository.create({
        phone,
        city,
        name: user_name,
        isActive: true,
        role: UserRole.vendor,
      });
      const user = await transactionalEntityManager.save(newUser);

      const governorate = await governorateRepository.findOne({
        where: { id: governorate_id },
      });

      if (!governorate) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("المحافظة", "not found", lang)
        );
      }

      const newBrokerOffice = brokerRepository.create({
        user,
        office_name,
        image: image || "default_broker.jpg",
        commercial_number,
        whatsapp_number,
        governorateId: governorate.id,
        governorateInfo: governorate,
        address,
        lat,
        long,
        working_hours_from,
        working_hours_to,
        description,
        rating_avg: 0,
        followers_count: 0,
      });

      const savedBroker = await transactionalEntityManager.save(newBrokerOffice);

      if (services) {
        const serviceEntities = [];
        for (const id of services) {
          const service = await serviceRepository.findOne({ where: { id } });
          if (!service) {
            throw new APIError(
              HttpStatusCode.NOT_FOUND,
              ErrorMessages.generateErrorMessage(serviceLang, "not found", lang)
            );
          }
          const relation = brokerofficeServiceRepository.create({
            service,
            broker_office: savedBroker,
          });
          serviceEntities.push(relation);
        }

        await transactionalEntityManager.save(serviceEntities);
      }

      const accessToken = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: UserRole.vendor,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "20m" }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: UserRole.vendor,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(HttpStatusCode.OK_CREATED).json(
        ApiResponse.success(
          {
            accessToken,
            broker: savedBroker,
            user,
          },
          ErrorMessages.generateErrorMessage(entity, "created", lang)
        )
      );
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}


  static async getBrokerOffices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        office_name,
        governorate_id,
        minRating,
        maxRating,
        service_id,
        service_type,
        page = "1",
        limit = "10",
        orderByFollowers,
      } = req.query;

      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المكاتب" : "broker offices";
      const currentUserId = req["currentUser"]?.id;

      const pageNumber = Math.max(Number(page), 1);
      const pageSize = Math.max(Number(limit), 1);
      const skip = (pageNumber - 1) * pageSize;

      const query = brokerRepository
        .createQueryBuilder("broker")
        .leftJoinAndSelect("broker.user", "user")
        .leftJoinAndSelect("broker.broker_service", "brokerService")
        .leftJoinAndSelect("brokerService.service", "service")
        .leftJoinAndSelect("broker.ratings", "rating")
        .leftJoinAndSelect("broker.governorateInfo", "governorate")
        .loadRelationCountAndMap("broker.followers_count", "broker.followers");

      if (office_name) {
        query.andWhere("broker.office_name ILIKE :office_name", {
          office_name: `%${office_name}%`,
        });
      }

      if (governorate_id) {
        query.andWhere("governorate.id = :governorate_id", {
          governorate_id: Number(governorate_id),
        });
      }

      if (service_id) {
        query.andWhere("service.id = :service_id", {
          service_id: Number(service_id),
        });
      }

      if (typeof service_type === "string") {
        query.andWhere("service.type = :service_type", { service_type });
      }

      if (minRating || maxRating) {
        query.leftJoin("broker.broker_ratings", "r");
        if (minRating)
          query.having("AVG(r.rating) >= :minRating", { minRating });
        if (maxRating)
          query.having("AVG(r.rating) <= :maxRating", { maxRating });
        query.groupBy("broker.id");
      }

      if (orderByFollowers) {
        query.orderBy(
          "broker.followers_count",
          orderByFollowers === "asc" ? "ASC" : "DESC"
        );
      } else {
        query.orderBy("broker.created_at", "DESC");
      }

      const [brokers, totalCount] = await query
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();

      const brokersWithRating = await Promise.all(
        brokers.map(async (broker) => {
          const { avg } = await AppDataSource.getRepository(BrokerRating)
            .createQueryBuilder("r")
            .select("AVG(r.rating)", "avg")
            .where("r.broker_office = :brokerId", { brokerId: broker.id })
            .getRawOne();
          return {
            ...broker,
            rating_avg: avg ? parseFloat(avg).toFixed(2) : "0.00",
          };
        })
      );

      const brokersWithFollow = await Promise.all(
        brokersWithRating.map(async (broker) => {
          let is_following = false;

          if (currentUserId) {
            const existingFollow = await AppDataSource.getRepository(
              BrokerFollower
            ).findOne({
              where: {
                broker_office: { id: broker.id },
                user: { id: currentUserId },
              },
            });
            is_following = !!existingFollow;
          }

          return {
            ...broker,
            is_following,
          };
        })
      );

      const pagination = {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };

     

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            brokersWithFollow,
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
            pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getBrokerProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const brokerId = req.params.id;
      const entity = lang === "ar" ? "المكاتب" : "broker offices";
      const currentUserId = req["currentUser"]?.id;

      const broker = await brokerRepository.findOne({
        where: { id: Number(brokerId) },
        relations: [
          "user",
          "portfolios",
          "properties",
          "cars",
          "broker_service",
          "broker_service.service",
          "ratings",
          "governorateInfo",
        ],
      });

      if (!broker) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      const { avg } = await AppDataSource.getRepository(BrokerRating)
        .createQueryBuilder("r")
        .select("AVG(r.rating)", "avg")
        .where("r.broker_office = :brokerId", { brokerId: broker.id })
        .getRawOne();
      const rating_avg = avg ? parseFloat(avg).toFixed(2) : "0.00";

      const services = await Promise.all(
        broker.broker_service.map(async (serBrokect) => {
          const service = await serviceRepository.findOne({
            where: { id: serBrokect.service.id },
            relations:["category"]
          });
          return service;
        })
      );

      let is_following = false;

      if (currentUserId) {
        const existingFollow = await AppDataSource.getRepository(
          BrokerFollower
        ).findOne({
          where: {
            broker_office: { id: broker.id },
            user: { id: currentUserId },
          },
        });
        is_following = !!existingFollow;
      }

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          {
            broker,
            services,
            rating_avg,
            is_following,
            followers_count: broker.followers_count,
          },
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateBrokerOffice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المكاتب" : "broker offices";
      const user = req["currentUser"];

      const broker = await brokerRepository.findOne({
        where: { user: { id: user.id } },
        // relations: ["user", "broker_service", "broker_service.service"],
      });

      if (!broker) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      // if (broker.user.id !== user?.id) {
      //   throw new APIError(
      //     HttpStatusCode.FORBIDDEN,
      //     ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
      //   );
      // }

      const {
        services,
        office_name,
        commercial_number,
        whatsapp_number,
        governorate_id,
        address,
        lat,
        long,
        working_hours_from,
        working_hours_to,
        description,
        user_name,
        user_phone,
      } = req.body;

      if (typeof office_name === "string") broker.office_name = office_name;
      if (typeof commercial_number === "string")
        broker.commercial_number = commercial_number;
      if (typeof whatsapp_number === "string")
        broker.whatsapp_number = whatsapp_number;
      if (typeof address === "string") broker.address = address;
      if (typeof lat === "number") broker.lat = lat;
      if (typeof long === "number") broker.long = long;
      if (typeof working_hours_from === "string")
        broker.working_hours_from = working_hours_from;
      if (typeof working_hours_to === "string")
        broker.working_hours_to = working_hours_to;
      if (typeof description === "string") broker.description = description;

      if (req.file) broker.image = req.file.filename;

      if (governorate_id) {
        const governorateEntity = await governorateRepository.findOneBy({
          id: governorate_id,
        });

        if (!governorateEntity) {
          throw new APIError(
            HttpStatusCode.NOT_FOUND,
            ErrorMessages.generateErrorMessage("المحافظة", "not found", lang)
          );
        }

        broker.governorateId = governorateEntity.id;
        broker.governorateInfo = governorateEntity;
      }

      if (services) {
        await brokerofficeServiceRepository.delete({
          broker_office: { id: broker.id },
        });

        const validServices = await serviceRepository.find({
          where: { id: In(services) },
        });

        if (validServices.length === 0) {
          throw new Error("No valid services found");
        }

        const brokerServices = validServices.map((service) =>{

          const new_b_s = 
          brokerofficeServiceRepository.create({
            service: service,
            broker_office: { id: broker.id },
          })
          new_b_s.broker_office = broker

          return new_b_s
        }

        );

        console.log(broker);

        await brokerofficeServiceRepository.save(brokerServices);
      }

      const currentUser = await userRepository.findOneBy({ id: user.id });
      if (user_name) {
        currentUser.name = user_name;
        await userRepository.save(currentUser);
      }

      if (user_phone) {
        currentUser.phone = user_phone;
        await userRepository.save(currentUser);
      }

      const updatedBroker = await brokerRepository.save(broker);

      const result = await brokerRepository.findOne({
        where: { id: updatedBroker.id },
        relations: ["broker_service", "broker_service.service"],
      });

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          {
            broker: result,
            services: result.broker_service?.map((bs) => bs.service.id) || [],
          },
          ErrorMessages.generateErrorMessage(entity, "updated", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteBrokerOffice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const user = req["currentUser"];
      const entity = lang === "ar" ? "المكاتب" : "broker offices";

      const broker = await brokerRepository.findOne({
        where: { user },
        relations: ["user"],
      });

      if (!broker) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      if (broker.user.id !== user.id) {
        throw new APIError(
          HttpStatusCode.FORBIDDEN,
          ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
        );
      }

      await brokerRepository.remove(broker);
      await userRepository.remove(broker.user);

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            null,
            ErrorMessages.generateErrorMessage(entity, "deleted", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
