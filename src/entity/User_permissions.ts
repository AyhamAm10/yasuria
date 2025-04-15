import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";


export enum PermissionsEnum {
    // Manage user and vendor accounts
    MANAGE_USERS = "manage_users", 
    LOGIN = "login", 
    
    // Sales and Service Management
    MANAGE_SALES = "manage_sales",
    MANAGE_SERVICES = "manage_services", 
    
    // Ads Management
    CREATE_ADS = "create_ads",
    DELETE_ADS = "delete_ads",
    
    // Full control as administrator
    FULL_ACCESS = "full_access", // 
  }
  
@Entity("user_permissions")
export class UserPermission {
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column({
    type:"enum",
    enum: PermissionsEnum
  })
  permission: PermissionsEnum;

  @PrimaryGeneratedColumn()
  id: number;
}