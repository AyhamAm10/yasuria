import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "../entity/Users";
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
      const { phone, password } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      const entity = lang === "ar" ? "المستخدم" : "user";
      await validator(getLoginSchema(lang) , req.body)

      const user = await userRepository.findOne({ where: { phone } });
      if (!user) {
        throw new APIError(HttpStatusCode.NOT_FOUND, ErrorMessages.generateErrorMessage(entity, "not found", lang));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage(entity, "invalid credentials", lang));
      }

      console.log('SECRETS:', {
        access: process.env.ACCESS_TOKEN_SECRET,
        refresh: process.env.REFRESH_TOKEN_SECRET
      });
      
      const accessToken = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "20m" }
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
          { accessToken , user },
          ErrorMessages.generateErrorMessage(entity, "logged in", lang)
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, password, role } = req.body;
      const lang = req.headers["accept-language"] || "ar";
      await validator(getRegisterSchema(lang) , req.body)
      const entity = lang === "ar" ? "المستخدم" : "user";

      const userExists = await userRepository.findOne({ where: { phone } });
      if (userExists) {
        console.log(userExists)
        console.log()
        throw new APIError(HttpStatusCode.BAD_REQUEST, ErrorMessages.generateErrorMessage(entity, "already exists", lang));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = userRepository.create({
        name,
        phone,
        password: hashedPassword,
        role: role || UserRole.user,
        isActive: true,
      });

      const savedUser = await userRepository.save(newUser);

      res.status(HttpStatusCode.OK_CREATED).json(
        ApiResponse.success(
          { userId: savedUser.id },
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

  // static async verifyCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     await validator(verifyCodeSchema, req.body, req.t);

  //     const { phone, code } = req.body;
  //     const user = await userRepository.findOne({ where: { phone } });

  //     if (!user) {
  //       throw new APIError(HttpStatusCode.NOT_FOUND, req.t("error.userNotFound"));
  //     }

  //     const storedCode = verificationCodes.get(phone);
  //     if (!storedCode || storedCode !== code) {
  //       throw new APIError(HttpStatusCode.BAD_REQUEST, req.t("error.invalidCode"));
  //     }

  //     user.isActive = true;
  //     await userRepository.save(user);
  //     verificationCodes.delete(phone);

  //     res.status(HttpStatusCode.OK).json({
  //       message: req.t("success.verified"),
  //     });

  //   } catch (error) {
  //     next(error);
  //   }
  // }

  
}
