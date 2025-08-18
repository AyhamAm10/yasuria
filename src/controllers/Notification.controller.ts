import { Request, Response } from "express";
import { UserTokenService } from "../service/UserToken.service";
import admin from "../config/firebase";
import { AppDataSource } from "../config/data_source";
import { Notification } from "../entity/Notifications";
import { User } from "../entity/User";
import { APIError, HttpStatusCode } from "../error/api.error";
import { ErrorMessages } from "../error/ErrorMessages";

export class NotificationController {
  private tokenService = new UserTokenService();
  async registerToken(req: Request, res: Response) {
    const { userId, token } = req.body;
    if (!userId || !token)
      return res.status(400).json({ error: "Missing userId or token" });

    try {
      const saved = await this.tokenService.registerToken(userId, token);
      res.json({ success: true, token: saved });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // async sendNotification(req: Request, res: Response) {
  //   const {
  //     userId,
  //     title_en,
  //     title_ar,
  //     description_en,
  //     description_ar,
  //     type,
  //     metaData,
  //   } = req.body;

  //   const lang = req.headers["accept-language"] || "ar";

  //   if (!userId || !type || !description_ar)
  //     throw new APIError(
  //       HttpStatusCode.BAD_REQUEST,
  //       ErrorMessages.generateErrorMessage("field", "bad request", lang)
  //     );

  //   try {
  //     const userToken = await this.tokenService.getTokenByUserId(userId);
  //     console.log(userToken)
  //     if (!userToken) {
  //       throw new APIError(
  //         HttpStatusCode.NOT_FOUND,
  //         ErrorMessages.generateErrorMessage("token", "not found", lang)
  //       );
  //     }

  //     const message = {
  //       notification: {
  //         title: lang == "ar" ? title_ar : title_en,
  //         body: lang == "ar" ? description_ar : description_en,
  //       },
  //       token: userToken.token,
  //     };

  //     const response = await admin.messaging().send(message);

  //     const user = await AppDataSource.getRepository(User).findOneBy({
  //       id: userId,
  //     });
  //     if (!user) return res.status(404).json({ error: "User not found" });

  //     const newNotification = AppDataSource.getRepository(Notification).create({
  //       user,
  //       title_en,
  //       title_ar,
  //       description_en,
  //       description_ar,
  //       type,
  //       metaData: metaData || {},
  //     });

  //     const savedNotification = await AppDataSource.getRepository(
  //       Notification
  //     ).save(newNotification);

  //     res.json({ success: true, response, notification: savedNotification });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // }

  async sendNotification(req: Request, res: Response) {
    const {
      userId,
      title_en,
      title_ar,
      description_en,
      description_ar,
      type,
      metaData,
    } = req.body;

    const lang = (req.headers["accept-language"] as string) || "ar";

    if (!userId || !type || !description_ar) {
      console.log("❌ Missing required fields:", {
        userId,
        type,
        description_ar,
      });
      throw new APIError(
        HttpStatusCode.BAD_REQUEST,
        ErrorMessages.generateErrorMessage("field", "bad request", lang)
      );
    }

    try {
      console.log("📬 Sending notification to user:", userId);

      const userToken = await this.tokenService.getTokenByUserId(userId);

      if (!userToken) {
        console.log("⚠️ Token not found for user:", userId);
        throw new APIError(
          HttpStatusCode.NOT_FOUND,
          ErrorMessages.generateErrorMessage("token", "not found", lang)
        );
      }

      const message = {
        notification: {
          title: lang === "ar" ? title_ar : title_en,
          body: lang === "ar" ? description_ar : description_en,
        },
        token: userToken.token,
      };

      const response = await admin.messaging().send(message);
      console.log("✅ Notification sent:", response);

      const user = await AppDataSource.getRepository(User).findOneBy({
        id: userId,
      });
      if (!user) {
        console.log("⚠️ User not found in DB:", userId);
        return res.status(404).json({ error: "User not found" });
      }

      const newNotification = AppDataSource.getRepository(Notification).create({
        user,
        title_en,
        title_ar,
        description_en,
        description_ar,
        type,
        metaData: metaData || {},
      });

      const savedNotification = await AppDataSource.getRepository(
        Notification
      ).save(newNotification);
      console.log("💾 Notification saved:", savedNotification);

      res.json({ success: true, response, notification: savedNotification });
    } catch (err: any) {
      console.error("🔥 Error in sendNotification:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  }

  async getUserNotifications(req: Request, res: Response) {
    const userId = req.currentUser?.id;
    const lang =
      (req.query.lang as string)?.toLowerCase() === "en" ? "en" : "ar";
    try {
      const notifications = await this.tokenService.getUserNotifications(
        Number(userId),
        lang
      );
      res.json({ success: true, notifications });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
