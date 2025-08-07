import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "../entity/User";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data_source";
import { APIError, HttpStatusCode } from "../error/api.error";
import { validator } from "../helper/validation/validator";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { getLoginSchema } from "../helper/validation/schema/loginSchema";
import { getRegisterSchema } from "../helper/validation/schema/registerSchema";
import { BrokerOffice } from "../entity/BrokerOffice";

const userRepository = AppDataSource.getRepository(User);
const brokerRepository = AppDataSource.getRepository(BrokerOffice);
export class AuthController {
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { phone } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المستخدم" : "user";

      await validator(getLoginSchema(lang), req.body);

      let user = await userRepository.findOne({
        where: { phone }
      });

      if (!user) {
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage(entity, "not found", lang)
        );
      }

      const breoker = await brokerRepository.findOne({
        where: { user: { id: user.id } },
        relations:["broker_service.service"]
      });


      const accessToken = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            { accessToken, user , breoker },
            ErrorMessages.generateErrorMessage(entity, "logged in", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, phone, city, role } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      await validator(getRegisterSchema(lang), req.body);
      const entity = lang === "ar" ? "المستخدم" : "user";

      const userExists = await userRepository.findOne({ where: { phone } });
      if (userExists) {
        throw new APIError(
          HttpStatusCode.BAD_REQUEST,
          ErrorMessages.generateErrorMessage(entity, "already exists", lang)
        );
      }

      const newUser = userRepository.create({
        name,
        phone,
        city,
        role: role || UserRole.user,
        isActive: true,
      });

      const savedUser = await userRepository.save(newUser);

      const accessToken = jwt.sign(
        { userId: savedUser.id, phone: savedUser.phone, role: savedUser.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      const refreshToken = jwt.sign(
        { userId: savedUser.id, phone: savedUser.phone, role: savedUser.role },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res
        .status(HttpStatusCode.OK_CREATED)
        .json(
          ApiResponse.success(
            { accessToken, user: savedUser },
            ErrorMessages.generateErrorMessage(entity, "created", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المستخدم" : "user";

      res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
      });

      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            null,
            ErrorMessages.generateErrorMessage(entity, "unauthorized", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }

  static async me(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المستخدم" : "user";

      const id = req.currentUser?.id
      const me =await userRepository.findOne({where: {id}}) 
      const brokerOffice =await brokerRepository.findOneBy({user: {id}})
      res
        .status(HttpStatusCode.OK)
        .json(
          ApiResponse.success(
            {user: me, broker:brokerOffice },
            ErrorMessages.generateErrorMessage(entity, "retrieved", lang)
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
