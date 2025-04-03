import * as dotenv from "dotenv";
import * as fs from "fs";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/Users";
import { Car } from "../entity/Cars";
import { Ads } from "../entity/Ads";
import { Favorite } from "../entity/Favorites";
import { Notification } from "../entity/Notifications";
import { Property } from "../entity/properties";
import { Service } from "../entity/Services";
import { UserPermission } from "../entity/User_permissions";
import { Attribute } from "../entity/Attribute";
import { AttributeValue } from "../entity/AttributeValue";
import { Specifications } from "../entity/Specifications";
import { SpecificationsValue } from "../entity/SpecificationsValue";

dotenv.config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, NODE_ENV } =
  process.env;


export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT || "5432"),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: false,
  ssl: false,
  entities: [
    User,
    Car,
    Ads,
    Favorite,
    Notification,
    Property,
    Service,
    UserPermission,
    Attribute,
    AttributeValue,
    Specifications,
    SpecificationsValue
  ],

  migrations: [__dirname + "/../migrations/*.ts"],
  subscribers: [],
});
