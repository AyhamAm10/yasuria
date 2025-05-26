import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";

interface AuthenticatedRequest extends Request {
  currentUser?: User;
}

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const accessToken = authHeader.split(" ")[1];
      if (accessToken) {
        try {
          const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET as string
          ) as { userId: number };

          const userId = decoded?.userId;
          if (userId) {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (user) {
              req.currentUser = user;
            }
          }
        } catch {
          // إذا فشل التحقق، ما نعمل شي وننتقل لـ next()
        }
      }
    }

    next(); // حتى لو ما كان فيه user، بننتقل للمرحلة التالية
  } catch (error) {
    next(); // في حال صار أي خطأ غير متوقع، برضو بنكمل بدون خطأ
  }
};
