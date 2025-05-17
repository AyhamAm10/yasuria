import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { BrokerOffice } from "../entity/BrokerOffice";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";
import { BrokerPortfolio } from "../entity/BrokerPortfolio";
import { ApiResponse } from "../helper/apiResponse";
import { User } from "../entity/User";

export const addBrokerPortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العمل" : "portfolio";

    const { broker_office_id, description, images } = req.body;

    const brokerOffice = await AppDataSource.getRepository(
      BrokerOffice
    ).findOne({
      where: { id: broker_office_id },
    });

    if (!brokerOffice) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("broker office", "not found", lang)
      );
    }

    const portfolio = AppDataSource.getRepository(BrokerPortfolio).create({
      broker_office: brokerOffice,
      description,
      images,
    });

    const saved = await AppDataSource.getRepository(BrokerPortfolio).save(
      portfolio
    );

    res
      .status(HttpStatusCode.OK_CREATED)
      .json(
        ApiResponse.success(
          saved,
          ErrorMessages.generateErrorMessage(entity, "created", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};

export const deleteBrokerPortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "العمل" : "portfolio";
    const user = req.currentUser;
    const portfolioId = Number(req.params.id);

    const brokerOffice = await AppDataSource.getRepository(BrokerOffice).findOne({
        where:{user:user},
    })

    const portfolio = await AppDataSource.getRepository(
      BrokerPortfolio
    ).findOne({
      where: { id: portfolioId , broker_office:brokerOffice },
    });

    if (!portfolio) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage(entity, "not found", lang)
      );
    }

    await AppDataSource.getRepository(BrokerPortfolio).remove(portfolio);

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
};

export const getBrokerPortfolios = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";
    const entity = lang === "ar" ? "الأعمال" : "portfolios";

    const brokerOfficeId = Number(req.params.id);

    const brokerOffice = await AppDataSource.getRepository(
      BrokerOffice
    ).findOne({
      where: { id: brokerOfficeId },
    });

    if (!brokerOffice) {
      throw new APIError(
        HttpStatusCode.NOT_FOUND,
        ErrorMessages.generateErrorMessage("broker office", "not found", lang)
      );
    }

    const portfolios = await AppDataSource.getRepository(BrokerPortfolio).find({
      where: { broker_office: { id: brokerOfficeId } },
      order: { created_at: "DESC" },
    });

    res
      .status(HttpStatusCode.OK)
      .json(
        ApiResponse.success(
          portfolios,
          ErrorMessages.generateErrorMessage(entity, "fetched", lang)
        )
      );
  } catch (error) {
    next(error);
  }
};
