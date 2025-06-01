import { AppDataSource } from "../config/data_source";
import { Notification } from "../entity/Notifications";
import { User } from "../entity/User";
import { UserToken } from "../entity/UserToken";


export class UserTokenService {
  private repo = AppDataSource.getRepository(UserToken);
  private notificationRepo = AppDataSource.getRepository(Notification)

  async registerToken(userId: number, token: string) {
    const existing = await this.repo.findOneBy({ token });
    if (existing) return existing; 

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) throw new Error("User not found");

    const newToken = this.repo.create({ user, token });
    return await this.repo.save(newToken);
  }

  async getTokenByUserId(userId: number) {
    return await this.repo.findOne({
      where: { user: { id: userId } },
    });
  }

  async getUserNotifications(userId: number, lang: 'en' | 'ar') {
  const notifications = await this.notificationRepo.find({
    where: { user: { id: userId } },
    order: { created_at: "DESC" },
  });

  return notifications.map(n => ({
    id: n.id,
    title: lang === 'ar' ? n.title_ar : n.title_en,
    description: lang === 'ar' ? n.description_ar : n.description_en,
    type: n.type,
    metaData: n.metaData,
    created_at: n.created_at,
  }));
}
}
