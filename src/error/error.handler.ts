import { NextFunction, Request, Response } from "express";
import { logger } from "../logging/logger";
import { APIError, HttpStatusCode } from "./api.error";

const errorHandler = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  logger.error(error.name);
  logger.error(error.stack);

  if (error instanceof APIError) {
    res.status(error.httpCode).send({
      code: error.code,
      message: error.message,
      description: error.description,
      error: error.name,
    });
  } else {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      message: error.message,
      error: "Internal server error",
    });
  }
};

export { errorHandler };
