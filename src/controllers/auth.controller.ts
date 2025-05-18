import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data_source";
import { APIError, HttpStatusCode } from "../error/api.error";
import { sendSms } from "../helper/smsService"; 
import { validator } from "../helper/validation/validator";
import { ErrorMessages } from "../error/ErrorMessages";
import { ApiResponse } from "../helper/apiResponse";
import { getLoginSchema } from "../helper/validation/schema/loginSchema";
import { getRegisterSchema } from "../helper/validation/schema/registerSchema";

const userRepository = AppDataSource.getRepository(User) as any;
const verificationCodes = new Map<string, string>(); 

export class AuthController {

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المستخدم" : "user";
      
      await validator(getLoginSchema(lang), req.body);

      let user = await userRepository.findOne({ where: { phone } });

      if (!user) {
              throw new APIError(HttpStatusCode.NOT_FOUND, ErrorMessages.generateErrorMessage(entity, "not found", lang));
            }

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

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          { accessToken, user },
          ErrorMessages.generateErrorMessage(entity, "logged in", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, city , role } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      await validator(getRegisterSchema(lang), req.body);
      const entity = lang === "ar" ? "المستخدم" : "user";

      const userExists = await userRepository.findOne({ where: { phone } });
      if (userExists) {
        throw new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage(entity, "already exists", lang));
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

      res.status(HttpStatusCode.OK_CREATED).json(
        ApiResponse.success(
          { accessToken, user: savedUser },
          ErrorMessages.generateErrorMessage(entity, "created", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المستخدم" : "user";

      res.cookie("jwt", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
      });

      res.status(HttpStatusCode.OK).json(
        ApiResponse.success(
          null,
          ErrorMessages.generateErrorMessage(entity, "logged out", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
