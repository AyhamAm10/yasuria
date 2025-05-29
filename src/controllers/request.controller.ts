import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { Request as RequestEntity, RequestStatus } from "../entity/Request";
import { getRequestSchema } from "../helper/validation/schema/requestShema";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { validator } from "../helper/validation/validator";
import { Governorate } from "../entity/governorate";
import { User } from "../entity/User";

const requestRepo = AppDataSource.getRepository(RequestEntity);
const governorateReposetory = AppDataSource.getRepository(Governorate);
const userReposetory = AppDataSource.getRepository(User);
export class RequestController {
  static async createRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلب" : "request";

      await validator(getRequestSchema(lang), req.body);

      const { description, budget, governorate_id } = req.body;

      const governorate = await governorateReposetory.findOneBy({
        id: governorate_id,
      });
      if (!governorate) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("governorate", "not found", lang)
        );
      }

      const user = await userReposetory.findOneBy({
        id: req.currentUser?.id,
      });
      if (!user) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("user", "not found", lang)
        );
      }
      const newRequest = requestRepo.create({
        description,
        budget,
        governorateId: governorate.id,
        governorateInfo: governorate,
        user,
      });

      const savedRequest = await requestRepo.save(newRequest);

      res
        .status(HttpStatusCode.OK_CREATED)
        .json(
          ApiResponse.success(
            savedRequest,
            ErrorMessages.generateErrorMessage(entity, "created", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلبات" : "requests";

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const { governorate_id } = req.query;
      const skip = (page - 1) * limit;

      const query = requestRepo
        .createQueryBuilder("request")
        .leftJoinAndSelect("request.user", "user")
        .orderBy("request.created_at", "DESC")
        .skip(skip)
        .take(limit);

      if (governorate_id) {
        query.andWhere("request.governorateId = :governorate_id", {
          governorate_id,
        });
      }

      const [requests, total] = await query.getManyAndCount();

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          requests,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          {
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
          }
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلب" : "request";
      const id = Number(req.params.id);

      const request = await requestRepo.findOne({
        where: { id },
        relations: ["user", "governorateInfo"],
      });

      if (!request) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            request,
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async updateRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلب" : "request";
      const id = Number(req.params.id);
      const { governorate_id, description, budget } = req.body;
      const request = await requestRepo.findOne({
        where: { id },
        relations: ["user"],
      });

      if (!request) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      if (request.user.id !== req.currentUser?.id) {
        throw new APIError(
          HttpStatusCode.FORBIDDEN,
          ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
        );
      }

      // await getRequestSchema(lang).validate(req.body);

      const governorate = await governorateReposetory.findOneBy({
        id: governorate_id,
      });
      if (!governorate) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("governorate", "not found", lang)
        );
      }

      requestRepo.merge(request,{
        budget,
        description,
        governorateInfo:governorate,
        governorateId:governorate_id,
      });

      const updatedRequest = await requestRepo.save(request);

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            updatedRequest,
            ErrorMessages.generateErrorMessage(entity, "updated", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async deleteRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلب" : "request";
      const id = Number(req.params.id);

      const request = await requestRepo.findOne({
        where: { id },
        relations: ["user"],
      });

      if (!request) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      if (request.user !== req.currentUser) {
        throw new APIError(
          HttpStatusCode.FORBIDDEN,
          ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
        );
      }

      await requestRepo.remove(request);

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

  static async getByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلبات" : "requests";
      const userId = Number(req.params.id);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [requests, total] = await requestRepo.findAndCount({
        where: { user: { id: userId } },
        relations: ["user" , "governorateInfo"],
        order: { created_at: "DESC" },
        take: limit,
        skip,
      });

      const totalPages = Math.ceil(total / limit);

      if (page > totalPages && total > 0) {
        res.status(HttpStatusCode.OK).json(
          ApiResponse.success(
            [],
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
            {
              meta: {
                total,
                page,
                limit,
                totalPages,
              },
            }
          )
        );
      }

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          requests,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          {
            meta: {
              total,
              page,
              limit,
              totalPages,
            },
          }
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
