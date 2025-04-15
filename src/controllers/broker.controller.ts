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

const userRepository = AppDataSource.getRepository(User);
const brokerRepository = AppDataSource.getRepository(BrokerOffice);

export class BrokerController {

  static async createBrokerOffice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المكتب الوسيط" : "broker office";

      await validator(brokerOfficeSchema(lang), req.body);

      const {
        phone,
        office_name,
        city,
        commercial_number,
        whatsapp_number,
        governorate,
        address,
        lat,
        long,
        working_hours_from,
        working_hours_to,
        description,
      } = req.body;

      const image = req.file ? req.file.filename : "";

      const userExists = await userRepository.findOne({ where: { phone } });
      if (userExists) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(entity, "already exists", lang)
        );
      }

      const newUser = userRepository.create({
        phone,
        city,
        name: office_name,
        isActive: true,
        role: UserRole.vendor,
      });
      const user = await userRepository.save(newUser);

      const existingBroker = await brokerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ["user"],
      });

      if (existingBroker) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(entity, "already exists", lang)
        );
      }

      const newBrokerOffice = brokerRepository.create({
        user,
        office_name,
        image: image || "default_broker.jpg",
        commercial_number,
        whatsapp_number,
        governorate,
        address,
        lat,
        long,
        working_hours_from,
        working_hours_to,
        description,
        rating_avg: 0,
        followers_count: 0,
      });

      const savedBroker = await brokerRepository.save(newBrokerOffice);

      const accessToken = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: user.role,
          brokerId: savedBroker.id,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "20m" }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: user.role,
          brokerId: savedBroker.id,
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
    } catch (error) {
      console.log(error)
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
        governorate,
        minRating,
        maxRating,
        page = "1",
        limit = "10",
      } = req.query;

      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المكاتب" : "broker offices";

      const pageNumber = Math.max(Number(page), 1);
      const pageSize = Math.max(Number(limit), 1);
      const skip = (pageNumber - 1) * pageSize;

      const query = brokerRepository
        .createQueryBuilder("broker")
        .leftJoinAndSelect("broker.user", "user");

      if (office_name)
        query.andWhere("broker.office_name ILIKE :office_name", {
          office_name: `%${office_name}%`,
        });

      if (governorate)
        query.andWhere("broker.governorate ILIKE :governorate", {
          governorate: `%${governorate}%`,
        });

      if (minRating)
        query.andWhere("broker.rating_avg >= :minRating", { minRating });

      if (maxRating)
        query.andWhere("broker.rating_avg <= :maxRating", { maxRating });

      const [brokers, totalCount] = await query
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();

      const pagination = {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };

      if (!brokers || brokers.length === 0) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            brokers,
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

      const broker = await brokerRepository.findOne({
        where: { id: Number(brokerId) },
        relations: ["user", "portfolios", "properties", "cars", "services"],
      });

      if (!broker) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("broker", "not found", lang)
        );
      }

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            broker,
            ErrorMessages.generateErrorMessage("broker", "retrieved", lang)
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

      await validator(brokerOfficeSchema(lang, true), req.body);

      const user = req["currentUser"];
      const broker = await brokerRepository.findOne({
        where: { user },
        relations: ["user"],
      });

      if (!broker) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("broker", "not found", lang)
        );
      }

      if (req.file) broker.image = req.file.filename;

      brokerRepository.merge(broker, req.body);
      const updatedBroker = await brokerRepository.save(broker);

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            updatedBroker,
            ErrorMessages.generateErrorMessage("broker", "updated", lang)
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

      const broker = await brokerRepository.findOne({
        where: { user },
      });

      if (!broker) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("broker", "not found", lang)
        );
      }

      await brokerRepository.remove(broker);
      await userRepository.remove(broker.user);

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            null,
            ErrorMessages.generateErrorMessage("broker", "deleted", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
