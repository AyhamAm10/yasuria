import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { UserToken } from "../entity/UserToken";


export class UserTokenService {
  private repo = AppDataSource.getRepository(UserToken);

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
}
