import { Request, Response } from "express";
import { UserTokenService } from "../service/UserToken.service";
import admin from "../config/firebase";


export class NotificationController {
  private tokenService = new UserTokenService();

  async registerToken(req: Request, res: Response) {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ error: "Missing userId or token" });

    try {
      const saved = await this.tokenService.registerToken(userId, token);
      res.json({ success: true, token: saved });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async sendNotification(req: Request, res: Response) {
    const { userId, title, body } = req.body;
    if (!userId || !title || !body) return res.status(400).json({ error: "Missing parameters" });

    try {
      const userToken = await this.tokenService.getTokenByUserId(userId);
      if (!userToken) return res.status(404).json({ error: "Token not found" });

      const message = {
        notification: { title, body },
        token: userToken.token,
      };

      const response = await admin.messaging().send(message);
      res.json({ success: true, response });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
