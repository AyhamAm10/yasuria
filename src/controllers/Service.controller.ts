import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { Service } from "../entity/Services";
import { APIError } from "../error/api.error";
import { HttpStatusCode } from "../error/api.error";
import { ApiResponse } from "../helper/apiResponse";
import { ErrorMessages } from "../error/ErrorMessages";
import { BrokerOffice } from "../entity/BrokerOffice";

const serviceRepository = AppDataSource.getRepository(Service);
const brokerOfficeRepository = AppDataSource.getRepository(BrokerOffice);

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      location,
      priceMin,
      priceMax,
      page = "1",
      limit = "10",
    } = req.query;
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang == "ar" ? "الخدمات" : "services";
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * pageSize;

    const query = serviceRepository.createQueryBuilder("service");

    if (location) query.andWhere("service.location = :location", { location });
    if (priceMin) query.andWhere("service.price >= :priceMin", { priceMin });
    if (priceMax) query.andWhere("service.price <= :priceMax", { priceMax });

    const [services, totalCount] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    // if(!services || services.length == 0){
    //     throw new APIError(HttpStatusCode.NOT_FOUND,ErrorMessages.generateErrorMessage(entity, "not found", lang))
    // }
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
          services,
          ErrorMessages.generateErrorMessage(entity, "retrieved", lang),
          pagination
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
    const user = req["currentUser"];

    // const office = await brokerOfficeRepository.findOne({ where: { user } });
    // if (!office)
    //   throw new APIError(
    //     HttpStatusCode.UNAUTHORIZED,
    //     ErrorMessages.generateErrorMessage("مكتب الوسيط", "not found", lang)
    //   );

    const images = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/uploads/${file.filename}`
        )
      : [];

    const newService = serviceRepository.create({ ...req.body, images });
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
    const entity = lang == "ar" ? "الخدمة" : "service";
    const { id } = req.params;

    const service = await serviceRepository.findOne({
      where: { id: Number(id) },
    });
    if (!service)
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );

    serviceRepository.merge(service, req.body);
    const updatedService = await serviceRepository.save(service);

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          updatedService,
          ErrorMessages.generateErrorMessage(entity, "updated", lang)
        )
      );
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
      relations: ["broker_service"], 
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
          lang == 'ar'?
          "لا يمكن حذف الخدمة لأنها مستخدمة بواحد أو أكثر من المكاتب":
          "cannot delete service as it's used by one or more offices",
          lang
        )
      );
    }

    // إذا لم تكن مستخدمة، قم بالحذف
    await serviceRepository.delete(id);

    res.status(HttpStatusCode.OK).json(
      ApiResponse.success(
        null,
        ErrorMessages.generateErrorMessage("الخدمة", "deleted", lang)
      )
    );
  } catch (error) {
    next(error);
  }
};
