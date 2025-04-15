import { AppDataSource } from "./data_source";
import { User, UserRole } from "../entity/User";
import bcrypt from "bcrypt";
export const createSuperAdmin = async () => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const existingSuperAdmin = await userRepository.findOne({
      where: { role: UserRole.superAdmin },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin is existed");
      return;
    }

       const phone = process.env.SUPERADMIN_PHONE;
   
       if (!phone ) {
         throw new Error("SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is not set in environment variables");
       }

   
    const superAdmin = userRepository.create({
      phone,
      city:" ",
      role: UserRole.superAdmin,
      name: "Admin",
      isActive: true
    });

    await userRepository.save(superAdmin);
    console.log("super admin creatted");
  } catch (error) {
    console.error("error when super admin created:", error);
  }
};
