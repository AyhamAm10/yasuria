import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { Service } from "../entity/Services";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { validator } from "../helper/validation/validator";
import { addServiceSchema } from "../helper/validation/schema/addServiceSchema";
import { ServiceCategory } from "../entity/SeviceCategory";

const serviceRepository = AppDataSource.getRepository(Service);
const serviceCategoryRepository = AppDataSource.getRepository(ServiceCategory);

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      location,
      page,
      limit = "10",
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "الخدمات" : "services";
    
    const query = serviceRepository.createQueryBuilder("service")
      .leftJoinAndSelect("service.category", "category"); 

    if (location) query.andWhere("service.location = :location", { location });


    let services, totalCount, pagination;
    
    if (page) {
      const pageNumber = Math.max(Number(page), 1);
      const pageSize = Math.max(Number(limit), 1);
      const skip = (pageNumber - 1) * pageSize;

      [services, totalCount] = await query
        .skip(skip)
        .take(pageSize)
        .getManyAndCount();

      pagination = {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } else {
      services = await query.getMany();
      totalCount = services.length;
    }

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        services,
        ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
        page ? pagination : undefined 
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "الخدمة" : "service";

    const service = await serviceRepository.findOne({
      where: { id: Number(id) },
      relations: ["user"],
    });

    if (!service)
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          service,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "الخدمة" : "service";
    const { category_id } = req.body;
    // await validator(addServiceSchema, req.body);

    const icon = req.file ? req.file.filename : "";

    const created = serviceRepository.create({ ...req.body, icon });
    const newService = Array.isArray(created) ? created[0] : created;
    if (category_id) {
      const category = await serviceCategoryRepository.findOneBy({ id: category_id });
      if (!category) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("category", "not found", lang)
        );
      }
      newService.category = category
    }
    const savedService = await serviceRepository.save(newService);

    res
      .status(HttpStatusCode.OK_CREATED)
      .json(
        ApiResponse.success(
          savedService,
          ErrorMessages.generateErrorMessage(entity, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الخدمة" : "service";
    const { id } = req.params; 
    const { category_id, ...updateData } = req.body; 

    const existingService = await serviceRepository.findOneBy({ id: Number(id) });
    
    if (!existingService) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    if (req.file) {
      updateData.icon = req.file.filename; 
      
    }

    if (category_id) {
      const category = await serviceCategoryRepository.findOneBy({ id: category_id });
      if (!category) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("category", "not found", lang)
        );
      }
      updateData.category = category;
    }

    Object.assign(existingService, updateData);

    const updatedService = await serviceRepository.save(existingService);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        updatedService,
        ErrorMessages.generateErrorMessage(entity, "updated", lang)
      )
    )
  } catch (error) {
    next(error);
  }
};
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req["currentUser"];
    const lang = req.headers["accept-language"] || "ar";

    const service = await serviceRepository.findOne({
      where: { id: Number(id) },
      relations: ["broker_office"],
    });

    if (!service) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("الخدمة", "not found", lang)
      );
    }

    if (service.broker_office && service.broker_office.length > 0) {
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage(
          lang == "ar"
            ? "لا يمكن حذف الخدمة لأنها مستخدمة بواحد أو أكثر من المكاتب"
            : "cannot delete service as it's used by one or more offices",
          "bad request"
        )
      );
    }

    // إذا لم تكن مستخدمة، قم بالحذف
    await serviceRepository.delete(id);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          null,
          ErrorMessages.generateErrorMessage("الخدمة", "deleted", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};
