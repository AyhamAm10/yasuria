import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { ServiceCategory } from "../entity/SeviceCategory";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { Service } from "../entity/Services";

const serviceCategoryRepository = AppDataSource.getRepository(ServiceCategory);
const serviceRepository = AppDataSource.getRepository(Service);

export class ServiceCategoryController {
  static async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "سمة الخدمة" : "service category";
      const { name_ar, name_en, type }: any = req.body;

      const categoryExited = await serviceCategoryRepository.findOne({
        where: { name_ar },
      });

      if (categoryExited) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(entity, "already exists", lang)
        );
      }

      const newCategorySevice = serviceCategoryRepository.create({
        name_ar,
        name_en,
        type,
      });

      const savedcategody = await serviceCategoryRepository.save(
        newCategorySevice
      );

      res
        .status(HttpStatusCode.OK_CREATED)
        .json(
          ApiResponse.success(
            { ...savedcategody },
            ErrorMessages.generateErrorMessage(entity, "created", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getCategorys(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "سمة الخدمة" : "service category";
      const { type } = req.query;

      let wherequndtion;
      if (type) {
        wherequndtion = { type };
      }
      const category = await serviceCategoryRepository.find({
        where: { ...wherequndtion },
      });

      if (!category || category.length === 0) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            category,
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async getServiceByCategoryId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.id;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "معرف السمة" : "category id";

      const category = await serviceCategoryRepository.findOneBy({
        id: Number(categoryId),
      });

      if (!categoryId || !category) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "bad request", lang)
        );
      }

      const services = await serviceRepository.find({
        where: { category },
        relations:["services"]
      });

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            services || [],
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
          )
        );
    } catch (error) {}
  }

  static async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.id;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "معرف السمة" : "category id";

      const category = await serviceCategoryRepository.findOneBy({
        id: Number(categoryId),
      });

      if (!categoryId || !category) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "bad request", lang)
        );
      }
      const services = await serviceRepository.find({
        where: { category },
      });

      if(services){
        throw new APIError(
            HttpStatusCode.NOT_FOUND,
            "لايمكنك حذف هذه السمة لانه هناك خدمات مرتبطة بها "
          );
      }

      await serviceCategoryRepository.remove(category)
    } catch (error) {
        next(error)
    }
  }
}
