import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/Users";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";

interface AuthenticatedRequest extends Request {
  currentUser?: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const lang = req.headers["accept-language"] || "ar";

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المصادقة", "unauthorized", lang)));
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المصادقة", "unauthorized", lang)));
    }

    jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string,
      async (err, decoded: any) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            const refreshToken = req.cookies?.jwt;
            if (!refreshToken) {
              return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("المصادقة", "forbidden", lang)));
            }

            try {
              const refreshDecoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET as string
              ) as { userId: number };

              const newAccessToken = jwt.sign(
                { userId: refreshDecoded.userId },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: "1h" }
              );

              res.setHeader("Authorization", `Bearer ${newAccessToken}`);
              req.headers.authorization = `Bearer ${newAccessToken}`;
              decoded = { userId: refreshDecoded.userId };
            } catch {
              return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("المصادقة", "forbidden", lang)));
            }
          } else {
            return next(new APIError(HttpStatusCode.FORBIDDEN, ErrorMessages.generateErrorMessage("المصادقة", "forbidden", lang)));
          }
        }

        const userId = decoded?.userId;
        if (!userId) {
          return next(new APIError(HttpStatusCode.UNAUTHORIZED, ErrorMessages.generateErrorMessage("المصادقة", "unauthorized", lang)));
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
          return next(new APIError(HttpStatusCode.NOT_FOUND, ErrorMessages.generateErrorMessage("المستخدم", "not found", lang)));
        }

        req.currentUser = user;
        return next();
      }
    );
  } catch (error) {
    next(error);
  }
};
