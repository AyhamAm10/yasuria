import { NextFunction , Response , Request } from "express";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";

const userRepository = AppDataSource.getRepository(User)

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
  } catch (error) {
    next(error);
  }
};

