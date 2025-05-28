import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data_source";
import { Request as RequestEntity, RequestStatus } from "../entity/Request";
import { getRequestSchema } from "../helper/validation/schema/requestShema";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { validator } from "../helper/validation/validator";

const requestRepo = AppDataSource.getRepository(RequestEntity);

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

      const { description, budget, governorate } = req.body;

      const newRequest = requestRepo.create({
        description,
        budget,
        governorate,
        user: req["currentUser"],
      });

      const savedRequest = await requestRepo.save(newRequest);

      res.status(HttpStatusCode.OK_CREATED)
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

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "الطلبات" : "requests";

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [requests, total] = await requestRepo.findAndCount({
        relations: ["user"],
        order: { created_at: "DESC" },
        take: limit,
        skip,
      });

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

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  static async updateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      if (request.user.id !== req.currentUser?.id) {
        throw new APIError(
          HttpStatusCode.FORBIDDEN,
          ErrorMessages.generateErrorMessage(entity, "forbidden", lang)
        );
      }

      await getRequestSchema(lang).validate(req.body);

      requestRepo.merge(request, req.body);

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

  static async deleteRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
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

 static async getByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الطلبات" : "requests";
    const userId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // البحث مع العد
    const [requests, total] = await requestRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ["user"],
      order: { created_at: "DESC" },
      take: limit,
      skip,
    });

    // حساب العدد الكلي للصفحات
    const totalPages = Math.ceil(total / limit);

    // معالجة حالة page > totalPages
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

    // إرسال النتيجة مع البيانات
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
